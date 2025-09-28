import { describe, it, expect } from 'vitest'
import { createTempProject, runDaltonCommand } from '../harness/runner.js'
import { generateDirtyRoadmapProject } from '../fixtures/generators.js'
import { resolveCli, cliAvailable } from '../harness/cli.js'
import { canRunDalton } from '../harness/detect.js'
import { snapshotDir, diffSnapshots } from '../harness/fsdiff.js'

// Verify roadmap normalization only writes allowed files (planning/roadmap.md and logs/)

describe('/refresh-roadmap IO allowlist', () => {
  it('writes only planning/roadmap.md and logs/', async () => {
    const cli = resolveCli()
    if (!cli || !(await cliAvailable(cli.bin))) {
      throw new Error('DALTON_CLI/OPENCODE_CLI not available')
    }

    const cwd = await createTempProject('refresh-io')
    await generateDirtyRoadmapProject(cwd)
    if (!(await canRunDalton(cwd))) {
      throw new Error('opencode is not forwarding dalton commands')
    }

    const pre = await snapshotDir(cwd)
    const res = await runDaltonCommand(cwd, '/refresh-roadmap', '')
    const post = await snapshotDir(cwd)
    const diff = diffSnapshots(pre, post)

    expect(res.stdout).toMatch(/^NORMALIZED roadmap\.md$/m)
    const touched = [...diff.added, ...diff.changed]
    for (const p of touched) {
      expect(p === 'planning/roadmap.md' || p.startsWith('logs/')).toBe(true)
    }
    expect(diff.removed.length).toBe(0)
  })
})
