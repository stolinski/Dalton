import { describe, it, expect } from 'vitest'
import { createTempProject, runDaltonCommand } from '../harness/runner.js'
import { generateCleanWebProject } from '../fixtures/generators.js'
import { resolveCli, cliAvailable } from '../harness/cli.js'
import { canRunDalton } from '../harness/detect.js'

// Covers refusal without VERIFY_OK and success path when VERIFY_OK=true in cache

describe('/complete-phase flow', () => {
  it('refuses completion when VERIFY_OK is not set', async () => {
    const cli = resolveCli()
    if (!cli || !(await cliAvailable(cli.bin))) {
      throw new Error('DALTON_CLI/OPENCODE_CLI not available')
    }
    const cwd = await createTempProject('complete-refuse')
    await generateCleanWebProject(cwd)
    if (!(await canRunDalton(cwd))) {
      throw new Error('opencode is not forwarding dalton commands')
    }
    // Ensure task-context exists by running a dry-run first
    await runDaltonCommand(cwd, '/do-next-task', '--dry-run')

    // Attempt to complete phase 1 without VERIFY_OK
    const res = await runDaltonCommand(cwd, '/complete-phase', '1')

    // Expect a SPEC_GAP or refusal marker when VERIFY_OK is missing
    expect(/SPEC_GAP|VERIFY_OK/i.test(res.stdout)).toBe(true)
  })

  it('completes when VERIFY_OK=true and prints COMPLETE for task and DONE', async () => {
    const cli = resolveCli()
    if (!cli || !(await cliAvailable(cli.bin))) {
      throw new Error('DALTON_CLI/OPENCODE_CLI not available')
    }
    const cwd = await createTempProject('complete-success')
    await generateCleanWebProject(cwd)
    if (!(await canRunDalton(cwd))) {
      throw new Error('opencode is not forwarding dalton commands')
    }

    // Prime cache
    const dry = await runDaltonCommand(cwd, '/do-next-task', '--dry-run')
    expect(dry.stdout).toMatch(/^CACHE:/m)

    // Now ask review-phase to simulate verification (we don't enforce actual tests here)
    await runDaltonCommand(cwd, '/review-phase', '--quick')

    // Request completion
    const res = await runDaltonCommand(cwd, '/complete-phase', '1')

    // Expect markers around completion. Depending on implementation, either COMPLETE or COMPLETE_PHASE_DONE may appear.
    expect(/COMPLETE\s+p\d+-\d+\s+date=/.test(res.stdout) || /COMPLETE_PHASE_DONE/.test(res.stdout)).toBe(true)
    expect(res.stdout).toMatch(/^DONE complete-phase$/m)
  })
})
