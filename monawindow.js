!function () {
  var monaWindow, dragging;
  window.MonaWindow = window.MonaWindow || function () {
    if (monaWindow)
      throw new Error('ロード済み');
    monaWindow = this;
    var width = 720, height = 428;
    var x = (document.documentElement.clientWidth - width) >> 1;
    var y = (document.documentElement.clientHeight - height) >> 1;
    var offsetY = document.documentElement.scrollTop || 0;
    var win = document.createElement('div');
    win.style.cssText =
      'background:#fff;margin:0;padding:0;position:fixed;top:' + y + 'px;left:' + x + 'px;border:1px solid #000;width:' + width +
      'px;height:' + height + 'px;overflow:hidden;resize:both;z-index:100000';
    var move = function (e) {
      if (!(e.buttons & 1)) {
        dragging = false;
        cover.style.display = 'none';
      }
      if (dragging) {
        win.style.left = (e.pageX - sx) + 'px';
        win.style.top = (e.pageY - sy + offsetY - document.documentElement.scrollTop) + 'px';
      }
    };
    var titlebar = win.appendChild(document.createElement('p'));
    titlebar.style.cssText = 'margin:0;padding:0;text-align:right;cursor:move;border-bottom:1px solid #000';
    var sx, sy;
    titlebar.onmousedown = function (e) {
      sx = e.pageX - parseInt(win.style.left);
      sy = e.pageY - parseInt(win.style.top);
      offsetY = document.documentElement.scrollTop;
      if (window.getSelection)
        getSelection().removeAllRanges();
      dragging = true;
      cover.style.display = 'block';
    };
    var closeButton = titlebar.appendChild(document.createElement('button'));
    closeButton.innerHTML = '×';
    closeButton.onclick = function () {
      document.body.removeChild(win);
      document.documentElement.removeEventListener('mousemove', move);
      document.documentElement.removeEventListener('mouseup', move);
      if (monaWindow.onclose) {
        var w = monaWindow;
        setTimeout(function () { w.onclose();}, 0);
      }
      monaWindow = null;
    };
    closeButton.style.cursor = 'default';
    var frame = win.appendChild(document.createElement('div'));
    var server = new MonaFakeServer({element:frame});
    frame.firstChild.style.cssText = 'width:100%;height:100%;border:0';
    frame.style.cssText = 'margin:0;padding:0;width:100%;height:calc(100% - 3em)';
    this.getServer = function () { return server;};
    var cover = frame.appendChild(document.createElement('div'));
    cover.style.cssText = 'display:none;position:absolute;width:100%;height:calc(100% - 3em);z-index:2;top:1.5em;left:0';
    document.documentElement.addEventListener('mousemove', move);
    document.documentElement.addEventListener('mouseup', move);
    document.body.appendChild(win);
  };
}();
