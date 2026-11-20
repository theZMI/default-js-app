<template>
  <div class="default-page examples-page">
    <h1><span>Примеры</span></h1>
    <p class="text-secondary">
      Мини-приложения на каждую возможность устройства. Платформа сборки: <b>{{ platform }}</b>{{ isCordova ? ' (Cordova)' : ' (браузер)' }}.
      Включение возможностей — <code>src/config/features.js</code>, код — <code>src/native/*</code>.
    </p>
    <div class="examples-grid">
      <router-link v-for="e in examples" :key="e.path" :to="e.link || `/examples/${e.path}`" class="examples-tile">
        <i class="bi" :class="e.icon"></i>
        <span class="examples-tile-name">{{ e.name }}</span>
        <small>{{ e.desc }}</small>
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

<style lang="scss" scoped>
@import "@/styles/scss/my-vars.scss";

.examples-page {
  padding: 15px;

  code {
    color: rgba(255, 255, 255, 0.7);
  }
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.examples-tile {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border-radius: 14px;
  color: #FFF;
  text-decoration: none;
  background-color: $site-glass-bg;
  border: $site-glass-border;
  box-shadow: $site-glass-shadow;

  .bi {
    font-size: 28px;
    color: $primary;
    margin-bottom: 4px;
  }

  &-name {
    font-size: 17px;
  }

  small {
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
    line-height: 1.3;
  }

  &:active {
    background-color: $site-active-element-bg;

    .bi {
      color: #FFF;
    }
  }
}
</style>
