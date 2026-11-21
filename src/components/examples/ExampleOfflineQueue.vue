<template>
  <example-layout :error="error">
    <div class="ex-card">
      <div class="form-check form-switch mb-3">
        <input id="oq-offline" v-model="offline" class="form-check-input" type="checkbox">
        <label class="form-check-label" for="oq-offline">Имитировать отсутствие сети</label>
      </div>
      <div class="ex-buttons">
        <button class="btn btn-primary rounded-pill" @click="addAction"><i class="bi bi-plus-lg"></i> Сделать действие</button>
        <button class="btn btn-secondary rounded-pill" @click="queue.process({force: true})">Отправить сейчас</button>
        <button class="btn btn-secondary rounded-pill" @click="queue.clear({all: true})">Очистить</button>
      </div>
      <div class="ex-stats mt-3">
        <div><small>Ждут отправки</small><b>{{ count('pending') }}</b></div>
        <div><small>Отправлено</small><b>{{ count('sent') }}</b></div>
      </div>
    </div>

    <div class="ex-card">
      <div v-if="!items.length" class="ex-empty">Очередь пуста</div>
      <ul class="ex-list">
        <li v-for="i in [...items].reverse()" :key="i.id">
          <i class="bi" :class="{'bi-hourglass-split text-warning': i.status === 'pending', 'bi-check-circle text-success': i.status === 'sent', 'bi-x-circle text-danger': i.status === 'failed'}"></i>
          <span class="flex-grow-1">{{ i.data.title }}<br><small class="text-secondary">{{ statusText(i) }}</small></span>
        </li>
      </ul>
    </div>
    <p class="ex-desc">
      Включите «нет сети», сделайте пару действий, закройте и снова откройте приложение — они остались.
      Выключите «нет сети» — уйдут сами (сразу или в течение 15 секунд).
    </p>
  </example-layout>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref, watch} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {createQueue} from '@/libraries/offlineQueue';
import {delay} from '@/helpers/delay';

defineOptions({name: 'ExampleOfflineQueue'});

const offline = ref(false);
const items = ref([]);
const error = ref('');
let n = 0;

// Своя очередь примера с имитацией сервера: в настоящем приложении — общая apiQueue
// (src/libraries/offlineQueue.js), которая отправляет запросы через Api.js
const queue = createQueue({
  name: 'example',
  send: async () => {
    await delay(400);
    if (offline.value) throw Object.assign(new Error('Нет сети'), {retry: true});
    return {ok: true};
  },
});

const count = (status) => items.value.filter((i) => i.status === status).length;
const statusText = (i) => i.status === 'sent'
  ? `отправлено с ${i.attempts}-й попытки`
  : i.status === 'failed' ? `ошибка: ${i.lastError}` : (i.attempts ? `попыток: ${i.attempts}, повтор позже` : 'ждёт');

async function addAction() {
  error.value = '';
  n++;
  await queue.add({method: 'post', uri: 'demo/action', data: {title: `Действие №${n} в ${new Date().toLocaleTimeString('ru-RU')}`}});
}

let unsubscribe = null;
let stopAuto = null;
onMounted(async () => {
  unsubscribe = queue.subscribe((list) => { items.value = list; n = list.length; });
  stopAuto = queue.start();
});
// Сеть «появилась» — сразу пробуем отправить
watch(offline, (v) => { if (!v) queue.process({force: true}); });
onBeforeUnmount(() => { unsubscribe && unsubscribe(); stopAuto && stopAuto(); });
</script>
