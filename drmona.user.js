// ==UserScript==
// @name     drmona
// @version  1
// @run-at   document-end
// @match    http://drrrkari.com/room/
// ==/UserScript==

var loadList = ['monafakeserver.js', 'monawindow.js', 'drmona.js'];
(function load() {
  if (!loadList.length)
    return;
  var s = document.createElement('script');
  s.onload = load;
  s.src = 'https://iwamizawa-software.github.io/mona-interface/' + loadList.shift();
  document.querySelector('head').appendChild(s);
})();
