<script setup lang="ts">
definePageMeta({
  layout: 'plain'
})

const { user, loggedIn, fetch: refreshSession } = useUserSession()
const { csrf, headerName } = useCsrf()

const loading = ref(false)
const error = ref('')

// If user already gave consent or is instructor, redirect
onMounted(() => {
  if (loggedIn.value && user.value) {
    if (user.value.role === 'instructor') {
      navigateTo('/instructor')
    } else if (user.value.consentGiven) {
      navigateTo('/instructions')
    }
  } else if (!loggedIn.value) {
    navigateTo('/login')
  }
})

async function acceptConsent() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/consent', {
      method: 'POST',
      headers: { [headerName]: csrf }
    })

    await refreshSession()
    await navigateTo('/instructions')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to submit consent. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8">
    <!-- Header -->
    <div class="space-y-3 text-center sm:text-left">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
        <UIcon name="i-lucide-shield-check" class="size-4" />
        Research Ethics & GDPR Consent Gate
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-highlighted">
        Participant Information & Consent Form
      </h1>
      <p class="text-sm text-muted">
        Study: <span class="font-medium text-highlighted">Grading the Grader: Can a RAG-Based Socratic AI Validly Measure What Students Understand?</span>
      </p>
      <div v-if="user?.neptunCode" class="pt-1">
        <span class="text-xs text-muted">Participant ID (Neptun):</span>
        <span class="ms-2 px-2 py-0.5 rounded font-mono text-xs font-semibold bg-neutral-200 dark:bg-neutral-800 text-highlighted">
          {{ user.neptunCode }}
        </span>
      </div>
    </div>

    <!-- Main Consent Content Card -->
    <UCard class="shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-800 space-y-6">
      <div class="space-y-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        <!-- Section 1: Research Purpose -->
        <div class="space-y-1.5">
          <h2 class="text-sm font-bold uppercase tracking-wider text-highlighted flex items-center gap-2">
            <UIcon name="i-lucide-book-open" class="size-4 text-primary" />
            1. Purpose of the Research
          </h2>
          <p>
            You are being invited to take part in an MSc research study investigating the evaluation of student conceptual understanding through Socratic AI dialogue in an undergraduate C programming context. The primary goal is to examine how accurately and fairly automated Socratic guidance measures programming comprehension.
          </p>
        </div>

        <!-- Section 2: What Participation Involves -->
        <div class="space-y-1.5">
          <h2 class="text-sm font-bold uppercase tracking-wider text-highlighted flex items-center gap-2">
            <UIcon name="i-lucide-clock" class="size-4 text-primary" />
            2. Study Procedure
          </h2>
          <p>
            You will complete a 60-minute C programming task in a split-screen workspace with access to a course-grounded Socratic AI assistant and a code editor. You may converse with the assistant, edit code, and execute automated unit tests.
          </p>
        </div>

        <!-- Section 3: Data Handling & Privacy (GDPR) -->
        <div class="space-y-1.5">
          <h2 class="text-sm font-bold uppercase tracking-wider text-highlighted flex items-center gap-2">
            <UIcon name="i-lucide-lock" class="size-4 text-primary" />
            3. Data Handling & Pseudonymization (GDPR)
          </h2>
          <ul class="list-disc list-inside space-y-1 pl-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
            <li><strong>Collected Data:</strong> Chat dialogue transcripts, timestamps, code snapshots, and unit test execution outcomes.</li>
            <li><strong>Pseudonymization:</strong> All data is pseudonymized using a cryptographic hash. Your direct identity is separated from the dialogue logs.</li>
            <li><strong>Confidentiality:</strong> Data will be securely stored and used strictly for academic research and publication in aggregated form.</li>
            <li><strong>Voluntary Participation:</strong> Participation is completely voluntary. You may withdraw at any time without negative consequences for your course grade or university standing.</li>
          </ul>
        </div>
      </div>

      <!-- Error notice if any -->
      <div v-if="error" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
        <UIcon name="i-lucide-alert-circle" class="size-4 shrink-0" />
        <span>{{ error }}</span>
      </div>

      <!-- Action Area: Single Accept Button -->
      <div class="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-xs text-muted text-center sm:text-left">
          By clicking <strong>"Accept & Continue"</strong>, you confirm you have read this information and consent to participate.
        </div>

        <UButton
          size="xl"
          color="primary"
          :loading="loading"
          icon="i-lucide-check-circle"
          class="w-full sm:w-auto px-8 font-semibold shadow-md"
          @click="acceptConsent"
        >
          Accept & Continue
        </UButton>
      </div>
    </UCard>
  </div>
</template>
