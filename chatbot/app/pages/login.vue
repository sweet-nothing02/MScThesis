<script setup lang="ts">
definePageMeta({
  layout: 'plain'
})

const { loggedIn, user, fetch: refreshSession } = useUserSession()
const { csrf, headerName } = useCsrf()

// If already logged in, redirect based on role
onMounted(() => {
  if (loggedIn.value && user.value) {
    if (user.value.role === 'instructor') {
      navigateTo('/instructor')
    } else if (user.value.role === 'student') {
      if (!user.value.consentGiven) {
        navigateTo('/consent')
      } else {
        navigateTo('/instructions')
      }
    }
  }
})

// Tab mode: 'student' or 'instructor'
const activeTab = ref<'student' | 'instructor'>('student')

// Student form
const neptunCode = ref('')
const studentLoading = ref(false)
const studentError = ref('')

// Instructor form
const instructorName = ref('Course Instructor')
const instructorLoading = ref(false)
const instructorError = ref('')

function handleNeptunInput(event: Event) {
  const target = event.target as HTMLInputElement
  neptunCode.value = target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  studentError.value = ''
}

async function loginAsStudent() {
  studentError.value = ''
  const trimmed = neptunCode.value.trim().toUpperCase()

  if (trimmed.length !== 6) {
    studentError.value = 'Neptun code must be exactly 6 alphanumeric characters (e.g. ABC123).'
    return
  }

  studentLoading.value = true
  try {
    const res = await $fetch<{ success: boolean, consentGiven: boolean }>('/api/auth/student-login', {
      method: 'POST',
      headers: { [headerName]: csrf },
      body: { neptunCode: trimmed }
    })

    await refreshSession()

    if (!res.consentGiven) {
      await navigateTo('/consent')
    } else {
      await navigateTo('/instructions')
    }
  } catch (err: any) {
    studentError.value = err?.data?.statusMessage || err?.data?.message || err?.message || 'Login failed. Please try again.'
  } finally {
    studentLoading.value = false
  }
}

async function loginAsInstructor() {
  instructorError.value = ''
  instructorLoading.value = true
  try {
    await $fetch<{ success: boolean }>('/api/auth/instructor-login', {
      method: 'POST',
      headers: { [headerName]: csrf },
      body: { name: instructorName.value.trim() || 'Course Instructor' }
    })

    await refreshSession()
    await navigateTo('/instructor')
  } catch (err: any) {
    instructorError.value = err?.data?.statusMessage || err?.data?.message || err?.message || 'Instructor login failed.'
  } finally {
    instructorLoading.value = false
  }
}
</script>

<template>
  <div class="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
    <div class="w-full max-w-md space-y-6">
      <!-- Title & Header -->
      <div class="text-center space-y-2">
        <div class="inline-flex p-3 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 mb-2">
          <UIcon name="i-lucide-graduation-cap" class="size-8" />
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-highlighted">
          Socratic AI Assessment
        </h1>
        <p class="text-sm text-muted">
          Undergraduate C Programming Research Study
        </p>
      </div>

      <!-- Mode Selector Tabs -->
      <div class="p-1 rounded-xl bg-neutral-200/80 dark:bg-neutral-800/80 grid grid-cols-2 gap-1">
        <button
          type="button"
          class="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all"
          :class="activeTab === 'student'
            ? 'bg-white dark:bg-neutral-900 text-highlighted shadow-sm'
            : 'text-muted hover:text-highlighted'"
          @click="activeTab = 'student'"
        >
          <UIcon name="i-lucide-user" class="size-4" />
          Student Login
        </button>
        <button
          type="button"
          class="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all"
          :class="activeTab === 'instructor'
            ? 'bg-white dark:bg-neutral-900 text-highlighted shadow-sm'
            : 'text-muted hover:text-highlighted'"
          @click="activeTab = 'instructor'"
        >
          <UIcon name="i-lucide-shield-check" class="size-4" />
          Instructor
        </button>
      </div>

      <!-- Main Card -->
      <UCard class="shadow-xl ring-1 ring-neutral-200 dark:ring-neutral-800">
        <!-- Student Login Panel -->
        <div v-if="activeTab === 'student'" class="space-y-5">
          <div>
            <h2 class="text-base font-semibold text-highlighted">
              Student Assessment Portal
            </h2>
            <p class="text-xs text-muted mt-0.5">
              Enter your Neptun code to access the study task and Socratic tutor.
            </p>
          </div>

          <form class="space-y-4" @submit.prevent="loginAsStudent">
            <div class="space-y-1.5">
              <label for="neptun-input" class="block text-xs font-semibold uppercase tracking-wider text-muted">
                Neptun Code
              </label>
              <div class="relative">
                <input
                  id="neptun-input"
                  :value="neptunCode"
                  type="text"
                  maxlength="6"
                  placeholder="ABC123"
                  class="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-highlighted font-mono text-center text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  :disabled="studentLoading"
                  autofocus
                  @input="handleNeptunInput"
                >
                <div class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted">
                  {{ neptunCode.length }}/6
                </div>
              </div>
            </div>

            <div v-if="studentError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <UIcon name="i-lucide-alert-circle" class="size-4 shrink-0" />
              <span>{{ studentError }}</span>
            </div>

            <UButton
              type="submit"
              block
              size="lg"
              color="primary"
              :loading="studentLoading"
              :disabled="neptunCode.length !== 6 || studentLoading"
              icon="i-lucide-arrow-right"
              trailing
            >
              Log in as Student
            </UButton>
          </form>

          <div class="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-muted flex items-start gap-2">
            <UIcon name="i-lucide-info" class="size-3.5 shrink-0 mt-0.5 text-primary" />
            <span>No password required for this research pilot. Your identity is pseudonymized in accordance with GDPR research guidelines.</span>
          </div>
        </div>

        <!-- Instructor Login Panel -->
        <div v-else class="space-y-5">
          <div>
            <h2 class="text-base font-semibold text-highlighted">
              Instructor Dashboard Portal
            </h2>
            <p class="text-xs text-muted mt-0.5">
              Access instructor dashboard, preview task, and monitor research sessions.
            </p>
          </div>

          <form class="space-y-4" @submit.prevent="loginAsInstructor">
            <div class="space-y-1.5">
              <label for="instructor-name" class="block text-xs font-semibold uppercase tracking-wider text-muted">
                Display Name
              </label>
              <input
                id="instructor-name"
                v-model="instructorName"
                type="text"
                placeholder="Course Instructor"
                class="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-highlighted text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                :disabled="instructorLoading"
              >
            </div>

            <div v-if="instructorError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <UIcon name="i-lucide-alert-circle" class="size-4 shrink-0" />
              <span>{{ instructorError }}</span>
            </div>

            <UButton
              type="submit"
              block
              size="lg"
              color="primary"
              :loading="instructorLoading"
              icon="i-lucide-shield-check"
            >
              Log in as Instructor
            </UButton>
          </form>

          <div class="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-muted flex items-start gap-2">
            <UIcon name="i-lucide-shield-alert" class="size-3.5 shrink-0 mt-0.5 text-amber-500" />
            <span>Instructor workspace allows viewing live transcripts, managing tasks, and exporting research data.</span>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
