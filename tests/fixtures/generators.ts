import fs from 'fs-extra'
import path from 'path'

export async function generateCleanWebProject(dest: string) {
  await baseScaffold(dest)
  await fs.ensureDir(path.join(dest, 'src/routes'))
  await fs.ensureDir(path.join(dest, 'src/lib'))

  const roadmap = `# Roadmap\n\nPHASE_ACTIVE 1 planning/phases/phase_1.md\n`
  await fs.writeFile(path.join(dest, 'planning/roadmap.md'), roadmap)

  const phase = `# Phase 1\n\n- [ ] p1-1 "+ title"\n\nAcceptance:\n- Output markers as documented\n\nContext Manifest:\nsrc/routes/+page.svelte\n`
  await fs.writeFile(path.join(dest, 'planning/phases/phase_1.md'), phase)
}

export async function generateServerOnlyProject(dest: string) {
  await baseScaffold(dest)
  await fs.ensureDir(path.join(dest, 'src/lib/server'))
  await fs.ensureDir(path.join(dest, 'server'))
  await fs.writeFile(path.join(dest, 'src/lib/server/authz.ts'), 'export const ok = true\n')

  const roadmap = `# Roadmap\n\nPHASE_ACTIVE 1 planning/phases/phase_1.md\n`
  await fs.writeFile(path.join(dest, 'planning/roadmap.md'), roadmap)

  const phase = `# Phase 1\n\n- [ ] p1-1 "+ server task"\n\nAcceptance:\n- Server routing engaged\n\nContext Manifest:\nsrc/lib/server/authz.ts\nserver/index.ts\n`
  await fs.writeFile(path.join(dest, 'planning/phases/phase_1.md'), phase)
}

export async function generateDataOnlyProject(dest: string) {
  await baseScaffold(dest)
  await fs.ensureDir(path.join(dest, 'db'))
  await fs.ensureDir(path.join(dest, 'migrations'))
  await fs.ensureDir(path.join(dest, 'schema'))
  await fs.writeFile(path.join(dest, 'migrations/001_init.sql'), '-- migration\n')

  const roadmap = `# Roadmap\n\nPHASE_ACTIVE 1 planning/phases/phase_1.md\n`
  await fs.writeFile(path.join(dest, 'planning/roadmap.md'), roadmap)

  const phase = `# Phase 1\n\n- [ ] p1-1 "+ data task"\n\nAcceptance:\n- Data routing engaged\n\nContext Manifest:\nmigrations/**\nschema/**\n`
  await fs.writeFile(path.join(dest, 'planning/phases/phase_1.md'), phase)
}

export async function generateMissingPlanning(dest: string) {
  await fs.ensureDir(path.join(dest, 'src/routes'))
  await fs.ensureDir(path.join(dest, 'src/lib'))
  // intentionally no planning/
}

export async function generateMixedProject(dest: string) {
  await baseScaffold(dest)
  await fs.ensureDir(path.join(dest, 'src/routes'))
  await fs.ensureDir(path.join(dest, 'src/lib'))
  await fs.ensureDir(path.join(dest, 'src/lib/server'))
  await fs.ensureDir(path.join(dest, 'server'))
  await fs.ensureDir(path.join(dest, 'db'))
  await fs.ensureDir(path.join(dest, 'migrations'))
  await fs.ensureDir(path.join(dest, 'schema'))

  const roadmap = `# Roadmap\n\nPHASE_ACTIVE 1 planning/phases/phase_1.md\n`
  await fs.writeFile(path.join(dest, 'planning/roadmap.md'), roadmap)

  const phase = `# Phase 1\n\n- [ ] p1-1 "+ mixed task"\n\nAcceptance:\n- Mixed routing engaged\n\nContext Manifest:\nsrc/routes/+page.svelte\nsrc/lib/server/authz.ts\ndb/tables.sql\n`
  await fs.writeFile(path.join(dest, 'planning/phases/phase_1.md'), phase)
}

export async function generateMissingAcceptance(dest: string) {
  await baseScaffold(dest)
  await fs.ensureDir(path.join(dest, 'src/routes'))
  const roadmap = `# Roadmap\n\nPHASE_ACTIVE 1 planning/phases/phase_1.md\n`
  await fs.writeFile(path.join(dest, 'planning/roadmap.md'), roadmap)
  // No Acceptance section for the only task
  const phase = `# Phase 1\n\n- [ ] p1-1 "+ missing acceptance"\n\nContext Manifest:\nsrc/routes/+page.svelte\n`
  await fs.writeFile(path.join(dest, 'planning/phases/phase_1.md'), phase)
}

async function baseScaffold(dest: string) {
  await fs.ensureDir(path.join(dest, 'planning/phases'))
  await fs.ensureDir(path.join(dest, '.opencode/cache/task-context'))
  await fs.ensureDir(path.join(dest, 'logs'))
  // Anchor project root so opencode doesn't walk up to repo root
  await fs.writeJson(path.join(dest, 'package.json'), { name: 'dalton-tmp', private: true }, { spaces: 2 })
  const wsMap = {
    web_defaults: ["src/routes/**", "src/lib/**"],
    server_defaults: ["src/lib/server/**", "server/**"],
    data_defaults: ["db/**", "migrations/**", "schema/**"]
  }
  await fs.ensureDir(path.join(dest, 'planning'))
  await fs.writeJson(path.join(dest, 'planning/workspace_map.json'), wsMap, { spaces: 2 })
}

export async function generateDirtyRoadmapProject(dest: string) {
  await baseScaffold(dest)
  await fs.ensureDir(path.join(dest, 'src/routes'))
  // Purposely messy roadmap headings/links to trigger normalization
  const roadmap = `# ROADMAP\n\nActive: One planning/phases/phase_1.md\nNext: Two planning/phases/phase_2.md\n`
  await fs.writeFile(path.join(dest, 'planning/roadmap.md'), roadmap)
  const phase1 = `# Phase One\n\n- [ ] p1-1 "+ normalize"\n\nAcceptance:\n- ok\n\nContext Manifest:\nsrc/routes/+page.svelte\n`
  await fs.writeFile(path.join(dest, 'planning/phases/phase_1.md'), phase1)
}
