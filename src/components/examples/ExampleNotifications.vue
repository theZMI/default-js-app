<template>
  <example-layout :error="error">
    <div class="ex-card">
      <label class="form-label">Текст напоминания</label>
      <input v-model="text" class="form-control mb-3" maxlength="200">
      <div class="ex-buttons">
        <button v-for="s in delays" :key="s" class="btn btn-secondary rounded-pill" @click="add(s)">Через {{ s < 60 ? `${s} с` : `${s / 60} мин` }}</button>
      </div>
      <div v-if="isApp" class="ex-buttons mt-2">
        <button class="btn btn-secondary rounded-pill" @click="addDaily">Каждый день в это время</button>
      </div>
      <div v-if="info" class="text-success small mt-2">{{ info }}</div>
    </div>

    <div class="ex-card">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <span>Запланировано</span>
        <button v-if="scheduled.length" class="btn btn-link text-secondary p-0" @click="removeAll">Отменить все</button>
      </div>
      <div v-if="!scheduled.length" class="ex-empty">Нет запланированных уведомлений</div>
      <ul class="ex-list">
        <li v-for="n in scheduled" :key="n.id">
          <i class="bi bi-bell"></i>
          <span class="flex-grow-1">{{ n.text || n.title || `#${n.id}` }}</span>
          <button class="ex-icon-btn" @click="remove(n.id)" aria-label="Отменить"><i class="bi bi-x-lg"></i></button>
        </li>
      </ul>
    </div>
    <p class="ex-desc">{{ isApp ? 'Закройте приложение — уведомление всё равно придёт.' : 'В браузере уведомление придёт, только если эта вкладка останется открытой.' }}</p>
  </example-layout>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import {schedule, cancel, cancelAll, getScheduled} from '@/native/notifications';
import {isCordova} from '@/native/cordova';

defineOptions({name: 'ExampleNotifications'});

const isApp = isCordova();
const delays = [10, 60, 300];
const text = ref('Пора сделать перерыв');
const scheduled = ref([]);
const error = ref('');
const info = ref('');

async function refresh() {
  scheduled.value = await getScheduled();
}

async function add(seconds) {
  error.value = info.value = '';
  try {
    const id = await schedule({title: 'Напоминание', text: text.value, inSeconds: seconds});
    if (!isApp) scheduled.value.push({id, text: text.value});
    else await refresh();
    info.value = 'Запланировано';
  } catch (e) {
    error.value = e.message;
  }
}

async function addDaily() {
  error.value = info.value = '';
  try {
    await schedule({title: 'Ежедневное напоминание', text: text.value, at: new Date(Date.now() + 86400000), every: 'day'});
    await refresh();
    info.value = 'Будет приходить каждый день';
  } catch (e) {
    error.value = e.message;
  }
}

async function remove(id) {
  await cancel(id);
  scheduled.value = scheduled.value.filter((n) => n.id !== id);
}

async function removeAll() {
  await cancelAll();
  scheduled.value = [];
}

onMounted(refresh);
</script>
