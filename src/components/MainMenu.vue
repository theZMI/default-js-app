<template>
  <div class="offcanvas offcanvas-start" data-bs-scroll="true" tabindex="-1" id="offcanvasUserMenu" aria-labelledby="offcanvasUserMenuLabel" v-swipe-left="closeMenu">
    <div class="offcanvas-header pt-0 pb-0">
      <button type="button" class="btn btn-link btn-close-menu text-fg" ref="menuCloseButton" data-bs-dismiss="offcanvas" :aria-label="$t('menu.close')">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
    <div class="offcanvas-body">
      <div class="offcanvas-menu-list">
        <ul class="list-unstyled" data-bs-dismiss="offcanvas">
          <li v-for="item in menuTop" :key="item.link">
            <router-link class="menu-item" :class="{active: isActive(item)}" :to="item.link"><span>{{ $t(item.name) }}</span></router-link>
          </li>
        </ul>
      </div>
      <div class="offcanvas-menu-list-bottom" v-if="menuBottom.length || pwa.canPrompt || pwa.iosHint">
        <div class="header text-secondary">{{ $t('menu.extra') }}</div>
        <ul class="list-unstyled" data-bs-dismiss="offcanvas">
          <li v-for="item in menuBottom" :key="item.link">
            <router-link class="menu-item" :class="{active: isActive(item)}" :to="item.link"><span>{{ $t(item.name) }}</span></router-link>
          </li>
          <!-- Установка сайта как приложения (PWA) — только в браузере и если браузер это умеет:
               системное окно — по нажатию; на iPhone/iPad — подсказка ниже (src/native/pwaInstall.js) -->
          <li v-if="pwa.canPrompt">
            <button type="button" class="menu-item menu-install" @click="install">
              <i class="bi bi-download" aria-hidden="true"></i><span>{{ $t('menu.install') }}</span>
            </button>
          </li>
        </ul>
        <p v-if="pwa.iosHint" class="menu-install-hint">
          <i class="bi bi-box-arrow-up" aria-hidden="true"></i> {{ $t('menu.installIos') }}
        </p>
      </div>
    </div>
  </div>
  <!-- APP.MENU_STYLE = 'burger': кнопка «☰» в левом верхнем углу открывает боковое меню
       (и свайпом слева — через openMenu()) -->
  <button v-if="isBurger" class="menu-burger" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasUserMenu"
          aria-controls="offcanvasUserMenu" :aria-label="$t('menu.all')">
    <i class="bi bi-list"></i>
  </button>
  <!-- Невидимая кнопка-триггер: меню открывается из нижнего меню («Всё меню»), «☰» и свайпом через openMenu() -->
  <div id="header" v-show="false">
    <div class="header-content">
      <nav class="navbar navbar-dark bg-black">
          <button class="navbar-toggler" type="button" ref="menuOpenButton" data-bs-toggle="offcanvas" href="#offcanvasUserMenu" role="button" aria-controls="offcanvasUserMenu">
            <span class="bi bi-list"></span>
          </button>
      </nav>
    </div>
  </div>
</template>

<script>
import {mainMenuItems, extraMenuItems} from '@/router/menu';
import {APP} from '@/config/app';
import {pwaInstall, promptInstall} from '@/native/pwaInstall';

export default {
  data() {
    return {
      pwa: pwaInstall,
      isBurger: APP.MENU_STYLE === 'burger',
    };
  },
  computed: {
    menuTop() {
      return mainMenuItems;
    },
    menuBottom() {
      return extraMenuItems;
    },
  },
  methods: {
    isActive(item) {
      const path = this.$route.path;
      return path === item.link || (item.link !== '/' && path.startsWith(item.link + '/'));
    },
    openMenu() {
      this.$refs.menuOpenButton.click();
    },
    closeMenu() {
      this.$refs.menuCloseButton.click();
    },
    install() {
      promptInstall();
    },
  },
}
</script>

<style lang="scss" scoped>
@import "@/styles/scss/bootstrap-declaration.scss";
@import "@/styles/scss/bootstrap-vars.scss";
@import "@/styles/scss/my-vars.scss";

.navbar {
  position: relative;
  z-index: 999;
  box-shadow: 0 0 15px rgba(0,0,0, 0.99);
  border-radius: 0 0 50% 0;
  top: 0;
  left: 0;
  //left: -1000px;

  .navbar-toggler {
    box-shadow: none !important;
    border: none;
    padding-left: 0;
    padding-right: 0;
    font-size: 36px;
    color: var(--app-fg);
    margin-left: -3px;
  }

  &.navbar-dark.bg-black {
    border-radius: 50%;
    left: 15px;
    top: 5px;
    background: transparent !important;
    box-shadow: none;
  }
}

// Кнопка «☰» (APP.MENU_STYLE = 'burger') — стеклянный круг в левом верхнем углу, как в magic-ball
.menu-burger {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 8px);
  left: 10px;
  z-index: 1000; // ниже открытого меню (offcanvas — 1045)
  width: 52px;
  height: 52px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: $site-glass-border;
  border-radius: 50%;
  background: $site-glass-bg;
  backdrop-filter: $site-glass-blur;
  -webkit-backdrop-filter: $site-glass-blur;
  font-size: 34px;
  line-height: 1;
  color: var(--app-fg);
  -webkit-tap-highlight-color: transparent;
}

.offcanvas {
  backdrop-filter: $site-glass-blur;
  background-color: $site-glass-bg;

  &-header {
    margin-top: 8px;
  }

  .btn-close-menu {
    font-size: 28px;
    margin-top: 5px;
    margin-bottom: 5px;
    padding: 0;
    box-shadow: none;
  }

  &-menu-list-bottom {
    margin-bottom: var(--app-bottom-offset, #{$site-bottom-menu-offset}); // нижнее меню (если есть) не закрывает этот блок
  }

  .menu-item {
    color: var(--app-fg);
    padding: 10px 0;
    margin: 10px 0;
    white-space: nowrap;
    display: block;
    width: 100%;
    text-align: left;
    text-decoration: none;

    &.active {
      color: $primary;
    }
  }

  // Кнопка установки — как пункт меню, со значком того же цвета, что текст
  .menu-install {
    border: 0;
    background: none;
    display: flex;
    align-items: center;
    gap: 10px;

    .bi {
      font-size: 18px;
    }
  }

  .menu-install-hint {
    margin: 0 0 10px;
    font-size: 14px;
    line-height: 1.4;
    color: rgba(var(--app-fg-rgb), 0.6);
  }

  .header {
    border-bottom: 1px solid;
    margin-bottom: 5px;
    white-space: nowrap;
    display: inline-block;
  }

  .offcanvas-body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-top: 0;
    padding-bottom: 0;
  }
}

</style>