import { describe, it, expect } from 'vitest'
import path from 'path'
import fs from 'fs-extra'
import { createTempProject, runDaltonCommand } from '../harness/runner.js'
import { generateCleanWebProject } from '../fixtures/generators.js'
import { assertOrder } from '../harness/markers.js'
import { resolveCli, cliAvailable } from '../harness/cli.js'
import { canRunDalton } from '../harness/detect.js'
import { snapshotDir, diffSnapshots } from '../harness/fsdiff.js'

// This test assumes an opencode CLI entry that responds to /do-next-task.
// Extends validation to IO allowlist and cache schema basics.

describe('/do-next-task dry-run (clean web)', () => {
  it('prints ARGV and required markers in order and summary; only writes to cache/logs; emits cache schema', async () => {
    const cli = resolveCli()
    if (!cli || !(await cliAvailable(cli.bin))) {
      throw new Error('DALTON_CLI/OPENCODE_CLI not available')
    }

    const cwd = await createTempProject('clean-web')
    await generateCleanWebProject(cwd)

    // Ensure CLI forwards to dalton before asserting
    if (!(await canRunDalton(cwd))) {
      throw new Error('opencode is not forwarding dalton commands')
    }

    // Snapshot before
    const pre = await snapshotDir(cwd)

    // Simulate: /do-next-task --dry-run
    const result = await runDaltonCommand(cwd, '/do-next-task', '--dry-run')

    // Snapshot after
    const post = await snapshotDir(cwd)
    const diff = diffSnapshots(pre, post)

    expect(result.code).toBeTypeOf('number')

    const markers = result.markers

    // Must include key markers
    const required = ['PHASE_ACTIVE', 'PHASE_FILE', 'TASKS', 'SELECT', 'FILES', 'CACHE']
    for (const t of required) {
      expect(markers.some(m => m.type === t)).toBe(true)
    }

    // Should not perform impl/test/complete on dry-run
    expect(markers.some(m => m.type === 'CHANGED')).toBe(false)
    expect(markers.some(m => m.type === 'TEST')).toBe(false)
    expect(markers.some(m => m.type === 'COMPLETE')).toBe(false)

    // Summary lines present
    expect(markers.some(m => m.raw.startsWith('PHASE: '))).toBe(true)
    expect(markers.some(m => m.raw.startsWith('TASK: '))).toBe(true)
    expect(markers.some(m => m.raw.startsWith('CACHE: '))).toBe(true)
    expect(markers.some(m => m.raw === 'DONE do-next-task')).toBe(true)

    // Order (subset)
    assertOrder(markers, ['PHASE_ACTIVE', 'PHASE_FILE', 'TASKS', 'SELECT', 'FILES', 'CACHE'])

    // IO allowlist: dry-run may only add/change under .opencode/ or logs/
    const touched = [...diff.added, ...diff.changed]
    for (const p of touched) {
      expect(p.startsWith('.opencode/') || p.startsWith('logs/')).toBe(true)
    }
    expect(diff.removed.length).toBe(0)

    // Cache schema validation: at least one task-context JSON with required fields
    const cacheDir = path.join(cwd, '.opencode', 'cache', 'task-context')
    const exists = await fs.pathExists(cacheDir)
    expect(exists).toBe(true)
    const files = exists ? await fs.readdir(cacheDir) : []
    const jsons = files.filter(f => f.endsWith('.json'))
    expect(jsons.length).toBeGreaterThan(0)

    // Load all candidates; assert at least one has the required shape
    const requiredTop = ['schema_version', 'flow_version', 'phase', 'task_id', 'title', 'acceptance', 'manifest', 'resolved_files']
    let hasValid = false
    for (const f of jsons) {
      const obj = await fs.readJson(path.join(cacheDir, f))
      const hasAllTop = requiredTop.every(k => Object.prototype.hasOwnProperty.call(obj, k))
      if (!hasAllTop) continue
      // manifest.files or manifest.source present
      const manifestOk = obj.manifest && (Array.isArray(obj.manifest.files) || typeof obj.manifest.source === 'string')
      const resolvedOk = Array.isArray(obj.resolved_files)
      if (manifestOk && resolvedOk) {
        hasValid = true
        // Optional: if present, type-check optional fields
        if ('only' in obj) expect(typeof obj.only === 'string' || obj.only === null).toBe(true)
        if ('freshness' in obj) expect(['string', 'number'].includes(typeof obj.freshness)).toBe(true)
        break
      }
    }
    expect(hasValid).toBe(true)
  })
})
