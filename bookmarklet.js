!function () {
  var currentDirectory = location.href.replace(/[^/]+$/, '');
  var createBookmarklet = function (name, srcList, match) {
    for (var i = 0; i < srcList.length; i++)
      if (srcList[i].indexOf('http'))
        srcList[i] = currentDirectory + srcList[i];
    document.getElementById(name).innerHTML = '';
    var a = document.getElementById(name).appendChild(document.createElement('a'));
    a.href = 'javascript:' + encodeURIComponent('!' + function f(srcList, match) {
      if (match && location.href.indexOf(match))
        return alert('チャットのページでやる');
      var head = document.getElementsByTagName('head')[0];
      if (src = srcList.shift()) {
        var script = document.createElement('script');
        script.src = src + '?' + (new Date()).getTime();
        script.onerror = script.onload = function () {
          head.removeChild(this);
          f(srcList);
        };
        head.appendChild(script);
      }
    } + '.apply(null, ' + JSON.stringify([srcList, match]) + ');void 0');
    a.text = name;
    a.onclick = function () { return false;};
  };
  createBookmarklet('drmona', [
    'monafakeserver.js',
    'monawindow.js',
    'drmona.js'
  ], 'http://drrrkari.com/room/');
}();
