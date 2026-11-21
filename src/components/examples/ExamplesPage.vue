<template>
  <div class="default-page">
    <h1 class="page-title">Примеры</h1>
    <div class="page-lead">
      Мини-приложение на каждую возможность устройства. Внутри каждого — «Как подключить» в своё приложение.
      Сейчас: {{ platform }}{{ isCordova ? ', приложение' : ', браузер' }}.
    </div>
    <div class="menu-tiles">
      <router-link v-for="e in examples" :key="e.path" :to="e.link || `/examples/${e.path}`" class="menu-tile">
        <div class="menu-tile-icon"><i class="bi" :class="e.icon"></i></div>
        <div class="menu-tile-text">
          <div class="menu-tile-name">{{ e.name }}</div>
          <div class="menu-tile-desc">{{ e.desc }}</div>
          <div v-if="e.only && e.only.length" class="examples-badges">
            <span v-for="key in e.only" :key="key">{{ BADGES[key].label }}</span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import {examples, BADGES} from '@/components/examples';
import {PLATFORM} from '@/config/platform';
import {isCordova} from '@/native/cordova';

export default {
  name: 'ExamplesPage',
  data() {
    return {
      examples,
      BADGES,
      platform: PLATFORM,
      isCordova: isCordova(),
    }
  },
}
</script>

<style lang="scss" scoped>
.examples-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;

  span {
    font-size: 11px;
    padding: 1px 7px;
    border-radius: 10px;
    color: #FFB020;
    background: rgba(255, 176, 32, 0.12);

    [data-app-theme="light"] & {
      color: #8A5A00;
    }
  }
}
</style>
