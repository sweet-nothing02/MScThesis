<script setup lang="ts">
const { user, loggedIn, clear } = useUserSession()
const colorMode = useColorMode()

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

async function logout() {
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
    <!-- Clean Minimalist Header -->
    <header class="border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Logo class="h-7 w-auto shrink-0" />
          <div class="flex flex-col">
            <span class="text-sm font-bold tracking-tight text-highlighted flex items-center gap-2">
              Socratic AI Study
              <UBadge
                v-if="user?.role === 'instructor'"
                label="Instructor"
                color="warning"
                variant="subtle"
                size="xs"
              />
              <UBadge
                v-else-if="user?.role === 'student'"
                :label="`Student: ${user?.neptunCode || user?.username}`"
                color="primary"
                variant="subtle"
                size="xs"
              />
            </span>
            <span class="text-xs text-muted hidden sm:inline">Undergraduate C Programming Assessment</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Dark/Light Theme Toggle -->
          <UButton
            :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="Toggle theme"
            @click="toggleColorMode"
          />

          <!-- Logout Button if logged in -->
          <UButton
            v-if="loggedIn"
            icon="i-lucide-log-out"
            label="Log out"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="logout"
          />
        </div>
      </div>
    </header>

    <!-- Page Content Slot -->
    <main class="flex-1 flex flex-col">
      <slot />
    </main>
  </div>
</template>
