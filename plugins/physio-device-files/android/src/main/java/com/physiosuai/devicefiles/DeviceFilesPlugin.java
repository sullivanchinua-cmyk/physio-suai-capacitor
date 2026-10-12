package com.physiosuai.devicefiles;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaMetadataRetriever;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.ContactsContract;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import android.provider.Settings;
import android.util.Size;
import android.webkit.MimeTypeMap;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * DeviceFiles - lets the web UI build WhatsApp-style pickers.
 *
 *  getAccess / requestAccess   runtime permissions (media, audio, contacts)
 *  openAppSettings             opens this app's Android settings page
 *  openAllFilesSettings        opens "All files access" (needed to LIST documents on Android 11+)
 *  listAlbums / listMedia      gallery grid (photos + videos) from MediaStore
 *  listAudio                   audio files from MediaStore
 *  listDocuments               pdf/doc/xls/ppt/txt/zip... from MediaStore.Files
 *  getThumbnail                small cached JPEG for a gallery cell
 *  copyToCache                 copies a content:// item into the app cache so the web layer can read it
 *  listContacts                phone contacts
 */
@CapacitorPlugin(
    name = "DeviceFiles",
    permissions = {
        @Permission(alias = "readStorage", strings = { Manifest.permission.READ_EXTERNAL_STORAGE }),
        @Permission(alias = "mediaImages", strings = { "android.permission.READ_MEDIA_IMAGES" }),
        @Permission(alias = "mediaVideo", strings = { "android.permission.READ_MEDIA_VIDEO" }),
        @Permission(alias = "mediaAudio", strings = { "android.permission.READ_MEDIA_AUDIO" }),
        @Permission(alias = "contacts", strings = { Manifest.permission.READ_CONTACTS })
    }
)
public class DeviceFilesPlugin extends Plugin {

    private static final String[] DOC_EXTENSIONS = {
        "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv", "rtf",
        "odt", "ods", "odp", "zip", "rar", "7z", "epub", "json", "md"
    };

    private final ExecutorService pool = Executors.newFixedThreadPool(3);

    @Override
    public void load() {
        // Remove attachment copies older than 6 hours.
        pool.execute(new Runnable() {
            @Override
            public void run() {
                cleanOldCache(6L * 60L * 60L * 1000L);
            }
        });
    }

    @Override
    protected void handleOnDestroy() {
        pool.shutdown();
        super.handleOnDestroy();
    }

    // ------------------------------------------------------------------ permissions

    private boolean granted(String alias) {
        return getPermissionState(alias) == PermissionState.GRANTED;
    }

    private boolean hasMediaAccess() {
        if (Build.VERSION.SDK_INT >= 33) {
            return granted("mediaImages") || granted("mediaVideo");
        }
        return granted("readStorage");
    }

    private boolean hasAudioAccess() {
        if (Build.VERSION.SDK_INT >= 33) {
            return granted("mediaAudio");
        }
        return granted("readStorage");
    }

    private boolean hasAllFilesAccess() {
        if (Build.VERSION.SDK_INT >= 30) {
            return Environment.isExternalStorageManager();
        }
        return granted("readStorage");
    }

    private JSObject accessObject() {
        JSObject o = new JSObject();
        o.put("media", hasMediaAccess());
        o.put("audio", hasAudioAccess());
        o.put("contacts", granted("contacts"));
        o.put("allFiles", hasAllFilesAccess());
        o.put("sdk", Build.VERSION.SDK_INT);
        return o;
    }

    @PluginMethod
    public void getAccess(PluginCall call) {
        call.resolve(accessObject());
    }

