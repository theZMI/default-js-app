<template>
  <example-layout>
    <div class="ex-card">
      <div class="mb-2">Системные приложения</div>
      <div class="links-grid">
        <button v-for="l in links" :key="l.name" class="links-item" @click="openExternal(l.url)">
          <i class="bi" :class="l.icon"></i><span>{{ l.name }}</span>
        </button>
      </div>
    </div>

    <div class="ex-card">
      <div class="mb-2">Браузер поверх приложения</div>
      <p class="small text-secondary">Для оплаты, входа через сторонний сервис и т.п.: страница открывается с кнопкой «Закрыть», приложение остаётся под ней.</p>
      <button class="btn btn-secondary rounded-pill" @click="openInApp('https://ya.ru')">Открыть ya.ru внутри</button>
    </div>

    <div class="ex-card">
      <div class="mb-2">Открытие приложения по ссылке</div>
      <p class="small text-secondary mb-0">
        Своя схема (myapp://…) и ссылки сайта (App Links) — плагин native-plugins/cordova-plugin-open-link
        и FEATURES.openLinks. Сейчас: <b>{{ openLinksOn ? 'включено' : 'выключено' }}</b>. Как подключить — README, раздел «Свои плагины».
      </p>
    </div>
  </example-layout>
</template>

<script setup>
import ExampleLayout from './ExampleLayout.vue';
import {openExternal, openInApp} from '@/native/browser';
import {FEATURES} from '@/config/features';

defineOptions({name: 'ExampleLinks'});

const openLinksOn = FEATURES.openLinks;
const links = [
  {name: 'Браузер', icon: 'bi-globe2', url: 'https://ya.ru'},
  {name: 'Звонок', icon: 'bi-telephone-fill', url: 'tel:+70000000000'},
  {name: 'SMS', icon: 'bi-chat-dots-fill', url: 'sms:+70000000000?body=Привет'},
  {name: 'Почта', icon: 'bi-envelope-fill', url: 'mailto:test@example.com?subject=Тема'},
  {name: 'Карты', icon: 'bi-map-fill', url: 'geo:54.7104,20.4522?q=54.7104,20.4522'},
  {name: 'Telegram', icon: 'bi-telegram', url: 'https://t.me/telegram'},
];
</script>

<style lang="scss" scoped>
.links-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.links-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 4px;
  border-radius: 12px;
  border: 1px solid rgba(var(--app-fg-rgb), 0.08);
  background: var(--app-inset-bg);
  color: var(--app-fg);
  font-size: 14px;

  .bi {
    font-size: 24px;
  }
}
</style>
