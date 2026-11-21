<template>
  <div class="default-page">
    <h1 class="page-title">{{ appName }}</h1>
    <div class="page-lead">{{ appDescription }}</div>

    <div class="menu-tiles">
      <router-link v-if="hasExamples" to="/examples" class="menu-tile">
        <div class="menu-tile-icon"><i class="bi bi-grid"></i></div>
        <div class="menu-tile-text">
          <div class="menu-tile-name">Примеры возможностей</div>
          <div class="menu-tile-desc">Компас, GPS-трекер, сканер, камера, диктофон, уровень, фоновый режим…</div>
        </div>
      </router-link>
      <router-link to="/about" class="menu-tile">
        <div class="menu-tile-icon"><i class="bi bi-info-circle"></i></div>
        <div class="menu-tile-text">
          <div class="menu-tile-name">О приложении</div>
          <div class="menu-tile-desc">Версия, сборка{{ hasUpdates ? ', обновления' : '' }}</div>
        </div>
      </router-link>
    </div>

    <section class="glass-card">
      <div class="glass-card-header">
        <i class="bi bi-lightbulb"></i>
        <span>С чего начать</span>
      </div>
      <div class="glass-card-hint mb-0">
        Это стартовая страница заготовки: замените её своей (src/components/HomePage.vue).
        Пункты меню — src/router/menu.js, возможности устройства включаются в src/config/features.js.
      </div>
    </section>
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