    @PluginMethod
    public void requestAccess(PluginCall call) {
        List<String> aliases = new ArrayList<String>();
        boolean sdk33 = Build.VERSION.SDK_INT >= 33;

        if (call.getBoolean("media", false)) {
            if (sdk33) {
                addIfMissing(aliases, "mediaImages");
                addIfMissing(aliases, "mediaVideo");
            } else {
                addIfMissing(aliases, "readStorage");
            }
        }
        if (call.getBoolean("audio", false)) {
            addIfMissing(aliases, sdk33 ? "mediaAudio" : "readStorage");
        }
        if (call.getBoolean("contacts", false)) {
            addIfMissing(aliases, "contacts");
        }
        if (call.getBoolean("documents", false) && !sdk33) {
            addIfMissing(aliases, "readStorage");
        }

        List<String> needed = new ArrayList<String>();
        for (String a : aliases) {
            if (!granted(a)) {
                needed.add(a);
            }
        }
        if (needed.isEmpty()) {
            call.resolve(accessObject());
            return;
        }
        requestPermissionForAliases(needed.toArray(new String[0]), call, "accessCallback");
    }

    private void addIfMissing(List<String> list, String alias) {
        if (!list.contains(alias)) {
            list.add(alias);
        }
    }

    @PermissionCallback
    private void accessCallback(PluginCall call) {
        call.resolve(accessObject());
    }

