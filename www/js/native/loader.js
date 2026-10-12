/**
 * One tag per page loads the whole native layer, in the right order.
 * <script src="js/native/loader.js"></script>   (after hybrid-config.js)
 */
(function () {
  var cur = document.currentScript;
  var base = cur.src.replace(/loader\.js(\?.*)?$/, '');
  ['config.js', 'native-core.js', 'sqlite-store.js', 'notifications.js', 'pickers.js'].forEach(function (f) {
    document.write('<script src="' + base + f + '"><\/script>');
  });
})();
