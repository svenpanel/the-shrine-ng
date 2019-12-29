<template>
  <aside class="groove-player">
    <button v-for="groove in grooves" :key="groove.file" tabindex="2">
      <span
        v-if="currentGroove && currentGroove == groove"
        @click="currentGroove = null"
        @keydown.enter.prevent="currentGroove = null"
        @keydown.space.prevent="currentGroove = null"
      >
        <span class="index__sound-knob">❚❚</span>
        <label class="">Stop the groove</label>
      </span>
      <span
        v-else
        @click="currentGroove = groove"
        @keydown.enter.prevent="currentGroove = groove"
        @keydown.space.prevent="currentGroove = groove"
      >
        <span class="index__sound-knob">►</span>
        <label class="">Play a groove</label>
      </span>
    </button>

    <audio v-if="currentGroove" autobuffer autoplay loop>
      <source :key="currentGroove.file" :src="`grooves/${currentGroove.file}`">
    </audio>
  </aside>
</template>

<script>
export default {
  props: {
    grooves: { type: Array, required: true }
  },
  data () {
    return { currentGroove: null }
  }
}
</script>

<style lang="scss">
@import "~/assets/variables.scss";

.groove-player {
  padding-bottom: 1rem;
}

.groove-player > button {
  background-color: transparent;
  border: 0;
  outline: 0;
  cursor: pointer;
}

.groove-player > button > span {
  display: flex;
  line-height: 3rem;
  justify-content: center;
}

.groove-player label {
  @include text-glow();

  padding: 0 1rem;
  border: 0.4rem outset rgba($knob-color, 0.25);
  background-color: $color-background;
  line-height: 1;
  height: 2rem;
  margin: 0 0 0 1rem;
  width: 10rem;
  text-align: center;
}
</style>
