<template>
  <component
    :is="tagComponent"
    :to="to"
    :href="href"
    :type="isButton ? type : undefined"
    :disabled="isButton ? disabled : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-label="ariaLabel"
    :tabindex="disabled ? -1 : 0"
    class="yugi-btn"
    :class="[
      `yugi-btn--${variant}`,
      `yugi-btn--${size}`,
      disabled && 'yugi-btn--disabled',
    ]"
    @click="handleClick"
  >
    <!-- Card Variant Structure (design-system.md §5.1) -->
    <template v-if="variant === 'card'">
      <div class="yugi-btn__card-frame">
        <div class="yugi-btn__card-header">
          <slot name="header">
            <slot />
          </slot>
        </div>

        <div class="yugi-btn__card-art">
          <slot name="art">
            <span v-if="icon" class="yugi-btn__card-icon">{{ icon }}</span>
            <slot name="icon">
              <!-- Default Egyptian Duel Eye / Symbol if no icon supplied -->
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                <circle cx="12" cy="12" r="9" stroke-opacity="0.6" />
                <path d="M12 7v10M7 12h10" stroke-linecap="round" />
                <polygon points="12,9 14,12 12,15 10,12" fill="currentColor" fill-opacity="0.4" />
              </svg>
            </slot>
          </slot>
        </div>

        <div v-if="sublabel || $slots.footer" class="yugi-btn__card-footer">
          <slot name="footer">
            {{ sublabel }}
          </slot>
        </div>
      </div>
    </template>

    <!-- Standard Button Structure -->
    <template v-else>
      <span v-if="icon || $slots.icon" class="yugi-btn__icon">
        <slot name="icon">
          {{ icon }}
        </slot>
      </span>

      <span class="yugi-btn__label">
        <slot />
      </span>

      <span v-if="sublabel" class="yugi-btn__sublabel">
        {{ sublabel }}
      </span>
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

interface Props {
  variant?: 'primary' | 'secondary' | 'card' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: string;
  sublabel?: string;
  to?: RouteLocationRaw;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  icon: '',
  sublabel: '',
  to: undefined,
  href: '',
  type: 'button',
  ariaLabel: undefined,
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const tagComponent = computed(() => {
  if (props.to) return 'router-link';
  if (props.href) return 'a';
  return 'button';
});

const isButton = computed(() => tagComponent.value === 'button');

function handleClick(event: MouseEvent): void {
  if (props.disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  emit('click', event);
}
</script>
