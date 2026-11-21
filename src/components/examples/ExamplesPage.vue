<template>
  <div class="default-page">
    <h1 class="page-title">Примеры</h1>
    <div class="page-lead">
      Мини-приложение на каждую возможность устройства. Сборка: {{ platform }}{{ isCordova ? ', Cordova' : ', браузер' }}.
    </div>
    <div class="menu-tiles">
      <router-link v-for="e in examples" :key="e.path" :to="e.link || `/examples/${e.path}`" class="menu-tile">
        <div class="menu-tile-icon"><i class="bi" :class="e.icon"></i></div>
        <div class="menu-tile-text">
          <div class="menu-tile-name">{{ e.name }}</div>
          <div class="menu-tile-desc">{{ e.desc }}</div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import {examples} from '@/components/examples';
import {PLATFORM} from '@/config/platform';
import {isCordova} from '@/native/cordova';

export default {
  name: 'ExamplesPage',
  data() {
    return {
      examples,
      platform: PLATFORM,
      isCordova: isCordova(),
    }
  },
}
</script>
