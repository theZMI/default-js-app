<template>
  <div class="default-page home-page">
    <h1><span>{{ appName }}</span></h1>
    <p class="text-secondary">{{ appDescription }}</p>

    <div class="home-cards">
      <router-link v-if="hasExamples" to="/examples" class="home-card">
        <i class="bi bi-grid-fill"></i>
        <span>Примеры возможностей</span>
        <small class="text-secondary">Компас, GPS-трекер, сканер, камера, диктофон, уровень, фоновый режим…</small>
      </router-link>
      <router-link to="/about" class="home-card">
        <i class="bi bi-info-circle-fill"></i>
        <span>О приложении</span>
        <small class="text-secondary">Версия, сборка{{ hasUpdates ? ', обновления' : '' }}</small>
      </router-link>
    </div>

    <p class="mt-4 text-secondary small">
      Это стартовая страница заготовки: замените её своей (src/components/HomePage.vue),
      пункты меню — в src/router/menu.js, возможности устройства включаются в src/config/features.js.
    </p>
  </div>
</template>

<script>
import {APP} from '@/config/app';
import {FEATURES} from '@/config/features';

export default {
  name: 'HomePage',
  data() {
    return {
      appName: APP.NAME,
      appDescription: APP.DESCRIPTION,
      hasExamples: FEATURES.examples,
      hasUpdates: FEATURES.appUpdates,
    }
  },
}
</script>

<style lang="scss" scoped>
@import "@/styles/scss/my-vars.scss";

.home-page {
  padding: 15px;
}

.home-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
  margin-top: 25px;
}

.home-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px;
  border-radius: 14px;
  color: #FFF;
  text-decoration: none;
  background-color: $site-glass-bg;
  border: $site-glass-border;
  box-shadow: $site-glass-shadow;

  .bi {
    font-size: 28px;
    opacity: 0.5;
  }

  &:active {
    background-color: $site-active-element-bg;
  }
}
</style>
