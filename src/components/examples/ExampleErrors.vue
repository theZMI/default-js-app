<template>
  <example-layout :error="error">
    <div class="ex-card">
      <p class="small">Сгенерируйте ошибку — она попадёт в отчёты (как ошибка у пользователя на телефоне):</p>
      <div class="ex-buttons">
        <button class="btn btn-secondary rounded-pill" @click="throwSync">Ошибка в коде</button>
        <button class="btn btn-secondary rounded-pill" @click="throwAsync">Отклонённый промис</button>
        <button class="btn btn-secondary rounded-pill" @click="manual">Отчёт вручную</button>
      </div>
      <div class="small text-secondary mt-2">
        Отправка на сервер: {{ uri ? `POST ${uri} (через офлайн-очередь)` : 'выключена — APP.ERROR_REPORTS.URI пуст, отчёты только на устройстве' }}
      </div>
    </div>

    <div class="ex-card">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <span>Отчёты на устройстве</span>
        <button v-if="reports.length" class="btn btn-link text-secondary p-0" @click="clear">Очистить</button>
      </div>
      <div v-if="!reports.length" class="ex-empty">Ошибок нет</div>
      <ul class="ex-list">
        <li v-for="(r, i) in reports" :key="i" class="d-block">
          <div class="text-danger">{{ r.message }}</div>
          <div class="small text-secondary">{{ new Date(r.time).toLocaleString('ru-RU') }} · {{ r.where }} · {{ r.route }} · v{{ r.appVersion }} ({{ r.platform }})</div>
        </li>
      </ul>
    </div>
  </example-layout>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {reportError, getLocalReports, clearLocalReports, onReport} from '@/libraries/errorReporter';
import {APP} from '@/config/app';

defineOptions({name: 'ExampleErrors'});

const uri = APP.ERROR_REPORTS.URI;
const reports = ref([]);
const error = ref('');

async function refresh() {
  reports.value = (await getLocalReports()) || [];
}

function throwSync() {
  // Ошибка «в обработчике» — её поймает errorHandler Vue
  // eslint-disable-next-line no-undef
  return notDefinedFunction();
}

function throwAsync() {
  Promise.reject(new Error('Тестовый отклонённый промис'));
}

function manual() {
  reportError(new Error('Отчёт, отправленный вручную'), {where: 'пример'});
}

async function clear() {
  await clearLocalReports();
  reports.value = [];
}

let off = null;
onMounted(() => {
  refresh();
  off = onReport(() => setTimeout(refresh, 50));
});
onBeforeUnmount(() => off && off());
</script>
