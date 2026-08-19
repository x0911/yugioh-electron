<template>
  <div class="loading-spinner-wrapper" role="status" aria-live="polite">
    <div
      class="loading-spinner"
      :class="[
        typeof size === 'string' && `loading-spinner--${size}`,
        `loading-spinner--${variant}`,
      ]"
      :style="customSizeStyle"
    >
      <template v-if="variant === 'ring'">
        <div class="loading-spinner__simple-circle" />
      </template>

      <template v-else>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="loading-spinner__svg"
          :width="pixelSize"
          :height="pixelSize"
        >
          <!-- Outer Solar / Arena Ring -->
          <g class="loading-spinner__outer-ring">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="currentColor"
              stroke-width="2"
              stroke-opacity="0.35"
              stroke-dasharray="4 6"
            />
            <!-- 8 Solar Ray Triangles -->
            <polygon points="50,2 47,8 53,8" fill="currentColor" />
            <polygon points="50,98 47,92 53,92" fill="currentColor" />
            <polygon points="2,50 8,47 8,53" fill="currentColor" />
            <polygon points="98,50 92,47 92,53" fill="currentColor" />
            <polygon points="16,16 22,20 19,25" fill="currentColor" />
            <polygon points="84,84 78,80 81,75" fill="currentColor" />
            <polygon points="16,84 20,78 25,81" fill="currentColor" />
            <polygon points="84,16 80,22 75,19" fill="currentColor" />
          </g>

          <!-- Middle Runed Ring -->
          <g class="loading-spinner__inner-ring">
            <circle
              cx="50"
              cy="50"
              r="30"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-opacity="0.75"
              stroke-dasharray="14 10 6 10"
            />
            <circle cx="50" cy="20" r="2" fill="currentColor" />
            <circle cx="50" cy="80" r="2" fill="currentColor" />
            <circle cx="20" cy="50" r="2" fill="currentColor" />
            <circle cx="80" cy="50" r="2" fill="currentColor" />
          </g>

          <!-- Glowing Center Energy Core -->
          <g class="loading-spinner__core">
            <circle cx="50" cy="50" r="12" fill="currentColor" fill-opacity="0.15" />
            <circle cx="50" cy="50" r="6" fill="currentColor" fill-opacity="0.8" />
            <!-- Eye / Star Diamond -->
            <polygon points="50,38 54,50 50,62 46,50" fill="currentColor" />
            <polygon points="38,50 50,54 62,50 50,46" fill="currentColor" />
          </g>
        </svg>
      </template>
    </div>

    <div v-if="label || sublabel" class="loading-spinner__text-group">
      <div v-if="label" class="loading-spinner__label">
        {{ label }}
      </div>
      <div v-if="sublabel" class="loading-spinner__sublabel">
        {{ sublabel }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  size?: 'sm' | 'md' | 'lg' | number;
  variant?: 'gold' | 'cyan' | 'ring';
  label?: string;
  sublabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'gold',
  label: '',
  sublabel: '',
});

const pixelSize = computed(() => {
  if (typeof props.size === 'number') {
    return props.size;
  }
  switch (props.size) {
    case 'sm':
      return 24;
    case 'lg':
      return 72;
    case 'md':
    default:
      return 48;
  }
});

const customSizeStyle = computed(() => {
  if (typeof props.size === 'number') {
    return {
      width: `${props.size}px`,
      height: `${props.size}px`,
    };
  }
  return {};
});
</script>
