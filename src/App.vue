<template>
  <div class="developer-info" v-if="showVersionBadge">Вер. {{ appVersion }}</div>

  <network-status />

  <pull-refresh v-model="pageRefreshing" :disabled="isPullRefreshDisabled" pulling-text="👇" loosing-text="👍" loading-text="" success-text="" pull-distance="140" @refresh="refreshPage" :class="{'is-page-refreshing': pageRefreshing, 'is-page-exception-to-pull-refresher': isPullRefreshDisabled}">
    <div v-if="pageRefreshing">
      <popup-message :visible="true">
        <my-loader label="Обновляем..."  />
      </popup-message>
    </div>

    <main-menu ref="mainMenu" />

    <div class="wrapper">
      <div class="content" :class="{'stretch-height': isStretchHeightPage}">
        <div v-if="hasAppUpdates" v-show="needAppUpdate">
          <popup-message :visible="true" :close="() => needAppUpdate = false">
            <check-updates ref="checkUpdates" />
          </popup-message>
        </div>
        <router-view v-slot="{ Component }">
          <transition name="animation-fade">
            <keep-alive :include="keepAlivePages">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </pull-refresh>

  <bottom-main-menu @openMainMenu="openMainMenu" @closeMainMenu="closeMainMenu" />
</template>

<script>
import { delay } from "@/helpers/delay";
import PullRefresh from "pull-refresh-vue3";
import NetworkStatus from "@/components/UI/NetworkStatus";
import MainMenu from "@/components/MainMenu";
import BottomMainMenu from "@/components/BottomMainMenu";
import CheckUpdates from "@/components/CheckUpdatesPage";
import PopupMessage from "@/components/UI/PopupMessage";
import { APP } from "@/config/app";
import { FEATURES } from "@/config/features";
import { CURRENT_VERSION } from "@/native/appUpdates";
import { keepAlivePages } from "@/router/menu";

export default {
  components: {
    PullRefresh,
    NetworkStatus,
    MainMenu,
    BottomMainMenu,
    CheckUpdates,
    PopupMessage,
  },
  data() {
    return {
      appVersion: CURRENT_VERSION,
      showVersionBadge: APP.SHOW_VERSION_BADGE,
      hasAppUpdates: FEATURES.appUpdates,
      needAppUpdate: false,
      pageRefreshing: false,
      keepAlivePages,
    }
  },
  methods: {
    openMainMenu() {
      this.$refs.mainMenu.openMenu();
    },
    closeMainMenu() {
      this.$refs.mainMenu.closeMenu();
    },
    async refreshPage() {
      this.pageRefreshing = true;
      await delay(200);
      window.location.reload();
    },
  },
  computed: {
    isStretchHeightPage() {
      return APP.STRETCH_HEIGHT_PAGES.includes(this.$route.path);
    },
    isPullRefreshDisabled() {
      return !APP.PULL_TO_REFRESH || APP.PULL_TO_REFRESH_DISABLED_PAGES.includes(this.$route.path);
    },
  },
  async mounted() {
    // Автопроверка обновления при запуске (APP.UPDATES.AUTO_CHECK_ON_START)
    if (this.hasAppUpdates && APP.UPDATES.AUTO_CHECK_ON_START && this.$refs.checkUpdates) {
      await this.$refs.checkUpdates.checkUpdates();
      this.needAppUpdate = this.$refs.checkUpdates.hasUpdates;
    }
  },
}
</script>

