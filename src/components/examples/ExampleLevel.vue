<template>
  <example-layout :error="error">
    <div class="ex-card text-center">
      <div class="level" :class="{'is-level': isLevel}">
        <div class="level-cross"></div>
        <div class="level-bubble" :style="bubbleStyle"></div>
      </div>
      <div class="ex-stats mt-3">
        <div><small>Наклон вперёд/назад</small><b>{{ tilt ? `${tilt.beta.toFixed(1)}°` : '—' }}</b></div>
        <div><small>Наклон влево/вправо</small><b>{{ tilt ? `${tilt.gamma.toFixed(1)}°` : '—' }}</b></div>
        <div><small>Ускорение</small><b>{{ accel ? `${accel.toFixed(1)} м/с²` : '—' }}</b></div>
        <div><small>Встряхиваний</small><b>{{ shakes }}</b></div>
      </div>
      <button class="btn btn-lg rounded-pill btn-min-width mt-3" :class="running ? 'btn-secondary' : 'btn-primary'" @click="toggle">
        {{ running ? 'Выключить датчики' : 'Включить датчики' }}
      </button>
    </div>
    <p class="ex-desc">Положите телефон на стол экраном вверх: пузырёк в центре и зелёный — поверхность ровная. Встряхните телефон — сработает счётчик.</p>
  </example-layout>
</template>

<script setup>
import {computed, onBeforeUnmount, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {startTilt, startMotion, onShake} from '@/native/motion';
import {vibrate, VIBRATION} from '@/native/vibration';

defineOptions({name: 'ExampleLevel'});

const MAX_TILT = 20; // градусов до края круга

const tilt = ref(null);
const accel = ref(null);
const shakes = ref(0);
const running = ref(false);
const error = ref('');
let stops = [];

const clamp = (v) => Math.max(-MAX_TILT, Math.min(MAX_TILT, v));
const isLevel = computed(() => tilt.value && Math.abs(tilt.value.beta) < 1 && Math.abs(tilt.value.gamma) < 1);
// Пузырёк всплывает в сторону, противоположную наклону
const bubbleStyle = computed(() => {
  if (!tilt.value) return {};
  const x = -clamp(tilt.value.gamma) / MAX_TILT * 42;
  const y = -clamp(tilt.value.beta) / MAX_TILT * 42;
  return {transform: `translate(${x}%, ${y}%)`};
});

function stopAll() {
  stops.forEach((s) => s());
  stops = [];
  running.value = false;
}

async function toggle() {
  error.value = '';
  if (running.value) {
    stopAll();
    return;
  }
  try {
    stops.push(await startTilt((t) => { tilt.value = t; }));
    stops.push(await startMotion((m) => { accel.value = m.magnitude; }));
    stops.push(await onShake(() => { shakes.value++; vibrate(VIBRATION.TAP); }));
    running.value = true;
  } catch (e) {
    stopAll();
    error.value = e.message;
  }
}

onBeforeUnmount(stopAll);
</script>

<style lang="scss" scoped>
.level {
  position: relative;
  width: 240px;
  max-width: 100%;
  aspect-ratio: 1;
  margin: 10px auto 0;
  border-radius: 50%;
  border: 2px solid rgba(var(--app-fg-rgb), 0.2);
  background: radial-gradient(circle, rgba(var(--app-fg-rgb), 0.06), rgba(0, 0, 0, 0.4));
  display: flex;
  align-items: center;
  justify-content: center;

  &.is-level .level-bubble {
    background: rgba(0, 156, 0, 0.85);
  }
}

.level-cross {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px dashed rgba(var(--app-fg-rgb), 0.35);
}

.level-bubble {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 102, 255, 0.85);
  box-shadow: inset 0 -6px 12px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 102, 255, 0.5);
  transition: transform 0.1s linear, background 0.2s;
}
</style>
