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
        {icon: 'bi-list', title: 'Кнопка «Всё меню»', text: 'Слева в нижнем меню: все разделы, включая «Дополнительно». Если в APP.MENU_STYLE выбран «burger» — нижнего меню нет, вместо него кнопка «☰» в левом верхнем углу.'},
        {icon: 'bi-arrow-left-circle', title: 'Кнопка «Назад» на Android', text: 'Закрывает меню и окна → возвращает на предыдущую страницу → на главной сворачивает приложение, а не закрывает его (нужен плагин фонового режима; без него — закрывает).'},
        {icon: 'bi-hand-index-thumb', title: 'Без случайного зума', text: 'Двойное касание и щипок не увеличивают страницу — интерфейс ведёт себя как нативный.'},
      ],
      shell: [
        'Меню: нижнее «плавающее» + боковое или только кнопка «☰» (APP.MENU_STYLE); пункты — src/router/menu.js.',
        'Страница «Настройки»: тёмная и светлая тема (или как в системе), размер текста, вибро-отклик, звук, язык (11 языков), сброс настроек и прогресса — блоки включаются в APP.SETTINGS.',
        'Установка сайта как приложения (PWA): пункт «Установить приложение» в разделе меню «Дополнительно» — только в браузере, который это умеет; на iPhone/iPad — подсказка, как добавить на экран «Домой».',
        'Работа без сети: офлайн-кеш сайта (service worker), офлайн-очередь запросов, локальная база IndexedDB.',
        'Индикатор сети: крутилка при долгих запросах, значок «нет сети».',
        'Понятные пользователю тексты ошибок вместо технических.',
        'Отчёты об ошибках JS: копятся на устройстве и отправляются на сервер, если задан APP.ERROR_REPORTS.URI.',
        'Самообновление Android-приложения (проверка версии, скачивание, установка APK).',
        'Версия поднимается сама при каждой сборке APK/iOS и выкладке сайта (scripts/bump-version.mjs).',
        'Защита: WebView не уходит на чужие сайты, строгий CSP, внешние ссылки — только безопасные схемы.',
        'Иконки для всех платформ генерируются из одной картинки (make icons).',
      ],
      config: [
        {file: 'src/config/features.js', text: 'какие возможности устройства включены'},
        {file: 'src/config/app.js', text: 'имя, вид меню, жесты, настройки по умолчанию и блоки страницы «Настройки», обновления, вход, карта, отчёты об ошибках'},
        {file: 'src/envs/*.js', text: 'адрес сервера, ссылка на APK (не в git)'},
        {file: 'src/router/menu.js', text: 'пункты меню'},
        {file: 'src/i18n/*.js', text: 'переводы интерфейса (11 языков)'},
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
        {cmd: 'make deploy', text: 'выложить сайт: новая версия, сборка, заливка (DEPLOY_KEY в Makefile)'},
        {cmd: 'make icons', text: 'иконки для всех платформ из resources/icon.png'},
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
