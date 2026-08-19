<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="modelValue" class="yugi-modal-backdrop" @click="handleBackdropClick">
        <div
          ref="modalRef"
          class="yugi-modal"
          :class="accent !== 'none' && `yugi-modal--accent-${accent}`"
          :style="{ maxWidth: width }"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
          @click.stop
        >
          <!-- Header Bar -->
          <div class="yugi-modal__header">
            <slot name="header">
              <h3 class="yugi-modal__title">
                {{ title }}
              </h3>
            </slot>

            <button
              v-if="cancelable"
              type="button"
              class="yugi-modal__close-btn"
              aria-label="Close dialog"
              @click="handleClose"
            >
              ✕
            </button>
          </div>

          <!-- Body Content -->
          <div class="yugi-modal__body">
            <slot />
          </div>

          <!-- Footer Bar -->
          <div v-if="$slots.footer" class="yugi-modal__footer">
            <slot name="footer" :close="handleClose" />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';

interface Props {
  modelValue: boolean;
  title?: string;
  cancelable?: boolean;
  accent?: 'gold' | 'user' | 'ai' | 'none';
  width?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  cancelable: true,
  accent: 'gold',
  width: '540px',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
  (e: 'cancel'): void;
}>();

const modalRef = ref<HTMLElement | null>(null);

function handleClose(): void {
  emit('update:modelValue', false);
  emit('close');
  emit('cancel');
}

function handleBackdropClick(): void {
  if (props.cancelable) {
    handleClose();
  }
}

function handleKeyDown(event: KeyboardEvent): void {
  if (props.modelValue && props.cancelable && event.key === 'Escape') {
    event.preventDefault();
    handleClose();
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Auto-focus modal container for accessibility
      setTimeout(() => {
        modalRef.value?.focus();
      }, 50);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>
