import { describe, it, expect } from 'vitest'
import { parseMarkers, assertOrder } from '../harness/markers.js'
import { normalizeOutput } from '../harness/normalize.js'

describe('harness utilities', () => {
  it('parses markers from sample output', () => {
    const sample = `ARGV {"raw":"--guidance ... --review-only"}\nPHASE_ACTIVE 1 planning/phases/phase_1.md\nPHASE_FILE 1 planning/phases/phase_1.md\nTASKS 12\nSELECT p1-8 "Title"\nFILES 9\nCACHE fresh ./.opencode/cache/task-context/p1-8.json\nPHASE: 1 planning/phases/phase_1.md\nTASK: p1-8 Title\nCACHE: fresh ./.opencode/cache/task-context/p1-8.json\nDONE do-next-task`
    const markers = parseMarkers(sample)
    expect(markers.length).toBeGreaterThan(0)
    assertOrder(markers, ['PHASE_ACTIVE', 'PHASE_FILE', 'TASKS', 'SELECT', 'FILES', 'CACHE'])
  })

  it('normalizes dates and paths', () => {
    const sample = 'COMPLETE p1-8 date=2025-09-26\n/.something/tests -> path'
    const norm = normalizeOutput(sample)
    expect(norm).toMatch('<DATE>')
    expect(norm).toMatch('<TESTS_DIR>')
  })
})
