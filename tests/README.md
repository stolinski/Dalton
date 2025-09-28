# Dalton Test Suite

All testing infrastructure lives under `./tests`.

## Stack
- TypeScript + Vitest
- `execa` for spawning commands
- Offline fixture generation (no network)

## Structure
- `harness/`: helpers to run commands, parse markers, normalize stdout, and diff filesystem.
- `fixtures/`: seed assets for generating projects; plus edge-case seeds.
- `scenarios/`: test files per command and agent behavior.
- `snapshots/`: normalized stdout/file snapshots.

## Running

By default, the harness calls the `opencode` binary on your PATH. You can override explicitly with `OPENCODE_CLI`.

```
cd tests
pnpm i # or npm i / yarn
OPENCODE_CLI=opencode pnpm test
```

Recommended flag form:

```
opencode run /do-next-task --dry-run
opencode run /do-next-task --dry-run --only web
```

Alternative JSON form (also supported by the harness):

```
opencode run /do-next-task '{"dry_run": true}'
opencode run "/do-next-task {\"dry_run\": true, \"only\": \"web\"}"
```

If `opencode` is not on your PATH, point `OPENCODE_CLI` to an absolute path.

### Environment variables

- `OPENCODE_CLI`: path to the CLI binary to use (default: search PATH).
- `VITEST_OPENCODE_DEBUG=1`: prints runner debug logs and first lines when early-exiting.
- `REQUIRE_FORWARDING=1`: strict mode. Probe must detect Dalton forwarding; tests will fail instead of softly passing when CLI is missing or not forwarding.

### Examples

- Strict single test with debug:

```
REQUIRE_FORWARDING=1 VITEST_OPENCODE_DEBUG=1 pnpm vitest run -w scenarios/do-next-task.dryrun.test.ts
```

- Full suite (strict):

```
REQUIRE_FORWARDING=1 pnpm test -w
```

## Adding Scenarios
- Build fixtures using `createTempProject()` with a generator (e.g., `generateCleanWebProject`).
- Use `runDaltonCommand()` to invoke commands and capture markers.
- Snapshot normalized stdout via `normalizeOutput()`.

## Notes
- Prefer `/do-next-task {"dry_run":true}` for determinism.
- Normalize dates/paths to keep snapshots stable.
- Avoid network calls; generators should copy local files only.
