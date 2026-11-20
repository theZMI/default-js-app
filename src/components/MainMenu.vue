<template>
  <div class="offcanvas offcanvas-start" data-bs-scroll="true" tabindex="-1" id="offcanvasUserMenu" aria-labelledby="offcanvasUserMenuLabel" v-swipe-left="closeMenu">
    <div class="offcanvas-header pt-0 pb-0">
      <button type="button" class="btn btn-link btn-close-menu text-white" ref="menuCloseButton" data-bs-dismiss="offcanvas" aria-label="Закрыть">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
    <div class="offcanvas-body">
      <div class="offcanvas-menu-list">
        <ul class="list-unstyled" data-bs-dismiss="offcanvas">
          <li v-for="item in menuTop" :key="item.link">
            <router-link class="menu-item" :class="{active: $route.path === item.link}" :to="item.link"><i class="bi" :class="item.icon"></i><span>{{ item.name }}</span></router-link>
          </li>
        </ul>
      </div>
      <div class="offcanvas-menu-list-bottom" v-if="menuBottom.length">
        <div class="header text-secondary">Дополнительно:</div>
        <ul class="list-unstyled" data-bs-dismiss="offcanvas">
          <li v-for="item in menuBottom" :key="item.link">
            <router-link class="menu-item" :class="{active: $route.path === item.link}" :to="item.link"><i class="bi" :class="item.icon"></i><span>{{ item.name }}</span></router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <!-- Невидимая кнопка-триггер: меню открывается из нижнего меню («Всё меню») через openMenu() -->
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

export default {
  computed: {
    menuTop() {
      return mainMenuItems;
    },
    menuBottom() {
      return extraMenuItems;
    },
  },
  methods: {
    openMenu() {
      this.$refs.menuOpenButton.click();
    },
    closeMenu() {
      this.$refs.menuCloseButton.click();
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
    color: #FFF;
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
    margin-bottom: $site-bottom-menu-offset; // Смещение чтобы bottom-menu приклеенное к низу приложение не закрывало это меню
  }

  .menu-item {
    color: #FFF;
    padding: 10px 0;
    margin: 10px 0;
    white-space: nowrap;
    display: block;
    width: 100%;
    text-align: left;
    text-decoration: none;

    .bi {
      margin-right: 12px;
      opacity: 0.5;
    }

    &.active {
      color: $primary;
    }
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