<template>
  <example-layout :error="error">
    <div class="ex-card">
      <div class="ex-buttons mb-3">
        <button class="btn btn-lg rounded-pill flex-grow-1" :class="tracking ? 'btn-secondary' : 'btn-primary'" @click="toggleTracking">
          <i class="bi" :class="tracking ? 'bi-stop-fill' : 'bi-play-fill'"></i>
          {{ tracking ? 'Остановить' : 'Начать трек' }}
        </button>
        <button class="btn btn-lg btn-secondary rounded-pill" @click="whereAmI" :disabled="locating">
          <i class="bi bi-crosshair"></i>
        </button>
      </div>

      <div v-if="hasBackground" class="form-check form-switch mb-3">
        <input class="form-check-input" type="checkbox" id="gps-bg" v-model="background" :disabled="tracking">
        <label class="form-check-label" for="gps-bg">Писать трек в фоне (с уведомлением)</label>
      </div>

      <my-loader v-if="locating" css-classes="text-start mb-3" label="Определяем местоположение…" />

      <div class="ex-stats">
        <div><small>Широта</small><b>{{ pos ? pos.latitude.toFixed(6) : '—' }}</b></div>
        <div><small>Долгота</small><b>{{ pos ? pos.longitude.toFixed(6) : '—' }}</b></div>
        <div><small>Точность</small><b>{{ pos ? `±${Math.round(pos.accuracy)} м` : '—' }}</b></div>
        <div><small>Скорость</small><b>{{ speedKmh }}</b></div>
        <div><small>Пройдено</small><b>{{ distanceText }}</b></div>
        <div><small>Время трека</small><b>{{ durationText }}</b></div>
      </div>

      <button v-if="pos" class="btn btn-link text-white px-0 mt-2" @click="openOnMap">
        <i class="bi bi-map"></i> Открыть на карте
      </button>
    </div>

    <div class="ex-card" v-if="track.length > 1">
      <div class="d-flex justify-content-between mb-2">
        <span>Трек</span><span class="text-secondary">точек: {{ track.length }}</span>
      </div>
      <svg viewBox="0 0 100 100" class="gps-track" preserveAspectRatio="xMidYMid meet">
        <polyline :points="trackPoints" fill="none" stroke="#0066FF" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
        <circle v-if="lastPoint" :cx="lastPoint[0]" :cy="lastPoint[1]" r="2.5" fill="#FFF" />
      </svg>
    </div>
  </example-layout>
</template>

<script setup>
import {computed, onBeforeUnmount, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {getCurrentPosition, watchPosition, distanceMeters} from '@/native/geolocation';
import {openExternal} from '@/native/browser';
import {isCordova} from '@/native/cordova';
import {FEATURES} from '@/config/features';

defineOptions({name: 'ExampleGps'});

// Точки с точностью хуже этой в трек не пишем — иначе стоящий человек «гуляет» на десятки метров
const MAX_ACCURACY_M = 50;
// Шаг меньше этого — дрожание GPS, а не движение
const MIN_STEP_M = 3;

const hasBackground = FEATURES.backgroundMode;
const pos = ref(null);
const track = ref([]);
const distance = ref(0);
const startedAt = ref(0);
const now = ref(Date.now());
const tracking = ref(false);
const background = ref(false);
const locating = ref(false);
const error = ref('');
let stopWatch = null;
let clock = null;

const speedKmh = computed(() => {
  const s = pos.value?.speed;
  return typeof s === 'number' && !Number.isNaN(s) ? `${(s * 3.6).toFixed(1)} км/ч` : '—';
});
const distanceText = computed(() => distance.value >= 1000 ? `${(distance.value / 1000).toFixed(2)} км` : `${Math.round(distance.value)} м`);
const durationText = computed(() => {
  if (!startedAt.value) return '—';
  const sec = Math.floor((now.value - startedAt.value) / 1000);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
});

// Трек → координаты SVG 0..100 (равный масштаб по осям, долгота сжата по широте)
const projected = computed(() => {
  const pts = track.value;
  if (pts.length < 2) return [];
  const k = Math.cos(pts[0].latitude * Math.PI / 180);
  const xs = pts.map((p) => p.longitude * k), ys = pts.map((p) => -p.latitude);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const span = Math.max(Math.max(...xs) - minX, Math.max(...ys) - minY) || 1e-9;
  return xs.map((x, i) => [5 + (x - minX) / span * 90, 5 + (ys[i] - minY) / span * 90]);
});
const trackPoints = computed(() => projected.value.map((p) => p.join(',')).join(' '));
const lastPoint = computed(() => projected.value[projected.value.length - 1]);

async function whereAmI() {
  error.value = '';
  locating.value = true;
  try {
    pos.value = await getCurrentPosition();
  } catch (e) {
    error.value = e.message;
  }
  locating.value = false;
}

function addPoint(p) {
  pos.value = p;
  if (p.accuracy > MAX_ACCURACY_M) return;
  const prev = track.value[track.value.length - 1];
  if (prev) {
    const step = distanceMeters(prev, p);
    if (step < MIN_STEP_M) return;
    distance.value += step;
  }
  track.value.push(p);
}

function toggleTracking() {
  error.value = '';
  if (tracking.value) {
    stopWatch && stopWatch();
    clearInterval(clock);
    tracking.value = false;
    return;
  }
  track.value = [];
  distance.value = 0;
  startedAt.value = Date.now();
  clock = setInterval(() => { now.value = Date.now(); }, 1000);
  tracking.value = true;
  stopWatch = watchPosition(
      (p) => { error.value = ''; addPoint(p); },
      (e) => { error.value = e.message; },
      background.value ? {background: {title: 'Пишем GPS-трек', text: 'Трек записывается в фоне'}} : {},
  );
}

function openOnMap() {
  const {latitude, longitude} = pos.value;
  // В приложении geo: откроет выбор карт (Яндекс, Google…), в браузере такая ссылка бесполезна
  openExternal(isCordova()
      ? `geo:${latitude},${longitude}?q=${latitude},${longitude}`
      : `https://yandex.ru/maps/?pt=${longitude},${latitude}&z=16&l=map`);
}

onBeforeUnmount(() => {
  stopWatch && stopWatch();
  clearInterval(clock);
});
</script>

<style lang="scss" scoped>
.gps-track {
  width: 100%;
  aspect-ratio: 1;
  max-height: 320px;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 10px;
}
</style>
