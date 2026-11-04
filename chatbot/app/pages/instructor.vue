<script setup lang="ts">
definePageMeta({
  layout: 'plain'
})

const { user, loggedIn } = useUserSession()

onMounted(() => {
  if (!loggedIn.value || !user.value) {
    navigateTo('/login')
  } else if (user.value.role !== 'instructor') {
    navigateTo('/')
  }
})

const toast = useToast()

function notifyDisabled(action: string) {
  toast.add({
    title: 'Feature Under Construction',
    description: `${action} is intentionally disabled. Course materials and tasks are managed via offline scripts and configuration files for the pilot study.`,
    color: 'neutral',
    icon: 'i-lucide-wrench'
  })
}
</script>

<template>
  <div class="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
    <!-- Header Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <UBadge label="Instructor Mode" color="warning" variant="subtle" size="sm" />
          <UBadge label="Research Pilot: Dec 8" color="neutral" variant="outline" size="sm" />
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-highlighted">
          Instructor Dashboard
        </h1>
        <p class="text-sm text-muted">
          Research management, RAG indexing controls, and student monitoring.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <UButton
          to="/instructions"
          icon="i-lucide-eye"
          label="Preview Student Experience"
          color="neutral"
          variant="outline"
          size="sm"
        />
      </div>
    </div>

    <!-- Management Controls Section (Buttons as requested) -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-highlighted flex items-center gap-2">
          <UIcon name="i-lucide-settings" class="size-4 text-primary" />
          Task & Knowledge Base Management
        </h2>
        <span class="text-xs text-muted">Direct CMS controls (placeholders for now)</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Button 1: Upload PDF -->
        <UCard class="hover:ring-primary/40 transition ring-1 ring-neutral-200 dark:ring-neutral-800 flex flex-col justify-between p-1">
          <div class="space-y-2 mb-4">
            <div class="p-2.5 rounded-xl bg-primary/10 text-primary w-fit">
              <UIcon name="i-lucide-file-up" class="size-5" />
            </div>
            <h3 class="font-semibold text-sm text-highlighted">Upload Slides & Course PDFs</h3>
            <p class="text-xs text-muted">
              Add new lecture notes or slide decks to be indexed into the Socratic RAG pipeline.
            </p>
          </div>
          <UButton
            block
            icon="i-lucide-upload"
            label="Upload New PDF"
            color="neutral"
            variant="subtle"
            @click="notifyDisabled('Uploading course PDFs')"
          />
        </UCard>

        <!-- Button 2: Create Task -->
        <UCard class="hover:ring-primary/40 transition ring-1 ring-neutral-200 dark:ring-neutral-800 flex flex-col justify-between p-1">
          <div class="space-y-2 mb-4">
            <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit">
              <UIcon name="i-lucide-code-2" class="size-5" />
            </div>
            <h3 class="font-semibold text-sm text-highlighted">Create New Programming Task</h3>
            <p class="text-xs text-muted">
              Configure missing C functions, problem description, starter boilerplate, and test cases.
            </p>
          </div>
          <UButton
            block
            icon="i-lucide-plus"
            label="Create New Task"
            color="neutral"
            variant="subtle"
            @click="notifyDisabled('Creating dynamic tasks')"
          />
        </UCard>

        <!-- Button 3: Sync RAG -->
        <UCard class="hover:ring-primary/40 transition ring-1 ring-neutral-200 dark:ring-neutral-800 flex flex-col justify-between p-1">
          <div class="space-y-2 mb-4">
            <div class="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 w-fit">
              <UIcon name="i-lucide-database" class="size-5" />
            </div>
            <h3 class="font-semibold text-sm text-highlighted">Sync Vector Embeddings</h3>
            <p class="text-xs text-muted">
              Re-generate chunk embeddings for course documents and update Turso vector store.
            </p>
          </div>
          <UButton
            block
            icon="i-lucide-refresh-cw"
            label="Re-index Knowledge Base"
            color="neutral"
            variant="subtle"
            @click="notifyDisabled('Re-indexing knowledge base')"
          />
        </UCard>
      </div>
    </div>

    <!-- Live Study Telemetry Placeholder -->
    <UCard class="ring-1 ring-neutral-200 dark:ring-neutral-800 space-y-4">
      <div class="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <h3 class="font-semibold text-sm text-highlighted flex items-center gap-2">
          <UIcon name="i-lucide-activity" class="size-4 text-emerald-500" />
          Active Study Session Overview (Dec 8 Pilot)
        </h3>
        <UBadge label="Waiting for Session" color="neutral" variant="subtle" size="xs" />
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div class="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div class="text-2xl font-bold font-mono text-highlighted">0</div>
          <div class="text-xs text-muted mt-1">Logged In Students</div>
        </div>
        <div class="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div class="text-2xl font-bold font-mono text-emerald-500">0</div>
          <div class="text-xs text-muted mt-1">Consents Signed</div>
        </div>
        <div class="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div class="text-2xl font-bold font-mono text-sky-500">0</div>
          <div class="text-xs text-muted mt-1">Active Chat Dialogues</div>
        </div>
        <div class="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div class="text-2xl font-bold font-mono text-purple-500">0</div>
          <div class="text-xs text-muted mt-1">Test Executions Logged</div>
        </div>
      </div>

      <div class="p-3 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/50 text-xs text-muted flex items-start gap-2">
        <UIcon name="i-lucide-info" class="size-4 text-primary shrink-0 mt-0.5" />
        <span>During the live session, real-time student transcripts, prompt rates, and test run outcomes will stream here for live monitoring and dataset export.</span>
      </div>
    </UCard>
  </div>
</template>
