var exec = require('cordova/exec');

var AudioOutput = {
  // callback(devices: [{id, name, type}])
  list: function (success, error) {
    exec(success, error, 'AudioOutput', 'list', []);
  },
  // callback(device: {id, name, type} | null)
  getCurrent: function (success, error) {
    exec(success, error, 'AudioOutput', 'getCurrent', []);
  },
  // best-effort: не для всех типов устройств Android допускает принудительное переключение
  select: function (deviceId, success, error) {
    exec(success, error, 'AudioOutput', 'select', [deviceId]);
  },
  // success вызывается повторно при каждом подключении/отключении устройства
  watch: function (success, error) {
    exec(success, error, 'AudioOutput', 'watch', []);
  },
  unwatch: function (success, error) {
    exec(success, error, 'AudioOutput', 'unwatch', []);
  },
};

module.exports = AudioOutput;
