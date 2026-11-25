<template>
  <div class="modal fade show d-block" v-if="visible" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header position-fixed end-0 top-0 z-3">
          <button v-if="close" type="button" class="btn-close" aria-label="Close" @click="close"></button>
        </div>
        <div class="modal-body text-center pt-4 pb-4">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'popup-message',
  props: {
    visible: {type: Boolean, default: false},
    // Функция закрытия: есть — показываем крестик
    close: {type: Function, default: null},
  },
}
</script>

<style lang="scss" scoped>
@import "@/styles/scss/my-vars.scss";

.modal {
  background: $site-background;

  .modal-header {
    border-color: transparent;

    .btn-close {
      border-radius: 50%;
      font-size: 22px;
      opacity: 1;
      margin-top: -3px;
      margin-right: -1px;
    }
  }

  .modal-dialog {
    // --app-vh-fix — поправка под CSS zoom на экранах уже 360 px (helpers/viewportMinWidth.js)
    height: calc(100vh * var(--app-vh-fix, 1));
    display: flex;
    overflow: scroll;
    align-items: center;
    padding-bottom: $site-bottom-menu-offset;
  }


  .modal-content {
    background: transparent;
    border-color: transparent;
  }
}
</style>