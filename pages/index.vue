<template>
  <section class="index">
    <div class="index__shrine">
      <h1 class="index__headline">
        <span>
          The Shrine
          <sub>next generation</sub>
        </span>
      </h1>
      <main class="index__sounds">
        <article
          v-for="(sound, index) in sounds"
          :key="sound.file"
          class="index__sound"
          :tabindex="index + 1"
          @click="soundsToPlay.push(sound)"
          @keydown.enter.prevent="soundsToPlay.push(sound)"
          @keydown.space.prevent="soundsToPlay.push(sound)"
        >
          <button type="button" class="index__sound-name">
            {{ sound.name }}
          </button>
          <div>
            <button type="button" class="index__sound-knob" :aria-label="sound.name" />
          </div>
        </article>

        <div class="index__sound" hidden />
        <div class="index__sound" hidden />
        <div class="index__sound" hidden />
        <div class="index__sound" hidden />
        <div class="index__sound" hidden />
        <div class="index__sound" hidden />
      </main>
    </div>

    <div class="index__content">
      <h2>1, 2, 3, gude Laune!</h2>
      <p>
        This "next generation" version of
        <em>the shrine</em>
        aka
        <em>sven panel</em>
        also works on your (e.g. iOS or Android) mobile phone.
        <br>
        <a href="https://github.com/gildesmarais/the-shrine-ng" target="_blank" rel="noopener">
          Contributions to this project are welcome.
        </a>
      </p>
      <p>
        The idea and the recordings come from
        <em>cubuss</em>
        who initially build the
        <em>svenpanel</em>
        and called it
        <a href="http://theshrine.de" target="_blank" rel="noopener noreferrer nofollow">theshrine</a>.
        <br>
        Thank you, cubuss!
      </p>
    </div>

    <!-- we need to support playing multiple sounds at the same time. for the lulz. -->
    <Player
      v-for="(sound, soundIndex) in soundsToPlay"
      :key="[soundIndex, sound.file].join()"
      :current-sound="sound"
    />
  </section>
</template>

<script>
import { mapState } from 'vuex'
import Player from '@/components/Player'

export default {
  components: {
    Player
  },
  head () {
    return {
      link: this.sounds.map(function (sound) {
        return { href: `/sounds/${sound.file}`, rel: 'preload', as: 'audio' }
      })
    }
  },
  data () {
    return {
      soundsToPlay: [],
      currentSound: null
    }
  },
  computed: {
    ...mapState({
      sounds: state => state.sounds.index
    })
  }
}
</script>

<style lang="scss">
@import "~/assets/variables.scss";

$shrine-background: #777;
$shrine-border-color: #333;
$knob-color: darken($shrine-background, 20);
$padding: 1rem;
$content-background-color: #111;
$color-white: #fff;

.index {
  width: 100%;
  max-width: 95vw;
  margin: 0.1rem auto;
  padding: 0 0.5rem;
  color: $color-primary;
}

.index__shrine {
  box-shadow: 0 0 1rem rgba($shrine-background, 0.7);
  border-radius: 2px;
  border-color: $shrine-border-color;
  background:
    radial-gradient(rgba($shrine-border-color, 0.25) 15%, transparent 16%) 0 0,
    radial-gradient(rgba($shrine-border-color, 0.25) 15%, transparent 16%) 0.5rem 0.5rem,
    radial-gradient(rgba($color-white, 0.1) 15%, transparent 20%) 0 0.05rem,
    radial-gradient(rgba($color-white, 0.1) 15%, transparent 20%) 0.5rem 0.55rem;
  background-color: $shrine-background;
  background-size: 0.75rem 0.75rem;
}

.index__headline {
  padding: 1rem $padding 0;
  text-align: center;
  line-height: 1;
  margin: 1.5rem auto 3rem;
}

.index__headline span {
  @include text-glow();

  width: 100%;
  font-size: 1.5rem;
  padding: 0.75rem 1rem 0.5rem;
  display: inline-block;
  background-color: $color-background;
  letter-spacing: 0.2rem;
  border: 0.4rem outset $knob-color;
}

@keyframes blinker {
  50% {
    color: $color-white;
  }
}

.index__headline sub {
  font-style: italic;
  transform: rotate(-10.6deg);
  display: inline-block;
  margin-left: -2.5rem;
  padding-top: 1rem;
  color: rgba($color-white, 0.75);
  letter-spacing: -0.05rem;
  animation: blinker 1.5s ease-out infinite;
}

.index__sounds {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  padding: 0 $padding;
}

.index__sound {
  margin: 0 0 0.25rem;
  padding: 0.25rem 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: border 0.2s;
}

.index__sound:focus {
  outline: 2px solid $color-red;
  z-index: 1;
}

.index__sound-name {
  @include text-glow();

  border: 0.4rem outset rgba($knob-color, 0.25);
  background-color: $color-background;
  min-height: 3.6rem;
  hyphens: auto;
  line-height: 1.1;
  letter-spacing: 0.025rem;
  font-style: italic;
  padding: 0.5rem 0.15rem;
  margin-bottom: 0.25rem;
  width: 100%;
  height: 100%;
  text-align: center;
  text-transform: uppercase;
  font-size: 0.9rem;
  user-select: none;
  cursor: pointer;
}

.index__sound:hover .index__sound-name {
  border-style: inset;
  border-color: rgba($knob-color, 0.75);
}

.index__sound-knob {
  margin: 0 auto 1rem;
  background: linear-gradient(-5deg, rgba($knob-color, 0.5) 0%, lighten($knob-color, 30) 100%);
  box-shadow: 0 0 0.4rem rgba($knob-color, 0.4);
  border: 1px solid rgba($knob-color, 0.7);
  border-radius: 50%;
  display: block;
  height: 2rem;
  width: 2rem;
  transition: background 0.3s ease-in;
  font-size: 0;
  cursor: pointer;
}

.index__sound:hover .index__sound-knob {
  background: linear-gradient(175deg, rgba(lighten($color-red, 50%), 0.5) 0%, rgba($color-red, 0.9) 100%);
}

.index__content {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  margin: 4rem 0;
  padding: 1rem;
  border-radius: 2px;
  background-color: $content-background-color;
}

.index__content p {
  max-width: 80ch;
  line-height: 1.61;
  margin: 0 auto;
  color: #ccc;
}

.index__content a {
  color: #eee;
  text-decoration-color: $color-red;
  text-decoration-style: dotted;

  &:hover {
    color: $color-white;
    text-decoration-style: solid;
  }
}

$itemsPerRow: (
  "min-width: 801px": 12%,
  "max-width: 800px": 16%,
  "max-width: 700px": 33%,
  "max-width: 480px": 49%,
  "max-width: 240px": 100%
);

@each $query, $width in $itemsPerRow {
  @media (#{$query}) {
    .index__sound {
      flex: 1 1 #{$width};
      margin-bottom: 0;
      padding: 0;
    }
  }
}

@media (max-width: 480px) {
  .index__sound {
    margin: auto 0.5%;
  }

  .index__sound-knob {
    display: none;
  }
}
</style>
