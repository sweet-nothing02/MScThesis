<script setup lang="ts">
definePageMeta({
  layout: 'plain'
})

const { user, loggedIn } = useUserSession()

// Enforce auth & consent
onMounted(() => {
  if (!loggedIn.value || !user.value) {
    navigateTo('/login')
  } else if (user.value.role === 'student' && !user.value.consentGiven) {
    navigateTo('/consent')
  }
})

const isStarting = ref(false)

async function startTest() {
  isStarting.value = true
  // Navigate to the main chat workspace page
  await navigateTo('/')
}
</script>

<template>
  <div class="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-8">
    <!-- Breadcrumb / Status -->
    <div class="flex items-center justify-between text-xs text-muted border-b border-neutral-200 dark:border-neutral-800 pb-3">
      <div class="flex items-center gap-2">
        <span>Assessment</span>
        <UIcon name="i-lucide-chevron-right" class="size-3" />
        <span class="text-highlighted font-medium">Undergraduate C Programming Pilot</span>
      </div>
      <div v-if="user?.neptunCode" class="flex items-center gap-1.5">
        <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
        <span class="font-mono font-medium text-highlighted">{{ user.neptunCode }}</span>
      </div>
    </div>

    <!-- HackerRank-style Test Header Card -->
    <div class="p-6 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-900/90 ring-1 ring-neutral-800 shadow-xl space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <UIcon name="i-lucide-code-2" class="size-3.5" />
            C Programming Assessment
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Preparation & Practice Task
          </h1>
          <p class="text-sm text-neutral-400 mt-1">
            Fill-in C programming problem with real-time Socratic AI tutoring.
          </p>
        </div>

        <!-- Quick Stats -->
        <div class="flex items-center gap-4 bg-neutral-800/80 px-4 py-3 rounded-xl border border-neutral-700/60 self-start sm:self-auto">
          <div class="text-center">
            <div class="text-xs uppercase tracking-wider text-neutral-400">Duration</div>
            <div class="text-lg font-bold font-mono text-emerald-400 flex items-center gap-1 justify-center">
              <UIcon name="i-lucide-clock" class="size-4" />
              60 min
            </div>
          </div>
          <div class="w-px h-8 bg-neutral-700" />
          <div class="text-center">
            <div class="text-xs uppercase tracking-wider text-neutral-400">Questions</div>
            <div class="text-lg font-bold font-mono text-white">1 Task</div>
          </div>
          <div class="w-px h-8 bg-neutral-700" />
          <div class="text-center">
            <div class="text-xs uppercase tracking-wider text-neutral-400">AI Tutor</div>
            <div class="text-lg font-bold text-sky-400">Active</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions & Rules -->
    <UCard class="shadow-md ring-1 ring-neutral-200 dark:ring-neutral-800 space-y-6">
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <h2 class="text-lg font-bold text-highlighted flex items-center gap-2">
            <UIcon name="i-lucide-file-text" class="size-5 text-primary" />
            Test Instructions & Environment
          </h2>
          <UBadge label="Instructions will be added later" color="neutral" variant="subtle" size="xs" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Box 1: Task Format -->
          <div class="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div class="font-semibold text-sm text-highlighted flex items-center gap-2">
              <UIcon name="i-lucide-terminal" class="size-4 text-emerald-500" />
              Task Format
            </div>
            <p class="text-xs text-muted leading-relaxed">
              You will be provided starter C code with missing implementations. Fill in the required functions according to the problem specification.
            </p>
          </div>

          <!-- Box 2: Socratic AI Guidance -->
          <div class="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div class="font-semibold text-sm text-highlighted flex items-center gap-2">
              <UIcon name="i-lucide-sparkles" class="size-4 text-sky-500" />
              Socratic AI Assistant
            </div>
            <p class="text-xs text-muted leading-relaxed">
              Use the AI tutor to clarify C concepts, debug compiler errors, and receive guided reasoning hints without spoiling the direct solution.
            </p>
          </div>

          <!-- Box 3: Test Execution -->
          <div class="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div class="font-semibold text-sm text-highlighted flex items-center gap-2">
              <UIcon name="i-lucide-play-circle" class="size-4 text-amber-500" />
              Run Unit Tests
            </div>
            <p class="text-xs text-muted leading-relaxed">
              Click "Run Tests" anytime during the 60 minutes to compile your code against unit test cases and view compiler diagnostics.
            </p>
          </div>

          <!-- Box 4: Submission & Timing -->
          <div class="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div class="font-semibold text-sm text-highlighted flex items-center gap-2">
              <UIcon name="i-lucide-timer" class="size-4 text-purple-500" />
              60-Minute Countdown
            </div>
            <p class="text-xs text-muted leading-relaxed">
              The 60-minute countdown begins once you click <strong>Start Test</strong>. Your progress is automatically saved throughout.
            </p>
          </div>
        </div>

        <!-- Readiness Checklist -->
        <div class="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 space-y-2.5">
          <div class="text-xs font-bold uppercase tracking-wider text-muted">Readiness Check</div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <UIcon name="i-lucide-check-circle-2" class="size-4 shrink-0" />
              <span>Consent Verified</span>
            </div>
            <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <UIcon name="i-lucide-check-circle-2" class="size-4 shrink-0" />
              <span>Socratic Engine Ready</span>
            </div>
            <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <UIcon name="i-lucide-check-circle-2" class="size-4 shrink-0" />
              <span>C Test Runner Ready</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Start Test Button Footer -->
      <div class="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-xs text-muted text-center sm:text-left">
          Make sure you are in a quiet environment and ready to code before beginning.
        </div>

        <UButton
          size="xl"
          color="success"
          :loading="isStarting"
          icon="i-lucide-play"
          class="w-full sm:w-auto px-10 font-bold tracking-wide shadow-lg cursor-pointer"
          @click="startTest"
        >
          Start Test
        </UButton>
      </div>
    </UCard>
  </div>
</template>
