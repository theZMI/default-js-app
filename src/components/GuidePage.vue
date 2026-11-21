<template>
  <div class="default-page guide">
    <h1 class="page-title">О заготовке</h1>
    <div class="page-lead">
      Default JS App — основа для мобильных приложений: один код на Vue 3 собирается в сайт/PWA,
      Android-приложение (APK/AAB) и iOS-приложение через Cordova.
    </div>

    <section class="glass-card">
      <div class="glass-card-header"><i class="bi bi-hand-index"></i><span>Жесты и управление</span></div>
      <dl class="stats-grid guide-grid">
        <template v-for="g in gestures" :key="g.title">
          <dt><i class="bi" :class="g.icon"></i></dt>
          <dd><b>{{ g.title }}</b><br><span class="text-secondary">{{ g.text }}</span></dd>
        </template>
      </dl>
    </section>

    <section class="glass-card">
      <div class="glass-card-header"><i class="bi bi-stars"></i><span>Что уже есть в оболочке</span></div>
      <ul class="guide-list">
        <li v-for="f in shell" :key="f">{{ f }}</li>
      </ul>
    </section>

    <section class="glass-card">
      <div class="glass-card-header"><i class="bi bi-phone"></i><span>Возможности устройства</span></div>
      <div class="glass-card-hint">Каждая — отдельный пример с пометками, где работает, и инструкцией «Как подключить».</div>
      <div class="guide-chips">
        <router-link v-for="e in examples" :key="e.path" :to="e.link || `/examples/${e.path}`" class="guide-chip">
          <i class="bi" :class="e.icon"></i>{{ e.name }}
        </router-link>
      </div>
    </section>

    <section class="glass-card">
      <div class="glass-card-header"><i class="bi bi-sliders"></i><span>Где что настраивается</span></div>
      <dl class="stats-grid guide-files">
        <template v-for="c in config" :key="c.file">
          <dt><code>{{ c.file }}</code></dt>
          <dd>{{ c.text }}</dd>
        </template>
      </dl>
    </section>

    <section class="glass-card">
      <div class="glass-card-header"><i class="bi bi-hammer"></i><span>Как собрать</span></div>
      <div class="glass-card-hint">Команды выполняются в папке приложения. Подробно — README.md, раздел «Сборка».</div>
      <dl class="stats-grid guide-files">
        <template v-for="b in build" :key="b.cmd">
          <dt><code>{{ b.cmd }}</code></dt>
          <dd>{{ b.text }}</dd>
        </template>
      </dl>
    </section>
  </div>
</template>

<script>
import {examples} from '@/components/examples';
import {FEATURES} from '@/config/features';

export default {
  name: 'GuidePage',
  data() {
    return {
      examples: FEATURES.examples ? examples : [],
      gestures: [
        {icon: 'bi-arrow-down', title: 'Потянуть страницу вниз', text: 'Перезагрузить приложение (pull-to-refresh). Выключается в APP.PULL_TO_REFRESH, для отдельных страниц — PULL_TO_REFRESH_DISABLED_PAGES.'},
        {icon: 'bi-arrow-right', title: 'Провести слева направо', text: 'Открыть боковое меню (жест начинается в левой части экрана). Справа налево по меню — закрыть. Настройка — APP.GESTURES.'},
        {icon: 'bi-list', title: 'Кнопка «Всё меню»', text: 'Слева в нижнем меню: все разделы, включая «Дополнительно».'},
        {icon: 'bi-arrow-left-circle', title: 'Кнопка «Назад» на Android', text: 'Закрывает меню и окна → возвращает на предыдущую страницу → на главной сворачивает приложение (а не закрывает его).'},
        {icon: 'bi-hand-index-thumb', title: 'Без случайного зума', text: 'Двойное касание и щипок не увеличивают страницу — интерфейс ведёт себя как нативный.'},
      ],
      shell: [
        'Нижнее «плавающее» меню и боковое меню — пункты в src/router/menu.js.',
        'Тёмная и светлая тема, размер текста, вибро-отклик, язык (русский/английский) — страница «Настройки».',
        'Работа без сети: PWA с офлайн-кешем в браузере, офлайн-очередь запросов, локальная база IndexedDB.',
        'Индикатор сети: крутилка при долгих запросах, значок «нет сети».',
        'Понятные пользователю тексты ошибок вместо технических.',
        'Отчёты об ошибках JS с телефонов на сервер.',
        'Самообновление Android-приложения (проверка версии, скачивание, установка APK).',
        'Защита: WebView не уходит на чужие сайты, строгий CSP, внешние ссылки — только безопасные схемы.',
        'Иконки для всех платформ генерируются из одной картинки (make icons).',
      ],
      config: [
        {file: 'src/config/features.js', text: 'какие возможности устройства включены'},
        {file: 'src/config/app.js', text: 'имя, жесты, обновления, вход, карта, отчёты об ошибках, настройки по умолчанию'},
        {file: 'src/envs/*.js', text: 'адрес сервера, ссылка на APK (не в git)'},
        {file: 'src/router/menu.js', text: 'пункты меню'},
        {file: 'src/i18n/*.js', text: 'переводы интерфейса'},
        {file: 'src/styles/scss/theme.scss', text: 'цвета тёмной и светлой темы'},
        {file: '../*-cordova/config.xml', text: 'id приложения, разрешения, иконки'},
      ],
      build: [
        {cmd: 'make install', text: 'установить зависимости (один раз)'},
        {cmd: 'make start', text: 'dev-сервер http://localhost:8080'},
        {cmd: 'make build-web', text: 'сайт/PWA → dist/'},
        {cmd: 'make build-android', text: 'тестовый APK → dist-apps/'},
        {cmd: 'make keystore', text: 'ключ подписи (один раз на приложение)'},
        {cmd: 'make build-android-release', text: 'AAB для Google Play + подписанный APK'},
        {cmd: 'make build-ios', text: 'iOS (нужен Xcode)'},
        {cmd: 'make lint / make test', text: 'проверки кода и автотесты'},
      ],
    }
  },
}
</script>

<style lang="scss" scoped>
.guide-grid {
  grid-template-columns: 28px 1fr;
  gap: 12px 10px;

  dt {
    opacity: 0.6;
    font-size: 20px;
  }

  dd {
    text-align: left;
    font-size: 14px;
    line-height: 1.35;
  }
}

.guide-files {
  grid-template-columns: auto 1fr;
  font-size: 13px;

  dt {
    opacity: 1;
  }

  dd {
    text-align: left;
    opacity: 0.75;
  }

  code {
    color: var(--app-fg);
    font-size: 12px;
    white-space: nowrap;
  }
}

.guide-list {
  margin: 0;
  padding-left: 18px;
  font-size: 14px;
  line-height: 1.4;

  li + li {
    margin-top: 6px;
  }
}

.guide-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.guide-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid var(--app-glass-border);
  background: var(--app-inset-bg);
  color: var(--app-fg);
  text-decoration: none;
  font-size: 13px;
}
</style>
