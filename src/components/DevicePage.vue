<template>
  <div class="default-page device-page">
    <h1><span>Возможности устройства</span></h1>
    <p class="text-secondary small">
      Демо всего, что умеет заготовка. Включение/выключение — src/config/features.js,
      код — src/native/*. Платформа сборки: <b>{{ platform }}</b>{{ isCordova ? ', Cordova' : ', браузер' }}.
    </p>

    <!-- Устройство -->
    <section v-if="FEATURES.deviceInfo" class="device-card">
      <h3><i class="bi bi-info-circle"></i> Устройство</h3>
      <button class="btn btn-secondary rounded-pill" @click="loadDeviceInfo">Показать</button>
      <pre v-if="deviceInfo" class="device-output">{{ deviceInfo }}</pre>
    </section>

    <!-- Геолокация -->
    <section v-if="FEATURES.geolocation" class="device-card">
      <h3><i class="bi bi-geo-alt-fill"></i> Геолокация</h3>
      <div class="device-buttons">
        <button class="btn btn-secondary rounded-pill" @click="getPosition" :disabled="geo.loading">Где я?</button>
        <button class="btn rounded-pill" :class="geo.stop ? 'btn-primary' : 'btn-secondary'" @click="toggleWatch">
          {{ geo.stop ? 'Остановить слежение' : 'Следить' }}
        </button>
      </div>
      <div v-if="geo.loading" class="mt-2"><my-loader css-classes="text-start" label="Определяем местоположение..." /></div>
      <div v-if="geo.position" class="device-output">
        {{ geo.position.latitude.toFixed(6) }}, {{ geo.position.longitude.toFixed(6) }}
        <span class="text-secondary">±{{ Math.round(geo.position.accuracy) }} м</span>
        <span v-if="geo.updates" class="text-secondary"> · обновлений: {{ geo.updates }}</span>
      </div>
      <div v-if="geo.error" class="text-danger mt-2">{{ geo.error }}</div>
      <div v-if="FEATURES.backgroundMode" class="form-check form-switch mt-2">
        <input class="form-check-input" type="checkbox" id="geo-bg" v-model="geo.background" :disabled="!!geo.stop">
        <label class="form-check-label" for="geo-bg">Продолжать в фоне (уведомление foreground-сервиса)</label>
      </div>
    </section>

    <!-- Компас -->
    <section v-if="FEATURES.compass" class="device-card">
      <h3><i class="bi bi-compass"></i> Компас</h3>
      <button class="btn rounded-pill" :class="compass.stop ? 'btn-primary' : 'btn-secondary'" @click="toggleCompass">
        {{ compass.stop ? 'Выключить' : 'Включить' }}
      </button>
      <div v-if="compass.stop" class="compass-view mt-3">
        <i class="bi bi-arrow-up-circle-fill compass-arrow" :style="{transform: `rotate(${-(compass.heading || 0)}deg)`}"></i>
        <span>{{ compass.heading === null ? 'Ждём данные датчика…' : `${Math.round(compass.heading)}° от севера` }}</span>
      </div>
      <div v-if="compass.error" class="text-danger mt-2">{{ compass.error }}</div>
    </section>

    <!-- Камера -->
    <section v-if="FEATURES.camera" class="device-card">
      <h3><i class="bi bi-camera-fill"></i> Камера</h3>
      <div class="device-buttons">
        <button class="btn btn-secondary rounded-pill" @click="photo('camera')">Сфотографировать</button>
        <button class="btn btn-secondary rounded-pill" @click="photo('gallery')">Из галереи</button>
      </div>
      <img v-if="camera.dataUrl" :src="camera.dataUrl" class="device-photo mt-3" alt="">
      <div v-if="camera.size" class="text-secondary small mt-1">{{ camera.size }}</div>
      <div v-if="camera.error" class="text-danger mt-2">{{ camera.error }}</div>
    </section>

    <!-- Сканер -->
    <section v-if="FEATURES.scanner" class="device-card">
      <h3><i class="bi bi-qr-code-scan"></i> Сканер QR / штрихкодов</h3>
      <div class="device-buttons">
        <button class="btn btn-secondary rounded-pill" @click="scanCode(SCAN_FORMATS.QR)">QR-код</button>
        <button class="btn btn-secondary rounded-pill" @click="scanCode(SCAN_FORMATS.ALL)">Любой код</button>
      </div>
      <div v-if="scanner.result !== null" class="device-output">{{ scanner.result || '(отменено)' }}</div>
      <div v-if="scanner.error" class="text-danger mt-2">{{ scanner.error }}</div>
    </section>

    <!-- Вибрация -->
    <section v-if="FEATURES.vibration" class="device-card">
      <h3><i class="bi bi-phone-vibrate"></i> Вибрация</h3>
      <div class="device-buttons">
        <button class="btn btn-secondary rounded-pill" @click="buzz(VIBRATION.TAP)">Короткая</button>
        <button class="btn btn-secondary rounded-pill" @click="buzz(VIBRATION.SUCCESS)">Успех</button>
        <button class="btn btn-secondary rounded-pill" @click="buzz(VIBRATION.ERROR)">Ошибка</button>
      </div>
      <div v-if="vibrationUnsupported" class="text-secondary mt-2">Это устройство не поддерживает вибрацию из JS.</div>
    </section>

    <!-- Фоновый режим -->
    <section v-if="FEATURES.backgroundMode" class="device-card">
      <h3><i class="bi bi-layers-fill"></i> Фоновый режим</h3>
      <p class="text-secondary small">Включите и сверните приложение: в шторке будет уведомление, JS продолжит работать.</p>
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="bg-demo" v-model="bgDemo" @change="toggleBackground">
        <label class="form-check-label" for="bg-demo">Держать приложение активным</label>
      </div>
      <div v-if="!bgAvailable" class="text-secondary small mt-1">Плагин cordova-plugin-background-mode не найден (браузер?)</div>
      <div v-if="bgDemo" class="device-output">Таймер в фоне: {{ bgTicks }} с</div>
    </section>

    <!-- Файлы -->
    <section v-if="FEATURES.files" class="device-card">
      <h3><i class="bi bi-file-earmark-arrow-down-fill"></i> Скачивание файлов</h3>
      <input class="form-control mb-2" v-model="files.url" placeholder="https://…">
      <div class="device-buttons">
        <button class="btn btn-secondary rounded-pill" @click="download" :disabled="files.progress !== null">Скачать</button>
        <button v-if="files.path" class="btn btn-secondary rounded-pill" @click="openDownloaded">Открыть</button>
      </div>
      <div v-if="files.progress !== null" class="progress mt-2" style="height: 8px;">
        <div class="progress-bar" :style="{width: files.progress + '%'}"></div>
      </div>
      <div v-if="files.path" class="device-output">{{ files.path }}</div>
      <div v-if="files.error" class="text-danger mt-2">{{ files.error }}</div>
    </section>

    <!-- Внешние ссылки -->
    <section v-if="FEATURES.externalLinks" class="device-card">
      <h3><i class="bi bi-box-arrow-up-right"></i> Внешние ссылки</h3>
      <div class="device-buttons">
        <button class="btn btn-secondary rounded-pill" @click="openExternal('https://ya.ru')">Браузер</button>
        <button class="btn btn-secondary rounded-pill" @click="openExternal('tel:+70000000000')">Звонок</button>
        <button class="btn btn-secondary rounded-pill" @click="openExternal('mailto:test@example.com')">Почта</button>
        <button class="btn btn-secondary rounded-pill" @click="openExternal('geo:54.71,20.51?q=54.71,20.51')">Карты</button>
      </div>
    </section>

    <!-- Аудиовыходы -->
    <section v-if="FEATURES.audioOutput" class="device-card">
      <h3><i class="bi bi-speaker-fill"></i> Аудиовыходы</h3>
      <button class="btn btn-secondary rounded-pill" @click="refreshOutputs">Обновить список</button>
      <div class="text-secondary small mt-1">{{ isNativeAudio ? 'Нативный плагин: можно переключать' : 'Браузер: только список (переключает ОС)' }}</div>
      <ul class="list-unstyled mt-2 mb-0">
        <li v-for="o in outputs" :key="o.id">
          <button class="btn btn-link text-white p-0" @click="selectOutput(o)">
            <i class="bi" :class="AUDIO_OUTPUT_TYPE_ICONS[o.type] || 'bi-volume-up'"></i>
            {{ o.name }} <b v-if="currentOutput && currentOutput.id === o.id">✓</b>
          </button>
        </li>
      </ul>
    </section>

    <!-- Обновления -->
    <section v-if="FEATURES.appUpdates" class="device-card">
      <h3><i class="bi bi-cloud-arrow-down-fill"></i> Обновление приложения</h3>
      <router-link to="/check-updates" class="btn btn-secondary rounded-pill">Открыть</router-link>
    </section>
  </div>
</template>

<script setup>
import {onBeforeUnmount, reactive, ref} from 'vue';
import {FEATURES} from '@/config/features';
import {PLATFORM} from '@/config/platform';
import {isCordova as detectCordova} from '@/native/cordova';
import {getDeviceInfo} from '@/native/device';
import {getCurrentPosition, watchPosition} from '@/native/geolocation';
import {startCompass} from '@/native/compass';
import {takePhoto, selectPhoto} from '@/native/camera';
import {scan, SCAN_FORMATS} from '@/native/scanner';
import {vibrate, VIBRATION} from '@/native/vibration';
import {enableBackgroundMode, disableBackgroundMode, isBackgroundModeAvailable} from '@/native/backgroundMode';
import {downloadFile, openFile} from '@/native/files';
import {openExternal} from '@/native/browser';
import {useAudioOutput, AUDIO_OUTPUT_TYPE_ICONS} from '@/native/audioOutput';
import {userErrorMessage} from '@/helpers/errors';

defineOptions({name: 'DevicePage'});

const platform = PLATFORM;
const isCordova = detectCordova();

// --- Устройство
const deviceInfo = ref(null);
async function loadDeviceInfo() {
  deviceInfo.value = JSON.stringify(await getDeviceInfo(), null, 2);
}

// --- Геолокация
const geo = reactive({loading: false, position: null, error: '', stop: null, updates: 0, background: false});
async function getPosition() {
  geo.loading = true;
  geo.error = '';
  try {
    geo.position = await getCurrentPosition();
  } catch (e) {
    geo.error = e.message;
  }
  geo.loading = false;
}
function toggleWatch() {
  if (geo.stop) {
    geo.stop();
    geo.stop = null;
    return;
  }
  geo.error = '';
  geo.updates = 0;
  geo.stop = watchPosition(
      (pos) => { geo.position = pos; geo.updates++; geo.error = ''; },
      (err) => { geo.error = err.message; },
      geo.background ? {background: {title: 'Отслеживаем местоположение', text: 'Геолокация работает в фоне'}} : {},
  );
}

// --- Компас
const compass = reactive({heading: null, stop: null, error: ''});
async function toggleCompass() {
  if (compass.stop) {
    compass.stop();
    compass.stop = null;
    compass.heading = null;
    return;
  }
  compass.error = '';
  try {
    compass.stop = await startCompass((h) => { compass.heading = h; });
  } catch (e) {
    compass.error = e.message;
  }
}

// --- Камера
const camera = reactive({dataUrl: '', size: '', error: ''});
async function photo(source) {
  camera.error = '';
  try {
    const res = source === 'camera' ? await takePhoto() : await selectPhoto();
    if (!res) return;
    camera.dataUrl = res.dataUrl;
    camera.size = `${Math.round(res.blob.size / 1024)} КБ, ${res.blob.type}`;
  } catch (e) {
    camera.error = userErrorMessage(e, 'Не удалось получить фото.');
  }
}

// --- Сканер
const scanner = reactive({result: null, error: ''});
async function scanCode(formats) {
  scanner.error = '';
  try {
    scanner.result = await scan({formats});
    if (scanner.result) vibrate(VIBRATION.SUCCESS);
  } catch (e) {
    scanner.error = userErrorMessage(e, 'Не удалось отсканировать код.');
  }
}

// --- Вибрация
const vibrationUnsupported = ref(false);
function buzz(pattern) {
  vibrationUnsupported.value = !vibrate(pattern);
}

// --- Фоновый режим
const bgDemo = ref(false);
const bgAvailable = isBackgroundModeAvailable();
const bgTicks = ref(0);
let bgTimer = null;
function toggleBackground() {
  clearInterval(bgTimer);
  if (bgDemo.value) {
    bgTicks.value = 0;
    bgTimer = setInterval(() => bgTicks.value++, 1000);
    enableBackgroundMode('device-page-demo', {title: 'Демо фонового режима', text: 'Приложение работает в фоне'});
  } else {
    disableBackgroundMode('device-page-demo');
  }
}

// --- Файлы
const files = reactive({url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', progress: null, path: '', error: ''});
async function download() {
  files.error = '';
  files.path = '';
  files.progress = 0;
  try {
    const name = decodeURIComponent(files.url.split('/').pop().split('?')[0]) || 'file';
    files.path = await downloadFile(files.url, name, {onProgress: (p) => { files.progress = p; }});
  } catch (e) {
    files.error = userErrorMessage(e, 'Не удалось скачать файл.');
  }
  files.progress = null;
}
async function openDownloaded() {
  const ext = files.path.split('.').pop().toLowerCase();
  const mime = {pdf: 'application/pdf', apk: 'application/vnd.android.package-archive', jpg: 'image/jpeg', png: 'image/png'}[ext] || '*/*';
  try {
    await openFile(files.path, mime);
  } catch (e) {
    files.error = userErrorMessage(e, 'Не удалось открыть файл.');
  }
}

// --- Аудиовыходы
const {outputs, currentOutput, isNative: isNativeAudio, refreshOutputs, selectOutput} = useAudioOutput();

onBeforeUnmount(() => {
  if (geo.stop) geo.stop();
  if (compass.stop) compass.stop();
  clearInterval(bgTimer);
  disableBackgroundMode('device-page-demo');
});
</script>

<style lang="scss" scoped>
@import "@/styles/scss/my-vars.scss";

.device-page {
  padding: 15px;
}

.device-card {
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 14px;
  background-color: $site-glass-bg;
  border: $site-glass-border;
  box-shadow: $site-glass-shadow;

  h3 {
    font-size: 19px;
    margin-bottom: 12px;

    .bi {
      opacity: 0.5;
      margin-right: 6px;
    }
  }
}

.device-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.device-output {
  margin: 10px 0 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.4);
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-all;
  -webkit-user-select: text;
  user-select: text;
}

.device-photo {
  max-width: 100%;
  max-height: 300px;
  border-radius: 10px;
}

.compass-view {
  display: flex;
  align-items: center;
  gap: 12px;
}

.compass-arrow {
  font-size: 48px;
  display: inline-block;
  transition: transform 0.15s linear;
}
</style>
