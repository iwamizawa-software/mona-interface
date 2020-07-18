window.MonaFakeServer = window.MonaFakeServer || function (options) {
  var myId, url, origin, client, entered, iframe, width, height;
  if (!options)
    options = {};
  width = options.width || 720;
  height = options.height || 380;
  myId = options.id || 'self';
  origin = (url = (options.url || 'http://mojachat.html.xdomain.jp/') + '?selfname=' + encodeURIComponent(myId)).replace(/^(https?:\/\/[^\/]+).*$/, '$1');
  if (!(client = options.client)) {
    if (options.element && location.protocol === 'http:') {
      iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.width = width;
      iframe.height = height;
      iframe.onload = function () {
        client = iframe.contentWindow;
      };
      options.element.appendChild(iframe);
    } else if (!(client = window.open(url))) {
      throw new Error('Failed to create window');
    }
  }

  var toClient = function (obj) {
    if (entered)
      client.postMessage(obj, origin);
  };
  var self = this;
  window.addEventListener('message', function (e) {
    if (e.origin === origin && e.source === client) {
      if (e.data.attr && !('id' in e.data.attr))
        e.data.attr.id = myId;
      if (e.data.type === 'ENTER') {
        if (e.data.attr)
          e.data.attr.ihash = '....myself';
        if (connected) {
          self.update(e.data);
          entered = true;
          var children = [];
          for (var id in member)
            children.push(member[id]);
          toClient({type:'ROOM',attr:{},children:children});
          toClient(member[myId]);
          toClient({type:'COUNT',attr:{c:count}});
          return;
        } else {
          entered = true;
        }
      } else if (e.data.type === 'EXIT') {
        entered = false;
        if (connected)
          return;
      }
      if (connected) {
        if (self.onmessage)
          self.onmessage(e.data);
      } else {
        self.update(e.data);
      }
    }
  });

  var connected, serverId, member = {}, count = 0, serverAttr = {};
  this.connect = function (id) {
    connected = true;
    serverId = '' + id;
  };
  var merge = function (target, source) {
    if (target)
      for (var i in source)
        target[i] = source[i];
  };
  var randomColor = function () { return [100, 90, 70, 40][Math.random() * 4 | 0];};
  var initAttr = {
    x : function () {
      var w = iframe ? window.getComputedStyle ? parseInt(getComputedStyle(iframe).getPropertyValue('width')) : iframe.width : width;
      return 40 - (w - 720) / 2 + Math.random() * w;
    },
    y : function () {
      var h = iframe ? window.getComputedStyle ? parseInt(getComputedStyle(iframe).getPropertyValue('height')) : iframe.height : height;
      return 240 + Math.random() * (h - 280);
    },
    scl : 100,
    stat : '通常',
    r : randomColor,
    g : randomColor,
    b : randomColor,
    type : function () {
      var a = 'モナー系:mona,marumimi,shodai,oomimi,kuromimi,polygon,agemona,anamona,mora,urara,fuun,iiajan,nida,gerara,sens,gari,yamazaki1,yamazaki2,boljoa3,boljoa4,puru,mosamosa1,mosamosa2,mosamosa3,mosamosa4,kamemona,ﾜｼｮｰｲ系:oni,wachoi,oniini,tofu,niku,ω系:iyou,ppa2,foppa,charhan,aramaki,>>1 8頭身:ichi,ichi2,ichineko,hat2,hati4,hati,hati3,女の子系:remona,monaka,riru,alice,batu,mina,miwa,kabin,ギコしぃ系:giko,tatigiko,zuza,sugoi3,ging,maturi,usi,nezumi,abogado,bana,uma,sika,kato,haka,tokei,gyouza,papi,tibigiko,fusa,suwarifusa,tibifusa,sii2,tibisii,tuu,hokkyoku6,顔文字系:jien,kita,haa,nyog,gaku,shob,shak,boljoa,その他1:mouk,mouk1,mouk2,hikk,dokuo,dokuo2,hosh,sira,siranaiwa,tiraneyo,ginu,unko,kasiwa,kappappa,zonu,asou,hiyoko,nin3,kunoichi,osa,cock,coc2,ri_man,chichon,nanyo,tahara,maji,kikko2,sumaso2,niraneko,niraime,niraime2,niramusume,その他2:chotto1,chotto2,chotto3,mossari,yokan,koit,koya,ranta,kyaku,taxi,moudamepo,sai,shaitama,welneco2,kagami,gakuri,unknown2,もまくる:boljoa2,joruju,joruju2,nazoko,nin,tibifusa2,unknown'.replace(/(^|,)[^,:]+:/g,'$1').split(',');
      return a[a.length * Math.random() | 0];
    }
  };
  this.update = function (obj, uncount) {
    if (!obj.attr)
      obj.attr = {};
    if (obj.type === 'ROOM') {
      for (var id in member)
        if (id !== myId)
          this.update({type:'EXIT',id:id}, true);
      for (var i = 0; i < obj.children.length; i++)
        this.update(obj.children[i], true);
    } else {
      if ('' + obj.attr.id === serverId)
        obj.attr.id = myId;
      switch (obj.type) {
        case 'USER':
          obj.type = 'ENTER';
        case 'ENTER':
          var fromClient = 'room' in obj.attr;
          if (obj.attr.id === myId && !fromClient) {
            serverAttr = {};
            for (var key in obj.attr)
              serverAttr[key] = 1;
          }
          var user = member[obj.attr.id];
          if (user) {
            if (obj.attr.id === myId && fromClient)
              for (var key in serverAttr)
                delete obj.attr[key];
            merge(user.attr, obj.attr);
            obj = user;
            toClient({type:'EXIT',attr:{id:obj.attr.id}});
          } else {
            for (var key in initAttr)
              if (!(key in obj.attr))
                obj.attr[key] = typeof initAttr[key] === 'function' ? initAttr[key]() : initAttr[key];
            count++;
            member[obj.attr.id] = obj;
          }
          break;
        case 'EXIT':
          if (member[obj.attr.id]) {
            count--;
            delete member[obj.attr.id];
          }
          break;
        case 'SET':
          if (member[obj.attr.id])
            merge(member[obj.attr.id].attr, obj.attr);
      }
      toClient(obj);
      if (obj.type === 'ENTER' && obj.attr.id !== myId)
        obj.type = 'USER';
    }
    if (!uncount && {ROOM:1,USER:1,EXIT:1}[obj.type])
      toClient({type:'COUNT',attr:{c:count}});
  };
  this.disconnect = function () {
    for (var id in member)
      if (id !== myId)
        this.update({type:'EXIT',id:id});
    serverAttr = {};
    connected = false;
  };
  this.clientStatus = function () { return entered;};

};
