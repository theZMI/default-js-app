<template>
  <example-layout :error="error">
    <div class="ex-card">
      <div class="ex-buttons">
        <button v-for="p in presets" :key="p.name" class="btn btn-secondary rounded-pill" @click="play(p.pattern)">{{ p.name }}</button>
      </div>
    </div>

    <div class="ex-card text-center">
      <!-- Вибрирует, пока палец на кнопке: vibrate(длинная) на нажатие, vibrate(0) на отпускание -->
      <button class="vibro-pad" :class="{'is-active': holding}"
              @pointerdown.prevent="holdStart" @pointerup="holdEnd" @pointerleave="holdEnd" @pointercancel="holdEnd"
              @contextmenu.prevent>
        <i class="bi bi-phone-vibrate"></i>
        <span>{{ holding ? 'Вжжжж…' : 'Держите' }}</span>
      </button>
    </div>

    <div class="ex-card">
      <label class="form-label">Свой паттерн, мс: вибрация, пауза, вибрация…</label>
      <div class="d-flex gap-2">
        <input class="form-control" v-model="custom" inputmode="numeric">
        <button class="btn btn-primary rounded-pill" @click="playCustom">Пуск</button>
      </div>
    </div>
    <p class="ex-desc">Работает на Android (в браузере и в приложении). iOS вибрацию из веб-кода не поддерживает.</p>
  </example-layout>
</template>

<script setup>
import {onBeforeUnmount, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {vibrate, VIBRATION, isVibrationAvailable} from '@/native/vibration';

defineOptions({name: 'ExampleVibration'});

const S = 150, L = 450, G = 150; // точка, тире, пауза (азбука Морзе)
const presets = [
  {name: 'Тап', pattern: VIBRATION.TAP},
  {name: 'Успех', pattern: VIBRATION.SUCCESS},
  {name: 'Ошибка', pattern: VIBRATION.ERROR},
  {name: 'Сердцебиение', pattern: [80, 120, 80, 600, 80, 120, 80]},
  {name: 'SOS', pattern: [S, G, S, G, S, G * 3, L, G, L, G, L, G * 3, S, G, S, G, S]},
];

const holding = ref(false);
const custom = ref('200, 100, 200, 100, 600');
const error = ref(isVibrationAvailable() ? '' : 'Это устройство не поддерживает вибрацию из веб-кода.');

function play(pattern) {
  if (!vibrate(pattern)) error.value = 'Вибрация недоступна (или запрещена браузером до первого касания страницы).';
}

function playCustom() {
  const pattern = custom.value.split(/[\s,;]+/).map(Number).filter((n) => n >= 0 && n <= 10000);
  if (pattern.length) play(pattern);
}

function holdStart() {
  holding.value = true;
  vibrate(10000);
}

function holdEnd() {
  if (!holding.value) return;
  holding.value = false;
  vibrate(0);
}

onBeforeUnmount(() => vibrate(0));
</script>

<style lang="scss" scoped>
.vibro-pad {
  width: 170px;
  height: 170px;
  border-radius: 50%;
  border: 1px solid rgba(var(--app-fg-rgb), 0.15);
  background: var(--app-btn-secondary-bg);
  color: var(--app-fg);
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  touch-action: none;
  transition: transform 0.1s;

  .bi {
    font-size: 48px;
  }

  &.is-active {
    background: #0066FF;
    transform: scale(0.95);
    animation: vibro-shake 0.08s linear infinite;
  }
}

@keyframes vibro-shake {
  0% { translate: -2px 0; }
  50% { translate: 2px 0; }
  100% { translate: -2px 0; }
}
</style>
