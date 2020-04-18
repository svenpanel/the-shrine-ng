<template>
  <aside class="groove-player">
    <button v-for="groove in grooves" :key="groove.file" tabindex="2">
      <span
        v-if="currentGroove && currentGroove == groove"
        @click="currentGroove = null"
        @keydown.enter.prevent="currentGroove = null"
        @keydown.space.prevent="currentGroove = null"
      >
        <span class="groove-player__button">❚❚</span>
        <!--
          how retro can you go?

          support is pretty good:
          https://caniuse.com/#feat=mdn-api_htmlmarqueeelement
        -->
        <marquee class="groove-player__display" loop="-1">{{ currentGroove.name }}</marquee>
      </span>

      <span
        v-else
        @click="currentGroove = groove"
        @keydown.enter.prevent="currentGroove = groove"
        @keydown.space.prevent="currentGroove = groove"
      >
        <span class="groove-player__button">►</span>
        <span class="groove-player__display">Play a groove</span>
      </span>
    </button>

    <audio v-if="currentGroove" autobuffer autoplay loop>
      <source :key="currentGroove.file" :src="`grooves/${currentGroove.file}`" preload="metadata">
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

$height: 2rem;

.groove-player {
  padding: 1rem;
}

.groove-player > button {
  background-color: $knob-color;
  cursor: pointer;
  height: $height;
  border: 0;
  padding: 0;
  line-height: $height;
  width: 100%;
  outline: 0;
}

.groove-player > button > span {
  display: flex;
  border: 1px solid $color-background;
  background-color: $color-background;
  box-shadow: 0 0 1px $knob-color;
}

.groove-player__button {
  @extend %button;

  border: 0;
  width: 2rem;
  height: $height;
}

.groove-player__display {
  @include text-glow();

  height: $height;
  padding: 0 1rem;
  line-height: $height;
  background-color: $color-background;
  text-align: center;
  flex: 1;
  text-transform: uppercase;
}

marquee.groove-player__display {
  margin: 0 1rem;
  letter-spacing: 0.33em;
}
</style>
