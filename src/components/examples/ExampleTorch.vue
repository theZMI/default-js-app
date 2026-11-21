<template>
  <example-layout :error="error">
    <div class="ex-card text-center">
      <button class="torch-button" :class="{'is-on': on}" @click="toggle" :disabled="busy" :aria-label="on ? 'Выключить фонарик' : 'Включить фонарик'">
        <i class="bi" :class="on ? 'bi-lightbulb-fill' : 'bi-lightbulb'"></i>
      </button>
      <div class="mt-3">{{ on ? 'Фонарик включён' : 'Нажмите, чтобы включить' }}</div>
    </div>
  </example-layout>
</template>

<script setup>
import {onBeforeUnmount, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {toggleTorch, torchOff, isTorchOn} from '@/native/torch';

defineOptions({name: 'ExampleTorch'});

const on = ref(isTorchOn());
const busy = ref(false);
const error = ref('');

async function toggle() {
  error.value = '';
  busy.value = true;
  try {
    on.value = await toggleTorch();
  } catch (e) {
    on.value = false;
    error.value = e.message;
  }
  busy.value = false;
}

// Уходя со страницы — гасим: иначе камера останется занятой
onBeforeUnmount(() => torchOff());
</script>

<style lang="scss" scoped>
.torch-button {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 1px solid var(--app-glass-border);
  background: var(--app-inset-bg);
  color: var(--app-fg);
  font-size: 64px;
  transition: all 0.2s;

  &.is-on {
    background: #FFD43B;
    color: #000;
    box-shadow: 0 0 60px rgba(255, 212, 59, 0.6);
  }
}
</style>
