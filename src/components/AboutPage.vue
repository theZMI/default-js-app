<template>
  <div class="default-page default-page-center text-center">
    <img src="@/assets/images/logo.png" alt="" class="about-logo">
    <h3>{{ appName }}</h3>
    <div class="about-text">{{ appDescription }}</div>

    <p class="mt-4">
      <span class="text-secondary">{{ $t('about.version') }}:</span> {{ version }}<br>
      <span class="text-secondary">{{ $t('about.build') }}:</span> {{ buildTime }} ({{ platform }})
    </p>

    <div v-if="showUpdateCheck" class="mt-4">
      <check-updates-page hide-version />
    </div>
  </div>
</template>

<script>
import {APP} from '@/config/app';
import {FEATURES} from '@/config/features';
import {PLATFORM} from '@/config/platform';
import {CURRENT_VERSION} from '@/native/appUpdates';
import CheckUpdatesPage from '@/components/CheckUpdatesPage.vue';

export default {
  name: 'AboutPage',
  components: {CheckUpdatesPage},
  data() {
    return {
      appName: APP.NAME,
      appDescription: APP.DESCRIPTION,
      version: CURRENT_VERSION,
      platform: PLATFORM,
      // Константа впечатывается DefinePlugin'ом на этапе сборки (см. vue.config.js)
       
      buildTime: typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : '—',
      showUpdateCheck: FEATURES.appUpdates,
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/scss/my-vars.scss";

.about-logo {
  width: 96px;
  height: 96px;
  object-fit: contain;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(var(--app-fg-rgb), 0.1);
  border-radius: 23px;
  box-shadow: 0 0 50px rgba(var(--app-fg-rgb), 0.2);
  background: var(--app-bg);
}

h3 {
  font-size: 24px;
}

.about-text {
  max-width: 420px;
  margin: 0.75rem auto 1rem auto;
  padding: 6px 12px;
  border-radius: 12px;
  background-color: $site-glass-bg;
  border: $site-glass-border;
  box-shadow: $site-glass-shadow;
  backdrop-filter: $site-glass-blur;
  line-height: 1.5;
  opacity: 0.9;
}
</style>
