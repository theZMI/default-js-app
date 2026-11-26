<!-- Настройки — единый вид для всех приложений из заготовки (как в magic-ball, bottle, movie-advisor, gift):
     заголовки карточек без иконок, без поясняющих подсказок, крупные переключатели, серая стеклянная
     кнопка сброса. Какие блоки показывать — APP.SETTINGS в src/config/app.js. -->
<template>
  <div class="default-page">
    <h1 class="page-title">{{ $t('settings.title') }}</h1>

    <!-- Оформление: тема и размер текста (APP.SETTINGS.APPEARANCE) -->
    <section v-if="cfg.APPEARANCE" class="glass-card">
      <div class="glass-card-header"><span>{{ $t('settings.appearance') }}</span></div>

      <div class="settings-label">{{ $t('settings.theme') }}</div>
      <div class="settings-segment" role="radiogroup">
        <button v-for="o in themeOptions" :key="o.value" type="button" role="radio" :aria-checked="settings.theme === o.value"
                :class="{'is-active': settings.theme === o.value}" @click="settings.theme = o.value">
          <i class="bi" :class="o.icon"></i>{{ $t(o.label) }}
        </button>
      </div>

      <div class="settings-label mt-3">{{ $t('settings.textSize') }}</div>
      <div class="settings-segment" role="radiogroup">
        <button v-for="o in textOptions" :key="o.value" type="button" role="radio" :aria-checked="settings.textScale === o.value"
                :class="{'is-active': settings.textScale === o.value}" @click="settings.textScale = o.value">
          <span :style="{fontSize: o.size}">Аа</span>{{ $t(o.label) }}
        </button>
      </div>
    </section>

    <!-- Поведение: звук и вибро-отклик (APP.SETTINGS.SOUND / HAPTICS) -->
    <section v-if="cfg.SOUND || cfg.HAPTICS" class="glass-card">
      <div class="glass-card-header"><span>{{ $t('settings.behavior') }}</span></div>
      <label v-if="cfg.SOUND" class="toggle-row">
        <span>{{ $t('settings.sound') }}</span>
        <input v-model="settings.sound" class="toggle-input" type="checkbox" role="switch">
        <span class="toggle" aria-hidden="true"><span class="toggle-knob"></span></span>
      </label>
      <label v-if="cfg.HAPTICS" class="toggle-row">
        <span>{{ $t('settings.haptics') }}</span>
        <input v-model="settings.haptics" class="toggle-input" type="checkbox" role="switch">
        <span class="toggle" aria-hidden="true"><span class="toggle-knob"></span></span>
      </label>
    </section>

    <!-- Язык (APP.SETTINGS.LANGUAGE) -->
    <section v-if="cfg.LANGUAGE && LANGUAGES.length > 1" class="glass-card">
      <div class="glass-card-header"><span>{{ $t('settings.language') }}</span></div>
      <div class="settings-langs" role="radiogroup">
        <button v-for="l in LANGUAGES" :key="l.code" type="button" role="radio" :aria-checked="settings.lang === l.code" :lang="l.code"
                :class="{'is-active': settings.lang === l.code}" @click="settings.lang = l.code">
          {{ l.name }}
        </button>
      </div>
    </section>

    <!-- Сброс: настройки всегда; прогресс — если APP.SETTINGS.PROGRESS_KEYS не пуст -->
    <div class="settings-reset">
      <button type="button" class="btn btn-reset btn-lg btn-min-width rounded-pill" @click="onResetSettings">{{ $t('settings.reset') }}</button>
      <button v-if="hasProgress" type="button" class="btn btn-reset is-danger btn-lg btn-min-width rounded-pill" @click="confirmVisible = true">
        {{ $t('settings.resetProgress') }}
      </button>
      <transition name="animation-fade">
        <div v-if="doneText" class="settings-done"><i class="bi bi-check-circle-fill"></i> {{ doneText }}</div>
      </transition>
    </div>

    <popup-message :visible="confirmVisible" :close="() => confirmVisible = false">
      <h3 class="settings-confirm-title">{{ $t('settings.confirmTitle') }}</h3>
      <p class="settings-confirm-text">{{ $t('settings.confirmText') }}</p>
      <div class="settings-confirm-actions">
        <button type="button" class="btn btn-reset btn-lg rounded-pill" @click="confirmVisible = false">{{ $t('settings.confirmNo') }}</button>
        <button type="button" class="btn btn-danger btn-lg rounded-pill" @click="onResetProgress">{{ $t('settings.confirmYes') }}</button>
      </div>
    </popup-message>
  </div>
</template>

<script>
import {settings, resetSettings, resetProgress, THEMES} from '@/libraries/settings';
import {LANGUAGES, t} from '@/i18n';
import {APP} from '@/config/app';
import PopupMessage from '@/components/UI/PopupMessage.vue';

