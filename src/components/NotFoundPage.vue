<template>
  <div class="default-page default-page-center status-page">
    <p class="status-page-code mb-4">404</p>
    <p class="mb-5">{{ $t('notFound.text') }}</p>
    <button @click="gotoHome" class="btn btn-primary btn-lg btn-min-width rounded-pill">{{ $t('notFound.home') }}</button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function gotoHome() {
  router.push('/');
}
</script>

<style lang="scss" scoped>
.status-page {
  text-align: center;

  &-code {
    font-size: 125px;
    opacity: 0.33;
    line-height: 1;
  }
}
</style>