<template>
  <example-layout :error="error">
    <div class="ex-card text-center">
      <i class="bi bi-qr-code-scan scanner-hero"></i>
      <div class="ex-buttons justify-content-center mt-3">
        <button class="btn btn-lg btn-primary rounded-pill" @click="doScan(SCAN_FORMATS.QR)">Сканировать QR</button>
        <button class="btn btn-lg btn-secondary rounded-pill" @click="doScan(SCAN_FORMATS.ALL)">Любой код</button>
      </div>
      <div v-if="last" class="ex-mono text-start">{{ last }}</div>
      <div v-if="last" class="ex-buttons justify-content-center mt-2">
        <button v-if="isUrl(last)" class="btn btn-secondary rounded-pill" @click="openExternal(last)"><i class="bi bi-box-arrow-up-right"></i> Открыть</button>
        <button class="btn btn-secondary rounded-pill" @click="copy(last)"><i class="bi bi-clipboard"></i> {{ copied ? 'Скопировано' : 'Копировать' }}</button>
      </div>
    </div>

    <div class="ex-card">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <span>История</span>
        <button v-if="history.length" class="btn btn-link text-secondary p-0" @click="clearHistory">Очистить</button>
      </div>
      <div v-if="!history.length" class="ex-empty">Пока ничего не сканировали</div>
      <ul class="ex-list">
        <li v-for="item in history" :key="item.time">
          <i class="bi" :class="isUrl(item.text) ? 'bi-link-45deg' : 'bi-upc'"></i>
          <span class="flex-grow-1 scanner-text" @click="last = item.text">{{ item.text }}</span>
          <small class="text-secondary">{{ formatTime(item.time) }}</small>
        </li>
      </ul>
    </div>
    <p class="ex-desc">В приложении — полноэкранный сканер с фонариком. В браузере — фото с камеры и распознавание через BarcodeDetector (Chrome).</p>
  </example-layout>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {scan, SCAN_FORMATS} from '@/native/scanner';
import {vibrate, VIBRATION} from '@/native/vibration';
import {openExternal} from '@/native/browser';
import localDB from '@/libraries/localDB';
import {userErrorMessage} from '@/helpers/errors';

defineOptions({name: 'ExampleScanner'});

const HISTORY_KEY = 'example-scanner-history';
const HISTORY_LIMIT = 50;

const last = ref('');
const history = ref([]);
const error = ref('');
const copied = ref(false);

const isUrl = (t) => /^https?:\/\//i.test(t);
const formatTime = (t) => new Date(t).toLocaleString('ru-RU', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'});

async function doScan(formats) {
  error.value = '';
  try {
    const text = await scan({formats});
    if (!text) return; // отменили
    vibrate(VIBRATION.SUCCESS);
    last.value = text;
    copied.value = false;
    history.value = [{text, time: Date.now()}, ...history.value].slice(0, HISTORY_LIMIT);
    await localDB.setValue(HISTORY_KEY, history.value);
  } catch (e) {
    vibrate(VIBRATION.ERROR);
    error.value = userErrorMessage(e, 'Не удалось отсканировать код.');
  }
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
  } catch (e) {
    error.value = 'Не удалось скопировать — выделите текст вручную.';
  }
}

async function clearHistory() {
  history.value = [];
  await localDB.setValue(HISTORY_KEY, []);
}

onMounted(async () => {
  history.value = await localDB.getValue(HISTORY_KEY, []);
});
</script>

<style lang="scss" scoped>
.scanner-hero {
  font-size: 64px;
  opacity: 0.3;
}

.scanner-text {
  word-break: break-all;
  -webkit-user-select: text;
  user-select: text;
}
</style>
