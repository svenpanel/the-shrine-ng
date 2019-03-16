<template>
  <audio autobuffer autoplay>
    <source :src="src">
  </audio>
</template>

<script>
export default {
  props: {
    currentSound: { type: Object, required: true }
  },
  computed: {
    src() {
      return ['sounds', this.currentSound.file].join('/')
    }
  }
}
</script>
