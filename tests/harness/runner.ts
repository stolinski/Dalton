import { execa } from 'execa'
import path from 'path'
import fs from 'fs-extra'
import { parseMarkers, Marker } from './markers.js'
import { normalizeOutput } from './normalize.js'
import { resolveCli } from './cli.js'

export type RunResult = {
  code: number
  stdout: string
  stderr: string
  markers: Marker[]
}

export type RunOptions = {
  timeoutMs?: number
  modes?: 'all' | 'run-only'
}

export async function runDaltonCommand(cwd: string, cmd: string, argvRaw: string, opts: RunOptions = {}): Promise<RunResult> {
  const cli = resolveCli()
  if (!cli) throw new Error('CLI not configured')
  const { bin } = cli

  const hasArgv = !!(argvRaw && argvRaw.trim().length)
  const message = hasArgv ? `${cmd} ${argvRaw}` : cmd

  const mode = opts.modes || 'all'
  const combinations: string[][] = []
  // Prefer split-args (flag form) first to match intended usage:
  // opencode run /do-next-task --dry-run --only web
  if (hasArgv) combinations.push(['run', cmd, ...argvRaw.split(' ')])
  combinations.push(['run', cmd])

  if (mode === 'all') {
    // Fallback to single-message for JSON form
    if (hasArgv) combinations.push(['run', message])
    combinations.push([cmd])
    if (hasArgv) combinations.push([cmd, argvRaw])
  }

  const timeoutMs = opts.timeoutMs ?? 120000
  const debug = process.env.VITEST_OPENCODE_DEBUG === '1'

  const tryOnce = async (args: string[]) => {
    let out = ''
    let errOut = ''
    let settled = false
    let earlyReason: string | null = null

    const shouldEarlyExit = (text: string) => {
      const norm = normalizeOutput(text)
      // Early-exit ONLY on terminal markers to avoid cutting output early
      const doneRx = /^DONE\s+(do-next-task|review-phase|refresh-roadmap|complete-phase)\b/m
      const specGapRx = /^SPEC_GAP\b/m
      const completeRx = /\bCOMPLETE_PHASE_DONE\b/
      if (doneRx.test(norm)) { earlyReason = 'marker:DONE'; return true }
      if (specGapRx.test(norm)) { earlyReason = 'marker:SPEC_GAP'; return true }
      if (completeRx.test(norm)) { earlyReason = 'marker:COMPLETE_PHASE_DONE'; return true }
      return false
    }

    try {
      if (debug) {
        // eslint-disable-next-line no-console
        console.error(`[runner] invoking: ${bin} ${args.join(' ')}`)
      }
      const child = execa(bin, args, {
        cwd,
        reject: false,
        timeout: timeoutMs,
        killSignal: 'SIGKILL',
        env: { ...process.env, TZ: 'UTC', CI: '1' }
      })

      if (child.stdout) {
        child.stdout.on('data', (chunk: any) => {
          out += String(chunk)
          if (!settled && shouldEarlyExit(out)) {
            settled = true
            try { child.kill('SIGKILL') } catch {}
          }
        })
      }
      if (child.stderr) {
        child.stderr.on('data', (chunk: any) => {
          errOut += String(chunk)
          if (!settled && shouldEarlyExit(out + '\n' + errOut)) {
            settled = true
            try { child.kill('SIGKILL') } catch {}
          }
        })
      }

      const { exitCode, timedOut } = await child
      const combined = (out || '') + (errOut ? '\n' + errOut : '')
      const normalized = normalizeOutput(combined)
      const markers = parseMarkers(normalized)
      if (timedOut) {
        if (debug) {
          // eslint-disable-next-line no-console
          console.error(`[runner] timed out after ${timeoutMs}ms`)
        }
        return { code: 124, stdout: normalized || 'TIMEOUT', stderr: '', markers }
      }
      if (debug) {
        const firstLines = combined.split(/\r?\n/).slice(0, 8).join('\n')
        // eslint-disable-next-line no-console
        console.error(`[runner] exit=${exitCode ?? 0} markers=${markers.length}${earlyReason ? ` early=${earlyReason}` : ''}\n${firstLines}`)
      }
      // Even if we killed early, return whatever we captured
      return { code: exitCode ?? 0, stdout: normalized, stderr: '', markers }
    } catch (err: any) {
      const combined = (out || '') + (errOut ? '\n' + errOut : '') + ((err?.stdout || '') + (err?.stderr ? '\n' + err.stderr : ''))
      const normalized = normalizeOutput(combined)
      const markers = parseMarkers(normalized)
      return { code: 1, stdout: normalized || String(err?.message || 'error'), stderr: '', markers }
    }
  }

  let last: RunResult | null = null
  for (const args of combinations) {
    const res = await tryOnce(args)
    last = res
    if (res.markers.length > 0) return res
    if (/SPEC_GAP|PHASE_ACTIVE|PHASE_FILE|ARGV|NORMALIZED/.test(res.stdout)) return res
    if (/Running the \/do-next-task command in dry-run mode\.|Triggered the do-next-task dry run/i.test(res.stdout)) return res
  }
  return last || { code: 1, stdout: 'no output', stderr: '', markers: [] }
}

export async function createTempProject(baseName: string): Promise<string> {
  const tmpRoot = path.join(process.cwd(), 'tests', '.tmp')
  await fs.ensureDir(tmpRoot)
  const dir = path.join(tmpRoot, `${baseName}-${Date.now()}`)
  await fs.ensureDir(dir)
  return dir
}
