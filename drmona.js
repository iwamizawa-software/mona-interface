!function (drChar, specialChar) {
  if (!window.$)
    return alert('$がない');
  var monaWindow = new MonaWindow();
  var overrideFunction = function (obj, property, func) {
    var original = obj[property];
    obj[property] = function () {
      var value = func.apply(this, arguments);
      return value === undefined && typeof original === 'function' ? original.apply(this, arguments) : value;
    };
    return function () {
      if (obj[property] !== func)
        func = function () {};
      else if (original)
        obj[property] = original;
      else
        delete obj[property];
    };
  };
  var restoreConfirm = overrideFunction(window, 'confirm', function (msg) {
    if (msg === '連続送信を中止しますか？「キャンセル」を押すと再送信します。')
      return false;
  });
  var dummyFrame = document.body.appendChild(document.createElement('div'));
  dummyFrame.style.display = 'none';
  var imgForm = document.getElementById('upimgform');
  imgForm.target = 'dummy';
  imgForm.onsubmit = function () {
    imgForm.elements.upimg.value = 'アップロード中';
  };
  dummyFrame.innerHTML = '<iframe name="dummy" onload="document.getElementById(\'upimgform\').elements.upimg.value=\'アップロード\'"></iframe>';
  var head = document.getElementsByTagName('head')[0], hideImg = document.createElement('style');
  hideImg.appendChild(document.createTextNode('#talks .talk a:not([data-allow]) img{display:none}#talks .talk a[href^="/upimg/"]:not([data-allow]):after{content:"画像を表示する"}#talks .talk a[href^="/upimg/"][data-allow]:after{content:"画像を表示しない"}#talks .talk a:not([data-allow="2"]) img{max-width:100px!important;max-height:100px!important}'));
  head.appendChild(hideImg);
  var allowIdList = {};
  var getAllowId = function (a) {
    try {
      var dl = a.parentNode.parentNode.parentNode.parentNode;
      return dl.getElementsByTagName('dt')[0].firstChild.nodeValue + dl.className.slice(4);
    } catch (e) {}
  };
  var allowImage = function (a, allow) {
    var id = getAllowId(a);
    if (allow) {
      allowIdList[id] = a.dataset.allow = allow;
    } else {
      delete a.dataset.allow;
      delete allowIdList[id];
    }
  };
  document.getElementById('talks_box').onclick = function (e) {
    if ((e.target.tagName || '').toLowerCase() === 'img') {
      allowImage(e.target.parentNode, '2');
      return;
    }
    if ((e.target.href + '').indexOf('http://drrrkari.com/upimg/'))
      return;
    allowImage(e.target, e.target.dataset.allow ? '' : '1');
    return false;
  };
  var restoreDOM = overrideFunction(Node.prototype, 'insertBefore', function (newNode, referenceNode) {
    if (this.id !== 'talks')
      return;
    var img = newNode.getElementsByTagName('img')[0];
    if (img) {
      var allow = allowIdList[getAllowId(img.parentNode)];
      if (allow)
        img.parentNode.dataset.allow = allow;
    } else {
      var a = newNode.getElementsByTagName('a')[0];
      if (!a)
        return;
      a.href = a.text;
      a.rel = 'noopener noreferrer';
    }
  });
  var server = monaWindow.getServer();
  server.onmessage = function (obj) {
    if (obj.type === 'COM') {
      document.querySelector('textarea[name=message]').value = obj.attr.cmt;
      document.querySelector('input[name=post]').click();
    }
    this.update(obj);
  };
  monaWindow.onclose = function () {
    document.body.removeChild(dummyFrame);
    imgForm.target = '';
    imgForm.onsubmit = null;
    head.removeChild(hideImg);
    restoreConfirm();
    restoreDOM();
    restoreAjax();
  };
  var dr2mona = {};
  var monaAttr = function (user) {
    var attr = {
      id : +dr2mona[user.id] || '1000000',
      ihash : (user.encip || '??????????').slice(0, 10),
      name : user.name
    };
    var char = specialChar[user.name] || drChar[user.icon];
    for (var key in char)
      attr[key] = char[key];
    if (user.trip)
      attr.trip = user.trip;
    return attr;
  };
  var exit = function (drId) {
    if (!(drId in dr2mona))
      return;
    var monaId = dr2mona[drId];
    delete dr2mona[drId];
    delete member[monaId];
    server.update({type:'EXIT',attr:{id:monaId}});
  };
  var entered, myId, member = {}, lastTalkId;
  var restoreAjax = overrideFunction($.ajaxSettings, 'complete', function (xhr) {
    if (!(xhr.responseText && (entered || (entered = server.clientStatus()))))
      return;
    var obj = JSON.parse(xhr.responseText);
    for (var monaId in obj.users)
      if (!member[monaId]) {
        exit(obj.users[monaId].id);
        dr2mona[obj.users[monaId].id] = monaId;
        member[monaId] = obj.users[monaId];
        if (!member[monaId].encip)
          member[monaId].encip = obj.hostip;
        if (myId !== undefined)
          server.update({type:'ENTER',attr:monaAttr(member[monaId])});
      }
    if (myId === undefined) {
      myId = dr2mona[document.getElementById('user_id').innerHTML];
      if (myId === undefined)
        return;
      server.connect(myId);
      var children = [];
      for (var monaId in member)
        children.push({type:'USER',attr:monaAttr(member[monaId])});
      server.update({type:'ROOM',attr:{},children:children});
      lastTalkId = obj.talks && obj.talks[obj.talks.length - 1].id;
    }
    if (obj.talks) {
      for (var i = obj.talks.length - 1; obj.talks[i] && obj.talks[i].id !== lastTalkId; i--);
      for (i++; i < obj.talks.length; i++) {
        if (obj.talks[i].uid in dr2mona) {
          var monaId = dr2mona[obj.talks[i].uid];
          if (monaId !== myId && member[monaId].lastTalkId !== obj.talks[i].id)
            server.update({type:'COM',attr:{id:monaId,cmt:obj.talks[i].message}});
          member[monaId].lastTalkId = obj.talks[i].id;
        }
      }
      lastTalkId = obj.talks[obj.talks.length - 1].id;
    }
    for (var monaId in member)
      if (!obj.users[monaId])
        exit(member[monaId].id);
  });
}({
  'girl' : {r : 100, g : 40, b : 40, type : 'batu'},
  'moza' : {r : 90, g : 90, b : 100, type : 'unknown2'},
  'tanaka' : {r : 70, g : 90, b : 100, type : 'mona'},
  'kanra' : {r : 90, g : 70, b : 40, type : 'niramusume'},
  'usa' : {r : 100, g : 100, b : 40, type : 'remona'},
  'gg' : {r : 100, g : 70, b : 90, type : 'alice'},
  'orange' : {r : 100, g : 70, b : 40, type : 'monaka'},
  'zaika' : {r : 90, g : 40, b : 40, type : 'mina'},
  'setton' : {r : 40, g : 40, b : 40, type : 'hikk'},
  'zawa' : {r : 40, g : 70, b : 40, type : 'boljoa3'},
  'neko' : {r : 100, g : 70, b : 70, type : 'riru'},
  'purple' : {r : 90, g : 70, b : 100, type : 'urara'},
  'kai' : {r : 70, g : 70, b : 40, type : 'chichon'},
  'bakyura' : {r : 70, g : 90, b : 40, type : 'ri_man'},
  'neko2' : {r : 90, g : 90, b : 90, type : 'oomimi'},
  'numakuro' : {r : 40, g : 70, b : 100, type : 'puru'},
  'bm' : {r : 70, g : 70, b : 70, type : 'mora'},
  'bear' : {r : 70, g : 40, b : 40, type : 'hokkyoku6'},
  'rab' : {r : 100, g : 70, b : 100, type : 'tibisii'},
  'nyan' : {r : 100, g : 70, b : 40, type : 'suwarifusa'},
  'muff' : {r : 40, g : 40, b : 40, type : 'hikk'},
  'muff_nyan' : {r : 100, g : 70, b : 40, type : 'suwarifusa'},
  'twin' : {r : 100, g : 40, b : 40, type : 'tibigiko'}
}, {
  '名無しさん' : {r : 100, g : 100, b : 100, type : 'charhan'},
  'もなちゃと' : {r : 100, g : 100, b : 100, type : 'mona'}
});
