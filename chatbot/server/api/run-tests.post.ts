import { z } from 'zod'
import { db, schema } from 'hub:db'

const runSchema = z.object({
  code: z.string(),
  chatId: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user || !session.user.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized. Please log in first.' })
  }

  const { code, chatId } = await readValidatedBody(event, runSchema.parse)

  // 1. Hidden Test Suite Harness (wraps student's solution)
  const fullCode = `
#include <stdio.h>
#include <stdlib.h>

// --- Student implementation begins ---
${code}
// --- Student implementation ends ---

int main() {
    int cap = 2, size = 0;
    int* buf = (int*)malloc(cap * sizeof(int));
    if (!buf) { 
        printf("TEST_ERROR: Initial allocation failed\\n"); 
        return 1; 
    }

    // Test 1: Append within capacity
    buf = append_and_ensure_capacity(buf, &size, &cap, 10);
    if (buf && size == 1 && cap == 2 && buf[0] == 10) {
        printf("TEST_1:PASS\\n");
    } else {
        printf("TEST_1:FAIL (Expected size=1 cap=2, got size=%d cap=%d)\\n", size, cap);
    }

    // Test 2: Append reaching initial capacity
    buf = append_and_ensure_capacity(buf, &size, &cap, 20);
    if (buf && size == 2 && cap == 2 && buf[1] == 20) {
        printf("TEST_2:PASS\\n");
    } else {
        printf("TEST_2:FAIL (Expected size=2 cap=2, got size=%d cap=%d)\\n", size, cap);
    }

    // Test 3: Append triggering doubling reallocation
    buf = append_and_ensure_capacity(buf, &size, &cap, 30);
    if (buf && size == 3 && cap == 4 && buf[0] == 10 && buf[1] == 20 && buf[2] == 30) {
        printf("TEST_3:PASS\\n");
    } else {
        printf("TEST_3:FAIL (Expected size=3 cap=4, got size=%d cap=%d)\\n", size, cap);
    }

    free(buf);
    return 0;
}
`

  // 2. Call Judge0 CE API with base64 encoding (prevents UTF-8 400 errors from GCC compiler characters)
  try {
    const encodedSource = Buffer.from(fullCode, 'utf-8').toString('base64')

    const response: any = await $fetch('https://ce.judge0.com/submissions?base64_encoded=true&wait=true', {
      method: 'POST',
      body: {
        source_code: encodedSource,
        language_id: 50
      }
    })

    const decodeB64 = (val?: string | null) => {
      if (!val) return ''
      try {
        return Buffer.from(val, 'base64').toString('utf-8')
      } catch {
        return val
      }
    }

    const stdout = decodeB64(response.stdout)
    const stderr = decodeB64(response.stderr)
    const compileOutput = decodeB64(response.compile_output)
    const fullCompilerOutput = compileOutput || stderr || (response.status?.description ? `Status: ${response.status.description}` : '')

    // Judge0 Status ID 3 = Accepted, ID 6 = Compilation Error
    const isCompiled = response.status?.id === 3
    const compileSuccess = isCompiled && !compileOutput

    // 3. Parse Test Assertions
    const tests = [
      {
        id: 1,
        name: 'Append within capacity',
        passed: stdout.includes('TEST_1:PASS'),
        detail: stdout.includes('TEST_1:PASS') ? 'Passed' : stdout.split('\n').find(l => l.startsWith('TEST_1:FAIL')) || 'Failed'
      },
      {
        id: 2,
        name: 'Fill initial capacity',
        passed: stdout.includes('TEST_2:PASS'),
        detail: stdout.includes('TEST_2:PASS') ? 'Passed' : stdout.split('\n').find(l => l.startsWith('TEST_2:FAIL')) || 'Failed'
      },
      {
        id: 3,
        name: 'Reallocate and double capacity',
        passed: stdout.includes('TEST_3:PASS'),
        detail: stdout.includes('TEST_3:PASS') ? 'Passed' : stdout.split('\n').find(l => l.startsWith('TEST_3:FAIL')) || 'Failed'
      }
    ]

    const testsPassed = tests.filter(t => t.passed).length

    // 4. Log to Telemetry DB (test_runs table)
    try {
      await db.insert(schema.testRuns).values({
        userId: session.user.id,
        chatId: chatId || null,
        code,
        compileSuccess,
        compilerOutput: fullCompilerOutput || 'Compilation successful.',
        testsPassed,
        testsTotal: tests.length,
        testDetails: JSON.stringify(tests)
      })
    } catch (dbErr) {
      console.error('Failed to log test run telemetry:', dbErr)
    }

    return {
      compileSuccess,
      compilerOutput: fullCompilerOutput || 'Compilation successful (exit code 0).',
      testsPassed,
      testsTotal: tests.length,
      tests,
      status: response.status?.description || 'Executed'
    }
  } catch (err: any) {
    console.error('Judge0 API execution error:', err?.data || err?.message || err)
    throw createError({
      statusCode: 502,
      statusMessage: err?.data?.error || err?.message || 'Code execution service unreachable'
    })
  }
})