<style lang="scss">
@import "@/styles/scss/bootstrap-overwrite.scss";
// Не весь бутстрап, а только используемые модули (полный вариант давал ~340КБ CSS,
// из которых большая часть — таблицы/аккордеоны/пагинация, которых в приложении нет).
// Порядок служебных импортов — как в документации Bootstrap 5.3.
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/variables-dark";
@import "~bootstrap/scss/maps";
@import "~bootstrap/scss/mixins";
@import "~bootstrap/scss/utilities";
// Утилиты — тоже не все: из ~1300 классов (каждый ещё и в 5 адаптивных вариантах)
// в разметке используется несколько десятков. Оставлены только группы ниже и без
// адаптивных/print-вариантов (d-md-…, d-print-… в приложении нет). Понадобится новая
// группа (например gap-2 → "gap") или адаптивный вариант — добавьте её сюда.
$utilities-in-use: (
  "display", "position", "top", "bottom", "end", "border", "border-top", "border-bottom",
  "width", "flex-wrap", "align-items", "margin", "margin-y", "margin-top", "margin-end",
  "margin-bottom", "padding", "padding-x", "padding-y", "padding-top", "padding-bottom",
  "text-align", "white-space", "color", "background-color", "rounded", "visibility", "z-index",
);
$utilities-trimmed: ();
@each $key, $utility in $utilities {
  @if index($utilities-in-use, $key) {
    $utilities-trimmed: map-merge($utilities-trimmed, ($key: map-merge($utility, (responsive: false, print: false))));
  }
}
$utilities: $utilities-trimmed;
@import "~bootstrap/scss/root";
@import "~bootstrap/scss/reboot";
@import "~bootstrap/scss/type";
@import "~bootstrap/scss/containers";
@import "~bootstrap/scss/grid";
@import "~bootstrap/scss/forms";
@import "~bootstrap/scss/buttons";
@import "~bootstrap/scss/transitions";
@import "~bootstrap/scss/nav";
@import "~bootstrap/scss/navbar";
@import "~bootstrap/scss/card";
@import "~bootstrap/scss/progress";
@import "~bootstrap/scss/spinners";
@import "~bootstrap/scss/close";
@import "~bootstrap/scss/toasts";
@import "~bootstrap/scss/modal";
@import "~bootstrap/scss/offcanvas";
@import "~bootstrap/scss/helpers";
@import "~bootstrap/scss/utilities/api";
@import "@/styles/scss/font-ptsans.scss";
@import "@/styles/scss/keyframes.scss";
@import "@/styles/scss/my-vars.scss";
@import "@/styles/scss/list.scss";
@import "@/styles/scss/animations.scss";
@import "@/styles/scss/attention-block";

