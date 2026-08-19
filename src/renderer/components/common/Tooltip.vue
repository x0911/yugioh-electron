<template>
  <div
    class="yugi-tooltip-wrapper"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
  >
    <slot />

    <transition name="tooltip-fade">
      <div
        v-if="isVisible && !disabled && (text || $slots.content)"
        :id="tooltipId"
        role="tooltip"
        class="yugi-tooltip-bubble"
        :class="`yugi-tooltip-bubble--${position}`"
      >
        <slot name="content">
          {{ text }}
        </slot>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';

interface Props {
  text?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  position: 'top',
  delay: 150,
  disabled: false,
});

const isVisible = ref(false);
const tooltipId = `tooltip-${Math.random().toString(36).substring(2, 9)}`;
let timer: ReturnType<typeof setTimeout> | null = null;

function clearTimer(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function show(): void {
  if (props.disabled) return;
  clearTimer();
  if (props.delay > 0) {
    timer = setTimeout(() => {
      isVisible.value = true;
    }, props.delay);
  } else {
    isVisible.value = true;
  }
}

function hide(): void {
  clearTimer();
  isVisible.value = false;
}

function handleMouseEnter(): void {
  show();
}

function handleMouseLeave(): void {
  hide();
}

function handleFocusIn(): void {
  show();
}

function handleFocusOut(): void {
  hide();
}

onBeforeUnmount(() => {
  clearTimer();
});
</script>
