<template>
  <component
    :is="as"
    class="glass-panel"
    :class="[
      elevated && 'glass-panel--elevated',
      accent !== 'none' && `glass-panel--accent-${accent}`,
    ]"
    :style="computedStyle"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  tint?: string;
  border?: string;
  blur?: string | number;
  padding?: string;
  elevated?: boolean;
  accent?: 'gold' | 'user' | 'ai' | 'none';
  as?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tint: '',
  border: '',
  blur: '',
  padding: '',
  elevated: false,
  accent: 'none',
  as: 'div',
});

const computedStyle = computed(() => {
  const styles: Record<string, string> = {};

  if (props.tint) {
    styles.background = props.tint;
  }
  if (props.border) {
    styles.borderColor = props.border;
  }
  if (props.blur) {
    const blurVal = typeof props.blur === 'number' ? `${props.blur}px` : props.blur;
    styles.backdropFilter = `blur(${blurVal}) saturate(140%)`;
    styles.webkitBackdropFilter = `blur(${blurVal}) saturate(140%)`;
  }
  if (props.padding) {
    styles.padding = props.padding;
  }

  return styles;
});
</script>
