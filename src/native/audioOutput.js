// Список и переключение аудиовыходов (динамик/наушники/Bluetooth).
// В Cordova-сборке используется нативный плагин cordova-plugin-audio-output
// (native-plugins/cordova-plugin-audio-output в корне репозитория, FEATURES.audioOutput; чтобы он заработал на
// устройстве, его нужно добавить в cordova-проект: `cordova plugin add` + пересборка).
// В обычном браузере (разработка) плагина нет — используется веб-фолбэк на
// navigator.mediaDevices.enumerateDevices(), который умеет только СПИСОК устройств:
// реального переключения физического выхода веб-страница делать не умеет, это решает ОС.
import {onUnmounted, ref} from 'vue';
import {FEATURES} from '@/config/features';

function getNativePlugin() {
  if (!FEATURES.audioOutput) return null;
  return (window.cordova && window.cordova.plugins && window.cordova.plugins.AudioOutput) || null;
}

async function listViaWebFallback() {
  if (!FEATURES.audioOutput) return [];
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return [];
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
        .filter((d) => d.kind === 'audiooutput')
        .map((d, i) => ({id: d.deviceId || `web-${i}`, name: d.label || 'Аудиовыход', type: 'unknown'}));
  } catch (e) {
    return [];
  }
}

export function useAudioOutput() {
  const outputs = ref([]);
  const currentOutput = ref(null);
  const isNative = ref(!!getNativePlugin());

  async function refreshOutputs() {
    const plugin = getNativePlugin();
    if (plugin) {
      outputs.value = await new Promise((resolve) => plugin.list(resolve, () => resolve([])));
      currentOutput.value = await new Promise((resolve) => plugin.getCurrent(resolve, () => resolve(null)));
    } else {
      outputs.value = await listViaWebFallback();
      currentOutput.value = outputs.value[0] || null;
    }
  }

  async function selectOutput(device) {
    const plugin = getNativePlugin();
    if (plugin) {
      const ok = await new Promise((resolve) => plugin.select(device.id, () => resolve(true), () => resolve(false)));
      if (ok) currentOutput.value = device;
      return ok;
    }
    // Веб-фолбэк ничего физически не переключает — только отражает выбор в интерфейсе.
    currentOutput.value = device;
    return true;
  }

  function startWatching() {
    const plugin = getNativePlugin();
    if (plugin && plugin.watch) {
      plugin.watch((list) => {
        outputs.value = list;
      }, () => {});
    }
  }

  onUnmounted(() => {
    const plugin = getNativePlugin();
    if (plugin && plugin.unwatch) plugin.unwatch();
  });

  return {outputs, currentOutput, isNative, refreshOutputs, selectOutput, startWatching};
}

export const AUDIO_OUTPUT_TYPE_ICONS = {
  speaker: 'bi-phone-vibrate',
  earpiece: 'bi-phone',
  wired_headset: 'bi-headphones',
  bluetooth: 'bi-bluetooth',
  bluetooth_a2dp: 'bi-bluetooth',
  usb: 'bi-usb-symbol',
  unknown: 'bi-volume-up',
};
