<template>
  <example-layout :error="error">
    <div class="ex-card">
      <div class="glass-card-header mb-2"><i class="bi" :class="available ? 'bi-check-circle text-success' : 'bi-exclamation-circle'"></i>
        <span>{{ available ? 'Push подключён' : 'Push пока не подключён' }}</span>
      </div>
      <p class="small mb-3">
        Push-уведомления приходят с вашего сервера через Firebase Cloud Messaging — даже когда приложение закрыто.
        Им нужен ваш Firebase-проект, поэтому в заготовке плагин не установлен: выполните шаги ниже.
      </p>
      <button class="btn btn-primary rounded-pill" @click="loadToken" :disabled="!available">Получить токен устройства</button>
      <pre v-if="token" class="ex-mono">{{ token }}</pre>
      <div v-if="messages.length" class="mt-3">
        <div class="mb-1">Полученные сообщения</div>
        <pre v-for="(m, i) in messages" :key="i" class="ex-mono">{{ m }}</pre>
      </div>
    </div>
  </example-layout>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {isPushAvailable, getToken, onMessage} from '@/native/push';

defineOptions({name: 'ExamplePush'});

const available = ref(false);
const token = ref('');
const messages = ref([]);
const error = ref('');

async function loadToken() {
  error.value = '';
  try {
    token.value = await getToken();
  } catch (e) {
    error.value = e.message;
  }
}

onMounted(async () => {
  available.value = await isPushAvailable();
  if (available.value) onMessage((m) => messages.value.unshift(JSON.stringify(m, null, 2)));
});
</script>
