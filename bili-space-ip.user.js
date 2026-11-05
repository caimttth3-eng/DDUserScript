// ==UserScript==
// @name         B站空间IP属地显示
// @namespace    https://github.com/caimttth3-eng/DDUserScript
// @version      1.2
// @description  在B站用户空间页把该用户的IP属地贴在用户名后面显示。原理：通过TV端登录二维码获取 access_key（扫码一次长期有效、自动续期），调用App端动态接口读取其最新动态详情中的IP属地字段。支持PC与移动端空间页。
// @author       caimttth3-eng
// @match        https://space.bilibili.com/*
// @match        https://m.bilibili.com/space/*
// @match        https://m.bilibili.com/space
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      app.bilibili.com
// @connect      passport.bilibili.com
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /* ================= MD5 (hex) ================= */
  var md5 = (function () {
    function safeAdd(x, y) { var lsw = (x & 0xffff) + (y & 0xffff), msw = (x >> 16) + (y >> 16) + (lsw >> 16); return (msw << 16) | (lsw & 0xffff); }
    function bitRotateLeft(n, c) { return (n << c) | (n >>> (32 - c)); }
    function md5cmn(q, a, b, x, s, t) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
    function md5ff(a, b, c, d, x, s, t) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
    function md5gg(a, b, c, d, x, s, t) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
    function md5hh(a, b, c, d, x, s, t) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
    function md5ii(a, b, c, d, x, s, t) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }
    function binlMD5(x, len) {
      x[len >> 5] |= 0x80 << (len % 32);
      x[(((len + 64) >>> 9) << 4) + 14] = len;
      var a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
      for (var i = 0; i < x.length; i += 16) {
        var olda = a, oldb = b, oldc = c, oldd = d;
        a = md5ff(a, b, c, d, x[i], 7, -680876936); d = md5ff(d, a, b, c, x[i + 1], 12, -389564586); c = md5ff(c, d, a, b, x[i + 2], 17, 606105819); b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = md5ff(a, b, c, d, x[i + 4], 7, -176418897); d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426); c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341); b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416); d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417); c = md5ff(c, d, a, b, x[i + 10], 17, -42063); b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682); d = md5ff(d, a, b, c, x[i + 13], 12, -40341101); c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290); b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
        a = md5gg(a, b, c, d, x[i + 1], 5, -165796510); d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632); c = md5gg(c, d, a, b, x[i + 11], 14, 643717713); b = md5gg(b, c, d, a, x[i], 20, -373897302);
        a = md5gg(a, b, c, d, x[i + 5], 5, -701558691); d = md5gg(d, a, b, c, x[i + 10], 9, 38016083); c = md5gg(c, d, a, b, x[i + 15], 14, -660478335); b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = md5gg(a, b, c, d, x[i + 9], 5, 568446438); d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690); c = md5gg(c, d, a, b, x[i + 3], 14, -187363961); b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467); d = md5gg(d, a, b, c, x[i + 2], 9, -51403784); c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473); b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
        a = md5hh(a, b, c, d, x[i + 5], 4, -378558); d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463); c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562); b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060); d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353); c = md5hh(c, d, a, b, x[i + 7], 16, -155497632); b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = md5hh(a, b, c, d, x[i + 13], 4, 681279174); d = md5hh(d, a, b, c, x[i], 11, -358537222); c = md5hh(c, d, a, b, x[i + 3], 16, -722521979); b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = md5hh(a, b, c, d, x[i + 9], 4, -640364487); d = md5hh(d, a, b, c, x[i + 12], 11, -421815835); c = md5hh(c, d, a, b, x[i + 15], 16, 530742520); b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
        a = md5ii(a, b, c, d, x[i], 6, -198630844); d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415); c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905); b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571); d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606); c = md5ii(c, d, a, b, x[i + 10], 15, -1051523); b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359); d = md5ii(d, a, b, c, x[i + 15], 10, -30611744); c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380); b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = md5ii(a, b, c, d, x[i + 4], 6, -145523070); d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379); c = md5ii(c, d, a, b, x[i + 2], 15, 718787259); b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
        a = safeAdd(a, olda); b = safeAdd(b, oldb); c = safeAdd(c, oldc); d = safeAdd(d, oldd);
      }
      return [a, b, c, d];
    }
    function binl2hex(binarray) {
      var hexTab = '0123456789abcdef', str = '';
      for (var i = 0; i < binarray.length * 4; i++) {
        str += hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xf) + hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xf);
      }
      return str;
    }
    function str2binl(str) {
      var bin = [], mask = (1 << 8) - 1;
      for (var i = 0; i < str.length * 8; i += 8) bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32);
      return bin;
    }
    return function (s) { return binl2hex(binlMD5(str2binl(unescape(encodeURIComponent(s))), s.length * 8)); };
  })();

  /* ================= 核心逻辑（内嵌 bili_ip_core） ================= */
  var Core = {};
  var APP_KEY_HD = 'dfca71928277209b';
  var APP_SECRET_HD = 'b5475a8825547a4fc26c7d518eaaa02e';
  var BUILD = 1450000;
  var STATISTICS = '{"appId":5,"platform":3,"version":"7.82.0","abtest":""}';
  var GRPC_UA = 'Dalvik/2.1.0 (Linux; U; Android 12; 2201123C Build/V417IR) 1.45.0 os/android model/2201123C mobi_app/android_hd build/1450000 channel/bilibili140 innerVer/1450000 osVer/12 network/2';
  var FORM_UA = 'Mozilla/5.0 BiliDroid/1.45.0 (bbcallen@gmail.com) os/android model/2201123C mobi_app/android_hd build/1450000 channel/bili innerVer/1450000 osVer/12 network/2';
  var GRPC_BASE = 'https://app.bilibili.com/';

  function utf8Encode(str) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.codePointAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else { out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); i++; }
    }
    return Uint8Array.from(out);
  }
  function utf8Decode(bytes) {
    if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    try { return decodeURIComponent(escape(s)); } catch (e) { return s; }
  }
  var B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  function b64FromBytes(bytes) {
    var out = [];
    for (var i = 0; i < bytes.length; i += 3) {
      var b0 = bytes[i], b1 = i + 1 < bytes.length ? bytes[i + 1] : 0, b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
      out.push(B64_CHARS[b0 >> 2]);
      out.push(B64_CHARS[((b0 & 3) << 4) | (b1 >> 4)]);
      out.push(i + 1 < bytes.length ? B64_CHARS[((b1 & 15) << 2) | (b2 >> 6)] : '=');
      out.push(i + 2 < bytes.length ? B64_CHARS[b2 & 63] : '=');
    }
    return out.join('');
  }
  function bytesToArr(b) { return Array.prototype.slice.call(b); }
  function pbVarint(n) {
    var out = [], v = n;
    if (v < 0) v = v >>> 0;
    while (v >= 128) { out.push((v % 128) | 0x80); v = Math.floor(v / 128); }
    out.push(v);
    return out;
  }
  function pbTag(field, wire) { return pbVarint((field << 3) | wire); }
  function pbBytes(field, bytes) {
    var out = pbTag(field, 2);
    out = out.concat(pbVarint(bytes.length));
    return out.concat(bytesToArr(bytes));
  }
  function pbString(field, s) { return pbBytes(field, utf8Encode(s)); }
  function pbInt(field, n) { return pbTag(field, 0).concat(pbVarint(n)); }
  function concatBytes(arrays) {
    var total = 0;
    arrays.forEach(function (a) { total += a.length; });
    var out = new Uint8Array(total), off = 0;
    arrays.forEach(function (a) { out.set(a, off); off += a.length; });
    return out;
  }
  function Reader(bytes) { this.b = bytes; this.i = 0; }
  Reader.prototype.varint = function () {
    var n = 0, s = 0;
    for (;;) {
      var c = this.b[this.i++];
      n += (c & 0x7f) * Math.pow(2, s);
      if (!(c & 0x80)) return n;
      s += 7;
    }
  };
  Reader.prototype.field = function () {
    if (this.i >= this.b.length) return null;
    var tag = this.varint();
    return { f: tag >>> 3, wire: tag & 7 };
  };
  Reader.prototype.readBytes = function (len) { var o = this.b.subarray(this.i, this.i + len); this.i += len; return o; };
  Reader.prototype.skip = function (wire) {
    if (wire === 0) this.varint();
    else if (wire === 1) this.i += 8;
    else if (wire === 2) { var l = this.varint(); this.i += l; }
    else if (wire === 5) this.i += 4;
    else this.i = this.b.length;
  };
  function pbWalk(bytes) {
    var r = new Reader(bytes), out = [];
    for (;;) {
      var fd = r.field();
      if (!fd) break;
      if (fd.wire === 0) out.push({ f: fd.f, wire: 0, value: r.varint() });
      else if (fd.wire === 1) out.push({ f: fd.f, wire: 1, value: r.readBytes(8) });
      else if (fd.wire === 2) { var l = r.varint(); out.push({ f: fd.f, wire: 2, value: r.readBytes(l) }); }
      else if (fd.wire === 5) out.push({ f: fd.f, wire: 5, value: r.readBytes(4) });
      else r.skip(fd.wire);
    }
    return out;
  }
  function pbFieldBytes(fields, n) {
    for (var i = 0; i < fields.length; i++) if (fields[i].f === n && fields[i].wire === 2) return fields[i].value;
    return null;
  }
  function pbAllFields(fields, n) {
    var out = [];
    for (var i = 0; i < fields.length; i++) if (fields[i].f === n) out.push(fields[i]);
    return out;
  }
  function metaBin(accessKey, buvid) {
    var m = [];
    if (accessKey) m = m.concat(pbString(1, accessKey));
    m = m.concat(pbString(2, 'android_hd'));
    m = m.concat(pbInt(4, BUILD));
    m = m.concat(pbString(5, 'bilibili140'));
    m = m.concat(pbString(6, buvid));
    m = m.concat(pbString(7, 'android'));
    return Uint8Array.from(m);
  }
  function deviceBin(buvid) {
    var m = [];
    m = m.concat(pbInt(1, 5), pbInt(2, BUILD), pbString(3, buvid), pbString(4, 'android_hd'), pbString(5, 'android'), pbString(6, ''), pbString(7, 'bilibili140'), pbString(8, 'Xiaomi'), pbString(9, '2201123C'));
    return Uint8Array.from(m);
  }
  function fawkesBin() { return Uint8Array.from(pbString(1, 'android_hd').concat(pbString(2, 'prod'))); }
  function localeBin() { var ids = pbString(1, 'zh').concat(pbString(3, 'CN')); return Uint8Array.from(pbBytes(1, ids).concat(pbBytes(2, ids))); }
  function networkBin() { return Uint8Array.from(pbInt(1, 1).concat(pbString(3, '46007'))); }
  function pyQuote(str) {
    var out = '', s = String(str);
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (/[A-Za-z0-9\-._~]/.test(ch)) { out += ch; continue; }
      var bytes = utf8Encode(ch);
      for (var j = 0; j < bytes.length; j++) out += '%' + bytes[j].toString(16).toUpperCase().padStart(2, '0');
    }
    return out;
  }
  function signParams(params) {
    var enc = {}, keys = Object.keys(params);
    keys.forEach(function (k) { enc[k] = pyQuote(params[k]); });
    var pairs = keys.map(function (k) { return k + '=' + enc[k]; }).sort();
    var q = pairs.join('&');
    return { query: q, sign: md5(q + APP_SECRET_HD) };
  }
  function baseParams(extra) {
    var p = { appkey: APP_KEY_HD, platform: 'android', channel: 'bili', mobi_app: 'android_hd', statistics: STATISTICS, build: BUILD, c_locale: 'zh_CN', s_locale: 'zh_CN', ts: Math.floor(Date.now() / 1000) };
    for (var k in (extra || {})) p[k] = extra[k];
    return p;
  }

  /* GM 适配 HTTP */
  function gmFetch(url, options) {
    return new Promise(function (resolve, reject) {
      GM_xmlhttpRequest({
        method: options.method || 'GET',
        url: url,
        headers: options.headers || {},
        data: options.body ? (typeof options.body === 'string' ? options.body : new Blob([options.body])) : undefined,
        responseType: 'arraybuffer',
        onload: function (res) {
          var headers = {};
          var raw = (res.responseHeaders || '').split('\r\n');
          raw.forEach(function (line) {
            var idx = line.indexOf(':');
            if (idx > 0) headers[line.slice(0, idx).trim().toLowerCase()] = line.slice(idx + 1).trim();
          });
          resolve({
            arrayBuffer: function () { return Promise.resolve(res.response); },
            headers: { get: function (k) { return headers[String(k).toLowerCase()] || null; } },
          });
        },
        onerror: function () { reject(new Error('网络请求失败: ' + url)); },
        ontimeout: function () { reject(new Error('请求超时: ' + url)); },
      });
    });
  }
  function gunzipBuffer(buf) {
    return new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer().then(function (ab) { return new Uint8Array(ab); });
  }

  function postForm(url, params) {
    var sp = signParams(params);
    var body = sp.query + '&sign=' + sp.sign;
    return gmFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': FORM_UA, 'APP-KEY': 'android_hd' },
      body: body,
    }).then(function (res) { return res.arrayBuffer(); }).then(function (buf) {
      var text = utf8Decode(new Uint8Array(buf));
      try { return JSON.parse(text); } catch (e) { throw new Error('非JSON响应: ' + text.slice(0, 200)); }
    });
  }
  function grpcCall(path, msgBytes, auth) {
    var headers = {
      'Content-Type': 'application/grpc',
      'User-Agent': GRPC_UA,
      'APP-KEY': 'android_hd',
      'grpc-timeout': '20100m',
      'grpc-accept-encoding': 'identity,deflate,gzip',
      'env': 'prod',
      'te': 'trailers',
      'x-bili-device-bin': b64FromBytes(deviceBin(auth.buvid)),
      'x-bili-fawkes-req-bin': b64FromBytes(fawkesBin()),
      'x-bili-locale-bin': b64FromBytes(localeBin()),
      'x-bili-network-bin': b64FromBytes(networkBin()),
      'x-bili-restriction-bin': b64FromBytes(Uint8Array.from([0x08, 0x00])),
      'x-bili-metadata-bin': b64FromBytes(metaBin(auth.accessKey || '', auth.buvid)),
      'buvid': auth.buvid,
    };
    if (auth.accessKey) {
      headers['authorization'] = 'identify_v1 ' + auth.accessKey;
      headers['x-bili-mid'] = String(auth.mid || 0);
    }
    var body = Uint8Array.from([0, 0, 0, 0, msgBytes.length & 0xff].concat(bytesToArr(msgBytes)));
    return gmFetch(GRPC_BASE + path, { method: 'POST', headers: headers, body: body }).then(function (res) {
      return res.arrayBuffer().then(function (buf) {
        var raw = new Uint8Array(buf);
        var gz = (res.headers.get('grpc-encoding') || '') === 'gzip';
        var payloads = [], off = 0;
        while (off + 5 <= raw.length) {
          var flags = raw[off];
          var len = raw[off + 1] * 16777216 + raw[off + 2] * 65536 + raw[off + 3] * 256 + raw[off + 4];
          if (len > raw.length - off - 5) break;
          var payload = raw.subarray(off + 5, off + 5 + len);
          if (flags & 1) {
            if (typeof DecompressionStream === 'undefined') throw new Error('浏览器不支持gzip解压');
            payload = gunzipBuffer(payload);
          }
          payloads.push(payload);
          off += 5 + len;
        }
        return Promise.all(payloads).then(concatBytes);
      });
    });
  }
  function dynSpace(hostMid, auth) {
    return grpcCall('bilibili.app.dynamic.v2.Dynamic/DynSpace', Uint8Array.from(pbInt(1, hostMid).concat(pbString(2, '')).concat(pbInt(5, 1))), auth);
  }
  function dynDetail(dynamicId, auth) {
    return grpcCall('bilibili.app.dynamic.v2.Dynamic/DynDetail', Uint8Array.from(
      pbInt(1, auth.mid || 0).concat(pbString(2, String(dynamicId))).concat(pbString(8, 'dt.opus-detail.0.0.pv')).concat(pbInt(9, 3)).concat(pbInt(10, 8))
    ), auth);
  }
  function extractDynamicIds(spaceBytes, maxItems) {
    var ids = [], top = pbWalk(spaceBytes), items = pbAllFields(top, 1), used = 0;
    for (var i = 0; i < items.length && used < (maxItems || 3); i++) {
      var item = items[i];
      if (item.wire !== 2) continue;
      var itemFields = pbWalk(item.value);
      var extend = pbFieldBytes(itemFields, 4);
      if (!extend) continue;
      var extFields = pbWalk(extend);
      var dynIdBytes = pbFieldBytes(extFields, 1);
      var id = null;
      if (dynIdBytes) { var s0 = utf8Decode(dynIdBytes); var m0 = /^\d+$/.exec(s0); if (m0) id = m0[0]; }
      if (!id) {
        var cardUrl = pbFieldBytes(extFields, 15);
        if (cardUrl) {
          var url = utf8Decode(cardUrl);
          var m = /(?:dynamic_id=|\/(?:opus|dynamic)\/)(\d+)/.exec(url);
          if (m) id = m[1];
        }
      }
      if (id) { ids.push(id); used++; }
    }
    return ids;
  }
  function extractDetailIP(detailBytes) {
    var top = pbWalk(detailBytes);
    var item = pbFieldBytes(top, 1);
    if (!item) return null;
    var itemFields = pbWalk(item);
    var mods = pbAllFields(itemFields, 3);
    for (var i = 0; i < mods.length; i++) {
      if (mods[i].wire !== 2) continue;
      var modFields = pbWalk(mods[i].value);
      var author = pbFieldBytes(modFields, 2);
      if (!author) continue;
      var authorFields = pbWalk(author);
      var ptime = pbFieldBytes(authorFields, 14);
      if (ptime) {
        var text = utf8Decode(ptime);
        if (text && (text.indexOf('属地') >= 0 || text.indexOf('IP') >= 0)) return text;
      }
    }
    return null;
  }
  function getProfileIP(mid, auth) {
    return dynSpace(mid, auth).then(function (spaceBytes) {
      var ids = extractDynamicIds(spaceBytes, 3);
      if (!ids.length) return { ip: null, detail: '该用户空间动态为空或不可见' };
      var chain = Promise.resolve({ ip: null, detail: '未找到IP属地字段' });
      ids.forEach(function (id) {
        chain = chain.then(function (result) {
          if (result.ip) return result;
          return dynDetail(id, auth).then(function (detailBytes) {
            var ip = extractDetailIP(detailBytes);
            return ip ? { ip: ip, detail: '来自动态 ' + id } : result;
          }).catch(function () { return result; });
        });
      });
      return chain;
    });
  }

  /* ================= 登录接口 ================= */
  function qrGenerate(buvid) {
    var loginSessionId = uuidHex();
    return postForm('https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code', baseParams({ local_id: buvid, login_session_id: loginSessionId, spm_id: 'from_spmid' }))
      .then(function (j) {
        if (!j.data) throw new Error('生成二维码失败: ' + (j.message || JSON.stringify(j)));
        return { url: j.data.url, auth_code: j.data.auth_code, login_session_id: loginSessionId, buvid: buvid };
      });
  }
  function qrPoll(authCode, buvid) {
    return postForm('https://passport.bilibili.com/x/passport-tv-login/qrcode/poll', baseParams({ local_id: buvid, auth_code: authCode }))
      .then(function (j) {
        if (j.code === 0 && j.data && j.data.access_token) {
          return { accessKey: j.data.access_token, refreshToken: j.data.refresh_token, expiresIn: j.data.expires_in, mid: j.data.mid, buvid: buvid };
        }
        return { code: j.code };
      });
  }
  function refreshLogin(refreshToken, buvid) {
    return postForm('https://passport.bilibili.com/api/oauth2/refreshToken', baseParams({ refresh_token: refreshToken }))
      .then(function (j) {
        var d = (j && j.data) || {};
        var t = d.token_info || d;
        if (t && t.access_token) return { accessKey: t.access_token, refreshToken: t.refresh_token || refreshToken, expiresIn: t.expires_in, mid: t.mid };
        return null;
      });
  }
  function uuidHex() {
    var s = '', i;
    if (typeof crypto !== 'undefined' && crypto.randomUUID) { s = crypto.randomUUID().replace(/-/g, ''); return s; }
    for (i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
    return s;
  }
  function buildBuvid() {
    var hex = (uuidHex() + uuidHex()).toUpperCase();
    return 'XY' + hex.slice(0, 35);
  }

  /* ================= 存储 ================= */
  var store = {
    get: function (k, d) { try { return GM_getValue(k, d); } catch (e) { try { return JSON.parse(localStorage.getItem('bip_' + k) || 'null') === null ? d : JSON.parse(localStorage.getItem('bip_' + k)); } catch (e2) { return d; } } },
    set: function (k, v) { try { GM_setValue(k, v); } catch (e) { try { localStorage.setItem('bip_' + k, JSON.stringify(v)); } catch (e2) {} } },
    del: function (k) { try { GM_deleteValue(k); } catch (e) { try { localStorage.removeItem('bip_' + k); } catch (e2) {} } },
  };

  function loadAuth() {
    var a = store.get('auth', null);
    return a && a.accessKey ? a : null;
  }
  function saveAuth(a) { store.set('auth', a); }
  function clearAuth() { store.del('auth'); }
  function ensureToken() {
    // 检查过期并自动刷新
    var a = loadAuth();
    if (!a) return Promise.resolve(null);
    var ts = a.tokenTime || 0;
    var exp = a.expiresIn || 15552000;
    if (Date.now() / 1000 - ts < exp - 86400 * 7) return Promise.resolve(a);
    if (!a.refreshToken) return Promise.resolve(null);
    return refreshLogin(a.refreshToken, a.buvid).then(function (n) {
      if (!n) { clearAuth(); return null; }
      n.buvid = a.buvid; n.tokenTime = Math.floor(Date.now() / 1000);
      saveAuth(n);
      return n;
    }).catch(function () { clearAuth(); return null; });
  }

  /* ================= UI ================= */
  var badge = null, fab = null, panel = null, pollTimer = null, currentMid = null;

  GM_addStyle([
    '#bip-fab{position:fixed;right:14px;bottom:96px;z-index:999999;width:44px;height:44px;border-radius:50%;background:#00a1d6;color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.3);cursor:pointer;font-family:Arial,sans-serif;user-select:none}',
    '#bip-panel{position:fixed;right:12px;bottom:148px;z-index:999999;width:300px;max-width:calc(100vw - 24px);background:#fff;color:#333;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.25);padding:16px;font-size:14px;font-family:-apple-system,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;display:none;box-sizing:border-box}',
    '#bip-panel h3{margin:0 0 10px;font-size:15px;color:#18191c}',
    '#bip-panel .bip-row{margin:8px 0;line-height:1.6;word-break:break-all}',
    '#bip-panel .bip-btn{display:inline-block;padding:6px 14px;border-radius:6px;background:#00a1d6;color:#fff;border:none;font-size:13px;cursor:pointer;margin:4px 6px 0 0}',
    '#bip-panel .bip-btn.gray{background:#99a2aa}',
    '#bip-panel input{width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid #ccd0d7;border-radius:6px;font-size:13px;margin-top:6px}',
    '#bip-panel .bip-qr{width:180px;height:180px;margin:6px auto;display:block;border:1px solid #eee;border-radius:8px}',
    '#bip-panel .bip-tip{font-size:12px;color:#61666d;line-height:1.7}',
    '#bip-badge{display:inline-flex;align-items:center;align-self:center;margin:0 0 0 8px;padding:1px 9px;border-radius:999px;font-size:12px;font-weight:500;line-height:20px;background:rgba(255,255,255,.92);color:#00a1d6;border:1px solid rgba(0,161,214,.45);vertical-align:middle;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.12)}',
    '#bip-badge.bip-loading{color:#99a2aa;border-color:#ccd0d7;background:rgba(153,162,170,.1)}',
    '#bip-badge.bip-err{color:#fb7299;border-color:#fba0bd;background:rgba(251,114,153,.08)}',
    '@media (max-width:768px){#bip-fab{bottom:86px;right:12px}}'
  ].join('\n'));

  function getMid() {
    var p = location.pathname, m = null;
    if (location.hostname.indexOf('space.bilibili.com') >= 0) {
      // 新版PC空间: space.bilibili.com/<mid>[/xxx]
      m = /^\/(\d+)/.exec(p);
      if (m) return m[1];
      m = /\/space\/(\d+)/.exec(p);
      if (m) return m[1];
    }
    m = /\/space\/(\d+)/.exec(p);
    if (m) return m[1];
    m = /[?&]mid=(\d+)/.exec(location.search);
    if (m) return m[1];
    // opus 等页面：从 DOM 提取作者 mid
    var el = document.querySelector('[data-mid]');
    if (el) {
      var v = el.getAttribute('data-mid');
      if (/^\d+$/.test(v)) return v;
    }
    var link = document.querySelector('a[href*="/space/"]');
    if (link) {
      var lm = /\/space\/(\d+)/.exec(link.getAttribute('href') || '');
      if (lm) return lm[1];
    }
    return null;
  }

  var NAME_SELECTORS = [
    '.upinfo-detail__top .nickname',
    '.nickname',
    '#h-name', '.h-name', '.h-name>span',
    '#h-username', '.h-username',
    '.user-name', '.space-user-name', '.userName',
    '.space-name', '.m-name',
    '[class*="nickname"]',
    '.info .name', '.bili-vcard .name'
  ];
  // 按页面标题里的用户名找元素（不依赖 class 名，兼容各种版式）
  function findNameByTitle() {
    var t = document.title || '';
    var m = /^(.+?)的(?:个人空间|个人主页|主页|空间)/.exec(t) || /^(.+?)\s*[-–]/.exec(t);
    if (!m) return null;
    var name = m[1].trim();
    if (!name || name.length > 30) return null;
    var best = null, bestY = Infinity;
    var els = document.querySelectorAll('div,span,h1,h2,h3,a,p');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.children && el.children.length) continue;
      if ((el.textContent || '').trim() !== name) continue;
      if (el.offsetParent === null && el.getClientRects().length === 0) continue;
      var y = el.getBoundingClientRect().top;
      if (y < bestY) { bestY = y; best = el; }
    }
    return best;
  }

  function findNameEl() {
    for (var i = 0; i < NAME_SELECTORS.length; i++) {
      var list;
      try { list = document.querySelectorAll(NAME_SELECTORS[i]); } catch (e) { continue; }
      for (var j = 0; j < list.length; j++) {
        var el = list[j];
        if (!el) continue;
        if (el.offsetParent === null && el.getClientRects().length === 0) continue;
        var text = (el.textContent || '').trim();
        if (!text || text.length > 40) continue;
        return el;
      }
    }
    return findNameByTitle();
  }

  function attachBadgeToName(el) {
    badge.__bipFixed = false;
    badge.style.cssText = '';
    if (el.insertAdjacentElement) el.insertAdjacentElement('afterend', badge);
    else if (el.parentNode) el.parentNode.appendChild(badge);
  }

  function ensureBadge() {
    if (badge && badge.isConnected) {
      // 之前是浮动兜底，现在名字元素出现了 → 迁移到名字后面
      if (badge.__bipFixed) {
        var el0 = findNameEl();
        if (el0) attachBadgeToName(el0);
      }
      return badge;
    }
    badge = document.createElement('span');
    badge.id = 'bip-badge';
    var el = findNameEl();
    if (el) {
      attachBadgeToName(el);
      return badge;
    }
    // 兜底：名字还没渲染出来，先固定显示，后续自动迁移
    badge.__bipFixed = true;
    badge.style.cssText = 'position:fixed;top:12px;right:12px;z-index:999998;margin:0;box-shadow:0 2px 10px rgba(0,0,0,.2)';
    document.body.appendChild(badge);
    return badge;
  }
  // 周期性检查：名字元素晚于徽章出现时把徽章挪回名字后面
  function remigrateBadge() {
    if (!badge || !badge.isConnected || !badge.__bipFixed) return;
    var el = findNameEl();
    if (el) attachBadgeToName(el);
  }
  function setBadge(text, cls) {
    var b = ensureBadge();
    b.textContent = text;
    b.className = 'bip-' + (cls || 'ok');
  }
  function removeBadge() {
    if (badge && badge.isConnected) badge.remove();
    badge = null;
  }

  function ensureFab() {
    if (fab && fab.isConnected) return fab;
    fab = document.createElement('div');
    fab.id = 'bip-fab';
    fab.textContent = 'IP';
    fab.title = 'B站IP属地';
    fab.addEventListener('click', togglePanel);
    document.body.appendChild(fab);
    return fab;
  }
  function togglePanel() {
    if (panel) { panel.style.display = panel.style.display === 'block' ? 'none' : 'block'; if (panel.style.display === 'block') renderPanel(); return; }
    panel = document.createElement('div');
    panel.id = 'bip-panel';
    document.body.appendChild(panel);
    renderPanel();
  }
  function closePanel() { if (panel) panel.style.display = 'none'; }

  function renderPanel() {
    var a = loadAuth();
    var html = '<h3>B站IP属地设置</h3>';
    if (a) {
      html += '<div class="bip-row">已登录：UID ' + a.mid + '<br><span class="bip-tip">有效期至 ' + new Date((a.tokenTime || 0) * 1000 + (a.expiresIn || 0) * 1000).toLocaleDateString() + '</span></div>';
      html += '<button class="bip-btn gray" id="bip-logout">退出登录</button>';
      html += '<button class="bip-btn" id="bip-refresh">立即刷新获取</button>';
    } else {
      html += '<div class="bip-row bip-tip">未登录。扫码登录后即可在本页面和任意B站用户空间页显示其IP属地（一次登录，长期有效，自动续期）。</div>';
      html += '<div class="bip-row"><button class="bip-btn" id="bip-startqr">扫码登录</button>';
      html += '<button class="bip-btn gray" id="bip-manual">手动粘贴access_key</button></div>';
      html += '<div id="bip-qrzone"></div>';
      html += '<div class="bip-row" id="bip-manualzone" style="display:none">粘贴access_key：<input id="bip-keyinput" placeholder="xxxxxxxx"></div>';
      html += '<div class="bip-row bip-tip" id="bip-logintip"></div>';
    }
    panel.innerHTML = html;

    if (a) {
      var logout = panel.querySelector('#bip-logout');
      logout.addEventListener('click', function () { clearAuth(); closePanel(); setBadge('未登录，点此登录', 'err'); ensureFab(); });
      var refreshBtn = panel.querySelector('#bip-refresh');
      refreshBtn.addEventListener('click', function () { closePanel(); runForCurrentPage(true); });
    } else {
      var startBtn = panel.querySelector('#bip-startqr');
      startBtn.addEventListener('click', startQrLogin);
      var manualBtn = panel.querySelector('#bip-manual');
      manualBtn.addEventListener('click', function () {
        panel.querySelector('#bip-manualzone').style.display = 'block';
        var input = panel.querySelector('#bip-keyinput');
        var btn = document.createElement('button');
        btn.className = 'bip-btn';
        btn.textContent = '保存并登录';
        btn.style.marginTop = '6px';
        btn.addEventListener('click', function () {
          var key = input.value.trim();
          if (!key) return;
          var a2 = { accessKey: key, refreshToken: '', expiresIn: 15552000, mid: 0, buvid: buildBuvid(), tokenTime: Math.floor(Date.now() / 1000) };
          saveAuth(a2);
          setBadge('已登录，正在获取IP…', 'loading');
          closePanel();
          runForCurrentPage(true);
        });
        panel.querySelector('#bip-manualzone').appendChild(btn);
      });
    }
  }

  function startQrLogin() {
    var zone = panel.querySelector('#bip-qrzone');
    var tip = panel.querySelector('#bip-logintip');
    zone.innerHTML = '<div class="bip-row bip-tip">正在生成二维码…</div>';
    tip.textContent = '';
    var buvid = (loadAuth() && loadAuth().buvid) || buildBuvid();
    qrGenerate(buvid).then(function (info) {
      var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=' + encodeURIComponent(info.url);
      zone.innerHTML = '<img class="bip-qr" src="' + qrUrl + '" alt="扫码登录">';
      tip.innerHTML = '用手机B站APP「扫一扫」扫描上方二维码并确认登录。<br>打不开？<a href="' + info.url + '" target="_blank" rel="noopener">点此打开登录页</a>';
      if (pollTimer) clearInterval(pollTimer);
      var start = Date.now();
      pollTimer = setInterval(function () {
        if (Date.now() - start > 180000) { clearInterval(pollTimer); pollTimer = null; tip.textContent = '二维码已过期，请重新点击「扫码登录」'; return; }
        qrPoll(info.auth_code, buvid).then(function (res) {
          if (res.accessKey) {
            clearInterval(pollTimer); pollTimer = null;
            res.buvid = buvid; res.tokenTime = Math.floor(Date.now() / 1000);
            saveAuth(res);
            zone.innerHTML = '<div class="bip-row">✅ 登录成功！UID ' + res.mid + '</div>';
            closePanel();
            setBadge('已登录，正在获取IP…', 'loading');
            runForCurrentPage(true);
          } else if (res.code === 86090) {
            tip.textContent = '已扫码，请在手机上确认登录…';
          } else if (res.code === 86101) {
            tip.textContent = '等待扫码…';
          } else {
            tip.textContent = '等待响应(code=' + res.code + ')';
          }
        }).catch(function (e) { tip.textContent = '轮询失败: ' + e.message; });
      }, 2000);
    }).catch(function (e) {
      zone.innerHTML = '<div class="bip-row bip-tip">生成二维码失败：' + e.message + '</div>';
    });
  }

  /* ================= 主流程 ================= */
  function runForCurrentPage(force) {
    var mid = getMid();
    if (!mid || mid === currentMid && !force) return;
    currentMid = mid;
    ensureFab();
    setBadge('IP属地：获取中…', 'loading');
    ensureToken().then(function (auth) {
      if (!auth) {
        setBadge('未登录，点此扫码登录', 'err');
        return;
      }
      return getProfileIP(parseInt(mid, 10), auth).then(function (result) {
        if (result.ip) setBadge(result.ip, 'ok');
        else setBadge(result.detail || '未获取到IP属地', 'err');
      }).catch(function (e) {
        setBadge('获取失败', 'err');
        console.error('[B站IP属地]', e);
      });
    });
  }

  function init() {
    ensureFab();
    runForCurrentPage();
    setInterval(function () { if (!document.hidden) remigrateBadge(); }, 2000);
    // SPA 切换用户时重新获取
    var lastUrl = location.href;
    var timer = null;
    new MutationObserver(function () {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        currentMid = null;
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () { runForCurrentPage(); }, 600);
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
    setInterval(function () { runForCurrentPage(); }, 60000);
  }

  if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined' && document.readyState !== 'loading') {
    init();
  } else if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
  }

  // 自测钩子（浏览器中无害）
  if (typeof globalThis !== 'undefined') {
    globalThis.BipUserscript = { md5: md5, signParams: signParams, qrGenerate: qrGenerate, qrPoll: qrPoll, getProfileIP: getProfileIP, ensureToken: ensureToken, loadAuth: loadAuth, saveAuth: saveAuth, clearAuth: clearAuth, buildBuvid: buildBuvid, pbInt: pbInt, pbString: pbString, extractDynamicIds: extractDynamicIds, extractDetailIP: extractDetailIP, findNameEl: findNameEl, ensureBadge: ensureBadge, remigrateBadge: remigrateBadge };
  }
})();
