// Ссылки, которыми открыли приложение: https://LINK_HOST/… (Android App Links) и
// URL_SCHEME://… (своя схема, см. plugin.xml). listen(callback) вызывает
// callback(link) на каждую — и на ту, которой приложение запустили, если она пришла
// раньше подписки.
var exec = require('cordova/exec');

var listeners = [];
var pending = [];

function emit(link) {
  if (!listeners.length) {
    pending.push(link);
    return;
  }
  listeners.forEach(function (fn) { fn(link); });
}

// iOS: Cordova сама передаёт ссылку схемы в глобальную window.handleOpenURL
window.handleOpenURL = function (link) {
  setTimeout(function () { emit(link); }, 0);
};

var OpenLink = {
  listen: function (callback) {
    listeners.push(callback);
    pending.splice(0).forEach(emit);
    if (listeners.length === 1 && cordova.platformId === 'android') {
      exec(emit, function () {}, 'OpenLink', 'listen', []);
    }
  },
};

module.exports = OpenLink;
