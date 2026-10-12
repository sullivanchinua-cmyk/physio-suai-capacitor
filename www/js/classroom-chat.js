function getChatsContent() {
            var emojis = ['😂','🤣','😭','😍','🥰','😎','🤔','😅','🔥','💯','👍','❤️','💪','🎉','😤','🙏','😩','🥺','😏','🤯','😇','🤑','😜','🤗'];
            var emojiSpans = emojis.map(function(e){ return '<span onclick="insertEmoji(\'' + e + '\')" style="font-size:22px;cursor:pointer;text-align:center;padding:4px;border-radius:8px;display:block">' + e + '</span>'; }).join('');
            return '<div style="padding-bottom:100px;background:transparent;position:relative;z-index:1">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #374151;background:#111827;position:sticky;top:0;z-index:10" id="classroomChatHeader">' +
                        '<h2 style="font-size:20px;font-weight:800;margin:0">🏫 Classroom Chat</h2>' +
                        '<div style="display:flex;align-items:center;gap:8px" id="classroomChatActions">' +
                          '<button onclick="window.location.href=\'pages/chat.html\'" style="background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;font-weight:700;padding:8px 14px;border-radius:14px;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:14px">' +
                            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>' +
                            'Friends' +
                          '</button>' +
                          '<div style="position:relative">' +
                            '<button onclick="document.getElementById(\'classroomMenu\').style.display=document.getElementById(\'classroomMenu\').style.display===\'none\'?\'block\':\'none\'" style="width:36px;height:36px;background:#374151;border-radius:10px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center">' +
                              '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>' +
                            '</button>' +
                            '<div id="classroomMenu" style="display:none;position:absolute;right:0;top:40px;background:#1f2937;border:1px solid #374151;border-radius:14px;padding:6px;min-width:200px;z-index:50;box-shadow:0 8px 30px #000b">' +
                              '<button onclick="document.getElementById(\'classroomMenu\').style.display=\'none\';showClassroomSearch()" style="display:flex;align-items:center;gap:12px;width:100%;background:none;border:none;cursor:pointer;padding:12px 14px;color:#fff;font-size:15px;border-radius:10px">🔍 Search</button>' +
                              '<button onclick="document.getElementById(\'classroomMenu\').style.display=\'none\';showClassroomInfo()" style="display:flex;align-items:center;gap:12px;width:100%;background:none;border:none;cursor:pointer;padding:12px 14px;color:#fff;font-size:15px;border-radius:10px">👥 Class Info</button>' +
                              '<button onclick="document.getElementById(\'classroomMenu\').style.display=\'none\';showClassMediaDocs()" style="display:flex;align-items:center;gap:12px;width:100%;background:none;border:none;cursor:pointer;padding:12px 14px;color:#fff;font-size:15px;border-radius:10px">🖼️ Media, Links & Docs</button>' +
                              '<button onclick="document.getElementById(\'classroomMenu\').style.display=\'none\';if(typeof initChatTheme===\'function\'){initChatTheme(\'public_chat\');__ct.open();}" style="display:flex;align-items:center;gap:12px;width:100%;background:none;border:none;cursor:pointer;padding:12px 14px;color:#fff;font-size:15px;border-radius:10px">🎨 Chat theme</button>' +
                            '</div>' +
                          '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div style="position:relative;z-index:1"><div id="chatMessages" style="padding:12px 16px;min-height:200px;background:transparent;position:relative;z-index:1"></div></div>' +
                    '<button id="classScrollBtn" onclick="classScrollToBottom()" style="position:fixed;right:18px;bottom:118px;z-index:600;width:48px;height:48px;border-radius:50%;background:#1f2937;border:1.5px solid #4b5563;cursor:pointer;box-shadow:0 3px 16px rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;-webkit-tap-highlight-color:transparent">' +
                      '<span id="classUnreadBadge" style="position:absolute;top:-8px;right:-4px;background:linear-gradient(135deg,#9333ea,#ec4899);color:#fff;font-size:11px;font-weight:700;min-width:20px;height:20px;border-radius:10px;padding:0 5px;display:none;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>' +
                      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e9edef" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>' +
                    '</button>' +
                   '</div>' +
                   '<div id="chatInputBar" style="position:fixed;bottom:0;left:0;right:0;z-index:200;background:#1a1f2e;border-top:1px solid #2a3942;box-shadow:0 -4px 20px #000a">' +
                   /* WhatsApp-style reply bar for classroom */
                   '<div id="pubReplyBar" style="display:none;background:#111b21;border-bottom:1px solid #2a3942;padding:6px 12px">' +
                     '<div style="display:flex;align-items:center;gap:10px;background:#1f2c34;border-radius:10px;border-left:4px solid #25d366;padding:8px 10px;min-height:44px">' +
                       '<div style="flex:1;min-width:0">' +
                         '<p id="pubReplyName" style="font-size:11.5px;color:#25d366;font-weight:700;margin:0 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Name</p>' +
                         '<p id="pubReplyText" style="font-size:12px;color:#8696a0;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></p>' +
                       '</div>' +
                       '<button onclick="clearPubReply()" style="background:none;border:none;cursor:pointer;color:#8696a0;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px;padding:0">✕</button>' +
                     '</div>' +
                   '</div>' +
                   
                   '<div id="pubTypingBar" style="display:none;padding:4px 12px 2px">'+
                   '<div id="pubTypingBubble" style="display:inline-flex;align-items:center;gap:8px;background:#1f2c34;border-radius:18px 18px 18px 4px;padding:7px 14px;max-width:80%;box-shadow:0 1px 4px rgba(0,0,0,.3)">'+
                   '<div id="pubTypingAvatars" style="display:flex;align-items:center;gap:-3px"></div>'+
                   '<div id="pubTypingDots" style="display:flex;gap:4px;align-items:center">'+
                   '<span class="waDot" style="width:8px;height:8px;border-radius:50%;background:#8696a0;display:inline-block"></span>'+
                   '<span class="waDot" style="width:8px;height:8px;border-radius:50%;background:#8696a0;display:inline-block;animation-delay:.2s"></span>'+
                   '<span class="waDot" style="width:8px;height:8px;border-radius:50%;background:#8696a0;display:inline-block;animation-delay:.4s"></span>'+
                   '</div>'+
                   '<div id="pubRecBars" style="display:none;gap:3px;align-items:flex-end;height:20px">'+
                   '<span class="waBar"></span><span class="waBar" style="animation-delay:.1s"></span>'+
                   '<span class="waBar" style="animation-delay:.2s"></span><span class="waBar" style="animation-delay:.3s"></span><span class="waBar" style="animation-delay:.4s"></span>'+
                   '</div>'+
                   '<span id="pubTypingText" style="font-size:12px;color:#8696a0;font-style:italic"></span>'+
                   '</div></div>' +
                     '<div id="homeImgStrip" style="display:none;background:#0d0f1a;border-top:1px solid #2a3942;padding:10px 12px;align-items:center;gap:10px">' +
                       '<img id="homeImgThumb" style="width:60px;height:60px;border-radius:8px;object-fit:cover;flex-shrink:0" src="" alt="">' +
                       '<div style="flex:1;min-width:0">' +
                         '<p id="homeImgName" style="font-size:13px;color:#e9edef;margin:0;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></p>' +
                         '<p id="homeImgSize" style="font-size:11px;color:#8696a0;margin:2px 0 0"></p>' +
                       '</div>' +
                       '<button onclick="clearChatFile()" style="background:none;border:none;cursor:pointer;color:#f87171;font-size:22px;flex-shrink:0;line-height:1">✕</button>' +
                     '</div>' +
                     '<div id="homeFileStrip" style="display:none;padding:8px 16px">' +
                       '<div style="display:flex;align-items:center;gap:10px;background:#1a2030;border-radius:14px;padding:10px 12px;border:1px solid #2d3748">' +
                         '<div id="homeFsIcoWrap" style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#9333ea,#ec4899);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px"><span id="homeFsIco">📎</span></div>' +
                         '<div style="flex:1;min-width:0">' +
                           '<div id="homeFsType" style="font-size:11px;font-weight:700;color:#a78bfa;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px"></div>' +
                           '<span id="homeFileName" style="font-size:13px;color:#e9edef;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block"></span>' +
                         '</div>' +
                         '<button onclick="clearChatFile()" style="background:rgba(255,255,255,.1);border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;color:#9ca3af;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0">✕</button>' +
                       '</div>' +
                     '</div>' +
                     '<div id="homeEmojiPicker" style="display:none;padding:14px 16px">' +
                       '<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px;margin-bottom:10px">' + emojiSpans + '</div>' +
                       '<button onclick="event.stopPropagation();closeHomeEmoji()" style="width:100%;color:#9ca3af;background:none;border:none;cursor:pointer;font-size:13px;padding:8px 0">Close ✕</button>' +
                     '</div>' +
                     '<div style="padding:8px 10px;display:flex;align-items:flex-end;gap:6px">' +
                       '<div style="flex:1;min-width:0;display:flex;align-items:center;background:#1f2937;border:1.5px solid #374151;border-radius:24px;padding:3px 8px 3px 14px;gap:2px" id="homeChatWrap">' +
                       '<button id="homeEmojiBtn" title="Emoji/GIF/Sticker" ontouchstart="WaEmojiPanel.touchStart(event)" ontouchend="WaEmojiPanel.touchEnd(true)" ontouchcancel="WaEmojiPanel.touchCancel()" onclick="WaEmojiPanel.toggle(\'emoji\')" style="width:34px;height:34px;border-radius:50%;background:none;border:none;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;color:#8696a0;-webkit-tap-highlight-color:transparent">' +
                         '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' +
                       '</button>' +
                       '<div style="flex:1;min-width:0;position:relative">' +
                       '<div id="mentionDropdown" style="display:none;position:absolute;bottom:44px;left:0;right:0;background:#1f2937;border:1.5px solid #374151;border-radius:14px;max-height:160px;overflow-y:auto;z-index:300;padding:6px;box-shadow:0 8px 24px #000a"></div>' +
                       '<textarea id="chatInput" rows="1" placeholder="Message (@name to tag)" onkeydown="if(event.key===\'Escape\') WaEmojiPanel.close();" oninput="onHomeChatType();_homeResizeTA(this);" style="width:100%;min-width:0;background:none;border:none;outline:none;color:#fff;font-size:15px;padding:9px 4px;font-family:inherit;box-sizing:border-box;resize:none;overflow:hidden;line-height:1.4;max-height:100px"></textarea>' +
                       '</div>' +
                       '<button onclick="showAttachMenu(onHomeAttach)" title="Attach" style="width:34px;height:34px;border-radius:50%;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#8696a0;-webkit-tap-highlight-color:transparent">' +
                         '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>' +
                       '</button>' +
                       '<label for="_camInpHome" title="Camera" ontouchend="event.preventDefault();_openHomeCamera()" onclick="_openHomeCamera()" style="width:34px;height:34px;border-radius:50%;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#8696a0;-webkit-tap-highlight-color:transparent">' +
                         '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>' +
                       '</label>' +
                       '<input id="_camInpHome" type="file" accept="image/*" capture="environment" style="position:fixed;top:-9999px;opacity:0;width:1px;height:1px;pointer-events:none">' +
                     '</div>' +
                     '<div style="position:relative;flex-shrink:0">' +
                     '<button id="homeMicSendBtn" ontouchstart="_hmSbStart(event)" ontouchend="_hmSbEnd(event)" ontouchcancel="_hmSbCancel()" onmousedown="_hmSbStart(event)" onmouseup="_hmSbEnd(event)" onmouseleave="_hmSbCancel()" style="width:50px;height:50px;min-width:50px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#8b5cf6);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 12px rgba(236,72,153,.45);transition:background .2s;-webkit-tap-highlight-color:transparent">' +
                       '<svg id="homeMicSVG" viewBox="0 0 24 24" width="23" height="23" fill="none"><rect x="9" y="1" width="6" height="12" rx="3" fill="white"/><path d="M5 11c0 3.866 3.134 7 7 7s7-3.134 7-7" stroke="white" stroke-width="2.2" stroke-linecap="round" fill="none"/><line x1="12" y1="18" x2="12" y2="22" stroke="white" stroke-width="2.2" stroke-linecap="round"/><line x1="8.5" y1="22" x2="15.5" y2="22" stroke="white" stroke-width="2.2" stroke-linecap="round"/></svg>' +
                       '<svg id="homeSendSVG" style="display:none" viewBox="0 0 24 24" width="22" height="22"><path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" fill="white"/></svg>' +
                       '<svg id="homeVoOnceSVG" style="display:none" viewBox="0 0 24 24" width="22" height="22"><path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" fill="white"/></svg>' +
                     '</button>' +
                     '<div id="homeVoBadge" style="display:none;position:absolute;top:-5px;right:-4px;width:18px;height:18px;background:linear-gradient(135deg,#ec4899,#8b5cf6);border-radius:50%;line-height:18px;text-align:center;font-size:11px;color:white;font-weight:900;pointer-events:none;box-shadow:0 1px 4px rgba(0,0,0,.5);font-family:Arial,sans-serif">1</div>' +
                     '</div>' +
                     '</div>' +
                   '</div>';
        }
        

