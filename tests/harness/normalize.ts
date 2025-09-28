import stripAnsi from 'strip-ansi'

export function normalizeOutput(s: string): string {
  let out = stripAnsi(s || '')
  out = out.replace(/\r/g, '')
  out = out.replace(/\d{4}-\d{2}-\d{2}/g, '<DATE>')
  out = out.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, '<ISO>')
  out = out.replace(/\.(opencode|logs)\//g, './$1/')
  out = out.replace(/\/[A-Za-z0-9_\-\.\/]+\/tests\b/g, '<TESTS_DIR>')
  return out.trim()
}
