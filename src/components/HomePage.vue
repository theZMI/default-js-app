<template>
  <div class="default-page">
    <h1 class="page-title">{{ $t('app.name') }}</h1>
    <div class="page-lead">{{ $t('app.description') }}</div>

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

    <section class="glass-card">
      <div class="glass-card-header">
        <i class="bi bi-lightbulb"></i>
        <span>{{ $t('home.startTitle') }}</span>
      </div>
      <div class="glass-card-hint mb-0">{{ $t('home.startText') }}</div>
    </section>
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
