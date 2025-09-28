import { describe, it, expect } from 'vitest'
import { createTempProject, runDaltonCommand } from '../harness/runner.js'
import { generateMissingPlanning } from '../fixtures/generators.js'
import { resolveCli, cliAvailable } from '../harness/cli.js'
import { canRunDalton } from '../harness/detect.js'

// Expect SPEC_GAP missing Dalton project structure when planning/roadmap.md is absent

describe('/do-next-task on missing planning structure', () => {
  it('emits SPEC_GAP for missing project structure', async () => {
    const cli = resolveCli()
    if (!cli || !(await cliAvailable(cli.bin))) {
      throw new Error('DALTON_CLI/OPENCODE_CLI not available')
    }

    const cwd = await createTempProject('missing-planning')
    await generateMissingPlanning(cwd)

    if (!(await canRunDalton(cwd))) {
      throw new Error('opencode is not forwarding dalton commands')
    }

    const result = await runDaltonCommand(cwd, '/do-next-task', '--dry-run')

    expect(result.stdout).toMatch(/SPEC_GAP\s+missing Dalton project structure/i)
  })
})
