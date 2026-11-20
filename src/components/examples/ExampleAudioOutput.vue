<template>
  <example-layout :error="error">
    <div class="ex-card">
      <div class="ex-buttons mb-2">
        <button class="btn btn-secondary rounded-pill" @click="refresh"><i class="bi bi-arrow-clockwise"></i> Обновить</button>
        <button class="btn rounded-pill" :class="playing ? 'btn-primary' : 'btn-secondary'" @click="toggleTone">
          <i class="bi" :class="playing ? 'bi-volume-mute-fill' : 'bi-volume-up-fill'"></i> {{ playing ? 'Выключить звук' : 'Тестовый звук' }}
        </button>
      </div>
      <div class="small text-secondary mb-2">
        {{ isNative ? 'Нативный плагин: выход можно переключить' : 'Без плагина: только список, выход выбирает система' }}
      </div>
      <div v-if="!outputs.length" class="ex-empty">Выходы не найдены</div>
      <ul class="ex-list">
        <li v-for="o in outputs" :key="o.id" @click="select(o)" class="audio-item">
          <i class="bi" :class="AUDIO_OUTPUT_TYPE_ICONS[o.type] || 'bi-volume-up'"></i>
          <span class="flex-grow-1">{{ o.name }}</span>
          <i v-if="currentOutput && currentOutput.id === o.id" class="bi bi-check-lg text-primary"></i>
        </li>
      </ul>
    </div>
    <p class="ex-desc">Включите тестовый звук и подключите/отключите наушники — список обновится, звук переедет.</p>
  </example-layout>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {useAudioOutput, AUDIO_OUTPUT_TYPE_ICONS} from '@/native/audioOutput';

defineOptions({name: 'ExampleAudioOutput'});

const {outputs, currentOutput, isNative, refreshOutputs, selectOutput, startWatching} = useAudioOutput();
const playing = ref(false);
const error = ref('');
let ctx = null;
let osc = null;

async function refresh() {
  error.value = '';
  await refreshOutputs();
}

async function select(o) {
  if (!(await selectOutput(o))) error.value = 'Android не дал переключиться на этот выход.';
}

// Тихий синус 440 Гц через Web Audio — чтобы услышать, куда идёт звук
function toggleTone() {
  if (playing.value) {
    osc && osc.stop();
    ctx && ctx.close();
    osc = ctx = null;
    playing.value = false;
    return;
  }
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  osc = ctx.createOscillator();
  const gain = ctx.createGain();
  gain.gain.value = 0.05;
  osc.frequency.value = 440;
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  playing.value = true;
}

onMounted(async () => {
  await refresh();
  startWatching();
});

onBeforeUnmount(() => playing.value && toggleTone());
</script>

<style lang="scss" scoped>
.audio-item {
  cursor: pointer;
}
</style>