// Classroom chat functions extracted from home.html
function loadMentionUsers() {
          if (!currentUser) return;
          db.ref('users').once('value').then(function(snap){
            // Clear and repopulate — keep same array reference so window._mentionUsers stays current
            _mentionUsers.length = 0;
            window._mentionUsers = _mentionUsers;
            snap.forEach(function(c){
              if(c.key !== currentUser.uid) _mentionUsers.push({uid:c.key, name:(c.val().name||'Student')});
            });
          });
        }
        // ── Classroom Chat Info ───────────────────────────────────────────────
        
function showClassroomSearch() {
          var existing = document.getElementById('_classSearch');
          if (existing) { existing.remove(); _clearSearchHighlights(); return; }

          var bar = document.createElement('div');
          bar.id = '_classSearch';
          // Two-row layout so nothing gets cut off on any screen width
          bar.style.cssText = 'position:fixed;top:56px;left:0;right:0;z-index:400;background:#1a1f2e;padding:10px 14px 10px;box-shadow:0 6px 24px rgba(0,0,0,.7);border-bottom:2px solid transparent;background-clip:padding-box;box-sizing:border-box';
          // Pink/purple bottom border via pseudo — use outline trick
          bar.style.borderBottom = '2px solid #9333ea';

          // Row 1: input + Cancel
          var row1 = document.createElement('div');
          row1.style.cssText = 'display:flex;align-items:center;gap:10px';

          var inputWrap = document.createElement('div');
          inputWrap.style.cssText = 'flex:1;display:flex;align-items:center;background:#2a3942;border-radius:24px;padding:0 14px;gap:8px;border:1.5px solid #374151';

          var searchIcon = document.createElement('span');
          searchIcon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8696a0" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';

          var inp = document.createElement('input');
          inp.id = '_classSearchInp';
          inp.type = 'text';
          inp.placeholder = 'Search in chat…';
          inp.style.cssText = 'flex:1;background:none;border:none;color:#fff;font-size:15px;outline:none;padding:10px 0;font-family:inherit';

          // Clear input ✕ inside input wrap
          var clearInp = document.createElement('button');
          clearInp.innerHTML = '✕';
          clearInp.style.cssText = 'background:none;border:none;color:#6b7280;font-size:16px;cursor:pointer;padding:0;line-height:1;display:none';
          clearInp.onclick = function() { inp.value=''; clearInp.style.display='none'; _doSearch(''); inp.focus(); };

          inputWrap.appendChild(searchIcon);
          inputWrap.appendChild(inp);
          inputWrap.appendChild(clearInp);

          var cancelBtn = document.createElement('button');
          cancelBtn.textContent = 'Cancel';
          cancelBtn.style.cssText = 'background:none;border:none;color:#ec4899;font-size:15px;font-weight:700;cursor:pointer;white-space:nowrap;padding:0 4px;flex-shrink:0';
          cancelBtn.onclick = function() { _clearSearchHighlights(); bar.remove(); };

          row1.appendChild(inputWrap);
          row1.appendChild(cancelBtn);

          // Row 2: nav controls (prev/next/count) — separate row so nothing overflows
          var row2 = document.createElement('div');
          row2.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:8px';

          var navInfo = document.createElement('span');
          navInfo.id = '_classSearchInfo';
          navInfo.style.cssText = 'color:#8696a0;font-size:13px;flex:1;font-weight:600';
          navInfo.textContent = 'Type to search all messages';

          var prevBtn = document.createElement('button');
          prevBtn.style.cssText = 'background:linear-gradient(135deg,#9333ea,#ec4899);border:none;border-radius:10px;color:#fff;width:36px;height:36px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(147,51,234,.4)';
          prevBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>';

          var nextBtn = document.createElement('button');
          nextBtn.style.cssText = 'background:linear-gradient(135deg,#9333ea,#ec4899);border:none;border-radius:10px;color:#fff;width:36px;height:36px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(147,51,234,.4)';
          nextBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';

          row2.appendChild(navInfo);
          row2.appendChild(prevBtn);
          row2.appendChild(nextBtn);

          bar.appendChild(row1);
          bar.appendChild(row2);
          document.body.appendChild(bar);

          var _matches = [];
          var _cur = -1;

          function _clearSearchHighlights() {
            document.querySelectorAll('._srchHL').forEach(function(el) {
              var parent = el.parentNode;
              if (parent) parent.replaceChild(document.createTextNode(el.textContent), el);
            });
            var msgs = document.getElementById('chatMessages');
            if (msgs) msgs.normalize();
          }

          // Make it accessible from cancel
          window._clearSearchHighlights = _clearSearchHighlights;

          function _doSearch(q) {
            _clearSearchHighlights();
            _matches = [];
            _cur = -1;
            navInfo.style.color = '#8696a0';
            if (!q || q.trim().length < 2) {
              navInfo.textContent = q.length > 0 ? 'Keep typing…' : 'Type to search all messages';
              return;
            }

            var ql = q.toLowerCase();
            var msgs = document.getElementById('chatMessages');
            if (!msgs) return;

            var walker = document.createTreeWalker(msgs, NodeFilter.SHOW_TEXT, null, false);
            var node;
            var nodesToHighlight = [];
            while ((node = walker.nextNode())) {
              if ((node.nodeValue || '').toLowerCase().includes(ql)) {
                nodesToHighlight.push(node);
              }
            }

            nodesToHighlight.forEach(function(node) {
              var text = node.nodeValue;
              var parent = node.parentNode;
              if (!parent) return;
              var parts = text.split(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')', 'gi'));
              var frag = document.createDocumentFragment();
              parts.forEach(function(part) {
                if (part.toLowerCase() === ql) {
                  var span = document.createElement('span');
                  span.className = '_srchHL';
                  span.style.cssText = 'background:linear-gradient(135deg,#9333ea,#ec4899);color:#fff;border-radius:4px;padding:0 3px';
                  span.textContent = part;
                  frag.appendChild(span);
                  _matches.push(span);
                } else {
                  frag.appendChild(document.createTextNode(part));
                }
              });
              parent.replaceChild(frag, node);
            });

            if (_matches.length > 0) {
              navInfo.textContent = '1 of ' + _matches.length + ' result' + (_matches.length===1?'':'s');
              navInfo.style.color = '#34d399';
              _cur = 0;
              _scrollToMatch(0);
            } else {
              navInfo.textContent = 'No results for "' + q + '"';
              navInfo.style.color = '#f87171';
            }
          }

          function _scrollToMatch(idx) {
            if (!_matches.length) return;
            _matches.forEach(function(m, i) {
              m.style.background = i === idx
                ? 'linear-gradient(135deg,#f59e0b,#ec4899)'
                : 'linear-gradient(135deg,#9333ea,#ec4899)';
            });
            _matches[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
            navInfo.textContent = (idx+1) + ' of ' + _matches.length + ' result' + (_matches.length===1?'':'s');
            navInfo.style.color = '#34d399';
            _cur = idx;
          }

          var _timer;
          inp.addEventListener('input', function() {
            clearInp.style.display = inp.value ? 'block' : 'none';
            clearTimeout(_timer);
            _timer = setTimeout(function() { _doSearch(inp.value); }, 300);
          });

          nextBtn.onclick = function() {
            if (!_matches.length) return;
            _scrollToMatch((_cur + 1) % _matches.length);
          };
          prevBtn.onclick = function() {
            if (!_matches.length) return;
            _scrollToMatch((_cur - 1 + _matches.length) % _matches.length);
          };

          // Focus input after animation
          setTimeout(function() { inp.focus(); }, 120);
        }

        function _clearSearchHighlights() {
          document.querySelectorAll('._srchHL').forEach(function(el) {
            var p = el.parentNode; if(p) p.replaceChild(document.createTextNode(el.textContent), el);
          });
          var m = document.getElementById('chatMessages'); if(m) m.normalize();
        }


        
