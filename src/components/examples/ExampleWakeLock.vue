<template>
  <example-layout :error="error">
    <div class="ex-card text-center">
      <i class="bi wl-hero" :class="on ? 'bi-brightness-high-fill' : 'bi-brightness-low'"></i>
      <div class="mt-2 mb-3">{{ on ? 'Экран не погаснет, пока открыта эта страница' : 'Экран гаснет как обычно' }}</div>
      <div class="form-check form-switch d-inline-block text-start">
        <input id="wl" v-model="on" class="form-check-input" type="checkbox" @change="toggle">
        <label class="form-check-label" for="wl">Не гасить экран</label>
      </div>
    </div>
    <p class="ex-desc">Подходит для сканера, карты, аудиогида, презентации. Уходя со страницы, блокировка снимается — так экран не будет гореть впустую.</p>
  </example-layout>
</template>

<script setup>
import {onBeforeUnmount, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {keepScreenOn, allowScreenOff} from '@/native/wakeLock';

defineOptions({name: 'ExampleWakeLock'});

const REASON = 'example-wake-lock';
const on = ref(false);
const error = ref('');

async function toggle() {
  error.value = '';
  if (on.value) {
    if (!(await keepScreenOn(REASON))) {
      on.value = false;
      error.value = 'Браузер не разрешил (нужен https и поддержка Screen Wake Lock).';
    }
  } else {
    await allowScreenOff(REASON);
  }
}

onBeforeUnmount(() => allowScreenOff(REASON));
</script>

<style lang="scss" scoped>
.wl-hero {
  font-size: 72px;
  color: #FFD43B;
}
</style>
