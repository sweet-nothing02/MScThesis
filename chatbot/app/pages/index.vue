<script setup lang="ts">
import { useChat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import { Codemirror } from 'vue-codemirror'
import { cpp } from '@codemirror/lang-cpp'
import { oneDark } from '@codemirror/theme-one-dark'

definePageMeta({
  layout: 'plain'
})

const { user, loggedIn } = useUserSession()
const { csrf, headerName } = useCsrf()
const toast = useToast()

// Enforce auth & consent
onMounted(() => {
  if (!loggedIn.value || !user.value) {
    navigateTo('/login')
  } else if (user.value.role === 'student' && !user.value.consentGiven) {
    navigateTo('/consent')
  }
})

// ---------------------------------------------------------
// 1. 60-Minute Countdown Timer
// ---------------------------------------------------------
const timeRemaining = ref(60 * 60)
let timerInterval: any = null

onMounted(() => {
  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      clearInterval(timerInterval)
      toast.add({
        title: 'Time Expired',
        description: 'Your 60-minute assessment window has ended.',
        color: 'warning'
      })
    }
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const formattedTime = computed(() => {
  const m = Math.floor(timeRemaining.value / 60)
  const s = timeRemaining.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

// ---------------------------------------------------------
// 2. Task Details & Code State
// ---------------------------------------------------------
const task = ref({
  title: 'Dynamically Resizing Array Buffer',
  difficulty: 'Medium',
  timeLimit: '60 mins',
  functionSignature: 'int* append_and_ensure_capacity(int* buffer, int* size, int* capacity, int value)',
  description: `Implement dynamic memory reallocation for an integer array in C.
When the current *size reaches *capacity, double the capacity using realloc(), update *capacity, insert value, and increment *size.`,
  constraints: [
    'Memory must be checked for allocation failure (NULL check)',
    'Existing elements must remain intact after reallocation',
    'Capacity doubles when full (cap = cap * 2)'
  ],
  sampleInput: 'Initial: capacity = 2, size = 2, elements = [10, 20]\nAppend: 30',
  sampleOutput: 'New capacity = 4, size = 3, elements = [10, 20, 30]'
})

const starterCode = `#include <stdio.h>
#include <stdlib.h>

/**
 * Appends 'value' to 'buffer'. If size == capacity, doubles the capacity.
 * 
 * @param buffer Pointer to dynamically allocated array
 * @param size Pointer to current number of elements
 * @param capacity Pointer to allocated buffer capacity
 * @param value The integer to append
 * @return Pointer to the buffer, or NULL on failure
 */
int* append_and_ensure_capacity(int* buffer, int* size, int* capacity, int value) {
    // TODO: Write your implementation here
    
    return buffer;
}
`

const code = ref(starterCode)
const cmExtensions = [cpp(), oneDark]

// ---------------------------------------------------------
// 3. Judge0 Test Execution & Telemetry
// ---------------------------------------------------------
const isRunningTests = ref(false)
const activeConsoleTab = ref<'testcases' | 'compiler'>('testcases')
const testResults = ref<any[]>([])
const compilerOutput = ref('Click "Run Tests" to compile and run your code against unit tests.')

async function runTests() {
  isRunningTests.value = true
  compilerOutput.value = 'Compiling via GCC...'
  
  try {
    const res: any = await $fetch('/api/run-tests', {
      method: 'POST',
      headers: { [headerName]: csrf },
      body: {
        code: code.value,
        chatId: chatId.value
      }
    })

    testResults.value = res.tests
    compilerOutput.value = res.compilerOutput
    
    if (res.compileSuccess) {
      toast.add({
        title: `Tests Executed (${res.testsPassed}/${res.testsTotal} Passed)`,
        color: res.testsPassed === res.testsTotal ? 'success' : 'warning'
      })
    } else {
      activeConsoleTab.value = 'compiler'
      toast.add({
        title: 'Compilation Error',
        description: 'See compiler output tab below.',
        color: 'error'
      })
    }
  } catch (err: any) {
    toast.add({
      title: 'Execution Failed',
      description: err?.data?.statusMessage || 'Service error',
      color: 'error'
    })
  } finally {
    isRunningTests.value = false
  }
}

// ---------------------------------------------------------
// 4. Socratic AI Chat with MessageContent & Streaming Animations
// ---------------------------------------------------------
const activeLeftTab = ref<'problem' | 'tutor'>('problem')
const chatId = ref(`exam-${user.value?.username || 'session'}`)

const { messages, status, sendMessage } = useChat({
  id: chatId.value,
  initialMessages: [
    {
      id: 'welcome',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: `Hello! I am your Socratic tutor for this task. I won't provide direct code solutions, but you can ask me to clarify pointer dereferencing, \`realloc()\` edge cases, or compiler diagnostics.`
        }
      ]
    }
  ],
  transport: new DefaultChatTransport({
    api: `/api/chats/${chatId.value}`,
    headers: { [headerName]: csrf }
  })
})

const chatInput = ref('')

function handleSendMessage() {
  if (!chatInput.value.trim() || status.value === 'streaming') return
  sendMessage({
    role: 'user',
    parts: [{ type: 'text', text: chatInput.value }]
  })
  chatInput.value = ''
}
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-neutral-950 text-neutral-100 font-sans overflow-hidden">
    <!-- 1. HackerRank Top Bar -->
    <header class="h-12 border-b border-neutral-800 bg-neutral-900/90 px-4 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 font-mono font-bold text-sm text-emerald-400">
          <UIcon name="i-lucide-code-2" class="size-4" />
          <span>MSc C Assessment</span>
        </div>
        <span class="text-neutral-600">/</span>
        <span class="text-xs text-neutral-300 font-medium truncate max-w-xs">{{ task.title }}</span>
      </div>

      <!-- Center Timer -->
      <div class="flex items-center gap-2 px-3 py-1 rounded bg-neutral-950 border border-neutral-800 font-mono text-xs">
        <UIcon name="i-lucide-clock" :class="timeRemaining < 600 ? 'text-rose-400 animate-pulse' : 'text-neutral-400'" class="size-3.5" />
        <span :class="timeRemaining < 600 ? 'text-rose-400 font-bold' : 'text-neutral-200'">{{ formattedTime }}</span>
      </div>

      <!-- Right Student Badge -->
      <div class="flex items-center gap-3">
        <span v-if="user?.neptunCode" class="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
          {{ user.neptunCode }}
        </span>
        <UButton size="xs" color="neutral" variant="outline" label="Instructions" to="/instructions" />
      </div>
    </header>

    <!-- 2. Dual-Pane Workspace -->
    <div class="flex-1 flex overflow-hidden">
      <!-- LEFT PANE: Problem Statement & Socratic Tutor -->
      <div class="w-1/2 flex flex-col border-r border-neutral-800 bg-neutral-900/50">
        <!-- Tabs -->
        <div class="flex border-b border-neutral-800 bg-neutral-900 px-2 shrink-0">
          <button
            class="px-4 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-2"
            :class="activeLeftTab === 'problem' ? 'border-emerald-500 text-emerald-400 bg-neutral-800/40' : 'border-transparent text-neutral-400 hover:text-neutral-200'"
            @click="activeLeftTab = 'problem'"
          >
            <UIcon name="i-lucide-file-text" class="size-3.5" />
            Problem Description
          </button>
          <button
            class="px-4 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-2"
            :class="activeLeftTab === 'tutor' ? 'border-emerald-500 text-emerald-400 bg-neutral-800/40' : 'border-transparent text-neutral-400 hover:text-neutral-200'"
            @click="activeLeftTab = 'tutor'"
          >
            <UIcon name="i-lucide-sparkles" class="size-3.5 text-amber-400" />
            Socratic AI Tutor
            <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>

        <!-- Problem Tab Content -->
        <div v-show="activeLeftTab === 'problem'" class="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-neutral-300 leading-relaxed">
          <div>
            <h2 class="text-xl font-bold text-white mb-2">{{ task.title }}</h2>
            <div class="flex items-center gap-2 text-xs text-neutral-400">
              <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">{{ task.difficulty }}</span>
              <span>Time: {{ task.timeLimit }}</span>
            </div>
          </div>
          <p>{{ task.description }}</p>
          <h3 class="text-white font-semibold text-xs tracking-wider uppercase text-neutral-400">Signature</h3>
          <pre class="bg-neutral-950 border border-neutral-800 p-3 rounded text-xs font-mono text-emerald-400">{{ task.functionSignature }}</pre>
          <h3 class="text-white font-semibold text-xs tracking-wider uppercase text-neutral-400">Constraints</h3>
          <ul class="list-disc pl-5 space-y-1 text-xs">
            <li v-for="(c, i) in task.constraints" :key="i">{{ c }}</li>
          </ul>
        </div>

        <!-- Socratic Tutor Tab Content (with thinking & markdown preserved) -->
        <div v-show="activeLeftTab === 'tutor'" class="flex-1 flex flex-col h-full overflow-hidden bg-neutral-950">
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <div v-for="m in messages" :key="m.id" class="flex flex-col gap-1">
              <div class="text-[10px] font-semibold tracking-wide uppercase" :class="m.role === 'user' ? 'text-emerald-400 text-right' : 'text-neutral-500'">
                {{ m.role === 'user' ? 'You' : 'Socratic Tutor' }}
              </div>
              <div :class="m.role === 'user' ? 'bg-neutral-900 border border-neutral-800 p-3 rounded-lg text-xs' : 'bg-neutral-950 text-xs'">
                <!-- Uses existing template component to preserve thinking and syntax highlighting -->
                <ChatMessageContent :message="m" />
              </div>
            </div>
            <ChatIndicator v-if="status === 'streaming'" />
          </div>

          <!-- Chat Input -->
          <div class="p-3 border-t border-neutral-800 bg-neutral-900 shrink-0">
            <div class="flex gap-2">
              <UInput
                v-model="chatInput"
                placeholder="Ask about pointer logic, realloc, or compiler errors..."
                class="flex-1"
                size="sm"
                @keydown.enter.prevent="handleSendMessage"
              />
              <UButton icon="i-lucide-send" color="primary" size="sm" :loading="status === 'streaming'" @click="handleSendMessage" />
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANE: CodeMirror Editor & Test Console -->
      <div class="w-1/2 flex flex-col bg-neutral-950">
        <!-- Editor Bar -->
        <div class="h-9 border-b border-neutral-800 bg-neutral-900 px-4 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <UIcon name="i-lucide-file-code" class="size-3.5 text-emerald-400" />
            <span>solution.c</span>
          </div>
          <span class="text-[11px] text-neutral-500 font-mono">GCC 9.2.0</span>
        </div>

        <!-- CodeMirror Editor Area -->
        <div class="flex-1 relative overflow-auto bg-neutral-950 text-xs">
          <ClientOnly>
            <Codemirror
              v-model="code"
              placeholder="Write your C solution here..."
              :style="{ height: '100%', fontSize: '13px' }"
              :autofocus="true"
              :indent-with-tab="true"
              :tab-size="4"
              :extensions="cmExtensions"
            />
          </ClientOnly>
        </div>

        <!-- BOTTOM CONSOLE: Test Cases & Compiler Output -->
        <div class="h-64 border-t border-neutral-800 bg-neutral-900 flex flex-col shrink-0">
          <div class="h-9 border-b border-neutral-800 px-3 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2">
              <button
                class="px-2.5 py-1 text-xs font-medium rounded transition-colors"
                :class="activeConsoleTab === 'testcases' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'"
                @click="activeConsoleTab = 'testcases'"
              >
                Test Cases ({{ testResults.filter(t => t.passed).length }}/{{ testResults.length }})
              </button>
              <button
                class="px-2.5 py-1 text-xs font-medium rounded transition-colors"
                :class="activeConsoleTab === 'compiler' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'"
                @click="activeConsoleTab = 'compiler'"
              >
                Compiler Output
              </button>
            </div>

            <!-- Run Tests Button -->
            <UButton
              size="xs"
              color="primary"
              icon="i-lucide-play"
              label="Run Tests"
              :loading="isRunningTests"
              @click="runTests"
            />
          </div>

          <!-- Console Views -->
          <div class="flex-1 overflow-y-auto p-4 font-mono text-xs">
            <div v-show="activeConsoleTab === 'testcases'" class="space-y-2">
              <div v-if="testResults.length === 0" class="text-neutral-500 italic">
                Click "Run Tests" to execute unit tests.
              </div>
              <div
                v-for="test in testResults"
                :key="test.id"
                class="p-2.5 rounded border flex items-start justify-between"
                :class="test.passed ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-rose-950/20 border-rose-800/40 text-rose-300'"
              >
                <div>
                  <div class="flex items-center gap-2 font-semibold">
                    <UIcon :name="test.passed ? 'i-lucide-check' : 'i-lucide-x'" class="size-3.5" />
                    <span>Test {{ test.id }}: {{ test.name }}</span>
                  </div>
                  <div v-if="!test.passed" class="text-[11px] text-rose-400 mt-1">{{ test.detail }}</div>
                </div>
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" :class="test.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'">
                  {{ test.passed ? 'Passed' : 'Failed' }}
                </span>
              </div>
            </div>

            <div v-show="activeConsoleTab === 'compiler'">
              <pre class="text-neutral-300 leading-relaxed whitespace-pre-wrap">{{ compilerOutput }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>