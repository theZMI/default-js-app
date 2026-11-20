<template>
  <example-layout :error="error">
    <div class="ex-card">
      <div class="ex-buttons">
        <button class="btn btn-lg btn-primary rounded-pill flex-grow-1" @click="add('camera')"><i class="bi bi-camera-fill"></i> Снять</button>
        <button class="btn btn-lg btn-secondary rounded-pill flex-grow-1" @click="add('gallery')"><i class="bi bi-images"></i> Из галереи</button>
      </div>
    </div>

    <div class="ex-card">
      <div class="d-flex justify-content-between mb-2">
        <span>Галерея приложения</span><span class="text-secondary">{{ photos.length }} фото · {{ totalSize }}</span>
      </div>
      <div v-if="!photos.length" class="ex-empty">Сделайте первое фото — оно сохранится в IndexedDB и переживёт перезапуск</div>
      <div class="camera-grid">
        <button v-for="p in photos" :key="p.id" class="camera-thumb" @click="opened = p">
          <img :src="p.url" alt="">
        </button>
      </div>
    </div>

    <popup-message :visible="!!opened" :close="() => opened = null">
      <div v-if="opened">
        <img :src="opened.url" class="camera-full" alt="">
        <div class="text-secondary small mt-2">{{ new Date(opened.id).toLocaleString('ru-RU') }} · {{ Math.round(opened.blob.size / 1024) }} КБ</div>
        <button class="btn btn-outline-danger rounded-pill mt-3" @click="remove(opened)"><i class="bi bi-trash"></i> Удалить</button>
      </div>
    </popup-message>
  </example-layout>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {takePhoto, selectPhoto} from '@/native/camera';
import localDB from '@/libraries/localDB';
import {userErrorMessage} from '@/helpers/errors';

defineOptions({name: 'ExampleCamera'});

// Фото хранятся Blob'ами в таблице images (src/libraries/localDB.js), для показа —
// object URL (дешевле base64: не раздувает память и DOM)
const photos = ref([]);
const opened = ref(null);
const error = ref('');

const totalSize = computed(() => {
  const kb = photos.value.reduce((sum, p) => sum + p.blob.size, 0) / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} МБ` : `${Math.round(kb)} КБ`;
});

const withUrl = (row) => ({...row, url: URL.createObjectURL(row.blob)});

async function add(source) {
  error.value = '';
  try {
    const res = source === 'camera' ? await takePhoto() : await selectPhoto();
    if (!res) return;
    const row = {id: Date.now(), blob: res.blob};
    await localDB.put('images', row);
    photos.value.unshift(withUrl(row));
  } catch (e) {
    error.value = userErrorMessage(e, 'Не удалось получить фото.');
  }
}

async function remove(photo) {
  await localDB.delete('images', photo.id);
  URL.revokeObjectURL(photo.url);
  photos.value = photos.value.filter((p) => p.id !== photo.id);
  opened.value = null;
}

onMounted(async () => {
  const rows = await localDB.getAll('images');
  photos.value = rows.sort((a, b) => b.id - a.id).map(withUrl);
});

onBeforeUnmount(() => photos.value.forEach((p) => URL.revokeObjectURL(p.url)));
</script>

<style lang="scss" scoped>
.camera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 6px;
}

.camera-thumb {
  padding: 0;
  border: none;
  background: #111;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.camera-full {
  max-width: 100%;
  max-height: 65vh;
  border-radius: 10px;
}
</style>
