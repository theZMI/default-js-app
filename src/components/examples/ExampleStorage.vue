<template>
  <example-layout :error="error">
    <div class="ex-card">
      <form class="d-flex gap-2" @submit.prevent="add">
        <input class="form-control" v-model="text" placeholder="Новая заметка" maxlength="500">
        <button class="btn btn-primary rounded-pill" :disabled="!text.trim()">Добавить</button>
      </form>
    </div>

    <div class="ex-card">
      <div v-if="!notes.length" class="ex-empty">Заметок нет. Добавьте и перезапустите приложение — они останутся.</div>
      <ul class="ex-list">
        <li v-for="n in notes" :key="n.id">
          <input class="form-check-input mt-0" type="checkbox" :checked="n.done" @change="toggle(n)">
          <span class="flex-grow-1" :class="{'storage-done': n.done}">{{ n.text }}</span>
          <button class="ex-icon-btn" @click="remove(n)" aria-label="Удалить"><i class="bi bi-x-lg"></i></button>
        </li>
      </ul>
    </div>
    <p class="ex-desc">
      Локальная база — src/libraries/localDB.js (IndexedDB через idb). Подходит для больших объёмов
      и Blob (фото, записи); для пары настроек хватит и localDB.getValue/setValue.
    </p>
  </example-layout>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import ExampleLayout from './ExampleLayout.vue';
import localDB from '@/libraries/localDB';

defineOptions({name: 'ExampleStorage'});

const KEY = 'example-notes';
const notes = ref([]);
const text = ref('');
const error = ref('');

async function save() {
  try {
    await localDB.setValue(KEY, notes.value);
  } catch (e) {
    error.value = 'Не удалось сохранить — возможно, закончилось место.';
  }
}

async function add() {
  notes.value.unshift({id: Date.now(), text: text.value.trim(), done: false});
  text.value = '';
  await save();
}

async function toggle(n) {
  n.done = !n.done;
  await save();
}

async function remove(n) {
  notes.value = notes.value.filter((x) => x.id !== n.id);
  await save();
}

onMounted(async () => {
  notes.value = await localDB.getValue(KEY, []);
});
</script>

<style lang="scss" scoped>
.storage-done {
  text-decoration: line-through;
  opacity: 0.5;
}
</style>
