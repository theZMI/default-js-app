<template>
  <example-layout :error="error">
    <div class="ex-card">
      <label class="form-label">Текст</label>
      <textarea v-model="text" class="form-control mb-2" rows="3"></textarea>
      <label class="form-label">Ссылка</label>
      <input v-model="url" class="form-control mb-3" inputmode="url">
      <div class="ex-buttons">
        <button class="btn btn-primary rounded-pill" @click="doShare()"><i class="bi bi-share"></i> Поделиться</button>
        <button class="btn btn-secondary rounded-pill" @click="sharePhoto"><i class="bi bi-image"></i> Фото</button>
      </div>
      <div v-if="result" class="small mt-2" :class="result === 'cancelled' ? 'text-secondary' : 'text-success'">{{ resultText }}</div>
    </div>
  </example-layout>
</template>

<script setup>
import {computed, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {share} from '@/native/share';
import {selectPhoto} from '@/native/camera';

defineOptions({name: 'ExampleShare'});

const text = ref('Смотри, что умеет заготовка приложения!');
const url = ref('https://github.com/theZMI/default-js-app');
const result = ref('');
const error = ref('');

const resultText = computed(() => ({shared: 'Отправлено', copied: 'Скопировано в буфер обмена (браузер не умеет делиться)', cancelled: 'Отменено'}[result.value]));

async function doShare(files = []) {
  error.value = result.value = '';
  try {
    result.value = await share({title: 'Default JS App', text: text.value, url: url.value, files});
  } catch (e) {
    error.value = e.message;
  }
}

async function sharePhoto() {
  const photo = await selectPhoto();
  if (!photo) return;
  const file = new File([photo.blob], 'photo.jpg', {type: photo.blob.type || 'image/jpeg'});
  await doShare([file]);
}
</script>
