<template>
  <div :class="cssClasses">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Загрузка...</span>
    </div>
    <div class="mt-3" v-html="label" v-if="label.length"></div>
  </div>
</template>

<script>
export default {
  name: 'my-loader',
  props: {
    label: {
      type: String,
      default: ''
    },
    cssClasses: {
      type: String,
      default: 'text-center'
    }
  }
}
</script>