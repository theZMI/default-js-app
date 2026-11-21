<template>
  <example-layout :error="error">
    <!-- data-no-swipe: жесты по карте не должны открывать боковое меню -->
    <div ref="mapEl" class="map-view" data-no-swipe></div>
    <div class="ex-buttons mt-2">
      <button class="btn btn-primary rounded-pill" @click="locate" :disabled="locating">
        <i class="bi bi-crosshair"></i> {{ locating ? 'Ищем…' : 'Я здесь' }}
      </button>
      <button class="btn btn-secondary rounded-pill" @click="clearCache"><i class="bi bi-trash"></i> Очистить кеш</button>
    </div>
    <div class="ex-card">
      <div class="ex-stats">
        <div><small>Тайлов в кеше</small><b>{{ cachedTiles }}</b></div>
        <div><small>Из кеша / из сети</small><b>{{ stats.cache }} / {{ stats.net }}</b></div>
      </div>
      <p class="ex-desc mb-0">Посмотрите место с интернетом, выключите сеть и вернитесь — карта откроется из кеша.</p>
    </div>
  </example-layout>
</template>

<script setup>
import {onBeforeUnmount, onMounted, reactive, ref} from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ExampleLayout from './ExampleLayout.vue';
import {APP} from '@/config/app';
import {getCurrentPosition} from '@/native/geolocation';
import localDB from '@/libraries/localDB';

defineOptions({name: 'ExampleMap'});

const mapEl = ref(null);
const error = ref('');
const locating = ref(false);
const cachedTiles = ref(0);
const stats = reactive({cache: 0, net: 0});
let map = null;
let me = null;

// Слой тайлов с кешем в IndexedDB: сначала ищем тайл на устройстве, нет — качаем и сохраняем.
// Кешируются только просмотренные тайлы (массовая предзагрузка запрещена правилами OSM).
const CachedTileLayer = L.TileLayer.extend({
  createTile(coords, done) {
    const img = document.createElement('img');
    img.alt = '';
    const url = this.getTileUrl(coords);
    (async () => {
      let blob = null;
      try {
        blob = (await localDB.get('tiles', url))?.blob || null;
        if (blob) stats.cache++;
      } catch (e) { /* нет IndexedDB — просто из сети */ }
      if (!blob) {
        try {
          const res = await fetch(url, {mode: 'cors'});
          if (!res.ok) throw new Error(String(res.status));
          blob = await res.blob();
          stats.net++;
          localDB.put('tiles', {url, blob, time: Date.now()}).then(countTiles).catch(() => {});
        } catch (e) {
          done(e, img);
          return;
        }
      }
      img.onload = () => { URL.revokeObjectURL(img.src); done(null, img); };
      img.src = URL.createObjectURL(blob);
    })();
    return img;
  },
});

async function countTiles() {
  try {
    cachedTiles.value = (await localDB.getAll('tiles')).length;
  } catch (e) {
    cachedTiles.value = 0;
  }
}

async function locate() {
  error.value = '';
  locating.value = true;
  try {
    const pos = await getCurrentPosition();
    const ll = [pos.latitude, pos.longitude];
    if (!me) {
      me = L.circleMarker(ll, {radius: 8, color: '#FFF', weight: 2, fillColor: '#0066FF', fillOpacity: 1}).addTo(map);
    } else {
      me.setLatLng(ll);
    }
    map.setView(ll, 16);
  } catch (e) {
    error.value = e.message;
  }
  locating.value = false;
}

async function clearCache() {
  await localDB.clear('tiles');
  stats.cache = stats.net = 0;
  countTiles();
}

onMounted(() => {
  map = L.map(mapEl.value, {zoomControl: true, attributionControl: true}).setView(APP.MAP.CENTER, APP.MAP.ZOOM);
  new CachedTileLayer(APP.MAP.TILE_URL, {maxZoom: APP.MAP.MAX_ZOOM, attribution: APP.MAP.ATTRIBUTION}).addTo(map);
  countTiles();
});

onBeforeUnmount(() => map && map.remove());
</script>

<style lang="scss" scoped>
.map-view {
  height: 55vh;
  min-height: 280px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--app-glass-border);
  z-index: 0; // слои Leaflet не должны перекрывать меню
}
</style>
