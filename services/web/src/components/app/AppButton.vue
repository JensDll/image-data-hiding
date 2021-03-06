<script setup lang="ts">
import type { PropType } from 'vue'

const emit = defineEmits(['click'])

defineProps({
  variant: {
    type: String as PropType<'default' | 'encode' | 'decode' | 'landing'>,
    default: 'default'
  },
  type: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const handleClick = (e: MouseEvent) => {
  const target = e.target as HTMLButtonElement
  if (!target.disabled && target.ariaDisabled !== 'true') {
    emit('click')
  }
}
</script>

<template>
  <div class="group relative">
    <div
      v-if="variant === 'landing'"
      class="absolute -inset-0.5 bg-gradient-to-r from-encode-500 to-decode-500 opacity-75 blur"
    ></div>
    <button
      :type="type"
      :class="[
        'relative flex rounded border-2 px-4 py-1 font-medium outline-offset-[2.5px] focus:outline focus:outline-2',
        {
          default: `border-gray-300 hover:bg-gray-100 focus:outline-gray-300`,
          landing: `border-gray-900 bg-gray-900 py-2 px-6 text-white outline-none hover:border-gray-700 hover:bg-gray-700
          dark:hover:border-gray-800 dark:hover:bg-gray-800`,
          encode: `border-encode-500 bg-encode-500 text-white hover:border-encode-400 hover:bg-encode-400 focus:outline-encode-400
          dark:border-encode-600 dark:bg-encode-600 dark:hover:border-encode-500 dark:hover:bg-encode-500 dark:focus:outline-encode-500`,
          decode: `border-decode-500 bg-decode-500 text-white hover:border-decode-400 hover:bg-decode-400 focus:outline-decode-400
          dark:border-decode-600 dark:bg-decode-600 dark:hover:border-decode-500 dark:hover:bg-decode-500 dark:focus:outline-decode-500`
        }[variant],
        {
          'cursor-not-allowed opacity-30': disabled
        }
      ]"
      :disabled="disabled"
      @click="handleClick"
    >
      <slot></slot>
    </button>
  </div>
</template>
