<script setup lang="ts">
import CallToAction from './CallToAction.vue'
</script>

<template>
  <section class="bg-gradient grid h-full min-h-[600px]">
    <div
      class="grid grid-rows-[auto_auto_1fr] justify-items-center self-center pt-6 md:p-0"
    >
      <section>
        <h1 class="px-5 text-center">Image Data Hiding</h1>
        <p class="mx-auto mt-8 max-w-2xl px-5 text-center text-lg">
          Online image Steganography. Hide text or binary data in images using
          this web-based tool.
        </p>
      </section>
      <CallToAction
        class="mt-6 w-full max-w-4xl lg:mt-8"
        @click="$router.push({ name: 'encode' })"
      />
    </div>
  </section>
</template>

<style scoped>
.bg-gradient {
  background-image: linear-gradient(
      12deg,
      theme('colors.encode.50'),
      theme('colors.encode.50' / 0) 60%
    ),
    linear-gradient(
      -12deg,
      theme('colors.decode.200'),
      theme('colors.decode.200' / 0) 60%
    );
}

.dark .bg-gradient {
  background-image: linear-gradient(
      12deg,
      theme('colors.encode.900' / 0.9),
      theme('colors.encode.900' / 0) 60%
    ),
    linear-gradient(
      -12deg,
      theme('colors.decode.900'),
      theme('colors.decode.900' / 0) 60%
    );
}
</style>
