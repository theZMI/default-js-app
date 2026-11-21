<template>
  <div class="default-page ex-page">
    <router-link to="/examples" class="ex-back"><i class="bi bi-chevron-left"></i> Все примеры</router-link>
    <h1 class="page-title ex-title">{{ example.name }}</h1>
    <div v-if="example.desc" class="page-lead">{{ example.desc }}</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <slot />
  </div>
</template>

<script>
// Общий каркас страницы примера: шапка с «назад», описание, блок ошибки.
// Данные примера (имя, иконка) берутся из meta маршрута — см. examples/index.js.
export default {
  name: 'example-layout',
  props: {
    error: {type: String, default: ''},
  },
  computed: {
    example() {
      return this.$route.meta.example || {};
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
  color: #FFF;
  opacity: 0.4;
  text-decoration: none;
  font-size: 15px;
}

#app .ex-title {
  margin-top: 0.5rem;
}

// Пояснение внизу страницы примера
.ex-desc {
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
  line-height: 1.35;
  margin-top: 12px;
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
    background: rgba(255, 255, 255, 0.04);
    border: $site-glass-border;
  }

  small {
    display: block;
    color: rgba(255, 255, 255, 0.5);
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
  background: rgba(0, 0, 0, 0.35);
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
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);

    &:last-child {
      border-bottom: none;
    }
  }
}

.ex-empty {
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  padding: 20px 0;
}

.ex-icon-btn {
  @include icon-button;
  font-size: 20px;
  padding: 4px 6px;
}
</style>
