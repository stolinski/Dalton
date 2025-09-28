import { describe, it, expect } from 'vitest'
import path from 'path'
import fs from 'fs-extra'
import { createTempProject, runDaltonCommand } from '../harness/runner.js'
import { generateServerOnlyProject, generateDataOnlyProject } from '../fixtures/generators.js'
import { resolveCli, cliAvailable } from '../harness/cli.js'
import { canRunDalton } from '../harness/detect.js'
import { snapshotDir, diffSnapshots } from '../harness/fsdiff.js'

// These tests rely on the CLI dry-run to build context/cache based on manifests.
// We assert via summary lines and that no impl/test markers appear in dry-run.

describe('/do-next-task dry-run routing', () => {
  it('respects only=server on server-only project', async () => {
    const cli = resolveCli()
    if (!cli || !(await cliAvailable(cli.bin))) {
      throw new Error('DALTON_CLI/OPENCODE_CLI not available')
    }

    const cwd = await createTempProject('server-only')
    await generateServerOnlyProject(cwd)

    if (!(await canRunDalton(cwd))) {
      throw new Error('opencode is not forwarding dalton commands')
    }

    const pre = await snapshotDir(cwd)

    const result = await runDaltonCommand(cwd, '/do-next-task', '--dry-run --only server')

    const post = await snapshotDir(cwd)
    const diff = diffSnapshots(pre, post)

    expect(result.stdout).toMatch(/^PHASE:/m)
    expect(result.stdout).toMatch(/^TASK:/m)
    expect(result.stdout).toMatch(/^CACHE:/m)
    expect(result.stdout).toMatch(/^ONLY: server$/m)
    expect(result.stdout).toMatch(/^DONE do-next-task$/m)

    // Ensure dry-run didn't implement
    expect(result.stdout).not.toMatch(/^CHANGED /m)
    expect(result.stdout).not.toMatch(/^TEST /m)
    expect(result.stdout).not.toMatch(/^COMPLETE /m)

    // IO allowlist
    const touched = [...diff.added, ...diff.changed]
    for (const p of touched) {
      expect(p.startsWith('.opencode/') || p.startsWith('logs/')).toBe(true)
    }

    // Cache JSON should reflect only=server
    const cacheDir = path.join(cwd, '.opencode', 'cache', 'task-context')
    const files = (await fs.pathExists(cacheDir)) ? await fs.readdir(cacheDir) : []
    const jsons = files.filter(f => f.endsWith('.json'))
    let hasOnly = false
    for (const f of jsons) {
      const obj = await fs.readJson(path.join(cacheDir, f))
      if (obj && obj.only === 'server') { hasOnly = true; break }
    }
    expect(hasOnly).toBe(true)
  })

  it('respects only=data on data-only project', async () => {
    const cli = resolveCli()
    if (!cli || !(await cliAvailable(cli.bin))) {
      throw new Error('DALTON_CLI/OPENCODE_CLI not available')
    }

    const cwd = await createTempProject('data-only')
    await generateDataOnlyProject(cwd)

    if (!(await canRunDalton(cwd))) {
      throw new Error('opencode is not forwarding dalton commands')
    }

    const pre = await snapshotDir(cwd)

    const result = await runDaltonCommand(cwd, '/do-next-task', '--dry-run --only data')

    const post = await snapshotDir(cwd)
    const diff = diffSnapshots(pre, post)

    expect(result.stdout).toMatch(/^PHASE:/m)
    expect(result.stdout).toMatch(/^TASK:/m)
    expect(result.stdout).toMatch(/^CACHE:/m)
    expect(result.stdout).toMatch(/^ONLY: data$/m)
    expect(result.stdout).toMatch(/^DONE do-next-task$/m)

    // Ensure dry-run didn't implement
    expect(result.stdout).not.toMatch(/^CHANGED /m)
    expect(result.stdout).not.toMatch(/^TEST /m)
    expect(result.stdout).not.toMatch(/^COMPLETE /m)

    // IO allowlist
    const touched = [...diff.added, ...diff.changed]
    for (const p of touched) {
      expect(p.startsWith('.opencode/') || p.startsWith('logs/')).toBe(true)
    }

    // Cache JSON should reflect only=data
    const cacheDir = path.join(cwd, '.opencode', 'cache', 'task-context')
    const files = (await fs.pathExists(cacheDir)) ? await fs.readdir(cacheDir) : []
    const jsons = files.filter(f => f.endsWith('.json'))
    let hasOnly = false
    for (const f of jsons) {
      const obj = await fs.readJson(path.join(cacheDir, f))
      if (obj && obj.only === 'data') { hasOnly = true; break }
    }
    expect(hasOnly).toBe(true)
  })
})
