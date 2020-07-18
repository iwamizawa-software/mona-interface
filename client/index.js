!function () {

  var server = window === parent ? window.opener : parent;
  if (!server) {
    document.body.innerHTML = '<p>サーバーがない';
    return;
  }
  
  var swf = document.createElement('embed');
  swf.src = 'http://monachat.dyndns.org/mojachat5l.swf';
  swf.setAttribute('quality', 'high');
  swf.setAttribute('bgcolor', '#ffffff');
  swf.setAttribute('flashVars',
    (location.search.length ? location.search.slice(1) + '&' : '') + 'description=' +
    encodeURIComponent('<p align="center"><font size="48" color="#ff0000"><u><a href="asfunction:System.security.allowDomain,' + location.hostname + '">OKは押さずこのリンクをクリックして待つ</a></u></font></p>')
  );
  document.body.appendChild(swf);

  var xmlToObj = function (xml) {
    var obj = {
      type : xml.tagName,
      attr : {},
      children : []
    };
    for (var i = 0; i < xml.attributes.length; ++i) {
      var a = xml.attributes[i];
      obj.attr[a.name] = a.value;
    }
    for (var i = 0; i < xml.childNodes.length; ++i)
      obj.children.push(xmlToObj(xml.childNodes[i]));
    return obj;
  };
  var escapeXML = function (text) {
    return ('' + text).replace(/[\r\n]/g, '').replace(/[<>&"']/g, function (s) { return '&#'+s.charCodeAt(0)+';'});
  };
  var objToXml = function (obj) {
    if (typeof obj === 'string')
      return escapeXML(obj);
    var parts = ['<' + obj.type];
    for (var key in obj.attr)
      parts.push(key + '="' + escapeXML(obj.attr[key]) + '"');
    parts = [parts.join(' ') + '>'];
    if (obj.children)
      for (var i = 0; i < obj.children.length; i++)
        parts.push(objToXml(obj.children[i]));
    return parts.join('') + '</' + obj.type + '>';
  };
  var parser = new DOMParser();
  window.MonaInterface = function (uri) {
    setTimeout(function (xml) {
      if (xml = ((parser.parseFromString(decodeURIComponent(uri), 'text/xml')) || {}).documentElement)
        server.postMessage(xmlToObj(xml), '*');
    }, 0);
  };
  window.addEventListener('message', function (e) {
    swf.onData(objToXml(e.data));
  });
}();
