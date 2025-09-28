export type Marker = {
  raw: string
  type: string
  args: string[]
}

// Two groups: 1) plain tokens with word-boundary, 2) summary tokens ending with ':' without \b
const markerRegex = /^(?:(START|DONE|ARGV|PHASE_ACTIVE|PHASE_FILE|TASKS|SELECT|FILES|CACHE|CHANGED|TEST|COMPLETE|COMPLETE_PHASE_DONE|DONE do-next-task|SPEC_GAP|IO_VIOLATION|RUN|NORMALIZED|DRAFT_READY|APPLIED)\b|(PHASE:|TASK:|CACHE:|ONLY:))\s*(.*)$/

export function parseMarkers(output: string): Marker[] {
  const lines = output.split(/\r?\n/)
  const markers: Marker[] = []
  for (const line of lines) {
    const m = line.match(markerRegex)
    if (m) {
      const type = (m[1] || m[2]) as string
      const rest = (m[3] || '').trim()
      const args = rest.length ? rest.split(/\s+/) : []
      markers.push({ raw: line, type, args })
    }
  }
  return markers
}

export function hasMarker(markers: Marker[], type: string) {
  return markers.some(m => m.type === type)
}

export function assertOrder(markers: Marker[], sequence: string[]) {
  let idx = 0
  for (const m of markers) {
    if (m.type === sequence[idx]) idx++
    if (idx === sequence.length) return
  }
  throw new Error(`Marker order missing sequence: ${sequence.join(' -> ')}`)
}
