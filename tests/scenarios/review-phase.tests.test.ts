import { describe, it, expect } from 'vitest'
import { createTempProject, runDaltonCommand } from '../harness/runner.js'
import { generateCleanWebProject } from '../fixtures/generators.js'
import { resolveCli, cliAvailable } from '../harness/cli.js'
import { canRunDalton } from '../harness/detect.js'

// review-phase is checks-first + static review (no git), with --quick to skip checks

describe('/review-phase command', () => {
  it('runs with --quick and prints DONE', async () => {
    const cli = resolveCli()
    if (!cli || !(await cliAvailable(cli.bin))) {
      throw new Error('DALTON_CLI/OPENCODE_CLI not available')
    }
    const cwd = await createTempProject('review-quick')
    await generateCleanWebProject(cwd)
    if (!(await canRunDalton(cwd))) {
      throw new Error('opencode is not forwarding dalton commands')
    }
    const res = await runDaltonCommand(cwd, '/review-phase', '--quick')
    expect(res.stdout).toMatch(/^ARGV /m)
    expect(res.stdout).toMatch(/^DONE review-phase$/m)
  })

  it('runs default (checks-first) and prints DONE', async () => {
    const cli = resolveCli()
    if (!cli || !(await cliAvailable(cli.bin))) {
      throw new Error('DALTON_CLI/OPENCODE_CLI not available')
    }
    const cwd = await createTempProject('review-default')
    await generateCleanWebProject(cwd)
    if (!(await canRunDalton(cwd))) {
      throw new Error('opencode is not forwarding dalton commands')
    }
    const res = await runDaltonCommand(cwd, '/review-phase', '')
    expect(res.stdout).toMatch(/^ARGV /m)
    expect(res.stdout).toMatch(/^DONE review-phase$/m)
  })
})