function showClassroomInfo() {
          var d = document.createElement('div');
          d.style.cssText = 'position:fixed;inset:0;z-index:9900;background:rgba(0,0,0,.75);display:flex;flex-direction:column;overflow-y:auto';
          var memberCount = 0;
          db.ref('users').once('value').then(function(s){ memberCount = s.numChildren ? s.numChildren() : (Object.keys(s.val()||{}).length); });
          d.innerHTML =
            '<div style="background:#0d1117;flex:1">' +
              '<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:#1a1f2e;border-bottom:1px solid #2a3942">' +
                '<button onclick="this.closest(\'[style*=inset]\').remove()" style="width:40px;height:40px;background:#2a3942;border-radius:12px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
                  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e9edef" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
                '</button>' +
                '<span style="color:#fff;font-weight:700;font-size:16px">Class Info</span>' +
              '</div>' +
              '<div style="padding:24px 16px 16px;text-align:center;border-bottom:1px solid #2a3942">' +
                '<div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#9333ea,#ec4899);display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 12px">🏫</div>' +
                '<h2 style="color:#fff;font-weight:800;font-size:19px;margin:0 0 4px">ESUT Physiotherapy</h2>' +
                '<p style="color:#8696a0;font-size:13px;margin:0">Classroom · Physio SUAI App</p>' +
              '</div>' +
              '<div style="padding:16px">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">' +
                  '<button onclick="alert(\'Voice chat coming soon!\')" style="background:#1a1f2e;border:1.5px solid #2a3942;border-radius:16px;padding:14px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;color:#e9edef">' +
                    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#vg1)" stroke-width="2"><defs><linearGradient id="vg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9333ea"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs><path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4z"/><path d="M8 11a4 4 0 008 0M12 19v4"/></svg>' +
                    '<span style="font-size:13px;font-weight:600">Voice chat</span>' +
                  '</button>' +
                  '<button onclick="document.getElementById(\'chatInput\')&&document.getElementById(\'chatInput\').focus()" style="background:#1a1f2e;border:1.5px solid #2a3942;border-radius:16px;padding:14px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;color:#e9edef;-webkit-tap-highlight-color:transparent" onclick="this.closest(\'[style*=inset]\').remove()">' +
                    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
                    '<span style="font-size:13px;font-weight:600">Search</span>' +
                  '</button>' +
                '</div>' +
                '<button onclick="this.closest(\'[style*=inset]\').remove();showClassMediaDocs()" style="width:100%;background:#1a1f2e;border:1.5px solid #2a3942;border-radius:16px;padding:14px 16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;-webkit-tap-highlight-color:transparent">' +
                  '<span style="color:#fff;font-weight:600;font-size:14px">🖼️ Media, links, and docs</span>' +
                  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>' +
                '</button>' +
                '<div style="background:#1a1f2e;border:1.5px solid #2a3942;border-radius:16px;padding:14px 16px;margin-bottom:10px">' +
                  '<p style="color:#8696a0;font-size:12px;margin:0 0 4px">Class code</p>' +
                  '<p style="color:#a78bfa;font-weight:700;font-size:16px;margin:0;letter-spacing:1px">kqayapcx</p>' +
                '</div>' +
                '<button onclick="window.open(\'https://classroom.google.com/c/kqayapcx\',\'_blank\')" style="width:100%;background:linear-gradient(135deg,#1a73e8,#0d47a1);border:none;border-radius:16px;padding:14px;cursor:pointer;color:#fff;font-weight:700;font-size:14px">🎓 Open Google Classroom</button>' +
              '</div>' +
            '</div>';
          document.body.appendChild(d);
          d.addEventListener('click', function(e){ if(e.target===d) d.remove(); });
        }

        // ── Media, Links & Docs viewer ────────────────────────────────────────
        
