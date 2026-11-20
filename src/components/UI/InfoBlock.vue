<template>
  <div class="info-block text-center mt-4 mb-4" :class="cssClasses">
    <div class="info-block-icon" role="status">
      <i class="bi" :class="icon"></i>
    </div>
    <div class="mb-3">
      <div class="info-block-label mb-3">{{ label }}</div>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'info-block',
  props: ['label', 'icon', 'cssClasses']
}
</script>

<style lang="scss" scoped>
.info-block {
  line-height: 1;

  &-icon {
    font-size: 45px;
  }

  &-label {
    padding-top: 12.5px;
    padding-bottom: 5px;
    line-height: 1.25;
    font-size: 17px;
  }
}
</style>