export default {
  name: 'SettingsPage',
  components: {PopupMessage},
  data() {
    return {
      settings,
      LANGUAGES,
      cfg: APP.SETTINGS,
      confirmVisible: false,
      doneText: '',
      themeOptions: [
        {value: THEMES.DARK, label: 'settings.themeDark', icon: 'bi-moon-stars'},
        {value: THEMES.LIGHT, label: 'settings.themeLight', icon: 'bi-sun'},
        {value: THEMES.SYSTEM, label: 'settings.themeSystem', icon: 'bi-circle-half'},
      ],
      textOptions: [
        {value: 'normal', label: 'settings.textNormal', size: '14px'},
        {value: 'large', label: 'settings.textLarge', size: '17px'},
        {value: 'xlarge', label: 'settings.textXLarge', size: '20px'},
      ],
    }
  },
  computed: {
    hasProgress() {
      return (APP.SETTINGS.PROGRESS_KEYS || []).length > 0;
    },
  },
  beforeUnmount() {
    clearTimeout(this.doneTimer);
  },
  methods: {
    onResetSettings() {
      resetSettings();
      this.showDone(t('settings.settingsReset'));
    },
    onResetProgress() {
      resetProgress();
      this.confirmVisible = false;
      this.showDone(t('settings.progressReset'));
    },
    // Короткое «готово» под кнопками
    showDone(text) {
      this.doneText = text;
      clearTimeout(this.doneTimer);
      this.doneTimer = setTimeout(() => { this.doneText = ''; }, 2500);
    },
  },
}
</script>

<style lang="scss" scoped>
@import "@/styles/scss/my-vars.scss";

.settings-label {
  font-size: 14px;
  opacity: 0.6;
  margin-bottom: 6px;
}

// Переключатель-«сегменты» (тема, размер текста): равные кнопки в ряд, выбранная — синяя
.settings-segment {
  display: flex;
  gap: 6px;

  button {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 4px;
    border-radius: 12px;
    border: $site-glass-border;
    background: var(--app-inset-bg);
    color: var(--app-fg);
    font-size: 13px;

    .bi {
      font-size: 20px;
    }

    span {
      line-height: 1;
    }

    &.is-active {
      background: $site-active-element-bg;
      color: #FFF;
    }
  }
}

// Выбор языка: сетка равных кнопок (на телефоне — по две в ряд), выбранная — синяя
.settings-langs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 6px;

  button {
    padding: 11px 6px;
    border-radius: 12px;
    border: $site-glass-border;
    background: var(--app-inset-bg);
    color: var(--app-fg);
    font-size: 15px;

    &.is-active {
      background: $site-active-element-bg;
      color: #FFF;
    }
  }
}

// Крупный переключатель (вместо мелкого bootstrap-switch): дорожка и белый кружок,
// вся строка нажимается; включённый — зелёный, как в играх из заготовки
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 0;
  font-size: 17px;
  cursor: pointer;

  & + & {
    margin-top: 10px;
  }
}

.toggle-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.toggle {
  flex: none;
  position: relative;
  width: 64px;
  height: 36px;
  border-radius: 18px; // «таблетка» с круглым кружком
  background: rgba(var(--app-fg-rgb), 0.14);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: background 0.2s;
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #FFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s cubic-bezier(0.3, 1.4, 0.6, 1);
}

.toggle-input:checked + .toggle {
  background: linear-gradient(180deg, #4CE08A, #1FB45E);

  .toggle-knob {
    transform: translateX(28px);
  }
}

.toggle-input:focus-visible + .toggle {
  outline: 2px solid #FFE14D;
  outline-offset: 2px;
}

.settings-reset {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 1.5rem;
}

// Кнопки сброса — серое стекло, как у карточек и кнопки меню, а не прозрачный контур
.btn-reset {
  background-color: $site-glass-bg;
  border: $site-glass-border;
  color: var(--app-fg);
  backdrop-filter: $site-glass-blur;
  -webkit-backdrop-filter: $site-glass-blur;

  &:hover,
  &:focus-visible,
  &:active {
    background-color: rgba(var(--app-fg-rgb), 0.16) !important;
    border-color: rgba(var(--app-fg-rgb), 0.16) !important;
    color: var(--app-fg) !important;
  }

  &.is-danger,
  &.is-danger:hover,
  &.is-danger:active {
    color: #FF6B6B !important;
  }
}

.settings-done {
  font-size: 15px;
  color: #4CE08A;
}

.settings-confirm-title {
  font-size: 23px;
  margin-bottom: 12px;
}

.settings-confirm-text {
  opacity: 0.8;
  margin-bottom: 20px;
}

.settings-confirm-actions {
  display: flex;
  gap: 10px;
  justify-content: center;

  .btn {
    flex: 1;
    max-width: 180px;
  }
}
</style>
