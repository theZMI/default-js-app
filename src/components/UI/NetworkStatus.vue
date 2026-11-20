<template>
  <div class="network-status" v-if="isShow" :class="className">
    <div class="spinner-border spinner-border-sm network-status-element network-status-element-on-loading" role="status"><span class="visually-hidden">Загрузка...</span></div>
    <i class="bi bi-wifi-off network-status-element network-status-element-on-error" @click="showInformation = !showInformation"></i>
    <div class="network-status-information network-status-element network-status-element-on-error" v-show="showInformation" v-text="information"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: 'network-status',
  data() {
    return {
      showInformation: false
    }
  },
  computed: {
    ...mapState({
      isShow: state => state.networkInformation.status !== 'success',
      status: state => state.networkInformation.status,
      information: state => state.networkInformation.lastError
    }),
    className() {
      return `network-status-` + this.status
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/scss/bootstrap-declaration.scss";
@import "@/styles/scss/bootstrap-vars.scss";

.network-status {
  text-align: center;
  position: fixed;
  left: 0;
  right: 0;
  // Индикатор не должен прятаться под статус-баром iOS в standalone-режиме
  top: env(safe-area-inset-top, 0px);
  min-width: 28px;
  min-height: 28px;
  width: fit-content;
  margin: 0 auto;
  line-height: 1;
  padding: 5px;
  border-radius: 0 0 5px 5px;
  color: #000;
  z-index: 9999;

  &-element {
    display: none;
  }

  &-loading {
    background: #444;

    .network-status-element-on-loading {
      display: block;
      text-align: center;
      margin: 1px auto 0 auto;
    }
  }

  &-error {
    background: $danger;

    .network-status-element-on-error {
      display: block;
    }
  }

  &-information {
    font-size: 13px;
  }
}
</style>