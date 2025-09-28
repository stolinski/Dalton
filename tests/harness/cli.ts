import { execa } from 'execa'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export type CliConfig = {
  bin: string
}

function findOnPath(cmd: string): string | null {
  const PATH = process.env.PATH || ''
  const exts = process.platform === 'win32' ? ['.exe', '.cmd', ''] : ['']
  for (const dir of PATH.split(path.delimiter)) {
    for (const ext of exts) {
      const full = path.join(dir, cmd + ext)
      if (fs.existsSync(full)) return full
    }
  }
  return null
}

export function resolveCli(): CliConfig | null {
  // 1) Environment override takes precedence
  const envBin = process.env.OPENCODE_CLI || process.env.DALTON_CLI
  if (envBin) return { bin: envBin }

  // 2) Require a real 'opencode' on PATH
  const opencodePath = findOnPath('opencode')
  if (opencodePath) return { bin: opencodePath }

  // 3) Final fallback to 'opencode' (may fail if not installed)
  return { bin: 'opencode' }
}

export async function cliAvailable(bin: string): Promise<boolean> {
  try {
    const { exitCode } = await execa(bin, ['--help'], { reject: false })
    return exitCode === 0 || exitCode === 1 // some CLIs return 1 for help
  } catch {
    return false
  }
}
