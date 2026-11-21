<template>
  <div class="default-page">
    <h1 class="page-title">{{ $t('settings.title') }}</h1>

    <section class="glass-card">
      <div class="glass-card-header"><i class="bi bi-palette"></i><span>{{ $t('settings.appearance') }}</span></div>

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

    <section class="glass-card">
      <div class="glass-card-header"><i class="bi bi-sliders"></i><span>{{ $t('settings.behavior') }}</span></div>
      <div class="form-check form-switch">
        <input id="set-haptics" v-model="settings.haptics" class="form-check-input" type="checkbox">
        <label class="form-check-label" for="set-haptics">{{ $t('settings.haptics') }}</label>
      </div>
      <div class="glass-card-hint mt-2 mb-0">{{ $t('settings.hapticsHint') }}</div>
    </section>

    <section class="glass-card">
      <div class="glass-card-header"><i class="bi bi-translate"></i><span>{{ $t('settings.language') }}</span></div>
      <div class="settings-segment">
        <button v-for="l in LANGUAGES" :key="l.code" type="button" :class="{'is-active': settings.lang === l.code}" @click="settings.lang = l.code">
          {{ l.name }}
        </button>
      </div>
      <div class="glass-card-hint mt-2 mb-0">{{ $t('settings.languageHint') }}</div>
    </section>

    <div class="text-center mt-4">
      <button type="button" class="btn btn-outline-secondary rounded-pill" @click="resetSettings">{{ $t('settings.reset') }}</button>
    </div>
  </div>
</template>

<script>
import {settings, resetSettings, THEMES} from '@/libraries/settings';
import {LANGUAGES} from '@/i18n';

export default {
  name: 'SettingsPage',
  data() {
    return {
      settings,
      LANGUAGES,
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
  methods: {
    resetSettings,
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

// Переключатель-«сегменты»: равные кнопки в ряд, выбранная — синяя
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
</style>
