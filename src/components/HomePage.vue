<template>
  <div class="default-page">
    <h1 class="page-title">{{ $t('app.name') }}</h1>
    <div class="page-lead">{{ $t('app.description') }}</div>

    <!-- «С чего начать» — сверху и простым текстом, без рамки: это пояснение, а не кнопка -->
    <section class="home-start">
      <h2 class="home-start-title"><i class="bi bi-lightbulb"></i> {{ $t('home.startTitle') }}</h2>
      <p class="home-start-text">{{ $t('home.startText') }}</p>
    </section>

    <div class="menu-tiles">
      <router-link v-if="hasExamples" to="/examples" class="menu-tile">
        <div class="menu-tile-icon"><i class="bi bi-grid"></i></div>
        <div class="menu-tile-text">
          <div class="menu-tile-name">{{ $t('menu.examples') }}</div>
          <div class="menu-tile-desc">{{ $t('home.examplesDesc') }}</div>
        </div>
      </router-link>
      <router-link to="/guide" class="menu-tile">
        <div class="menu-tile-icon"><i class="bi bi-book"></i></div>
        <div class="menu-tile-text">
          <div class="menu-tile-name">{{ $t('menu.guide') }}</div>
          <div class="menu-tile-desc">{{ $t('home.guideDesc') }}</div>
        </div>
      </router-link>
      <router-link to="/about" class="menu-tile">
        <div class="menu-tile-icon"><i class="bi bi-info-circle"></i></div>
        <div class="menu-tile-text">
          <div class="menu-tile-name">{{ $t('menu.about') }}</div>
          <div class="menu-tile-desc">{{ hasUpdates ? $t('home.aboutDescUpdates') : $t('home.aboutDesc') }}</div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import {FEATURES} from '@/config/features';

export default {
  name: 'HomePage',
  data() {
    return {
      hasExamples: FEATURES.examples,
      hasUpdates: FEATURES.appUpdates,
    }
  },
}
</script>

<style lang="scss" scoped>
@import "@/styles/scss/my-vars.scss";

.home-start {
  margin-bottom: 1.25rem;
}

.home-start-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;

  // Акцент темы — читается и в тёмной, и в светлой теме
  .bi {
    color: $site-active-element-bg;
  }
}

.home-start-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
  color: rgba(var(--app-fg-rgb), 0.7);
}
</style>
