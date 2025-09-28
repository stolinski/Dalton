import { describe, it, expect } from 'vitest'
import { createTempProject, runDaltonCommand } from '../harness/runner.js'
import { generateMissingAcceptance } from '../fixtures/generators.js'
import { resolveCli, cliAvailable } from '../harness/cli.js'
import { canRunDalton } from '../harness/detect.js'

// Expect SPEC_GAP when Acceptance section is missing for selected task

describe('/do-next-task acceptance missing', () => {
  it('emits SPEC_GAP acceptance missing', async () => {
    const cli = resolveCli()
    if (!cli || !(await cliAvailable(cli.bin))) {
      throw new Error('DALTON_CLI/OPENCODE_CLI not available')
    }

    const cwd = await createTempProject('missing-acceptance')
    await generateMissingAcceptance(cwd)

    if (!(await canRunDalton(cwd))) {
      throw new Error('opencode is not forwarding dalton commands')
    }

    const result = await runDaltonCommand(cwd, '/do-next-task', '--dry-run')

    expect(result.stdout).toMatch(/SPEC_GAP\s+acceptance missing for p1-1/i)
  })
})
