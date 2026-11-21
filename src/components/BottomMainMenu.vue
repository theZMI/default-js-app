<template>
  <div class="fixed-bottom bottom-main-menu-wrapper" v-if="showMenu">
    <div class="bottom-main-menu">
      <button v-if="addButtonAllMenu" class="bottom-main-menu-item" type="button" aria-label="Всё меню" @click="$emit('openMainMenu')">
        <i class="bi bi-list"></i>
        <span>Всё меню</span>
      </button>
      <router-link v-for="item in menu" :key="item.link" :aria-label="item.shortName || item.name" class="bottom-main-menu-item" :class="{'active': isActive(item)}" :to="item.link" @click="$emit('closeMainMenu')">
        <i class="bi" :class="item.icon"></i>
        <span>
          {{ item.shortName || item.name }}
          <span v-if="item.indicator" :class="item.indicatorCssClasses">{{ item.indicator }}</span>
        </span>
      </router-link>
    </div>
  </div>
</template>

<script>
import {bottomMenuItems} from '@/router/menu';

export default {
  emits: ['openMainMenu', 'closeMainMenu'],
  data() {
    return {
      // Кнопка «Всё меню» открывает боковое меню (там все пункты, включая «Дополнительно»)
      addButtonAllMenu: true,
    }
  },
  computed: {
    menu() {
      return bottomMenuItems;
    },
    showMenu() {
      return this.menu.length || this.addButtonAllMenu;
    },
  },
  methods: {
    isActive(item) {
      const path = this.$route.path;
      if ([item.link, ...(item.aliases || [])].includes(path)) return true;
      // Вложенные страницы раздела (/examples/compass) подсвечивают его пункт; главную — только точно
      return item.link !== '/' && path.startsWith(item.link + '/');
    },
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/scss/bootstrap-declaration.scss";
@import "@/styles/scss/bootstrap-vars.scss";
@import "@/styles/scss/my-vars.scss";

.bottom-main-menu {
  height: 60px;
  padding: 0;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0 auto;
  max-width: $site-max-width;

  &-wrapper {
    backdrop-filter: $site-glass-blur;
    background-color: $site-glass-bg;
    box-shadow: $site-glass-shadow;
    border: $site-glass-border;
    z-index: 1046 !important;
    width: calc(100vw - 12px);
    max-width: 500px;
    margin: 0 auto;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 12px 12px 0 0;

    &-2 {
      bottom: -1px;
      width: 100%;
      border-radius: 0;
      border-width: 1px 0 0 0;

      .bottom-main-menu {
        height: 72px;
        margin: 0 auto;

        &-item {
          margin: 5px 0;
          text-shadow: 0 0 1px #000;

          &:first-child {
            margin-left: 15px;
          }

          &:last-child {
            margin-right: 15px;
          }

          .bi {
            font-size: 25px;
            opacity: 0.5;
            transition: all linear 0.25s;
            margin-bottom: 5px;
          }

          span {
            opacity: 0.5;
            transition: all linear 0.25s;
          }
        }

        &-item.active {
          border-radius: 50px;

          .bi {
            opacity: 1;
          }

          span {
            opacity: 1;
          }
        }
      }
    }
  }

  &-item {
    background: transparent;
    border: none;
    flex-grow: 1;
    flex-basis: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: color 0.25s linear;
    text-decoration: none;
    padding: 0;
    color: #FFF;
    border-radius: 30px;
    //font-size: 21px;
    line-height: 1;
    font-size: 30px;
    border: 1px solid transparent;

    &.active {
      background: $site-active-element-bg;
      //border: none;
      color: rgb(255, 255, 255);
      flex-grow: 1;
      flex-basis: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: all 0.25s linear;
      text-decoration: none;
      line-height: 1;
      padding: 0;
      text-shadow: 0 1px rgba(0,0,0, 0.15);
      border: 1px solid $site-active-element-border;
    }

    span {
      line-height: 1;
      font-size: 13px;
      white-space: nowrap;
      padding-top: 7px;
      display: none; // только иконки, как в плеере; подписи под иконками — display: block
                     // (и высоту меню/отступ $site-bottom-menu-offset тогда увеличить)

      .badge {
        font-size: 13px;
        padding: 2px 6px;
        color: #FFF !important;
        font-weight: normal;
      }
    }
  }
}
</style>