async function showClassMediaDocs() {
          var d = document.createElement('div');
          d.style.cssText = 'position:fixed;inset:0;z-index:9900;background:#0d1117;display:flex;flex-direction:column';
          d.innerHTML =
            '<div style="background:#1a1f2e;border-bottom:1px solid #2a3942;padding:12px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0">' +
              '<button onclick="this.closest(\'[style*=position:fixed]\').remove()" style="width:40px;height:40px;background:#2a3942;border-radius:12px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center">' +
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e9edef" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
              '</button>' +
              '<span style="color:#fff;font-weight:700;font-size:16px">Media, Links & Docs</span>' +
            '</div>' +
            '<div style="display:flex;border-bottom:1px solid #2a3942;flex-shrink:0">' +
              '<button onclick="switchMediaTab(\'media\')" id="mediaTabBtn" style="flex:1;background:none;border:none;border-bottom:2px solid #ec4899;padding:12px;color:#ec4899;font-weight:700;font-size:13px;cursor:pointer">Media</button>' +
              '<button onclick="switchMediaTab(\'links\')" id="linksTabBtn" style="flex:1;background:none;border:none;border-bottom:2px solid transparent;padding:12px;color:#6b7280;font-size:13px;cursor:pointer">Links</button>' +
              '<button onclick="switchMediaTab(\'docs\')" id="docsTabBtn" style="flex:1;background:none;border:none;border-bottom:2px solid transparent;padding:12px;color:#6b7280;font-size:13px;cursor:pointer">Docs</button>' +
            '</div>' +
            '<div id="mediaTabContent" style="flex:1;overflow-y:auto;padding:12px">' +
              '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px" id="mediaGrid"><div style="text-align:center;padding:30px;color:#6b7280;grid-column:1/-1">Loading media…</div></div>' +
            '</div>';
          document.body.appendChild(d);

          window.switchMediaTab = function(tab) {
            ['media','links','docs'].forEach(function(t){
              document.getElementById(t+'TabBtn').style.borderBottomColor = t===tab ? '#ec4899' : 'transparent';
              document.getElementById(t+'TabBtn').style.color = t===tab ? '#ec4899' : '#6b7280';
              document.getElementById(t+'TabBtn').style.fontWeight = t===tab ? '700' : '400';
            });
            var content = document.getElementById('mediaTabContent');
            if (tab==='media') _loadMediaTab(content);
            else if (tab==='links') _loadLinksTab(content);
            else _loadDocsTab(content);
          };

          function _loadMediaTab(container) {
            container.innerHTML = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px" id="mediaGrid"><div style="text-align:center;padding:30px;color:#6b7280;grid-column:1/-1">Loading…</div></div>';
            db.ref('public_chat').orderByChild('fileType').once('value').then(function(snap) {
              var items = []; snap.forEach(function(c){ var v=c.val(); if(v.fileType&&(v.fileType.startsWith('image/')||v.fileType.startsWith('video/'))) items.push(v); });
              var g = document.getElementById('mediaGrid');
              if (!g) return;
              if (!items.length) { g.innerHTML='<div style="text-align:center;padding:30px;color:#6b7280;grid-column:1/-1">No media yet</div>'; return; }
              g.innerHTML = items.reverse().map(function(v) {
                return v.fileType.startsWith('image/') ?
                  '<div style="aspect-ratio:1;overflow:hidden;cursor:pointer" onclick="window.open(\''+v.fileUrl+'\',\'_blank\')"><img src="'+v.fileUrl+'" style="width:100%;height:100%;object-fit:cover" loading="lazy"></div>' :
                  '<div style="aspect-ratio:1;background:#1f2937;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:28px" onclick="window.open(\''+v.fileUrl+'\',\'_blank\')">▶️</div>';
              }).join('');
            });
          }
          function _loadLinksTab(container) {
            container.innerHTML = '<div style="padding:16px;color:#6b7280;font-size:14px">Loading links…</div>';
            db.ref('public_chat').once('value').then(function(snap) {
              var links = []; var urlRe = /(https?:\/\/[^\s]+)/g;
              snap.forEach(function(c){ var t=(c.val().message||c.val().text||''); var m=t.match(urlRe); if(m) links = links.concat(m.map(function(u){return{url:u,sender:c.val().senderName||c.val().sender||''};})); });
              if (!links.length) { container.innerHTML='<div style="text-align:center;padding:30px;color:#6b7280">No links shared yet</div>'; return; }
              container.innerHTML = links.reverse().map(function(l){
                return '<a href="'+l.url+'" target="_blank" style="display:block;background:#1a1f2e;border-radius:14px;padding:12px 14px;margin-bottom:8px;text-decoration:none">' +
                  '<p style="color:#60a5fa;font-size:13px;margin:0 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+l.url+'</p>' +
                  (l.sender?'<p style="color:#6b7280;font-size:11px;margin:0">Shared by '+l.sender+'</p>':'') +
                '</a>';
              }).join('');
            });
          }
          function _loadDocsTab(container) {
            container.innerHTML = '<div style="padding:16px;color:#6b7280;font-size:14px">Loading docs…</div>';
            db.ref('public_chat').once('value').then(function(snap) {
              var docs = [];
              snap.forEach(function(c){ var v=c.val(); if(v.fileUrl&&v.fileType&&!v.fileType.startsWith('image/')&&!v.fileType.startsWith('video/')&&!v.fileType.startsWith('audio/')) docs.push(v); });
              if (!docs.length) { container.innerHTML='<div style="text-align:center;padding:30px;color:#6b7280">No documents shared yet</div>'; return; }
              var icons = {pdf:'📄',doc:'📝',docx:'📝',xls:'📊',xlsx:'📊',ppt:'📑',pptx:'📑',txt:'📃'};
              container.innerHTML = docs.reverse().map(function(v){
                var ext=(v.fileName||'').split('.').pop().toLowerCase();
                var ic=icons[ext]||'📎';
                var eu=v.fileUrl.replace(/'/g,"\\'"); var en=(v.fileName||'Document').replace(/'/g,"\\'");
                return '<button onclick="(function(){var u=\''+eu+'\',n=\''+en+'\';if(typeof _dlFile===\'function\'){_dlFile(u,n);}else{fetch(u).then(function(r){return r.blob();}).then(function(b){var a=document.createElement(\'a\');a.href=URL.createObjectURL(b);a.download=n;document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);},1000);}).catch(function(){window.open(u,\'_blank\');});}})()" style="display:flex;align-items:center;gap:12px;background:#1a1f2e;border-radius:14px;padding:12px 14px;margin-bottom:8px;border:none;width:100%;cursor:pointer;text-align:left">' +
                  '<span style="font-size:28px;flex-shrink:0">'+ic+'</span>' +
                  '<div style="min-width:0;flex:1"><p style="color:#e9edef;font-size:13px;font-weight:600;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(v.fileName||'Document')+'</p><p style="color:#6b7280;font-size:11px;margin:2px 0 0">Tap to save</p></div>' +
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
                '</button>';
              }).join('');
            });
          }
          _loadMediaTab(document.getElementById('mediaTabContent'));
        }

        function onHomeChatKeydown(e) {
          // Enter = newline (no auto-send). Send via button only.
          if(e.key==='Escape'){ document.getElementById('mentionDropdown').style.display='none'; WaEmojiPanel.close(); }
        }
        function _homeResizeTA(ta){ if(!ta)return; ta.style.height='auto'; ta.style.height=Math.min(ta.scrollHeight,100)+'px'; }
        function insertMentionPub(name) {
          var inp = document.getElementById('chatInput');
          if(inp){ inp.value = inp.value.replace(/@\w*$/, '@'+name+' '); inp.focus(); }
          document.getElementById('mentionDropdown').style.display='none';
          onHomeChatType();
        }
        // ── Mention notification banner ───────────────────────────────────────
        function showMentionNotif(from, message, onDismiss, msgText) {
          var existing = document.getElementById('_mentionBanner');
          if (existing) existing.remove();
          var d = document.createElement('div');
          d.id = '_mentionBanner';
          d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(135deg,#9333ea,#ec4899);padding:14px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 4px 20px rgba(0,0,0,.5);animation:slideDown .3s ease';
          d.innerHTML =
            '<div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">🔔</div>' +
            '<div style="flex:1;min-width:0">' +
              '<p style="color:#fff;font-weight:700;font-size:14px;margin:0">' + (from||'Someone') + ' tagged you</p>' +
              '<p style="color:rgba(255,255,255,.8);font-size:12px;margin:2px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (message||'').substring(0,80) + '</p>' +
            '</div>' +
            '<button onclick="this.closest(\'#_mentionBanner\').remove()" style="width:32px;height:32px;background:rgba(255,255,255,.2);border:none;border-radius:50%;color:#fff;font-size:16px;cursor:pointer;flex-shrink:0">✕</button>';
          d.addEventListener('click', function(e) {
            if (e.target.tagName !== 'BUTTON') {
              d.remove();
              if (typeof onDismiss === 'function') onDismiss();
              // Open chat tab then scroll to the tagged message
              if (typeof loadSubpage === 'function') {
                loadSubpage('chat');
                // After chat loads, search for the message text and scroll to it
                setTimeout(function() {
                  var searchText = msgText || message || '';
                  if (!searchText) return;
                  // Find the message in chatMessages by text content
                  var msgs = document.getElementById('chatMessages');
                  if (!msgs) return;
                  var allMsgEls = msgs.querySelectorAll('[id^="msg_"]');
                  var found = null;
                  // Extract key part of message (after the "tagged you: " prefix)
                  var keyText = searchText.replace(/^[^:]+tagged you:\s*["']?/i,'').replace(/["']$/,'').substring(0,40).toLowerCase();
                  allMsgEls.forEach(function(el) {
                    if (!found && el.textContent.toLowerCase().includes(keyText)) {
                      found = el;
                    }
                  });
                  if (found) {
                    found.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Briefly highlight the message
                    found.style.transition = 'background .3s';
                    found.style.background = 'rgba(147,51,234,.25)';
                    setTimeout(function(){ found.style.background = ''; }, 2500);
                  } else {
                    // If message not visible yet (may not be loaded), scroll to bottom
                    var chatContent = document.getElementById('chatContent');
                    if (chatContent) chatContent.scrollTop = chatContent.scrollHeight;
                  }
                }, 800);
              }
            }
          });
          document.body.appendChild(d);
          // Auto-dismiss after 8 seconds
          setTimeout(function() {
            if (d.parentNode) {
              d.style.animation = 'slideUp .3s ease forwards';
              setTimeout(function(){ if(d.parentNode) d.remove(); if(onDismiss) onDismiss(); }, 300);
            }
          }, 8000);
        }

        function onHomeChatType() {
            var inp = document.getElementById('chatInput');
            var val = inp ? (inp.value || '') : '';
            var trimmed = val.trim();

            // ── INSTANT secret commands ──────────────────────────────
            if (/^\.@calc(ulator)?$/i.test(trimmed)) {
              inp.value = ''; updateHomeMicSend();
              if (typeof GeminiChat !== 'undefined') GeminiChat.openCalc();
              return;
            }
            if (/^\.@calend(er|ar)?$/i.test(trimmed)) {
              inp.value = ''; updateHomeMicSend();
              if (typeof GeminiChat !== 'undefined') GeminiChat.openCalend();
              return;
            }

            // Update mic/send button
            updateHomeMicSend();
            // Send typing indicator to Firebase (with name + photo)
            if (trimmed && typeof firebase !== 'undefined' && firebase.auth().currentUser) {
              var _u = firebase.auth().currentUser;
              var _photo = (window.currentUserData&&window.currentUserData.photoURL)||null;
              var _cdName = (window.currentUserData&&window.currentUserData.name)||_u.displayName||'Student';
              var _init  = _cdName[0].toUpperCase();
              firebase.database().ref('typing/public_chat/'+_u.uid).set({
                name: _cdName, initial:_init, photo:_photo,
                recording:false, ts: Date.now()
              });
              clearTimeout(window._homeTypingTimer);
              window._homeTypingTimer = setTimeout(function() {
                firebase.database().ref('typing/public_chat/'+_u.uid).remove();
              }, 3000);
            }
            // @mention detection
            var atMatch = val.match(/@(\w*)$/);
            var dd = document.getElementById('mentionDropdown');
            if(dd && atMatch){
              var q = atMatch[1].toLowerCase();
              var matches = _mentionUsers.filter(function(u){ return u.name.toLowerCase().includes(q); });
              if(matches.length){
                dd.style.display='block';
                dd.innerHTML = matches.slice(0,6).map(function(u){
                  return '<button onclick="insertMentionPub(\''+u.name.replace(/'/g,'\\\'')+'\')" style="display:flex;align-items:center;gap:8px;width:100%;background:none;border:none;cursor:pointer;padding:8px 10px;border-radius:10px;color:#fff;font-size:14px;text-align:left" onmouseover="this.style.background=\'#374151\'" onmouseout="this.style.background=\'none\'">'+
                    '<span style="width:28px;height:28px;background:linear-gradient(135deg,#ec4899,#8b5cf6);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;font-size:12px">'+u.name[0].toUpperCase()+'</span>'+
                    '@'+u.name+'</button>';
                }).join('');
              } else { dd.style.display='none'; }
            } else if(dd){ dd.style.display='none'; }
        }
        function closeHomeEmoji() { if(typeof WaEmojiPanel!=='undefined') WaEmojiPanel.close(); }
        function toggleHomeEmoji(e) { if(typeof WaEmojiPanel!=='undefined') WaEmojiPanel.toggle('emoji'); }

        function clearChatFile() {
            currentChatFile = null;
            var s = document.getElementById('homeFileStrip');
            if (s) s.style.display = 'none';
            var is = document.getElementById('homeImgStrip');
            if (is) is.style.display = 'none';
            var th = document.getElementById('homeImgThumb');
            if (th) { try { URL.revokeObjectURL(th.src); } catch(e){} th.src = ''; }
        }
        function getSchoolContent() {
            return `
                <div class="max-w-2xl mx-auto p-4 flex flex-col gap-4">
                  <div class="text-center py-4">
                    <div style="font-size:72px;margin-bottom:12px">🎓</div>
                    <h2 class="text-2xl font-bold">ESUT Student Portal</h2>
                    <p style="color:#6b7280;font-size:13px;margin-top:4px">portal.esut.edu.ng</p>
                  </div>
                  <!-- In-App Loader (proxy) -->
                  <button onclick="loadSchoolInApp()"
                    style="width:100%;background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;font-weight:700;padding:18px 24px;border-radius:20px;border:none;cursor:pointer;display:flex;align-items:center;gap:16px;font-size:16px;box-shadow:0 6px 20px #ec489940">
                    <div style="width:48px;height:48px;background:rgba(255,255,255,.2);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">🔓</div>
                    <div style="text-align:left">
                      <div style="font-weight:800;font-size:17px">Open Portal In-App</div>
                      <div style="font-size:12px;opacity:.8;font-weight:400">Loads here directly – bypasses redirect</div>
                    </div>
                  </button>
                  <!-- Browser fallback -->
                  <button onclick="window.open('https://portal.esut.edu.ng/login.aspx','_blank')"
                    style="width:100%;background:#1f2937;color:#fff;font-weight:700;padding:16px 24px;border-radius:20px;border:1.5px solid #374151;cursor:pointer;display:flex;align-items:center;gap:16px;font-size:15px">
                    <div style="width:48px;height:48px;background:#374151;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">🌐</div>
                    <div style="text-align:left">
                      <div style="font-weight:700">Open in Browser</div>
                      <div style="font-size:12px;color:#6b7280;font-weight:400">Standard browser experience</div>
                    </div>
                  </button>
                  <!-- Quick shortcuts -->
                  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
                    <button onclick="loadSchoolInApp('student/results.aspx')"
                      style="background:#1e3a5f;color:#fff;font-weight:600;padding:14px 8px;border-radius:16px;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:13px">
                      <span style="font-size:24px">📊</span>Results
                    </button>
                    <button onclick="loadSchoolInApp('student/coursereg.aspx')"
                      style="background:#14532d;color:#fff;font-weight:600;padding:14px 8px;border-radius:16px;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:13px">
                      <span style="font-size:24px">📚</span>Courses
                    </button>
                    <button onclick="loadSchoolInApp('student/fees.aspx')"
                      style="background:#713f12;color:#fff;font-weight:600;padding:14px 8px;border-radius:16px;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:13px">
                      <span style="font-size:24px">💳</span>Fees
                    </button>
                  </div>
                  <div style="background:#1f2937;border-radius:16px;padding:16px;font-size:13px;color:#9ca3af;line-height:1.7">
                    <p style="color:#fff;font-weight:600;margin-bottom:8px">💡 Tips</p>
                    <p>• <span style="color:#ec4899;font-weight:600">In-App</span> loads the portal directly here using a bypass proxy</p>
                    <p>• If it shows blank, it means ESUT changed their security – use <strong style="color:#fff">Open in Browser</strong></p>
                  </div>
                </div>
            `;
        }
        var SCHOOL_PROXY = 'https://corsproxy.io/?';
        var SCHOOL_BASE  = 'https://portal.esut.edu.ng/';
        function loadSchoolInApp(path) {
            var targetUrl = SCHOOL_BASE + (path || 'login.aspx');
            // Show portal inline viewer
            var content = document.getElementById('mainContent');
            content.innerHTML = `
              <div style="display:flex;flex-direction:column;height:calc(100vh - 8rem)">
                <div style="background:#1f2937;border-bottom:1px solid #374151;padding:10px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0">
                  <button onclick="loadPage('school')" style="width:38px;height:38px;background:#374151;border-radius:10px;border:none;cursor:pointer;color:#fff;font-size:18px;display:flex;align-items:center;justify-content:center">←</button>
                  <span style="flex:1;color:#9ca3af;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">portal.esut.edu.ng</span>
                  <button onclick="window.open('${targetUrl}','_blank')" style="background:#3b82f6;color:#fff;font-weight:600;padding:6px 12px;border-radius:8px;border:none;cursor:pointer;font-size:12px">↗ Browser</button>
                </div>
                <div id="schoolLoading" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:30px">
                  <div style="width:52px;height:52px;border:4px solid #ec4899;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite"></div>
                  <p style="color:#9ca3af;font-size:15px">Connecting to ESUT Portal…</p>
                  <p style="color:#4b5563;font-size:12px">Bypassing redirect security…</p>
                </div>
                <iframe id="schoolFrame" style="display:none;flex:1;width:100%;border:none;min-height:0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation-by-user-activation"></iframe>
                <div id="schoolError" style="display:none;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:30px">
                  <div style="font-size:56px">⚠️</div>
                  <h3 style="font-weight:700;font-size:18px">Portal Blocked Embedding</h3>
                  <p style="color:#6b7280;font-size:14px;max-width:280px">ESUT's security blocked the in-app loader. Use browser mode instead.</p>
                  <button onclick="window.open('${targetUrl}','_blank')" style="background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;font-weight:700;padding:12px 28px;border-radius:16px;border:none;cursor:pointer">Open in Browser 🌐</button>
                  <button onclick="loadPage('school')" style="color:#6b7280;background:none;border:none;cursor:pointer;font-size:13px;margin-top:4px">← Back</button>
                </div>
              </div>
              <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
            `;
            // Fetch via proxy and inject
            fetch(SCHOOL_PROXY + encodeURIComponent(targetUrl), { signal: AbortSignal.timeout(15000) })
              .then(function(r){ if(!r.ok) throw new Error(r.status); return r.text(); })
              .then(function(html){
                var patched = html
                  .replace(/<head([^>]*)>/i, '<head$1><base href="' + SCHOOL_BASE + '">')
                  .replace(/top\.location(\s*=|\s*\.href\s*=)/g, '//BLOCKED=')
                  .replace(/parent\.location(\s*=|\s*\.href\s*=)/g, '//BLOCKED=')
                  .replace(/window\.top\s*!==?\s*window(?:\.self)?/g, 'false')
                  .replace(/if\s*\(\s*(?:top|window\.top)\s*!={1,2}\s*(?:self|window(?:\.self)?)\s*\)/g, 'if(false)')
                  .replace(/if\s*\(\s*window\s*!=\s*(?:top|window\.top)\s*\)/g, 'if(false)');
                var frame = document.getElementById('schoolFrame');
                if (!frame) return;
                frame.srcdoc = patched;
                frame.style.display = 'block';
                frame.style.flex = '1';
                document.getElementById('schoolLoading').style.display = 'none';
              })
              .catch(function(){
                var lo = document.getElementById('schoolLoading'), er = document.getElementById('schoolError');
                if (lo) lo.style.display = 'none';
                if (er) { er.style.display = 'flex'; }
              });
        }
        function getLecturesContent() {
            return `
                <div class="max-w-7xl mx-auto p-4">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-3xl font-bold">Lecture Updates</h2>
                        <button onclick="showAddLectureModal()" class="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 rounded-xl hover:from-pink-600 hover:to-purple-700 transition font-semibold">
                            + Add Lecture
                        </button>
                    </div>
                    <div id="lecturesGrid" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Lectures loaded here -->
                    </div>
                </div>
            `;
        }
        function getMusicContent() {
            // Guard: only show Empire toast ONCE per app session (not every tab switch)
            if (!window._empireToastShown) {
              window._empireToastShown = true;
              setTimeout(showEmpireToast, 300);
            }
            return `
                <div class="max-w-2xl mx-auto p-4 flex flex-col gap-4">
                  <!-- ★ EMPIRE FEATURED CARD ★ -->
                  <button onclick="openMusicInApp('empire')"
                    style="width:100%;background:linear-gradient(135deg,#1a0533,#0f1e3d,#1a0533);border:2px solid rgba(167,139,250,.5);border-radius:24px;padding:20px 16px;text-align:center;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 8px 32px rgba(139,92,246,.35)"
                    onmousedown="this.style.transform='scale(.97)'" onmouseup="this.style.transform=''">
                    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 50%,rgba(236,72,153,.12),transparent 65%);pointer-events:none"></div>
                    <div style="font-size:10px;font-weight:800;color:#a78bfa;text-transform:uppercase;letter-spacing:2.5px;margin-bottom:6px">🌟 New Release · Empire</div>
                    <div style="font-size:36px;margin-bottom:8px">🎵</div>
                    <div style="color:#fff;font-weight:800;font-size:20px;margin-bottom:3px">Akachukwu</div>
                    <div style="color:#9ca3af;font-size:13px;margin-bottom:12px">Blissful Empire · Latest Drop</div>
                    <span style="background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;font-size:13px;font-weight:700;padding:8px 24px;border-radius:20px;display:inline-block">▶ Play Now</span>
                  </button>
                  <p style="text-align:center;color:#6b7280;font-size:12px">— or stream from —</p>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                    <!-- Boomplay -->
                    <button onclick="openMusicInApp('boomplay')"
                      style="background:linear-gradient(135deg,#dc2626,#7f1d1d);border-radius:24px;padding:22px 12px;text-align:center;border:none;cursor:pointer;transition:transform .15s;position:relative;overflow:hidden"
                      onmousedown="this.style.transform='scale(.95)'" onmouseup="this.style.transform=''">
                      <div style="font-size:48px;margin-bottom:10px">🎵</div>
                      <div style="color:#fff;font-weight:800;font-size:17px">Boomplay</div>
                      <div style="color:#fca5a5;font-size:12px;margin-top:4px">African Music</div>
                      <div style="margin-top:8px;background:rgba(255,255,255,.2);border-radius:20px;padding:3px 10px;display:inline-block;color:#fff;font-size:11px;font-weight:600">In-App ✓</div>
                    </button>
                    <!-- Audiomack -->
                    <button onclick="openMusicInApp('audiomack')"
                      style="background:linear-gradient(135deg,#ea580c,#92400e);border-radius:24px;padding:22px 12px;text-align:center;border:none;cursor:pointer;transition:transform .15s"
                      onmousedown="this.style.transform='scale(.95)'" onmouseup="this.style.transform=''">
                      <div style="font-size:48px;margin-bottom:10px">🎧</div>
                      <div style="color:#fff;font-weight:800;font-size:17px">Audiomack</div>
                      <div style="color:#fed7aa;font-size:12px;margin-top:4px">Trending Hits</div>
                      <div style="margin-top:8px;background:rgba(255,255,255,.2);border-radius:20px;padding:3px 10px;display:inline-block;color:#fff;font-size:11px;font-weight:600">In-App ✓</div>
                    </button>
                    <!-- SoundCloud -->
                    <button onclick="openMusicInApp('soundcloud')"
                      style="background:linear-gradient(135deg,#ea580c,#c2410c);border-radius:24px;padding:22px 12px;text-align:center;border:none;cursor:pointer;transition:transform .15s"
                      onmousedown="this.style.transform='scale(.95)'" onmouseup="this.style.transform=''">
                      <div style="font-size:48px;margin-bottom:10px">☁️</div>
                      <div style="color:#fff;font-weight:800;font-size:17px">SoundCloud</div>
                      <div style="color:#fed7aa;font-size:12px;margin-top:4px">Independent Artists</div>
                      <div style="margin-top:8px;background:rgba(255,255,255,.2);border-radius:20px;padding:3px 10px;display:inline-block;color:#fff;font-size:11px;font-weight:600">In-App ✓</div>
                    </button>
                    <!-- YT Music -->
                    <button onclick="openMusicInApp('ytmusic')"
                      style="background:linear-gradient(135deg,#9f1239,#7f1d1d);border-radius:24px;padding:22px 12px;text-align:center;border:none;cursor:pointer;transition:transform .15s"
                      onmousedown="this.style.transform='scale(.95)'" onmouseup="this.style.transform=''">
                      <div style="font-size:48px;margin-bottom:10px">▶️</div>
                      <div style="color:#fff;font-weight:800;font-size:17px">YT Music</div>
                      <div style="color:#fca5a5;font-size:12px;margin-top:4px">YouTube Music</div>
                      <div style="margin-top:8px;background:rgba(255,255,255,.2);border-radius:20px;padding:3px 10px;display:inline-block;color:#fff;font-size:11px;font-weight:600">In-App ✓</div>
                    </button>
                  </div>
                </div>
            `;
        }
        // ── EMPIRE TOAST ANIMATION ──────────────────────────────────
        function showEmpireToast() {
            // Remove any existing toast
            var old = document.getElementById('empireToastEl');
            if (old) old.remove();
            var toast = document.createElement('div');
            toast.id = 'empireToastEl';
            toast.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;display:flex;align-items:center;justify-content:center;pointer-events:none;';
            toast.innerHTML = `
              <div id="empireCardEl" style="
                background:linear-gradient(145deg,#0a0a1a 0%,#1a0533 45%,#0d1a2e 100%);
                border:1.5px solid rgba(167,139,250,.5);
                border-radius:28px;padding:28px 32px;text-align:center;
                width:88%;max-width:300px;
                box-shadow:0 0 70px rgba(167,139,250,.3),0 20px 60px rgba(0,0,0,.9);
                transform:scale(0) translateY(40px);opacity:0;
                transition:transform .5s cubic-bezier(.34,1.56,.64,1),opacity .4s ease;
                position:relative;overflow:hidden;
              ">
                <div id="empireVinylEl" style="
                  width:72px;height:72px;border-radius:50%;margin:0 auto 14px;
                  background:radial-gradient(circle at 50%,#111 26%,#1a1a2e 27%,#0f3460 42%,#533483 56%,#ec4899 68%,#8b5cf6 78%,#1a1a2e 79%);
                  animation:empireSpin 2s linear infinite;
                  box-shadow:0 0 22px rgba(236,72,153,.65);
                "></div>
                <div style="font-size:10px;font-weight:800;color:#a78bfa;text-transform:uppercase;letter-spacing:2.5px;margin-bottom:8px">🎵 New Release</div>
                <div style="font-size:18px;font-weight:800;color:#fff;line-height:1.35;margin-bottom:3px">Listen to the latest<br>song by Empire</div>
                <div style="font-size:13px;color:#9ca3af;margin-bottom:2px">Akachukwu · Blissful Empire</div>
                <div id="empireBarEl" style="height:3px;border-radius:3px;background:linear-gradient(90deg,#ec4899,#8b5cf6,#a78bfa);margin-top:16px;width:0;transition:width 3s linear;"></div>
              </div>
              <style>
                @keyframes empireSpin{to{transform:rotate(360deg)}}
                @keyframes empireNote{0%{transform:translateY(0) rotate(-8deg);opacity:1}100%{transform:translateY(-55px) rotate(12deg);opacity:0}}
                .empire-note{position:absolute;font-size:20px;animation:empireNote 1.5s ease-out forwards;pointer-events:none;}
              </style>
            `;
            document.body.appendChild(toast);
            // Animate in
            setTimeout(function() {
                var card = document.getElementById('empireCardEl');
                var bar  = document.getElementById('empireBarEl');
                if (!card) return;
                card.style.transform = 'scale(1) translateY(0)';
                card.style.opacity   = '1';
                setTimeout(function() { if(bar) bar.style.width = '100%'; }, 300);
                // Float notes
                var notes = ['🎵','🎶','🎤','🎸','✨','🔥'];
                for (var i = 0; i < 6; i++) {
                    (function(idx) {
                        setTimeout(function() {
                            if (!card) return;
                            var n = document.createElement('span');
                            n.className = 'empire-note';
                            n.textContent = notes[idx % notes.length];
                            n.style.left = (15 + Math.random() * 65) + '%';
                            n.style.top  = '20px';
                            card.appendChild(n);
                            setTimeout(function() { if(n.parentNode) n.remove(); }, 1600);
                        }, idx * 260);
                    })(i);
                }
                // Hide after 3 seconds
                setTimeout(function() {
                    if (!card) return;
                    card.style.transition = 'transform .4s ease, opacity .35s ease';
                    card.style.transform  = 'scale(.75) translateY(-24px)';
                    card.style.opacity    = '0';
                    setTimeout(function() { if(toast.parentNode) toast.remove(); }, 400);
                }, 3200);
            }, 50);
        }
        var MUSIC_SERVICES = {
          empire:     { name:'Empire – Akachukwu', icon:'🎵',
                        url:'https://audiomack.com/blissful-empire/song/akachukwu',
                        embed:'https://audiomack.com/embed/blissful-empire/song/akachukwu' },
          boomplay:   { name:'Boomplay',   icon:'🎵', url:'https://www.boomplay.com/browse' },
          audiomack:  { name:'Audiomack',  icon:'🎧', url:'https://audiomack.com/trending-songs',
                        embed:'https://audiomack.com/embed/trending-songs' },
          soundcloud: { name:'SoundCloud', icon:'☁️',
                        embed:'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/discover&auto_play=false&visual=true' },
          ytmusic:    { name:'YT Music',   icon:'▶️', url:'https://music.youtube.com' }
        };
        // Track which service is loaded in background iframe
        var _bgMusicKey = null;
        var _bgMusicLoaded = false;
        function openMusicInApp(key) {
            var s = MUSIC_SERVICES[key];
            var mainContent = document.getElementById('mainContent');
            mainContent.innerHTML = `
              <div style="display:flex;flex-direction:column;height:calc(100vh - 8rem)">
                <div style="background:#1f2937;border-bottom:1px solid #374151;padding:10px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0">
                  <button onclick="loadPage('music')" style="width:38px;height:38px;background:#374151;border-radius:10px;border:none;cursor:pointer;color:#fff;font-size:18px;display:flex;align-items:center;justify-content:center">←</button>
                  <span style="flex:1;font-weight:700;font-size:15px">${s.icon} ${s.name}</span>
                  <button onclick="stopBgMusic();loadPage('music')" style="width:32px;height:32px;background:#ef4444;color:#fff;border-radius:8px;border:none;cursor:pointer;font-size:14px">✕</button>
                </div>
                <div id="musicLoading" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center">
                  <div style="width:48px;height:48px;border:4px solid #ec4899;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite"></div>
                  <p style="color:#9ca3af">Loading ${s.name}…</p>
                </div>
                <!-- Visible proxy iframe shown when music tab is open -->
                <iframe id="musicFrame" style="display:none;flex:1;width:100%;border:none;min-height:0"
                  allow="autoplay;encrypted-media;fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-top-navigation-by-user-activation"></iframe>
                <div id="musicError" style="display:none;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:30px;flex:1">
                  <div style="font-size:60px">${s.icon}</div>
                  <h3 style="font-weight:700;font-size:18px">${s.name}</h3>
                  <p style="color:#6b7280;font-size:14px;max-width:260px">This service blocked embedding. Open in browser to play music.</p>
                  <button onclick="retryMusicProxy('${key}')" style="background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;font-weight:700;padding:12px 24px;border-radius:14px;border:none;cursor:pointer">🔄 Retry</button>
                  <button onclick="window.open('${s.url || s.embed}','_blank')" style="background:#374151;color:#fff;font-weight:600;padding:10px 24px;border-radius:14px;border:none;cursor:pointer">🌐 Open in Browser</button>
                </div>
              </div>
              <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
            `;
            // Load into the PERSISTENT background iframe so it survives tab switches
            var bgFrame = document.getElementById('bgMusicFrame');
            var visFrame = document.getElementById('musicFrame');
            if (_bgMusicKey === key && _bgMusicLoaded) {
                // Already loaded - just show the visible frame mirroring src
                document.getElementById('musicLoading').style.display = 'none';
                if (s.embed) {
                    visFrame.src = bgFrame.src;
                    visFrame.style.display = 'block';
                    visFrame.style.flex = '1';
                } else {
                    visFrame.srcdoc = bgFrame.srcdoc || '';
                    visFrame.style.display = 'block';
                    visFrame.style.flex = '1';
                }
                miniShowBar(s.name, s.icon + ' Playing');
            } else {
                _bgMusicKey = key;
                _bgMusicLoaded = false;
                if (s.embed) {
                    bgFrame.src = s.embed;
                    visFrame.src = s.embed;
                    visFrame.style.display = 'block';
                    visFrame.style.flex = '1';
                    document.getElementById('musicLoading').style.display = 'none';
                    _bgMusicLoaded = true;
                    visFrame.onload = function() { miniShowBar(s.name, s.icon + ' Now Playing'); };
                } else {
                    loadMusicProxy(key, s);
                }
            }
        }
        function stopBgMusic() {
            var bgFrame = document.getElementById('bgMusicFrame');
            if (bgFrame) { bgFrame.src = 'about:blank'; bgFrame.srcdoc = ''; }
            _bgMusicKey = null;
            _bgMusicLoaded = false;
            miniHideBar();
        }
        function loadMusicProxy(key, s) {
            if (!s) s = MUSIC_SERVICES[key];
            fetch('https://corsproxy.io/?' + encodeURIComponent(s.url), { signal: AbortSignal.timeout(20000) })
              .then(function(r){ if(!r.ok) throw new Error(r.status); return r.text(); })
              .then(function(html){
                var base = s.url.match(/^(https?:\/\/[^/]+)/)[1];
                var patched = html
                  .replace(/<head([^>]*)>/i, '<head$1><base href="' + base + '/">')
                  .replace(/top\.location(\s*=|\s*\.href\s*=)/g, '//B=')
                  .replace(/window\.top\s*!==?\s*window(?:\.self)?/g, 'false')
                  .replace(/if\s*\(\s*(?:top|window\.top)\s*!={1,2}\s*(?:self|window(?:\.self)?)\s*\)/g, 'if(false)');
                var bgFrame = document.getElementById('bgMusicFrame');
                var frame = document.getElementById('musicFrame');
                if (!frame) return;
                bgFrame.srcdoc = patched;
                frame.srcdoc = patched;
                frame.style.display = 'block';
                frame.style.flex = '1';
                _bgMusicLoaded = true;
                var lo = document.getElementById('musicLoading');
                if (lo) lo.style.display = 'none';
                if (s) miniShowBar(s.name, s.icon + ' Now Playing');
              })
              .catch(function(){ showMusicError(key); });
        }
        function retryMusicProxy(key) {
            var s = MUSIC_SERVICES[key];
            var er = document.getElementById('musicError'), lo = document.getElementById('musicLoading');
            if (er) er.style.display = 'none';
            if (lo) lo.style.display = 'flex';
            loadMusicProxy(key, s);
        }
        function showMusicError(key) {
            var lo = document.getElementById('musicLoading'), er = document.getElementById('musicError');
            if (lo) lo.style.display = 'none';
            if (er) er.style.display = 'flex';
        }
        // Subpage functions
        function loadSubpage(page) {
            window.location.href = `pages/${page}.html`;
        }
        let currentChatFile = null;
        window._homeChatHistory = [];
        // Init Gemini for classroom chat
        if (typeof GeminiChat !== 'undefined') GeminiChat.init({
          msgsContainerId: 'chatMessages',
          msgInputId: 'chatInput',
          getHistory: function(){ return window._homeChatHistory||[]; },
          pushReply: function(text){
            // Save as Gemini AI, NOT as the current user
            if (typeof db === 'undefined') return;
            db.ref('public_chat').push({
              message: text,
              fileUrl: null,
              fileType: null,
              senderId: 'gemini-ai',
              senderName: 'Gemini AI',
              senderEmail: 'gemini@ai',
              senderAvatar: null,
              isGemini: true,
              timestamp: Date.now(),
              reactions: {}
            });
          }
        });
        async function sendChatMessage() {
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            var extraText = window._homePendingText || null;
            if (!message && !currentChatFile && !extraText) return;

            // ── Edit mode ──────────────────────────────────────────────────────
            if (input.dataset.editingId && message) {
              var eId = input.dataset.editingId;
              await db.ref('public_chat/' + eId).update({message: message, edited: true, editTs: Date.now()});
              input.value = ''; delete input.dataset.editingId;
              onHomeChatType();
              var bar = document.getElementById('_pubEditBar'); if(bar) bar.style.display = 'none';
              showToast('✏️ Message updated');
              return;
            }

            // ── Secret commands ──────────────────────────────────────
            if (message && /^\.@calc(ulator)?$/i.test(message)) {
              input.value = ''; updateHomeMicSend();
              if (typeof GeminiChat !== 'undefined') GeminiChat.openCalc();
              return;
            }
            if (message && /^\.@calend(er|ar)?$/i.test(message)) {
              input.value = ''; updateHomeMicSend();
              if (typeof GeminiChat !== 'undefined') GeminiChat.openCalend();
              return;
            }

            window._homePendingText = null;
            // Close @mention dropdown
            var dd = document.getElementById('mentionDropdown');
            if(dd) dd.style.display='none';
            let fileUrl = null, fileType = null, fileName = null;
            if (currentChatFile) {
                var _isVid = currentChatFile.type && currentChatFile.type.startsWith('video/');
                if (_isVid && typeof uploadFileWithProgress === 'function') {
                    var _vLocalUrl = URL.createObjectURL(currentChatFile);
                    var _vOv = document.createElement('div');
                    _vOv.id = '_pubVidUpOv';
                    _vOv.style.cssText = 'position:fixed;inset:0;z-index:9800;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.72)';
                    _vOv.innerHTML = '<div style="position:relative;width:260px;height:195px;border-radius:16px;overflow:hidden">'+
                      '<video src="'+_vLocalUrl+'" muted playsinline style="width:100%;height:100%;object-fit:cover;filter:blur(8px);transform:scale(1.08)" id="_pubVidUpPrev"></video>'+
                      '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">'+
                        '<svg width="72" height="72" viewBox="0 0 72 72" style="transform:rotate(-90deg)">'+
                          '<circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="5"/>'+
                          '<circle id="_pubVidProg" cx="36" cy="36" r="30" fill="none" stroke="#ec4899" stroke-width="5" stroke-linecap="round" stroke-dasharray="188.5" stroke-dashoffset="188.5" style="transition:stroke-dashoffset .2s ease"/>'+
                        '</svg>'+
                        '<div id="_pubVidPct" style="position:absolute;font-size:15px;font-weight:700;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.7)">0%</div>'+
                      '</div>'+
                      '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.6));padding:10px 12px;font-size:12px;color:rgba(255,255,255,.8)">Uploading video…</div>'+
                    '</div>';
                    document.body.appendChild(_vOv);
                    const upload = await uploadFileWithProgress(currentChatFile, 'chat', function(pct) {
                        var pe = document.getElementById('_pubVidProg');
                        var pp = document.getElementById('_pubVidPct');
                        var vp = document.getElementById('_pubVidUpPrev');
                        if (pe) pe.setAttribute('stroke-dashoffset', (188.5*(1-pct/100)).toFixed(1));
                        if (vp) vp.style.filter = 'blur('+Math.max(0,8-(pct/100)*8).toFixed(1)+'px)';
                        if (pp) pp.textContent = pct+'%';
                    });
                    var _vOv2 = document.getElementById('_pubVidUpOv'); if(_vOv2) _vOv2.remove();
                    URL.revokeObjectURL(_vLocalUrl);
                    if (upload.success) {
                        fileUrl = upload.url; fileType = upload.fileType || getMimeFromName(currentChatFile.name); fileName = upload.fileName || currentChatFile.name;
                        window._pendingFileKey = upload.key || null;
                    } else { clearChatFile(); showToast('Upload failed: '+(upload.error||'Try again'),'error'); return; }
                    clearChatFile();
                } else {
                    showSendPill('Uploading file…');
                    const upload = await uploadFile(currentChatFile, 'chat');
                    if (upload.success) {
                        fileUrl  = upload.url;
                        fileType = upload.fileType || getMimeFromName(currentChatFile.name);
                        fileName = upload.fileName  || currentChatFile.name;
                        window._pendingFileKey = upload.key || null;
                    } else {
                        hideSendPill(); clearChatFile();
                        showToast('Upload failed: ' + (upload.error || 'Try again'), 'error');
                        return;
                    }
                    hideSendPill(); clearChatFile();
                }
            }
            var finalMsg = extraText ? (extraText + (message ? '\n' + message : '')) : message;
            // Guard: nothing to send?
            if (!finalMsg && !fileUrl) { updateHomeMicSend(); return; }
            await sendMessage(finalMsg, fileUrl, fileType, false, null, fileName, window._pendingFileKey||null);
            window._pendingFileKey = null;

            // ── @mention notifications ────────────────────────────────
            if (finalMsg) {
              var mentionMatches = finalMsg.match(/@(\w+)/g);
              if (mentionMatches && typeof sendMentionNotification === 'function') {
                var senderName = (window.currentUserData&&window.currentUserData.name)||(currentUser?(currentUser.displayName||'Someone'):'Someone');
                mentionMatches.forEach(function(m) {
                  sendMentionNotification(m.slice(1), senderName, finalMsg);
                });
              }
            }
            input.value = '';

            // Track history & check @gemini
            if(!window._homeChatHistory) window._homeChatHistory=[];
            window._homeChatHistory.push(finalMsg||'');
            if(window._homeChatHistory.length>12) window._homeChatHistory.shift();
            if(finalMsg && finalMsg.toLowerCase().includes('@gemini')){
              setTimeout(function(){ GeminiChat.check(finalMsg, window._homeChatHistory); }, 150);
            }
            updateHomeMicSend();
        }
        function onHomeAttach(file, type, extra) {
            // type === 'text+file' means file came with a caption from preview
            if (type === 'text+file' && file) {
                currentChatFile = file;
                window._homePendingText = extra || null;
                var strip = document.getElementById('homeFileStrip');
                var nameEl = document.getElementById('homeFileName');
                if (strip && nameEl) { nameEl.textContent = (extra ? extra + ' · ' : '') + file.name; strip.style.display = 'block'; }
                updateHomeMicSend();
                // Auto-send immediately (preview already confirmed by user)
                sendChatMessage();
                return;
            }
            if (type === 'text' || (!file && extra)) {
                currentChatFile = null;
                var strip = document.getElementById('homeFileStrip');
                var nameEl = document.getElementById('homeFileName');
                if (strip && nameEl) { nameEl.textContent = extra?extra.substring(0,50):type; strip.style.display = 'block'; }
                window._homePendingText = extra || type;
                updateHomeMicSend();
                return;
            }
            if (!file) return;
            // Show WhatsApp preview for images/videos; for other files just queue
            if (typeof showFilePreview === 'function' && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
                showFilePreview(file, function(f, caption, viewOnce) {
                    currentChatFile = f;
                    window._homePendingText = caption || null;
                    window._homeViewOnce = !!viewOnce;
                    if (f.type.startsWith('image/')) {
                        // Show WhatsApp-style thumb strip
                        var is = document.getElementById('homeImgStrip');
                        var th = document.getElementById('homeImgThumb');
                        var nm = document.getElementById('homeImgName');
                        var sz = document.getElementById('homeImgSize');
                        var fs = document.getElementById('homeFileStrip');
                        if (th) { var u = URL.createObjectURL(f); th.src = u; }
                        if (nm) nm.textContent = f.name;
                        if (sz) sz.textContent = (f.size > 1048576 ? (f.size/1048576).toFixed(1)+' MB' : (f.size/1024).toFixed(0)+' KB') + (viewOnce ? ' · View once' : '');
                        if (fs) fs.style.display = 'none';
                        if (is) is.style.display = 'flex';
                    } else {
                        var fs2 = document.getElementById('homeFileStrip');
                        var nm2 = document.getElementById('homeFileName');
                        var tp2 = document.getElementById('homeFsType');
                        var ic2 = document.getElementById('homeFsIco');
                        if (ic2) ic2.textContent = '📹';
                        if (tp2) tp2.textContent = 'Video';
                        if (nm2) nm2.textContent = f.name;
                        var is2 = document.getElementById('homeImgStrip');
                        if (is2) is2.style.display = 'none';
                        if (fs2) fs2.style.display = 'block';
                    }
                    sendChatMessage();
                });
                return;
            }
            currentChatFile = file;
            var strip = document.getElementById('homeFileStrip');
            var nameEl = document.getElementById('homeFileName');
            if (strip && nameEl) { nameEl.textContent = file.name; strip.style.display = 'block'; }
            updateHomeMicSend();
        }
        function openHomeCamera() { _openHomeCamera(); }
        function _openHomeCamera() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && typeof _openCameraWebRTC === 'function') {
              _attachCB = function(file) {
                if (!file) return;
                if (typeof showFilePreview === 'function') {
                  showFilePreview(file, function(f, caption) {
                    currentChatFile = f;
                    window._homePendingText = caption || null;
                    sendChatMessage();
                  });
                } else { onHomeAttach(file); }
              };
              _openCameraWebRTC(); return;
            }
            // Fallback: trigger hidden file input
            var inp = document.getElementById('_camInpHome'); if (inp) inp.click();
        }
        async function attachFile() { showAttachMenu(onHomeAttach); }
        // ── Home mic/send ──────────────────────────────────────────
        var _homeHeld=false, _homeHoldT=null;
        var _homeRec=null, _homeChunks=[], _homeStream=null, _homeInterval=null, _homeSecs=0;
        function updateHomeMicSend() {
            var inp = document.getElementById('chatInput');
            var hasContent = (inp && inp.value.trim().length>0) || !!currentChatFile || !!window._homePendingText;
            var mic = document.getElementById('homeMicSVG');
            var send = document.getElementById('homeSendSVG');
            var btn = document.getElementById('homeMicSendBtn');
            if (mic && send) { mic.style.display = hasContent?'none':''; send.style.display = hasContent?'':'none'; }
        }
        // ── New send button: tap=send/voice, hold=view-once ───────────────
        var _hmVoMode=false, _hmSbTimer=null, _hmSbFired=false;
        function _hmSbStart(e){ e.preventDefault(); _hmSbFired=false; _hmSbTimer=setTimeout(function(){ _hmSbFired=true; _hmToggleVO(); },700); }
        function _hmSbEnd(e){
          clearTimeout(_hmSbTimer);
          if(_hmSbFired){ _hmSbFired=false; return; }
          var hasContent=updateHomeMicSendState();
          if(hasContent){ _hmVoMode?_hmSendVO():sendChatMessage(); }
          else { if(typeof WaEmojiPanel!=='undefined') WaEmojiPanel.openVoiceSheet(); }
        }
        function _hmSbCancel(){ clearTimeout(_hmSbTimer); _hmSbFired=false; }
        function updateHomeMicSendState() {
            var inp=document.getElementById('chatInput');
            return (inp&&inp.value.trim().length>0)||!!currentChatFile||!!window._homePendingText;
        }
        function _hmToggleVO(){
          _hmVoMode=!_hmVoMode;
          if(navigator.vibrate) navigator.vibrate(40);
          _hmUpdateBtn();
        }
        function _hmUpdateBtn(){
          var btn=document.getElementById('homeMicSendBtn');
          var mic=document.getElementById('homeMicSVG'), send=document.getElementById('homeSendSVG');
          var voOnce=document.getElementById('homeVoOnceSVG'), badge=document.getElementById('homeVoBadge');
          if(!btn) return;
          if(_hmVoMode){
            if(mic)  mic.style.display='none';
            if(send) send.style.display='none';
            if(voOnce) voOnce.style.display='';
            if(badge) badge.style.display='block';
          } else {
            if(voOnce) voOnce.style.display='none';
            if(badge)  badge.style.display='none';
            var hasContent=updateHomeMicSendState();
            if(mic)  mic.style.display=hasContent?'none':'';
            if(send) send.style.display=hasContent?'':'none';
          }
        }
        function _hmSendVO(){
          var inp=document.getElementById('chatInput'); var text=(inp&&inp.value.trim())||'';
          if(!text&&!currentChatFile&&!window._homePendingText) return;
          if(!currentUser) return;
          if(inp) inp.value=''; _hmVoMode=false; _hmUpdateBtn();
          if(typeof WaEmojiPanel!=='undefined') WaEmojiPanel.close();
          var msgData={message:text||'📎 File',senderUid:currentUser.uid,
            senderName:(currentUserData&&currentUserData.name)||'Student',
            senderAvatar:(currentUserData&&currentUserData.photoURL)||null,
            ts:Date.now(),viewOnce:true};
          db.ref('public_chat').push(msgData);
          onHomeChatType();
        }
        // Legacy stubs (kept for compat with any remaining references)
        function cancelHomeVoice(){}
        function insertEmoji(emoji) {
            var input=document.getElementById('chatInput');
            if(input){ input.value+=emoji; onHomeChatType(); _homeResizeTA(input); input.focus(); }
            if(typeof WaEmojiPanel!=='undefined') WaEmojiPanel.close();
        }
        function clearHomeFileStrip() {
            var strip=document.getElementById('homeFileStrip');
            if(strip) strip.style.display='none';
        }
        
async function sendChatMessage() {
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            var extraText = window._homePendingText || null;
            if (!message && !currentChatFile && !extraText) return;

            // ── Edit mode ──────────────────────────────────────────────────────
            if (input.dataset.editingId && message) {
              var eId = input.dataset.editingId;
              await db.ref('public_chat/' + eId).update({message: message, edited: true, editTs: Date.now()});
              input.value = ''; delete input.dataset.editingId;
              onHomeChatType();
              var bar = document.getElementById('_pubEditBar'); if(bar) bar.style.display = 'none';
              showToast('✏️ Message updated');
              return;
            }

            // ── Secret commands ──────────────────────────────────────
            if (message && /^\.@calc(ulator)?$/i.test(message)) {
              input.value = ''; updateHomeMicSend();
              if (typeof GeminiChat !== 'undefined') GeminiChat.openCalc();
              return;
            }
            if (message && /^\.@calend(er|ar)?$/i.test(message)) {
              input.value = ''; updateHomeMicSend();
              if (typeof GeminiChat !== 'undefined') GeminiChat.openCalend();
              return;
            }

            window._homePendingText = null;
            // Close @mention dropdown
            var dd = document.getElementById('mentionDropdown');
            if(dd) dd.style.display='none';
            let fileUrl = null, fileType = null, fileName = null;
            if (currentChatFile) {
                var _isVid = currentChatFile.type && currentChatFile.type.startsWith('video/');
                if (_isVid && typeof uploadFileWithProgress === 'function') {
                    var _vLocalUrl = URL.createObjectURL(currentChatFile);
                    var _vOv = document.createElement('div');
                    _vOv.id = '_pubVidUpOv';
                    _vOv.style.cssText = 'position:fixed;inset:0;z-index:9800;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.72)';
                    _vOv.innerHTML = '<div style="position:relative;width:260px;height:195px;border-radius:16px;overflow:hidden">'+
                      '<video src="'+_vLocalUrl+'" muted playsinline style="width:100%;height:100%;object-fit:cover;filter:blur(8px);transform:scale(1.08)" id="_pubVidUpPrev"></video>'+
                      '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">'+
                        '<svg width="72" height="72" viewBox="0 0 72 72" style="transform:rotate(-90deg)">'+
                          '<circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="5"/>'+
                          '<circle id="_pubVidProg" cx="36" cy="36" r="30" fill="none" stroke="#ec4899" stroke-width="5" stroke-linecap="round" stroke-dasharray="188.5" stroke-dashoffset="188.5" style="transition:stroke-dashoffset .2s ease"/>'+
                        '</svg>'+
                        '<div id="_pubVidPct" style="position:absolute;font-size:15px;font-weight:700;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.7)">0%</div>'+
                      '</div>'+
                      '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.6));padding:10px 12px;font-size:12px;color:rgba(255,255,255,.8)">Uploading video…</div>'+
                    '</div>';
                    document.body.appendChild(_vOv);
                    const upload = await uploadFileWithProgress(currentChatFile, 'chat', function(pct) {
                        var pe = document.getElementById('_pubVidProg');
                        var pp = document.getElementById('_pubVidPct');
                        var vp = document.getElementById('_pubVidUpPrev');
                        if (pe) pe.setAttribute('stroke-dashoffset', (188.5*(1-pct/100)).toFixed(1));
                        if (vp) vp.style.filter = 'blur('+Math.max(0,8-(pct/100)*8).toFixed(1)+'px)';
                        if (pp) pp.textContent = pct+'%';
                    });
                    var _vOv2 = document.getElementById('_pubVidUpOv'); if(_vOv2) _vOv2.remove();
                    URL.revokeObjectURL(_vLocalUrl);
                    if (upload.success) {
                        fileUrl = upload.url; fileType = upload.fileType || getMimeFromName(currentChatFile.name); fileName = upload.fileName || currentChatFile.name;
                        window._pendingFileKey = upload.key || null;
                    } else { clearChatFile(); showToast('Upload failed: '+(upload.error||'Try again'),'error'); return; }
                    clearChatFile();
                } else {
                    showSendPill('Uploading file…');
                    const upload = await uploadFile(currentChatFile, 'chat');
                    if (upload.success) {
                        fileUrl  = upload.url;
                        fileType = upload.fileType || getMimeFromName(currentChatFile.name);
                        fileName = upload.fileName  || currentChatFile.name;
                        window._pendingFileKey = upload.key || null;
                    } else {
                        hideSendPill(); clearChatFile();
                        showToast('Upload failed: ' + (upload.error || 'Try again'), 'error');
                        return;
                    }
                    hideSendPill(); clearChatFile();
                }
            }
            var finalMsg = extraText ? (extraText + (message ? '\n' + message : '')) : message;
            // Guard: nothing to send?
            if (!finalMsg && !fileUrl) { updateHomeMicSend(); return; }
            await sendMessage(finalMsg, fileUrl, fileType, false, null, fileName, window._pendingFileKey||null);
            window._pendingFileKey = null;

            // ── @mention notifications ────────────────────────────────
            if (finalMsg) {
              var mentionMatches = finalMsg.match(/@(\w+)/g);
              if (mentionMatches && typeof sendMentionNotification === 'function') {
                var senderName = (window.currentUserData&&window.currentUserData.name)||(currentUser?(currentUser.displayName||'Someone'):'Someone');
                mentionMatches.forEach(function(m) {
                  sendMentionNotification(m.slice(1), senderName, finalMsg);
                });
              }
            }
            input.value = '';

            // Track history & check @gemini
            if(!window._homeChatHistory) window._homeChatHistory=[];
            window._homeChatHistory.push(finalMsg||'');
            if(window._homeChatHistory.length>12) window._homeChatHistory.shift();
            if(finalMsg && finalMsg.toLowerCase().includes('@gemini')){
              setTimeout(function(){ GeminiChat.check(finalMsg, window._homeChatHistory); }, 150);
            }
            updateHomeMicSend();
        }
        
function onHomeAttach(file, type, extra) {
            // type === 'text+file' means file came with a caption from preview
            if (type === 'text+file' && file) {
                currentChatFile = file;
                window._homePendingText = extra || null;
                var strip = document.getElementById('homeFileStrip');
                var nameEl = document.getElementById('homeFileName');
                if (strip && nameEl) { nameEl.textContent = (extra ? extra + ' · ' : '') + file.name; strip.style.display = 'block'; }
                updateHomeMicSend();
                // Auto-send immediately (preview already confirmed by user)
                sendChatMessage();
                return;
            }
            if (type === 'text' || (!file && extra)) {
                currentChatFile = null;
                var strip = document.getElementById('homeFileStrip');
                var nameEl = document.getElementById('homeFileName');
                if (strip && nameEl) { nameEl.textContent = extra?extra.substring(0,50):type; strip.style.display = 'block'; }
                window._homePendingText = extra || type;
                updateHomeMicSend();
                return;
            }
            if (!file) return;
            // Show WhatsApp preview for images/videos; for other files just queue
            if (typeof showFilePreview === 'function' && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
                showFilePreview(file, function(f, caption, viewOnce) {
                    currentChatFile = f;
                    window._homePendingText = caption || null;
                    window._homeViewOnce = !!viewOnce;
                    if (f.type.startsWith('image/')) {
                        // Show WhatsApp-style thumb strip
                        var is = document.getElementById('homeImgStrip');
                        var th = document.getElementById('homeImgThumb');
                        var nm = document.getElementById('homeImgName');
                        var sz = document.getElementById('homeImgSize');
                        var fs = document.getElementById('homeFileStrip');
                        if (th) { var u = URL.createObjectURL(f); th.src = u; }
                        if (nm) nm.textContent = f.name;
                        if (sz) sz.textContent = (f.size > 1048576 ? (f.size/1048576).toFixed(1)+' MB' : (f.size/1024).toFixed(0)+' KB') + (viewOnce ? ' · View once' : '');
                        if (fs) fs.style.display = 'none';
                        if (is) is.style.display = 'flex';
                    } else {
                        var fs2 = document.getElementById('homeFileStrip');
                        var nm2 = document.getElementById('homeFileName');
                        var tp2 = document.getElementById('homeFsType');
                        var ic2 = document.getElementById('homeFsIco');
                        if (ic2) ic2.textContent = '📹';
                        if (tp2) tp2.textContent = 'Video';
                        if (nm2) nm2.textContent = f.name;
                        var is2 = document.getElementById('homeImgStrip');
                        if (is2) is2.style.display = 'none';
                        if (fs2) fs2.style.display = 'block';
                    }
                    sendChatMessage();
                });
                return;
            }
            currentChatFile = file;
            var strip = document.getElementById('homeFileStrip');
            var nameEl = document.getElementById('homeFileName');
            if (strip && nameEl) { nameEl.textContent = file.name; strip.style.display = 'block'; }
            updateHomeMicSend();
        }
        function openHomeCamera() { _openHomeCamera(); }
        function _openHomeCamera() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && typeof _openCameraWebRTC === 'function') {
              _attachCB = function(file) {
                if (!file) return;
                if (typeof showFilePreview === 'function') {
                  showFilePreview(file, function(f, caption) {
                    currentChatFile = f;
                    window._homePendingText = caption || null;
                    sendChatMessage();
                  });
                } else { onHomeAttach(file); }
              };
              _openCameraWebRTC(); return;
            }
            // Fallback: trigger hidden file input
            var inp = document.getElementById('_camInpHome'); if (inp) inp.click();
        }
        async function attachFile() { showAttachMenu(onHomeAttach); }
        // ── Home mic/send ──────────────────────────────────────────
        var _homeHeld=false, _homeHoldT=null;
        var _homeRec=null, _homeChunks=[], _homeStream=null, _homeInterval=null, _homeSecs=0;
        function updateHomeMicSend() {
            var inp = document.getElementById('chatInput');
            var hasContent = (inp && inp.value.trim().length>0) || !!currentChatFile || !!window._homePendingText;
            var mic = document.getElementById('homeMicSVG');
            var send = document.getElementById('homeSendSVG');
            var btn = document.getElementById('homeMicSendBtn');
            if (mic && send) { mic.style.display = hasContent?'none':''; send.style.display = hasContent?'':'none'; }
        }
        // ── New send button: tap=send/voice, hold=view-once ───────────────
        var _hmVoMode=false, _hmSbTimer=null, _hmSbFired=false;
        