    @PluginMethod
    public void openAllFilesSettings(PluginCall call) {
        String pkg = "package:" + getContext().getPackageName();
        try {
            Intent intent;
            if (Build.VERSION.SDK_INT >= 30) {
                intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, Uri.parse(pkg));
            } else {
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse(pkg));
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            try {
                Intent fallback = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse(pkg));
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(fallback);
                call.resolve();
            } catch (Exception e2) {
                call.reject("Could not open settings: " + e2.getMessage());
            }
        }
    }

    @PluginMethod
    public void openAppSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open settings: " + e.getMessage());
        }
    }

    // ------------------------------------------------------------------ gallery

    @PluginMethod
    public void listAlbums(PluginCall call) {
        if (!hasMediaAccess()) {
            call.reject("PERMISSION_DENIED");
            return;
        }
        Cursor c = null;
        try {
            Uri files = MediaStore.Files.getContentUri("external");
            String[] projection = { "bucket_id", "bucket_display_name" };
            String selection = "media_type IN (1,3)";
            c = getContext().getContentResolver().query(files, projection, selection, null, "date_added DESC");
            Map<String, JSObject> albums = new LinkedHashMap<String, JSObject>();
            if (c != null) {
                while (c.moveToNext()) {
                    String id = c.getString(0);
                    if (id == null) {
                        continue;
                    }
                    JSObject a = albums.get(id);
                    if (a == null) {
                        a = new JSObject();
                        a.put("id", id);
                        String name = c.getString(1);
                        a.put("name", name == null ? "Other" : name);
                        a.put("count", 0);
                        albums.put(id, a);
                    }
                    a.put("count", a.getInteger("count") + 1);
                }
            }
            JSArray arr = new JSArray();
            for (JSObject a : albums.values()) {
                arr.put(a);
            }
            JSObject res = new JSObject();
            res.put("albums", arr);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("listAlbums failed: " + e.getMessage());
        } finally {
            if (c != null) {
                c.close();
            }
        }
    }

    @PluginMethod
    public void listMedia(PluginCall call) {
        if (!hasMediaAccess()) {
            call.reject("PERMISSION_DENIED");
            return;
        }
        String kind = call.getString("kind", "all");
        String albumId = call.getString("albumId");
        int limit = call.getInt("limit", 90);
        int offset = call.getInt("offset", 0);

        String types = "1,3";
        if ("image".equals(kind)) {
            types = "1";
        } else if ("video".equals(kind)) {
            types = "3";
        }

        List<String> projection = new ArrayList<String>();
        projection.add("_id");
        projection.add("_display_name");
        projection.add("_size");
        projection.add("date_added");
        projection.add("mime_type");
        projection.add("media_type");
        boolean hasDuration = Build.VERSION.SDK_INT >= 29;
        if (hasDuration) {
            projection.add("duration");
        }

        StringBuilder selection = new StringBuilder("media_type IN (" + types + ") AND _size > 0");
        List<String> args = new ArrayList<String>();
        if (albumId != null && albumId.length() > 0) {
            selection.append(" AND bucket_id = ?");
            args.add(albumId);
        }

        Cursor c = null;
        try {
            c = getContext().getContentResolver().query(
                MediaStore.Files.getContentUri("external"),
                projection.toArray(new String[0]),
                selection.toString(),
                args.isEmpty() ? null : args.toArray(new String[0]),
                "date_added DESC, _id DESC"
            );
            JSArray items = new JSArray();
            int total = 0;
            if (c != null) {
                total = c.getCount();
                if (offset < total && c.moveToPosition(offset)) {
                    int n = 0;
                    do {
                        long id = c.getLong(0);
                        int mediaType = c.getInt(5);
                        boolean isVideo = mediaType == 3;
                        Uri base = isVideo ? MediaStore.Video.Media.EXTERNAL_CONTENT_URI : MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                        Uri uri = ContentUris.withAppendedId(base, id);

                        JSObject o = new JSObject();
                        o.put("id", id);
                        o.put("uri", uri.toString());
                        o.put("kind", isVideo ? "video" : "image");
                        o.put("name", c.getString(1));
                        o.put("size", c.getLong(2));
                        o.put("dateAdded", c.getLong(3));
                        o.put("mime", c.getString(4));
                        o.put("duration", hasDuration ? c.getLong(6) : 0L);
                        items.put(o);
                        n++;
                    } while (n < limit && c.moveToNext());
                }
            }
            JSObject res = new JSObject();
            res.put("items", items);
            res.put("total", total);
            res.put("hasMore", offset + items.length() < total);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("listMedia failed: " + e.getMessage());
        } finally {
            if (c != null) {
                c.close();
            }
        }
    }

    // ------------------------------------------------------------------ audio

    @PluginMethod
    public void listAudio(PluginCall call) {
        if (!hasAudioAccess()) {
            call.reject("PERMISSION_DENIED");
            return;
        }
        int limit = call.getInt("limit", 200);
        int offset = call.getInt("offset", 0);
        String query = call.getString("query", "");

        String[] projection = {
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.DISPLAY_NAME,
            MediaStore.Audio.Media.TITLE,
            MediaStore.Audio.Media.ARTIST,
            MediaStore.Audio.Media.ALBUM,
            MediaStore.Audio.Media.DURATION,
            MediaStore.Audio.Media.SIZE,
            MediaStore.Audio.Media.DATE_ADDED,
            MediaStore.Audio.Media.MIME_TYPE
        };

        StringBuilder selection = new StringBuilder("is_ringtone = 0 AND is_alarm = 0 AND is_notification = 0 AND _size > 0");
        List<String> args = new ArrayList<String>();
        if (query != null && query.trim().length() > 0) {
            String like = "%" + query.trim() + "%";
            selection.append(" AND (_display_name LIKE ? OR title LIKE ? OR artist LIKE ?)");
            args.add(like);
            args.add(like);
            args.add(like);
        }

        Cursor c = null;
        try {
            c = getContext().getContentResolver().query(
                MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                projection,
                selection.toString(),
                args.isEmpty() ? null : args.toArray(new String[0]),
                "date_added DESC, _id DESC"
            );
            JSArray items = new JSArray();
            int total = 0;
            if (c != null) {
                total = c.getCount();
                if (offset < total && c.moveToPosition(offset)) {
                    int n = 0;
                    do {
                        long id = c.getLong(0);
                        Uri uri = ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id);
                        JSObject o = new JSObject();
                        o.put("id", id);
                        o.put("uri", uri.toString());
                        o.put("name", c.getString(1));
                        o.put("title", c.getString(2));
                        o.put("artist", cleanUnknown(c.getString(3)));
                        o.put("album", cleanUnknown(c.getString(4)));
                        o.put("duration", c.getLong(5));
                        o.put("size", c.getLong(6));
                        o.put("dateAdded", c.getLong(7));
                        o.put("mime", c.getString(8));
                        items.put(o);
                        n++;
                    } while (n < limit && c.moveToNext());
                }
            }
            JSObject res = new JSObject();
            res.put("items", items);
            res.put("total", total);
            res.put("hasMore", offset + items.length() < total);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("listAudio failed: " + e.getMessage());
        } finally {
            if (c != null) {
                c.close();
            }
        }
    }

    private String cleanUnknown(String s) {
        if (s == null || "<unknown>".equals(s)) {
            return "";
        }
        return s;
    }

    // ------------------------------------------------------------------ documents

    @PluginMethod
    public void listDocuments(PluginCall call) {
        int limit = call.getInt("limit", 200);
        int offset = call.getInt("offset", 0);
        String query = call.getString("query", "");

        StringBuilder selection = new StringBuilder("_size > 0 AND (");
        for (int i = 0; i < DOC_EXTENSIONS.length; i++) {
            if (i > 0) {
                selection.append(" OR ");
            }
            selection.append("_display_name LIKE '%.").append(DOC_EXTENSIONS[i]).append("'");
        }
        selection.append(")");
        List<String> args = new ArrayList<String>();
        if (query != null && query.trim().length() > 0) {
            selection.append(" AND _display_name LIKE ?");
            args.add("%" + query.trim() + "%");
        }

        String[] projection = { "_id", "_display_name", "_size", "date_added", "date_modified", "mime_type" };

        Cursor c = null;
        try {
            c = getContext().getContentResolver().query(
                MediaStore.Files.getContentUri("external"),
                projection,
                selection.toString(),
                args.isEmpty() ? null : args.toArray(new String[0]),
                "date_modified DESC, _id DESC"
            );
            JSArray items = new JSArray();
            int total = 0;
            if (c != null) {
                total = c.getCount();
                if (offset < total && c.moveToPosition(offset)) {
                    int n = 0;
                    do {
                        long id = c.getLong(0);
                        String name = c.getString(1);
                        Uri uri = ContentUris.withAppendedId(MediaStore.Files.getContentUri("external"), id);
                        JSObject o = new JSObject();
                        o.put("id", id);
                        o.put("uri", uri.toString());
                        o.put("name", name);
                        o.put("ext", extensionOf(name));
                        o.put("size", c.getLong(2));
                        o.put("dateAdded", c.getLong(3));
                        o.put("dateModified", c.getLong(4));
                        o.put("mime", c.getString(5));
                        items.put(o);
                        n++;
                    } while (n < limit && c.moveToNext());
                }
            }
            JSObject res = new JSObject();
            res.put("items", items);
            res.put("total", total);
            res.put("hasMore", offset + items.length() < total);
            res.put("allFiles", hasAllFilesAccess());
            call.resolve(res);
        } catch (Exception e) {
            call.reject("listDocuments failed: " + e.getMessage());
        } finally {
            if (c != null) {
                c.close();
            }
        }
    }

    private String extensionOf(String name) {
        if (name == null) {
            return "";
        }
        int dot = name.lastIndexOf('.');
        if (dot < 0 || dot == name.length() - 1) {
            return "";
        }
        return name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    // ------------------------------------------------------------------ thumbnails

    @PluginMethod
    public void getThumbnail(final PluginCall call) {
        final String uriStr = call.getString("uri");
        final String kind = call.getString("kind", "image");
        final long id = call.getLong("id", 0L);
        final int size = call.getInt("size", 256);
        if (uriStr == null || !uriStr.startsWith("content://")) {
            call.reject("Invalid uri");
            return;
        }
        pool.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    File dir = new File(getContext().getCacheDir(), "thumbs");
                    if (!dir.exists()) {
                        dir.mkdirs();
                    }
                    String fileName = kind + "_" + (id != 0 ? String.valueOf(id) : Integer.toHexString(uriStr.hashCode())) + "_" + size + ".jpg";
                    File out = new File(dir, fileName);
                    if (!out.exists() || out.length() == 0) {
                        Bitmap bmp = makeThumbnail(Uri.parse(uriStr), "video".equals(kind), size);
                        if (bmp == null) {
                            call.reject("No thumbnail");
                            return;
                        }
                        FileOutputStream fos = new FileOutputStream(out);
                        try {
                            bmp.compress(Bitmap.CompressFormat.JPEG, 80, fos);
                        } finally {
                            fos.close();
                            bmp.recycle();
                        }
                    }
                    JSObject res = new JSObject();
                    res.put("path", out.getAbsolutePath());
                    call.resolve(res);
                } catch (Exception e) {
                    call.reject("getThumbnail failed: " + e.getMessage());
                }
            }
        });
    }

    private Bitmap makeThumbnail(Uri uri, boolean isVideo, int size) throws Exception {
        ContentResolver cr = getContext().getContentResolver();
        if (Build.VERSION.SDK_INT >= 29) {
            try {
                return cr.loadThumbnail(uri, new Size(size, size), null);
            } catch (Exception ignored) {
                // fall through to manual decoding
            }
        }
        if (isVideo) {
            MediaMetadataRetriever r = new MediaMetadataRetriever();
            try {
                r.setDataSource(getContext(), uri);
                return r.getFrameAtTime(0);
            } finally {
                r.release();
            }
        }
        BitmapFactory.Options bounds = new BitmapFactory.Options();
        bounds.inJustDecodeBounds = true;
        InputStream in1 = cr.openInputStream(uri);
        try {
            BitmapFactory.decodeStream(in1, null, bounds);
        } finally {
            if (in1 != null) {
                in1.close();
            }
        }
        int sample = 1;
        while ((bounds.outWidth / (sample * 2)) >= size && (bounds.outHeight / (sample * 2)) >= size) {
            sample *= 2;
        }
        BitmapFactory.Options opts = new BitmapFactory.Options();
        opts.inSampleSize = sample;
        InputStream in2 = cr.openInputStream(uri);
        try {
            return BitmapFactory.decodeStream(in2, null, opts);
        } finally {
            if (in2 != null) {
                in2.close();
            }
        }
    }

    // ------------------------------------------------------------------ copy to cache

    @PluginMethod
    public void copyToCache(final PluginCall call) {
        final String uriStr = call.getString("uri");
        final String wantedName = call.getString("name");
        // Only content:// items are allowed, so the web layer can never read app-private files.
        if (uriStr == null || !uriStr.startsWith("content://")) {
            call.reject("Invalid uri");
            return;
        }
        pool.execute(new Runnable() {
            @Override
            public void run() {
                InputStream in = null;
                OutputStream out = null;
                try {
                    ContentResolver cr = getContext().getContentResolver();
                    Uri uri = Uri.parse(uriStr);

                    String name = wantedName;
                    long size = -1;
                    Cursor c = null;
                    try {
                        c = cr.query(uri, new String[] { OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE }, null, null, null);
                        if (c != null && c.moveToFirst()) {
                            if (name == null || name.length() == 0) {
                                name = c.getString(0);
                            }
                            size = c.getLong(1);
                        }
                    } catch (Exception ignored) {
                        // some providers do not expose OpenableColumns
                    } finally {
                        if (c != null) {
                            c.close();
                        }
                    }
                    if (name == null || name.length() == 0) {
                        name = "file_" + System.currentTimeMillis();
                    }
                    name = name.replaceAll("[\\\\/:*?\"<>|]", "_");

                    File dir = new File(getContext().getCacheDir(), "attach");
                    if (!dir.exists()) {
                        dir.mkdirs();
                    }
                    // Keep the original file name; reuse an existing copy of the same item.
                    File dest = new File(dir, Integer.toHexString(uriStr.hashCode()) + "_" + name);
                    if (!dest.exists() || dest.length() == 0) {
                        in = cr.openInputStream(uri);
                        if (in == null) {
                            call.reject("Cannot open file");
                            return;
                        }
                        out = new FileOutputStream(dest);
                        byte[] buf = new byte[64 * 1024];
                        int n;
                        while ((n = in.read(buf)) > 0) {
                            out.write(buf, 0, n);
                        }
                        out.flush();
                    }

                    String mime = cr.getType(uri);
                    if (mime == null) {
                        String ext = extensionOf(name);
                        if (ext.length() > 0) {
                            mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);
                        }
                    }
                    if (mime == null) {
                        mime = "application/octet-stream";
                    }

                    JSObject res = new JSObject();
                    res.put("path", dest.getAbsolutePath());
                    res.put("name", name);
                    res.put("mime", mime);
                    res.put("size", dest.length() > 0 ? dest.length() : size);
                    call.resolve(res);
                } catch (Exception e) {
                    call.reject("copyToCache failed: " + e.getMessage());
                } finally {
                    try {
                        if (in != null) {
                            in.close();
                        }
                        if (out != null) {
                            out.close();
                        }
                    } catch (Exception ignored) {
                        // nothing to do
                    }
                }
            }
        });
    }

    @PluginMethod
    public void cleanCache(PluginCall call) {
        long maxAgeMs = call.getLong("maxAgeMs", 0L);
        cleanOldCache(maxAgeMs);
        call.resolve();
    }

    private void cleanOldCache(long maxAgeMs) {
        try {
            File dir = new File(getContext().getCacheDir(), "attach");
            File[] files = dir.listFiles();
            if (files == null) {
                return;
            }
            long now = System.currentTimeMillis();
            for (File f : files) {
                if (maxAgeMs <= 0 || now - f.lastModified() > maxAgeMs) {
                    f.delete();
                }
            }
        } catch (Exception ignored) {
            // best effort
        }
    }

    // ------------------------------------------------------------------ contacts

    @PluginMethod
    public void listContacts(final PluginCall call) {
        if (!granted("contacts")) {
            call.reject("PERMISSION_DENIED");
            return;
        }
        pool.execute(new Runnable() {
            @Override
            public void run() {
                Cursor phones = null;
                Cursor mails = null;
                try {
                    ContentResolver cr = getContext().getContentResolver();
                    Map<String, JSObject> byId = new LinkedHashMap<String, JSObject>();

                    phones = cr.query(
                        ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                        new String[] {
                            ContactsContract.CommonDataKinds.Phone.CONTACT_ID,
                            ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                            ContactsContract.CommonDataKinds.Phone.NUMBER
                        },
                        null, null,
                        ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME + " COLLATE NOCASE ASC"
                    );
                    if (phones != null) {
                        while (phones.moveToNext() && byId.size() < 5000) {
                            String id = phones.getString(0);
                            JSObject o = byId.get(id);
                            if (o == null) {
                                o = new JSObject();
                                o.put("id", id);
                                o.put("name", phones.getString(1));
                                o.put("phones", new JSArray());
                                o.put("emails", new JSArray());
                                byId.put(id, o);
                            }
                            String num = phones.getString(2);
                            if (num != null) {
                                JSArray list = (JSArray) o.get("phones");
                                if (!containsString(list, num)) {
                                    list.put(num);
                                }
                            }
                        }
                    }

                    mails = cr.query(
                        ContactsContract.CommonDataKinds.Email.CONTENT_URI,
                        new String[] {
                            ContactsContract.CommonDataKinds.Email.CONTACT_ID,
                            ContactsContract.CommonDataKinds.Email.DISPLAY_NAME,
                            ContactsContract.CommonDataKinds.Email.ADDRESS
                        },
                        null, null, null
                    );
                    if (mails != null) {
                        while (mails.moveToNext()) {
                            String id = mails.getString(0);
                            JSObject o = byId.get(id);
                            if (o == null) {
                                if (byId.size() >= 5000) {
                                    continue;
                                }
                                o = new JSObject();
                                o.put("id", id);
                                o.put("name", mails.getString(1));
                                o.put("phones", new JSArray());
                                o.put("emails", new JSArray());
                                byId.put(id, o);
                            }
                            String addr = mails.getString(2);
                            if (addr != null) {
                                JSArray list = (JSArray) o.get("emails");
                                if (!containsString(list, addr)) {
                                    list.put(addr);
                                }
                            }
                        }
                    }

                    JSArray out = new JSArray();
                    for (JSObject o : byId.values()) {
                        out.put(o);
                    }
                    JSObject res = new JSObject();
                    res.put("contacts", out);
                    call.resolve(res);
                } catch (Exception e) {
                    call.reject("listContacts failed: " + e.getMessage());
                } finally {
                    if (phones != null) {
                        phones.close();
                    }
                    if (mails != null) {
                        mails.close();
                    }
                }
            }
        });
    }

    private boolean containsString(JSArray arr, String value) {
        for (int i = 0; i < arr.length(); i++) {
            if (value.equals(arr.optString(i))) {
                return true;
            }
        }
        return false;
    }
}
