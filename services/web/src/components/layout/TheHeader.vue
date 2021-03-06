<script setup lang="ts">
/* global changeTheme */
import { computed, ref, watch } from 'vue'

type ThemeName = 'light' | 'dark' | 'system'
type Theme = {
  name: ThemeName
  text: string
  icon: string
}

const themes: Theme[] = [
  {
    name: 'light',
    text: 'Light',
    icon: 'i-heroicons-outline-sun'
  },
  {
    name: 'dark',
    text: 'Dark',
    icon: 'i-heroicons-outline-moon'
  },
  {
    name: 'system',
    text: 'System',
    icon: 'i-heroicons-outline-desktop-computer'
  }
]

const isDropdownOpen = ref(false)
const isPopupOpen = ref(false)
const theme = ref<ThemeName>(localStorage.theme)

const isDark = ref(document.documentElement.classList.contains('dark'))
const isLight = computed(() => !isDark.value)

function changeThemePreference(themePreference: ThemeName) {
  changeTheme(themePreference)
  theme.value = themePreference
  isDark.value = document.documentElement.classList.contains('dark')
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function closePopup() {
  isPopupOpen.value = false
}

watch(theme, changeThemePreference)
</script>

<template>
  <header
    class="sticky top-0 z-10 border-b bg-bg-base backdrop-blur grid-area-[header] supports-backdrop-blur:bg-bg-base/95"
    :class="{ 'border-b-0': $route.name === 'home' }"
  >
    <div class="flex items-end justify-between py-6 container">
      <div
        class="flex cursor-pointer items-center text-xl font-semibold"
        @click="$router.push({ name: 'home' })"
      >
        <img src="/logo.svg" alt="logo" class="mr-3 h-6 w-6 dark:hidden" />
        <img
          src="/logo-dark.svg"
          alt="logo"
          class="mr-3 hidden h-6 w-6 dark:block"
        />
        Steganography
      </div>
      <nav class="relative hidden md:block">
        <ul class="flex">
          <li>
            <RouterLink
              class="mr-6 font-medium hover:text-orange-600"
              active-class="text-orange-600"
              :to="{ name: 'codec' }"
            >
              Codec
            </RouterLink>
          </li>
          <li>
            <RouterLink
              class="font-medium hover:text-orange-600"
              exact-active-class="text-orange-600"
              :to="{ name: 'about' }"
            >
              About
            </RouterLink>
          </li>
          <li class="mx-6 border-l"></li>
          <li @click="isDropdownOpen = true">
            <div
              :class="[
                'h-6 w-6 cursor-pointer text-orange-600',
                isLight ? 'i-heroicons-outline-sun' : 'i-heroicons-outline-moon'
              ]"
              outline="Sun"
            ></div>
            <ul
              v-if="isDropdownOpen"
              v-on-click-outside="closeDropdown"
              class="absolute top-16 right-0 w-36 rounded-lg border bg-white py-1 text-sm shadow-lg dark:bg-gray-800"
            >
              <li
                v-for="{ name, text, icon } in themes"
                :key="name"
                class="flex cursor-pointer items-center py-1 px-2 font-semibold hover:bg-gray-50 dark:hover:bg-gray-600/30"
                :class="{ 'text-orange-600': theme === name }"
                @click="changeThemePreference(name)"
              >
                <span
                  :class="[
                    'mr-2 h-6 w-6 text-gray-400',
                    icon,
                    { '!text-orange-600': theme === name }
                  ]"
                ></span>
                {{ text }}
              </li>
            </ul>
          </li>
          <li class="pl-4">
            <a href="https://github.com/JensDll/image-data-hiding">
              <div
                class="h-6 w-6 text-gray-400 i-mdi-github hover:text-gray-500 dark:hover:text-gray-300"
              ></div>
            </a>
          </li>
        </ul>
      </nav>
      <div
        class="h-6 w-6 cursor-pointer i-heroicons-outline-dots-vertical md:hidden"
        @click="isPopupOpen = true"
      ></div>
    </div>
  </header>
  <nav
    v-if="isPopupOpen"
    class="fixed inset-0 z-50 bg-gray-900/20 backdrop-blur-sm dark:bg-gray-900/50 md:hidden"
    @click.self="closePopup"
  >
    <div
      class="fixed top-5 right-5 left-5 rounded-lg bg-bg-base p-6 shadow-lg dark:bg-gray-800 sm:left-auto sm:w-full sm:max-w-xs"
    >
      <div
        class="absolute top-5 right-5 h-6 w-6 cursor-pointer text-gray-500 i-heroicons-outline-x hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
        @click="closePopup"
      ></div>
      <ul class="space-y-6">
        <li>
          <RouterLink
            class="mr-6 font-medium hover:text-orange-600"
            active-class="text-orange-600"
            :to="{ name: 'codec' }"
          >
            Codec
          </RouterLink>
        </li>
        <li>
          <RouterLink
            class="font-medium hover:text-orange-600"
            exact-active-class="text-orange-600"
            :to="{ name: 'about' }"
          >
            About
          </RouterLink>
        </li>
        <li>
          <a
            class="cursor-pointer font-medium hover:text-orange-600"
            href="https://github.com/JensDll/image-data-hiding"
          >
            GitHub
          </a>
        </li>
      </ul>
      <div
        class="mt-5 flex items-center justify-between border-t border-border-form-base pt-5"
      >
        <label class="m-0" for="theme">Switch theme</label>
        <select
          id="theme"
          v-model="theme"
          class="dark:border-gray-600 dark:bg-gray-700"
        >
          <option v-for="{ name, text } in themes" :key="name" :value="name">
            {{ text }}
          </option>
        </select>
      </div>
    </div>
  </nav>
</template>
