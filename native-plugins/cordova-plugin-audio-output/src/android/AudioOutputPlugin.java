package pro.thezmi.cordova.audiooutput;

import android.annotation.SuppressLint;
import android.content.Context;
import android.media.AudioDeviceCallback;
import android.media.AudioDeviceInfo;
import android.media.AudioManager;
import android.os.Build;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

// Перечисление и (в пределах возможностей платформы) переключение аудиовыходов.
//
// Важное ограничение Android: у сторонних приложений нет официального общего API "принудительно
// перевести поток STREAM_MUSIC на произвольное устройство" — ОС сама решает, играть через провод
// или Bluetooth, когда устройство подключено. Поэтому select() — это best-effort: он надёжно
// работает для переключения громкой связи (динамик) и пытается запустить Bluetooth SCO для
// гарнитур, а для остальных типов устройств полагается на автоматический выбор системы.
public class AudioOutputPlugin extends CordovaPlugin {
    private AudioManager audioManager;
    private CallbackContext watchCallbackContext;
    private AudioDeviceCallback deviceCallback;

    @Override
    protected void pluginInitialize() {
        audioManager = (AudioManager) cordova.getActivity().getSystemService(Context.AUDIO_SERVICE);
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        switch (action) {
            case "list":
                cordova.getThreadPool().execute(() -> {
                    try {
                        callbackContext.success(listOutputs());
                    } catch (JSONException e) {
                        callbackContext.error(e.getMessage());
                    }
                });
                return true;
            case "getCurrent":
                cordova.getThreadPool().execute(() -> {
                    try {
                        callbackContext.success(getCurrentOutput());
                    } catch (JSONException e) {
                        callbackContext.error(e.getMessage());
                    }
                });
                return true;
            case "select":
                final int deviceId = args.optInt(0, -1);
                cordova.getThreadPool().execute(() -> {
                    boolean ok = selectOutput(deviceId);
                    callbackContext.success(ok ? 1 : 0);
                });
                return true;
            case "watch":
                startWatching(callbackContext);
                return true;
            case "unwatch":
                stopWatching();
                callbackContext.success();
                return true;
            default:
                return false;
        }
    }

    private JSONArray listOutputs() throws JSONException {
        JSONArray result = new JSONArray();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            AudioDeviceInfo[] devices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS);
            for (AudioDeviceInfo device : devices) {
                result.put(deviceToJson(device));
            }
        }
        return result;
    }

    @SuppressLint("NewApi")
    private JSONObject getCurrentOutput() throws JSONException {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AudioDeviceInfo device = audioManager.getCommunicationDevice();
            if (device != null) return deviceToJson(device);
        }
        // На старых версиях Android нет единого публичного API "текущего выхода" для потока
        // музыки — определяем приблизительно по системным флагам.
        String type;
        if (audioManager.isBluetoothA2dpOn()) {
            type = "bluetooth_a2dp";
        } else if (audioManager.isWiredHeadsetOn()) {
            type = "wired_headset";
        } else {
            type = "speaker";
        }
        JSONObject obj = new JSONObject();
        obj.put("id", -1);
        obj.put("name", typeToLabel(type));
        obj.put("type", type);
        return obj;
    }

    @SuppressLint("NewApi")
    private boolean selectOutput(int deviceId) {
        try {
            AudioDeviceInfo target = null;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                for (AudioDeviceInfo device : audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS)) {
                    if (device.getId() == deviceId) {
                        target = device;
                        break;
                    }
                }
            }
            if (target == null) return false;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                return audioManager.setCommunicationDevice(target);
            }

            int type = target.getType();
            if (type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO || type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP) {
                audioManager.setSpeakerphoneOn(false);
                audioManager.startBluetoothSco();
                audioManager.setBluetoothScoOn(true);
                return true;
            }
            if (type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER) {
                audioManager.stopBluetoothSco();
                audioManager.setBluetoothScoOn(false);
                audioManager.setSpeakerphoneOn(true);
                return true;
            }
            // Проводная гарнитура/USB — система и так предпочитает их, когда подключены.
            audioManager.setSpeakerphoneOn(false);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void startWatching(CallbackContext callbackContext) {
        watchCallbackContext = callbackContext;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && deviceCallback == null) {
            deviceCallback = new AudioDeviceCallback() {
                @Override
                public void onAudioDevicesAdded(AudioDeviceInfo[] addedDevices) {
                    notifyWatcher();
                }

                @Override
                public void onAudioDevicesRemoved(AudioDeviceInfo[] removedDevices) {
                    notifyWatcher();
                }
            };
            audioManager.registerAudioDeviceCallback(deviceCallback, null);
        }
        notifyWatcher();
    }

    private void notifyWatcher() {
        if (watchCallbackContext == null) return;
        try {
            PluginResult result = new PluginResult(PluginResult.Status.OK, listOutputs());
            result.setKeepCallback(true);
            watchCallbackContext.sendPluginResult(result);
        } catch (JSONException ignored) {
        }
    }

    private void stopWatching() {
        if (deviceCallback != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            audioManager.unregisterAudioDeviceCallback(deviceCallback);
            deviceCallback = null;
        }
        watchCallbackContext = null;
    }

    private JSONObject deviceToJson(AudioDeviceInfo device) throws JSONException {
        String category = typeToCategory(device.getType());
        JSONObject obj = new JSONObject();
        obj.put("id", device.getId());
        obj.put("name", device.getProductName() != null && device.getProductName().length() > 0
                ? device.getProductName().toString() : typeToLabel(category));
        obj.put("type", category);
        return obj;
    }

    private String typeToCategory(int type) {
        switch (type) {
            case AudioDeviceInfo.TYPE_BUILTIN_SPEAKER:
                return "speaker";
            case AudioDeviceInfo.TYPE_BUILTIN_EARPIECE:
                return "earpiece";
            case AudioDeviceInfo.TYPE_WIRED_HEADSET:
            case AudioDeviceInfo.TYPE_WIRED_HEADPHONES:
                return "wired_headset";
            case AudioDeviceInfo.TYPE_BLUETOOTH_SCO:
                return "bluetooth";
            case AudioDeviceInfo.TYPE_BLUETOOTH_A2DP:
                return "bluetooth_a2dp";
            case AudioDeviceInfo.TYPE_USB_DEVICE:
            case AudioDeviceInfo.TYPE_USB_HEADSET:
                return "usb";
            default:
                return "unknown";
        }
    }

    private String typeToLabel(String category) {
        switch (category) {
            case "speaker": return "Динамик телефона";
            case "earpiece": return "Динамик для разговора";
            case "wired_headset": return "Проводная гарнитура";
            case "bluetooth": return "Bluetooth (гарнитура)";
            case "bluetooth_a2dp": return "Bluetooth устройство";
            case "usb": return "USB-аудио";
            default: return "Аудиовыход";
        }
    }

    @Override
    public void onDestroy() {
        stopWatching();
        super.onDestroy();
    }
}
