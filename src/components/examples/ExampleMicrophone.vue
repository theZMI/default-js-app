<template>
  <example-layout :error="error">
    <div class="ex-card text-center">
      <div class="mic-level" :style="{'--level': level}">
        <button class="mic-button" :class="{'is-recording': recorder}" @click="toggle" :aria-label="recorder ? 'Остановить' : 'Записать'">
          <i class="bi" :class="recorder ? 'bi-stop-fill' : 'bi-mic-fill'"></i>
        </button>
      </div>
      <div class="ex-big-value mt-3">{{ timerText }}</div>
      <div class="text-secondary">{{ recorder ? 'Идёт запись — нажмите, чтобы остановить' : 'Нажмите, чтобы записать' }}</div>
    </div>

    <div class="ex-card">
      <div class="d-flex justify-content-between mb-1">
        <span>Записи</span><span class="text-secondary">{{ records.length }}</span>
      </div>
      <div v-if="!records.length" class="ex-empty">Записей пока нет</div>
      <ul class="ex-list">
        <li v-for="r in records" :key="r.id">
          <div class="flex-grow-1">
            <div class="small text-secondary">{{ new Date(r.id).toLocaleString('ru-RU') }} · {{ formatDuration(r.durationMs) }}</div>
            <audio :src="r.url" controls preload="metadata" class="mic-audio"></audio>
          </div>
          <button class="ex-icon-btn" @click="remove(r)" aria-label="Удалить"><i class="bi bi-trash"></i></button>
        </li>
      </ul>
    </div>
    <p class="ex-desc">Записи хранятся в IndexedDB. Формат — webm/opus (Android, Chrome) или mp4/aac (iOS, Safari).</p>
  </example-layout>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {startRecording} from '@/native/microphone';
import {vibrate, VIBRATION} from '@/native/vibration';
import localDB from '@/libraries/localDB';

defineOptions({name: 'ExampleMicrophone'});

const recorder = ref(null);
const level = ref(0);
const startedAt = ref(0);
const now = ref(0);
const records = ref([]);
const error = ref('');
let clock = null;

const formatDuration = (ms) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
const timerText = computed(() => recorder.value ? formatDuration(now.value - startedAt.value) : '0:00');
const withUrl = (row) => ({...row, url: URL.createObjectURL(row.blob)});

async function toggle() {
  error.value = '';
  if (recorder.value) {
    const rec = recorder.value;
    recorder.value = null;
    clearInterval(clock);
    level.value = 0;
    let res;
    try {
      res = await rec.stop();
    } catch (e) {
      error.value = e.message;
      return;
    }
    URL.revokeObjectURL(res.url);
    const row = {id: Date.now(), blob: res.blob, durationMs: res.durationMs, mimeType: res.mimeType};
    await localDB.put('files', row);
    records.value.unshift(withUrl(row));
    return;
  }
  try {
    recorder.value = await startRecording({onLevel: (l) => { level.value = l; }});
    vibrate(VIBRATION.TAP);
    startedAt.value = now.value = Date.now();
    clock = setInterval(() => { now.value = Date.now(); }, 250);
  } catch (e) {
    error.value = e.message;
  }
}

async function remove(r) {
  await localDB.delete('files', r.id);
  URL.revokeObjectURL(r.url);
  records.value = records.value.filter((x) => x.id !== r.id);
}

onMounted(async () => {
  // В таблице files могут лежать и другие файлы — берём только аудиозаписи
  const rows = (await localDB.getAll('files')).filter((r) => r.mimeType && r.mimeType.startsWith('audio/'));
  records.value = rows.sort((a, b) => b.id - a.id).map(withUrl);
});

onBeforeUnmount(() => {
  recorder.value && recorder.value.cancel();
  clearInterval(clock);
  records.value.forEach((r) => URL.revokeObjectURL(r.url));
});
</script>

<style lang="scss" scoped>
.mic-level {
  --level: 0;
  width: 150px;
  height: 150px;
  margin: 10px auto 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  // Кольцо «дышит» с громкостью
  box-shadow: 0 0 0 calc(var(--level) * 30px) rgba(255, 41, 41, 0.25);
  transition: box-shadow 0.05s linear;
}

.mic-button {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: #0066FF;
  color: #FFF;
  font-size: 46px;

  &.is-recording {
    background: #FF2929;
  }
}

.mic-audio {
  width: 100%;
  height: 36px;
  margin-top: 4px;
}
</style>
