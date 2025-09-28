import fs from 'fs-extra'
import path from 'path'

export type FsSnapshot = Record<string, { size: number; mtimeMs: number }>

export async function snapshotDir(root: string): Promise<FsSnapshot> {
  const out: FsSnapshot = {}
  async function walk(dir: string) {
    const entries = await fs.readdir(dir)
    for (const name of entries) {
      const p = path.join(dir, name)
      const st = await fs.stat(p)
      if (st.isDirectory()) {
        await walk(p)
      } else {
        const rel = path.relative(root, p)
        out[rel] = { size: st.size, mtimeMs: st.mtimeMs }
      }
    }
  }
  await walk(root)
  return out
}

export function diffSnapshots(a: FsSnapshot, b: FsSnapshot) {
  const added: string[] = []
  const removed: string[] = []
  const changed: string[] = []
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const k of keys) {
    if (!(k in a)) added.push(k)
    else if (!(k in b)) removed.push(k)
    else if (a[k].size !== b[k].size || a[k].mtimeMs !== b[k].mtimeMs) changed.push(k)
  }
  return { added, removed, changed }
}
