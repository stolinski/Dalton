import { runDaltonCommand } from './runner.js'

export async function canRunDalton(cwd: string): Promise<boolean> {
  const strict = process.env.REQUIRE_FORWARDING === '1'
  const timeoutMs = strict ? 120000 : 20000
  // Tighten probe to the two known-good forms (split args via `run`)
  const modes = 'run-only'
  const res = await runDaltonCommand(cwd, '/do-next-task', '--dry-run', { timeoutMs, modes })
  const ok =
    res.markers.length > 0 ||
    /\b(ARGV|PHASE_ACTIVE|PHASE_FILE|TASKS|SELECT|FILES|CACHE|SPEC_GAP|NORMALIZED|DONE do-next-task|COMPLETE_PHASE_DONE)\b/i.test(
      res.stdout
    ) || /Running the \/do-next-task command in dry-run mode\./i.test(res.stdout) || /Triggered the do-next-task dry run/i.test(res.stdout)

  const debug = process.env.VITEST_OPENCODE_DEBUG === '1'
  if (debug) {
    const firstLines = (res.stdout || '').split(/\r?\n/).slice(0, 12).join('\n')
    // eslint-disable-next-line no-console
    console.error(`[detect] probe stdout (first lines):\n${firstLines}`)
  }

  if (!ok && strict) {
    throw new Error('opencode did not forward dalton commands in probe')
  }
  return ok
}
