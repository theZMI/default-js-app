<template>
  <div class="default-page ex-page">
    <div class="ex-header">
      <router-link to="/examples" class="ex-back" aria-label="Ко всем примерам"><i class="bi bi-chevron-left"></i></router-link>
      <i class="bi ex-header-icon" :class="example.icon"></i>
      <h1 class="ex-title">{{ example.name }}</h1>
    </div>
    <p v-if="example.desc" class="ex-desc">{{ example.desc }}</p>
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

.ex-page {
  padding: 10px 15px 15px;
}

.ex-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;

  .ex-back {
    color: #FFF;
    font-size: 24px;
    text-decoration: none;
    margin-left: -6px;
  }

  .ex-header-icon {
    font-size: 24px;
    opacity: 0.5;
  }

  #app & .ex-title {
    font-size: 26px;
    margin: 0;
  }
}

.ex-desc {
  color: rgba(255, 255, 255, 0.5);
  font-size: 15px;
}

.ex-card {
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 14px;
  background-color: $site-glass-bg;
  border: $site-glass-border;
  box-shadow: $site-glass-shadow;
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
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.35);
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
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.4);
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
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  padding: 4px 6px;
}
</style>
