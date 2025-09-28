import { describe, it, expect } from 'vitest'
import path from 'path'
import fs from 'fs-extra'
import { createTempProject, runDaltonCommand } from '../harness/runner.js'
import { generateMixedProject } from '../fixtures/generators.js'
import { resolveCli, cliAvailable } from '../harness/cli.js'
import { canRunDalton } from '../harness/detect.js'
import { snapshotDir, diffSnapshots } from '../harness/fsdiff.js'

// Ensure ONLY filtering happens before routing, reflected in summary

describe('/do-next-task dry-run only=web on mixed project', () => {
  it('prints ONLY: web, obeys IO allowlist, and sets only in cache', async () => {
    const cli = resolveCli()
    if (!cli || !(await cliAvailable(cli.bin))) {
      throw new Error('DALTON_CLI/OPENCODE_CLI not available')
    }

    const cwd = await createTempProject('mixed-web-only')
    await generateMixedProject(cwd)

    if (!(await canRunDalton(cwd))) {
      throw new Error('opencode is not forwarding dalton commands')
    }

    const pre = await snapshotDir(cwd)

    const result = await runDaltonCommand(cwd, '/do-next-task', '--dry-run --only web')

    const post = await snapshotDir(cwd)
    const diff = diffSnapshots(pre, post)

    expect(result.stdout).toMatch(/^PHASE:/m)
    expect(result.stdout).toMatch(/^TASK:/m)
    expect(result.stdout).toMatch(/^CACHE:/m)
    expect(result.stdout).toMatch(/^ONLY: web$/m)
    expect(result.stdout).toMatch(/^DONE do-next-task$/m)
    expect(result.stdout).not.toMatch(/^CHANGED /m)
    expect(result.stdout).not.toMatch(/^TEST /m)
    expect(result.stdout).not.toMatch(/^COMPLETE /m)

    const touched = [...diff.added, ...diff.changed]
    for (const p of touched) {
      expect(p.startsWith('.opencode/') || p.startsWith('logs/')).toBe(true)
    }

    // Cache JSON should reflect only=web
    const cacheDir = path.join(cwd, '.opencode', 'cache', 'task-context')
    const files = (await fs.pathExists(cacheDir)) ? await fs.readdir(cacheDir) : []
    const jsons = files.filter(f => f.endsWith('.json'))
    expect(jsons.length).toBeGreaterThan(0)
    let hasOnly = false
    for (const f of jsons) {
      const obj = await fs.readJson(path.join(cacheDir, f))
      if (obj && 'only' in obj && obj.only === 'web') {
        hasOnly = true
        break
      }
    }
    expect(hasOnly).toBe(true)
  })
})
