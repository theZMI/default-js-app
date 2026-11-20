<template>
  <example-layout :error="error">
    <div class="ex-card">
      <label class="form-label">Ссылка на файл</label>
      <input class="form-control mb-2" v-model="url" placeholder="https://…" inputmode="url">
      <div class="ex-buttons mb-2">
        <button v-for="s in samples" :key="s.name" class="btn btn-sm btn-secondary rounded-pill" @click="url = s.url">{{ s.name }}</button>
      </div>
      <button class="btn btn-lg btn-primary rounded-pill w-100" @click="download" :disabled="progress !== null || !url">
        <i class="bi bi-download"></i> Скачать
      </button>
      <div v-if="progress !== null" class="mt-3">
        <div class="progress" style="height: 8px;"><div class="progress-bar" :style="{width: progress + '%'}"></div></div>
        <div class="small text-secondary mt-1">{{ progress }}%</div>
      </div>
    </div>

    <div class="ex-card">
      <div class="mb-1">Скачанные файлы</div>
      <div v-if="!files.length" class="ex-empty">Пока пусто</div>
      <ul class="ex-list">
        <li v-for="f in files" :key="f.path">
          <i class="bi bi-file-earmark"></i>
          <span class="flex-grow-1 files-name">{{ f.name }}</span>
          <button v-if="isNative" class="btn btn-sm btn-secondary rounded-pill" @click="open(f)">Открыть</button>
        </li>
      </ul>
    </div>
    <p class="ex-desc">
      В приложении файл сохраняется в папку приложения (cordova.file.externalDataDirectory) и открывается
      системой — так же устроено самообновление APK. В браузере — обычное скачивание.
    </p>
  </example-layout>
</template>

<script setup>
import {ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {downloadFile, openFile} from '@/native/files';
import {isCordova} from '@/native/cordova';
import {userErrorMessage} from '@/helpers/errors';

defineOptions({name: 'ExampleFiles'});

const MIME_BY_EXT = {pdf: 'application/pdf', apk: 'application/vnd.android.package-archive', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', mp3: 'audio/mpeg', txt: 'text/plain'};
const samples = [
  {name: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'},
  {name: 'Картинка', url: 'https://www.w3.org/Icons/w3c_home.png'},
];

const isNative = isCordova();
const url = ref(samples[0].url);
const progress = ref(null);
const files = ref([]);
const error = ref('');

async function download() {
  error.value = '';
  progress.value = 0;
  try {
    const name = decodeURIComponent(url.value.split('/').pop().split('?')[0]) || `file-${Date.now()}`;
    const path = await downloadFile(url.value, name, {onProgress: (p) => { progress.value = p; }});
    files.value = [{name, path}, ...files.value.filter((f) => f.path !== path)];
  } catch (e) {
    error.value = userErrorMessage(e, 'Не удалось скачать файл.');
  }
  progress.value = null;
}

async function open(f) {
  error.value = '';
  const ext = f.name.split('.').pop().toLowerCase();
  try {
    await openFile(f.path, MIME_BY_EXT[ext] || '*/*');
  } catch (e) {
    error.value = userErrorMessage(e, 'Не удалось открыть файл — нет подходящего приложения?');
  }
}
</script>

<style lang="scss" scoped>
.files-name {
  word-break: break-all;
}
</style>
