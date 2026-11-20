<template>
  <example-layout :error="error">
    <div class="ex-card text-center">
      <div class="ex-big-value">{{ ticks }} с</div>
      <div class="text-secondary mb-3">{{ running ? 'Таймер идёт — сверните приложение и вернитесь' : 'Таймер остановлен' }}</div>
      <div class="form-check form-switch d-inline-block text-start mb-3">
        <input class="form-check-input" type="checkbox" id="bg-keep" v-model="keepAlive" :disabled="running">
        <label class="form-check-label" for="bg-keep">Включить фоновый режим</label>
      </div>
      <div>
        <button class="btn btn-lg rounded-pill btn-min-width" :class="running ? 'btn-secondary' : 'btn-primary'" @click="toggle">
          {{ running ? 'Стоп' : 'Старт' }}
        </button>
      </div>
      <div v-if="!available" class="text-secondary small mt-3">Плагин cordova-plugin-background-mode не найден (это браузер?) — фон работать не будет.</div>
    </div>

    <div class="ex-card">
      <div class="mb-1">Журнал</div>
      <div v-if="!log.length" class="ex-empty">Сверните приложение во время работы таймера</div>
      <ul class="ex-list">
        <li v-for="(l, i) in log" :key="i"><small class="text-secondary">{{ l.time }}</small> {{ l.text }}</li>
      </ul>
    </div>
    <p class="ex-desc">
      Без фонового режима Android «замораживает» свёрнутое приложение: таймер встанет, и в журнале
      будет видно, сколько секунд потерялось. С ним — в шторке висит уведомление, а JS продолжает работать.
    </p>
  </example-layout>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {enableBackgroundMode, disableBackgroundMode, isBackgroundModeAvailable} from '@/native/backgroundMode';

defineOptions({name: 'ExampleBackground'});

const REASON = 'example-background';
const available = isBackgroundModeAvailable();
const ticks = ref(0);
const running = ref(false);
const keepAlive = ref(true);
const log = ref([]);
const error = ref('');
let timer = null;
let startedAt = 0;
let hiddenAt = 0;

function addLog(text) {
  log.value.unshift({time: new Date().toLocaleTimeString('ru-RU'), text});
}

function toggle() {
  if (running.value) {
    clearInterval(timer);
    disableBackgroundMode(REASON);
    running.value = false;
    addLog('Таймер остановлен');
    return;
  }
  ticks.value = 0;
  startedAt = Date.now();
  // Тики считаются инкрементом, а не от времени старта, — так видно, если JS «спал»
  timer = setInterval(() => ticks.value++, 1000);
  if (keepAlive.value) enableBackgroundMode(REASON, {title: 'Таймер работает', text: 'Пример фонового режима'});
  running.value = true;
  addLog(keepAlive.value ? 'Старт с фоновым режимом' : 'Старт без фонового режима');
}

function onVisibility() {
  if (!running.value) return;
  if (document.hidden) {
    hiddenAt = Date.now();
    addLog(`Свернули на ${ticks.value} с`);
  } else {
    const real = Math.round((Date.now() - startedAt) / 1000);
    const lost = real - ticks.value;
    addLog(`Вернулись через ${Math.round((Date.now() - hiddenAt) / 1000)} с; таймер: ${ticks.value} с, реально: ${real} с` + (lost > 2 ? ` — потеряно ${lost} с` : ' — ничего не потеряно'));
  }
}

onMounted(() => document.addEventListener('visibilitychange', onVisibility));
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibility);
  clearInterval(timer);
  disableBackgroundMode(REASON);
});
</script>