function _hmSbStart(e){ e.preventDefault(); _hmSbFired=false; _hmSbTimer=setTimeout(function(){ _hmSbFired=true; _hmToggleVO(); },700); }
        function _hmSbEnd(e){
          clearTimeout(_hmSbTimer);
          if(_hmSbFired){ _hmSbFired=false; return; }
          var hasContent=updateHomeMicSendState();
          if(hasContent){ _hmVoMode?_hmSendVO():sendChatMessage(); }
          else { if(typeof WaEmojiPanel!=='undefined') WaEmojiPanel.openVoiceSheet(); }
        }
        function _hmSbCancel(){ clearTimeout(_hmSbTimer); _hmSbFired=false; }
        function updateHomeMicSendState() {
            var inp=document.getElementById('chatInput');
            return (inp&&inp.value.trim().length>0)||!!currentChatFile||!!window._homePendingText;
        }
        function _hmToggleVO(){
          _hmVoMode=!_hmVoMode;
          if(navigator.vibrate) navigator.vibrate(40);
          _hmUpdateBtn();
        }
        function _hmUpdateBtn(){
          var btn=document.getElementById('homeMicSendBtn');
          var mic=document.getElementById('homeMicSVG'), send=document.getElementById('homeSendSVG');
          var voOnce=document.getElementById('homeVoOnceSVG'), badge=document.getElementById('homeVoBadge');
          if(!btn) return;
          if(_hmVoMode){
            if(mic)  mic.style.display='none';
            if(send) send.style.display='none';
            if(voOnce) voOnce.style.display='';
            if(badge) badge.style.display='block';
          } else {
            if(voOnce) voOnce.style.display='none';
            if(badge)  badge.style.display='none';
            var hasContent=updateHomeMicSendState();
            if(mic)  mic.style.display=hasContent?'none':'';
            if(send) send.style.display=hasContent?'':'none';
          }
        }
        function _hmSendVO(){
          var inp=document.getElementById('chatInput'); var text=(inp&&inp.value.trim())||'';
          if(!text&&!currentChatFile&&!window._homePendingText) return;
          if(!currentUser) return;
          if(inp) inp.value=''; _hmVoMode=false; _hmUpdateBtn();
          if(typeof WaEmojiPanel!=='undefined') WaEmojiPanel.close();
          var msgData={message:text||'📎 File',senderUid:currentUser.uid,
            senderName:(currentUserData&&currentUserData.name)||'Student',
            senderAvatar:(currentUserData&&currentUserData.photoURL)||null,
            ts:Date.now(),viewOnce:true};
          db.ref('public_chat').push(msgData);
          onHomeChatType();
        }
        // Legacy stubs (kept for compat with any remaining references)
        function cancelHomeVoice(){}
        
function insertEmoji(emoji) {
            var input=document.getElementById('chatInput');
            if(input){ input.value+=emoji; onHomeChatType(); _homeResizeTA(input); input.focus(); }
            if(typeof WaEmojiPanel!=='undefined') WaEmojiPanel.close();
        }
function clearChatFile() {
            currentChatFile = null;
            var s = document.getElementById('homeFileStrip');
            if (s) s.style.display = 'none';
            var is = document.getElementById('homeImgStrip');
            if (is) is.style.display = 'none';
            var th = document.getElementById('homeImgThumb');
            if (th) { try { URL.revokeObjectURL(th.src); } catch(e){} th.src = ''; }
        }