// Скролл приложения живёт НЕ на документе, а внутри #app: скролл документа в
// standalone-PWA на iOS ломается (страница «замерзает» на высоте одного экрана),
// внутренний контейнер работает стабильно и в браузере, и в установленном приложении.
html {
  height: 100%;
  overflow: hidden;
  min-width: $site-min-width;

  * {
    -webkit-tap-highlight-color: rgba(0,0,0, 0); /* make transparent link selection, adjust last value opacity 0 to 1.0 */
    outline: none !important;
  }

  .developer-info {
    position: fixed;
    right: 0;
    top: env(safe-area-inset-top, 0px); // Отступ под статус-бар iOS в standalone (в браузере env равен нулю)
    color: #FFF;
    padding: 5px 9px;
    line-height: 1;
    font-size: 13px;
    background-color: #000;
    border: 1px solid #000;
    border-width: 0 0 1px 1px;
    border-radius: 0 0 0 8px;
    z-index: 1000;
    display: inline-block;

    &:empty {
      display: none;
    }

    &-center {
      left: 0;
      width: 100px;
      border-radius: 0 0 8px 8px;
      border-width: 0 1px 1px 1px;
      margin: auto;
      text-align: center;
    }

    &-important {
      background: red;
    }
  }

  // Component pull-to-update
  .lb-pull-refresh__head {
    display: flex;
    justify-content: center;
    color: #FFF;
    font-size: 1.1rem;

    backdrop-filter: $site-glass-blur;
    background-color: $site-glass-bg !important;
    box-shadow: $site-glass-shadow;
    border: $site-glass-border;
    width: 63px;
    height: 63px;
    padding-top: 6px;
    left: calc(50% - 25px);
    // Дополнительный отступ от контента: круглишок остаётся скрытым, пока не
    // потянули дальше этого расстояния, а когда появляется — не липнет к контенту
    top: 0;
    transform: translateY(calc(-100% - 24px));
    border-radius: 50%;
    margin: 0 auto;
    text-align: center;

    * {
      filter: grayscale(1);
    }

    .pull-text {
      @include animation('appear 0.75s 1');
    }
  }

  .is-page-refreshing, .is-page-exception-to-pull-refresher {
    .lb-pull-refresh__head {
      display: none;
    }
  }

  body {
    min-width: $site-min-width;
    width: 100%;
    height: 100%;
    overflow: hidden;
    -webkit-touch-callout: none; /* prevent callout to copy image, etc when tap to hold */
    -webkit-text-size-adjust: none; /* prevent webkit from resizing text to fit */
    -webkit-user-select: none; /* prevent copy paste, to allow, change 'none' to 'text' */
    margin: 0 auto;
    padding: env(safe-area-inset-top, 0px) 0 0 0;
    color: #FFF;
    font-family: 'PT Sans', 'HelveticaNeue-Light', 'HelveticaNeue', Helvetica, Arial, sans-serif;
    background: $site-background;
    font-size: 17px;

    &.with-dots {
      background-image: radial-gradient(circle, #161616 1px, rgba(0,0,0, 0) 1px);
      background-repeat: repeat;
      background-size: 1rem 1rem;
    }

    #app {
      // Единственный скролл-контейнер приложения (см. комментарий у html).
      // 100vh — фолбэк для iOS < 16.4 без поддержки dvh; в standalone они равны.
      // -webkit-overflow-scrolling: touch тут НЕ ставить: легаси-свойство с известным
      // багом «замерзания» скролла после перезагрузки страницы на iOS, а инерционный
      // скролл на современных iOS и так включён по умолчанию.
      height: 100vh;
      height: 100dvh;
      overflow-y: auto;
      width: 100%;
      // Когда pull-refresh отключён (:disabled на компоненте), он больше не
      // делает preventDefault на touchmove — и жест перехватывает нативный
      // pull-to-refresh браузера/PWA (кружок вместо эмодзи). contain убирает
      // именно нативный refresh-жест, не трогая обычный инерционный скролл.
      overscroll-behavior-y: contain;

      // У pull-refresh собственные height:100%/overflow:hidden — при фиксированной
      // высоте #app они бы обрезали контент по высоте экрана, снимаем их.
      // Голова компонента остаётся невидимой: она спрятана выше верхней границы
      // скролл-контейнера и выезжает за счёт translate3d самого трека.
      .lb-pull-refresh {
        height: auto;
        min-height: 100%;
        overflow: visible;
      }

      .wrapper {
        min-height: 100vh;
        min-height: 100dvh;
        width: 100%;
        max-width: $site-max-width;
        margin: 0 auto;
        display: flex;
        // Сверху — ещё и отступ под статус-бар в standalone на iOS (в браузере
        // env равен нулю). Снизу env не добавляем: меню сознательно прижато к
        // низу, как в браузере, и 73px хватает, чтобы контент из-под него вышел.
        padding:
            calc(#{$site-top-menu-offset})
            6px
            $site-bottom-menu-offset
            6px;

        .content {
          align-self: center;
          width: 100%;
          margin: 0;
          padding: 0;

          // min-, а не height: с жёсткой высотой длинный контент вытекал из
          // блока мимо нижнего padding обёртки и прятался под нижним меню;
          // min-height растит обёртку, и отступ снизу работает
          &.stretch-height {
            min-height: -webkit-fill-available;
            min-height: stretch;
          }
        }
      }

      .default-page {
        margin: 0 auto;
        max-width: $site-max-width;
        min-height: calc(100vh - $site-top-menu-offset - $site-bottom-menu-offset - 30px); // 30px = padding сверху и снизу
        min-height: calc(100dvh - $site-top-menu-offset - $site-bottom-menu-offset - 30px);

        &-center {
          min-height: unset !important;
        }
      }

      h1, h2, h3 {
        line-height: 1;

        small {
          display: block;
          font-size: 15px;
          margin-left: -2px;
          line-height: 1;
        }

        span {
          border-bottom: 1px solid rgba(255,255,255, 0.33);
          padding-bottom: 5px;
        }
      }

      h1 {
        margin-bottom: 23px;

        span {
          padding-bottom: 10px;
        }
      }

      input[readonly] {
        color: #777;
      }
    }
  }
}
</style>