import { describe, it, expect } from 'vitest'
import { createTempProject, runDaltonCommand } from '../harness/runner.js'
import { generateDirtyRoadmapProject } from '../fixtures/generators.js'
import { resolveCli, cliAvailable } from '../harness/cli.js'
import { canRunDalton } from '../harness/detect.js'

// Verifies roadmap_normalizer emits NORMALIZED and final DONE

describe('/refresh-roadmap normalization', () => {
  it('emits NORMALIZED roadmap.md then DONE', async () => {
    const cli = resolveCli()
    if (!cli || !(await cliAvailable(cli.bin))) {
      throw new Error('DALTON_CLI/OPENCODE_CLI not available')
    }

    const cwd = await createTempProject('refresh-roadmap')
    await generateDirtyRoadmapProject(cwd)

    if (!(await canRunDalton(cwd))) {
      throw new Error('opencode is not forwarding dalton commands')
    }

    const res = await runDaltonCommand(cwd, '/refresh-roadmap', '')

    expect(res.stdout).toMatch(/^ARGV /m)
    expect(res.stdout).toMatch(/^NORMALIZED roadmap\.md$/m)
    expect(res.stdout).toMatch(/^DONE refresh-roadmap$/m)
  })
})
