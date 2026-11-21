<template>
  <div class="default-page ex-page">
    <router-link to="/examples" class="ex-back"><i class="bi bi-chevron-left"></i> Все примеры</router-link>
    <h1 class="page-title ex-title">{{ example.name }}</h1>
    <div v-if="example.desc" class="page-lead">{{ example.desc }}</div>

    <div v-if="badges.length" class="ex-badges">
      <span v-for="b in badges" :key="b.label" class="ex-badge" :title="b.hint"><i class="bi" :class="b.icon"></i>{{ b.label }}</span>
    </div>

    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    <slot />

    <section v-if="example.setup && example.setup.length" class="ex-card ex-setup" :class="{'is-open': setupOpen}">
      <button type="button" class="ex-setup-toggle" @click="setupOpen = !setupOpen" :aria-expanded="setupOpen">
        <i class="bi bi-wrench-adjustable"></i>
        <span class="flex-grow-1">Как подключить в своём приложении</span>
        <i class="bi" :class="setupOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
      </button>
      <ol v-if="setupOpen" class="ex-setup-steps">
        <li v-for="(step, i) in example.setup" :key="i">{{ step }}</li>
      </ol>
      <ul v-if="setupOpen && badges.length" class="ex-setup-badges">
        <li v-for="b in badges" :key="b.label"><b>{{ b.label }}:</b> {{ b.hint }}</li>
      </ul>
    </section>
  </div>
</template>

<script>
// Общий каркас страницы примера: шапка с «назад», описание, пометки платформ, блок ошибки,
// внизу — «Как подключить». Данные примера берутся из meta маршрута — см. examples/index.js.
// setupOpen — раскрыть «Как подключить» сразу (для примеров, которые без настройки не работают).
import {BADGES} from './index.js';

export default {
  name: 'example-layout',
  props: {
    error: {type: String, default: ''},
    setupOpenByDefault: {type: Boolean, default: false},
  },
  data() {
    return {
      setupOpen: this.setupOpenByDefault || (this.$route.meta.example?.only || []).includes('setup'),
    }
  },
  computed: {
    example() {
      return this.$route.meta.example || {};
    },
    badges() {
      return (this.example.only || []).map((key) => BADGES[key]).filter(Boolean);
    },
  },
}
</script>

<style lang="scss">
// Общие классы для всех примеров (не scoped — используются внутри страниц примеров)
@import "@/styles/scss/my-vars.scss";

@import "@/styles/scss/mixins.scss";

.ex-page {
  padding-top: 6px;
}

// «← Все примеры» — приглушённая ссылка над заголовком, как «назад» в источниках плеера
.ex-back {
  display: inline-block;
  margin-top: 6px;
  color: var(--app-fg);
  opacity: 0.4;
  text-decoration: none;
  font-size: 15px;
}

#app .ex-title {
  margin-top: 0.5rem;
}

// Пояснение внизу страницы примера
.ex-desc {
  color: rgba(var(--app-fg-rgb), 0.45);
  font-size: 13px;
  line-height: 1.35;
  margin-top: 12px;
}

// Пометки «Только на телефоне», «Нужен сервер»…
.ex-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: -0.75rem 0 0.5rem;
}

.ex-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: #FFB020;
  background: rgba(255, 176, 32, 0.12);
  border: 1px solid rgba(255, 176, 32, 0.25);

  [data-app-theme="light"] & {
    color: #8A5A00;
  }
}

.ex-setup {
  margin-top: 20px;

  .ex-setup-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 0;
    border: none;
    background: none;
    color: var(--app-fg);
    text-align: left;

    .bi {
      opacity: 0.6;
    }
  }

  .ex-setup-steps {
    margin: 14px 0 0;
    padding-left: 20px;
    font-size: 14px;
    line-height: 1.45;
    -webkit-user-select: text;
    user-select: text;

    li + li {
      margin-top: 8px;
    }
  }

  .ex-setup-badges {
    margin: 14px 0 0;
    padding: 12px 0 0;
    border-top: 1px solid rgba(var(--app-fg-rgb), 0.08);
    list-style: none;
    font-size: 13px;
    opacity: 0.75;
  }
}

// Блок примера — та же «стеклянная» карточка, что .glass-card (ui.scss)
.ex-card {
  @include glass-frame;
  margin-top: 12px;
}

.ex-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ex-big-value {
  font-size: 44px;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.ex-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  > div {
    padding: 10px 12px;
    border-radius: 12px;
    background: rgba(var(--app-fg-rgb), 0.04);
    border: $site-glass-border;
  }

  small {
    display: block;
    color: rgba(var(--app-fg-rgb), 0.5);
    font-size: 13px;
  }

  b {
    font-size: 20px;
    font-weight: normal;
    font-variant-numeric: tabular-nums;
  }
}

.ex-mono {
  margin: 10px 0 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--app-inset-bg);
  border: $site-glass-border;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-all;
  -webkit-user-select: text;
  user-select: text;
}

.ex-list {
  list-style: none;
  padding: 0;
  margin: 0;

  > li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(var(--app-fg-rgb), 0.07);

    &:last-child {
      border-bottom: none;
    }
  }
}

.ex-empty {
  color: rgba(var(--app-fg-rgb), 0.4);
  text-align: center;
  padding: 20px 0;
}

.ex-icon-btn {
  @include icon-button;
  font-size: 20px;
  padding: 4px 6px;
}
</style>
