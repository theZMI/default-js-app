<template>
  <example-layout :error="error">
    <div class="ex-card text-center">
      <div class="ms-cover"><i class="bi bi-music-note-beamed"></i></div>
      <div class="mt-3 ms-title">{{ tracks[index].title }}</div>
      <div class="text-secondary">{{ tracks[index].artist }}</div>
      <div class="ex-buttons justify-content-center mt-3">
        <button class="btn btn-secondary rounded-pill" @click="prev" aria-label="Предыдущий"><i class="bi bi-skip-start-fill"></i></button>
        <button class="btn btn-primary rounded-pill btn-lg" @click="playing ? pause() : play()" :aria-label="playing ? 'Пауза' : 'Играть'">
          <i class="bi" :class="playing ? 'bi-pause-fill' : 'bi-play-fill'"></i>
        </button>
        <button class="btn btn-secondary rounded-pill" @click="next" aria-label="Следующий"><i class="bi bi-skip-end-fill"></i></button>
      </div>
    </div>
    <p class="ex-desc">Нажмите «Играть» и откройте шторку или заблокируйте экран — там будут название и кнопки. Звук — тихий тон (сгенерирован в приложении).</p>
  </example-layout>
</template>

<script setup>
import {onBeforeUnmount, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {setMediaSession, setPlaybackState, clearMediaSession} from '@/native/mediaSession';
import {enableBackgroundMode, disableBackgroundMode} from '@/native/backgroundMode';

defineOptions({name: 'ExampleMediaSession'});

const tracks = [
  {title: 'Тон 440 Гц', artist: 'Default JS App', freq: 440},
  {title: 'Тон 523 Гц', artist: 'Default JS App', freq: 523},
  {title: 'Тон 659 Гц', artist: 'Default JS App', freq: 659},
];
const index = ref(0);
const playing = ref(false);
const error = ref('');
// Media Session в браузере показывается только для настоящего <audio>, поэтому звук —
// WAV-файл, сгенерированный на лету (без внешних файлов)
const audio = new Audio();
audio.loop = true;
audio.volume = 0.15;

function toneWav(freq, seconds = 2, rate = 22050) {
  const n = seconds * rate;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const str = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.sin(2 * Math.PI * freq * i / rate) * 12000, true);
  return URL.createObjectURL(new Blob([buf], {type: 'audio/wav'}));
}

function load() {
  if (audio.src) URL.revokeObjectURL(audio.src);
  audio.src = toneWav(tracks[index.value].freq);
}

async function play() {
  error.value = '';
  if (!audio.src) load();
  try {
    await audio.play();
  } catch (e) {
    error.value = 'Не удалось запустить звук.';
    return;
  }
  playing.value = true;
  setMediaSession({title: tracks[index.value].title, artist: tracks[index.value].artist, album: 'Пример Media Session'}, {play, pause, next, previous: prev, stop: pause});
  setPlaybackState(true);
  enableBackgroundMode('example-media', {title: tracks[index.value].title, text: 'Играет пример'});
}

function pause() {
  audio.pause();
  playing.value = false;
  setPlaybackState(false);
  disableBackgroundMode('example-media');
}

function switchTo(i) {
  index.value = (i + tracks.length) % tracks.length;
  load();
  if (playing.value) play();
}

const next = () => switchTo(index.value + 1);
const prev = () => switchTo(index.value - 1);

onBeforeUnmount(() => {
  pause();
  clearMediaSession();
  if (audio.src) URL.revokeObjectURL(audio.src);
});
</script>

<style lang="scss" scoped>
.ms-cover {
  width: 160px;
  height: 160px;
  margin: 10px auto 0;
  border-radius: 16px;
  background: linear-gradient(135deg, #0066FF, #6A00F4);
  color: #FFF;
  font-size: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ms-title {
  font-size: 20px;
}
</style>
