// import type { Plugin } from "@opencode-ai/plugin";
// import { readFile, writeFile, mkdir } from "node:fs/promises";
// import { watch } from "node:fs";
// import { createHash } from "node:crypto";
// import { join, dirname } from "node:path";
// import { tmpdir } from "node:os";

// const LOG = process.env.OPENCODE_DEBUG_ROADMAP_NORMALIZE === "1";
// function log(...args: any[]) {
//   if (LOG) console.log("[roadmap-normalize]", ...args);
// }
// const RUN_TIMEOUT_MS = (() => {
//   const v = Number.parseInt(process.env.OPENCODE_ROADMAP_NORMALIZE_TIMEOUT_MS || "", 10);
//   if (Number.isFinite(v)) return Math.min(Math.max(v, 10000), 120000);
//   return 60000; // default 60s
// })();
// const VERIFY_DELAYS_MS = (() => {
//   const FRACTIONS = [0.1, 0.2, 0.35, 0.5];
//   let prev = 0;
//   return FRACTIONS.map((f) => {
//     const delta = Math.max(f - prev, 0);
//     prev = f;
//     return Math.round(RUN_TIMEOUT_MS * delta);
//   });
// })();
// const RUN_STALE_MS = RUN_TIMEOUT_MS + Math.max(...VERIFY_DELAYS_MS) + 3000;
// function sleep(ms: number) {
//   return new Promise((res) => setTimeout(res, ms));
// }

// const ROADMAP_REL = "planning/roadmap.md";
// const LOCK_REL = ".opencode/.roadmap-normalize.lock";
// const PHASE_DECIMAL_RE = /^###\s*Phase\s+\d+\.\d+/im;

// async function sha256(path: string) {
//   try {
//     const buf = await readFile(path);
//     return createHash("sha256").update(buf).digest("hex");
//   } catch {
//     return null;
//   }
// }

// export const RoadmapNormalizeViaCommand: Plugin = async ({ client, directory }) => {
//   const roadmapPath = join(directory, ROADMAP_REL);
//   let lockPath = join(directory, LOCK_REL);
//   let lockDir = dirname(lockPath);
//   const roadmapDir = dirname(roadmapPath);
//   const roadmapFile = "roadmap.md";

//   let timer: ReturnType<typeof setTimeout> | null = null;
//   let running = false;
//   let startedAt = 0;
//   let lastNormalizedHash: string | null = null;

//   async function hasActiveLock(): Promise<boolean> {
//     const tryPaths = [lockPath];
//     // If lockPath is under project .opencode, also check temp fallback
//     tryPaths.push(
//       join(
//         tmpdir(),
//         "opencode",
//         createHash("md5").update(directory).digest("hex"),
//         ".roadmap-normalize.lock"
//       )
//     );

//     for (const p of tryPaths) {
//       try {
//         const raw = await readFile(p, "utf8");
//         const { until } = JSON.parse(raw) as { until: number };
//         const active = Date.now() < until;
//         if (LOG) log("lock", active ? "active" : "expired", "at", p);
//         // Sync current lockPath to the valid one
//         if (active) {
//           lockPath = p;
//           lockDir = dirname(p);
//         }
//         if (active) return true;
//       } catch (e) {
//         if (LOG) log("lock read (expected if first run) at", p);
//       }
//     }
//     return false;
//   }

//   async function setLock(ms: number) {
//     const until = Date.now() + ms;
//     try {
//       await mkdir(lockDir, { recursive: true });
//       await writeFile(lockPath, JSON.stringify({ until }), "utf8");
//       if (LOG) log("set lock for", ms, "ms", "at", lockPath);
//     } catch (e) {
//       if (LOG) log("set lock failed at", lockPath, (e as Error).message);
//       // Fallback to temp dir
//       try {
//         const fallbackDir = join(
//           tmpdir(),
//           "opencode",
//           createHash("md5").update(directory).digest("hex")
//         );
//         await mkdir(fallbackDir, { recursive: true });
//         lockPath = join(fallbackDir, ".roadmap-normalize.lock");
//         lockDir = fallbackDir;
//         await writeFile(lockPath, JSON.stringify({ until }), "utf8");
//         if (LOG) log("set lock (fallback) at", lockPath);
//       } catch (e2) {
//         if (LOG) log("set lock fallback failed:", (e2 as Error).message);
//         // ignore
//       }
//     }
//   }

//   async function runNormalization() {
//     // Clear stale runs
//     if (running && startedAt && Date.now() - startedAt > RUN_STALE_MS) {
//       if (LOG) log("watchdog: clearing stale run");
//       running = false;
//     }
//     if (running) {
//       if (LOG) log("skip: already running");
//       return;
//     }
//     if (await hasActiveLock()) {
//       if (LOG) log("skip: active lock");
//       return;
//     }

//     running = true;
//     startedAt = Date.now();
//     try {
//       const beforeHash = await sha256(roadmapPath);
//       if (beforeHash && lastNormalizedHash && beforeHash === lastNormalizedHash) {
//         if (LOG) log("skip: hash unchanged");
//         return;
//       }

//       // Always delegate renumbering to /roadmap-plan
//       if (client?.tui?.executeCommand) {
//         if (LOG) log("run via TUI: /roadmap-plan");
//         if (client?.tui?.showToast) {
//           await client.tui.showToast({
//             body: { message: "Starting roadmap normalization…", variant: "info" },
//           });
//         }
//         const runPromise = client.tui.executeCommand({ body: { command: "/roadmap-plan" } });
//         const timeout = new Promise((_r, rej) =>
//           setTimeout(() => rej(new Error("timeout")), RUN_TIMEOUT_MS)
//         );
//         try {
//           await Promise.race([runPromise, timeout]);
//         } catch (err) {
//           if ((err as Error).message === "timeout" && client?.tui?.showToast) {
//             await client.tui.showToast({
//               body: {
//                 message:
//                   "Roadmap normalization timed out; will still check for changes. If edits are blocked, run /roadmap-plan manually.",
//                 variant: "warning",
//               },
//             });
//           }
//           // Do not throw; proceed to verify in case the command completed late
//         }
//       } else {
//         if (LOG) log("skip: no TUI executeCommand available");
//         return;
//       }

//       // Verify that roadmap changed after a few delays
//       let changed = false;
//       for (const d of VERIFY_DELAYS_MS) {
//         await sleep(d);
//         const current = await sha256(roadmapPath);
//         if (current && current !== beforeHash) {
//           changed = true;
//           break;
//         }
//       }

//       if (!changed) {
//         if (LOG) log("no change detected after command");
//         if (client?.tui?.showToast) {
//           await client.tui.showToast({
//             body: { message: "Roadmap normalization did not change anything", variant: "warning" },
//           });
//         }
//       } else {
//         if (LOG) log("change detected; setting lock");
//         lastNormalizedHash = await sha256(roadmapPath);
//         await setLock(1500);
//         if (client?.tui?.showToast) {
//           await client.tui.showToast({
//             body: { message: "Roadmap normalized", variant: "success" },
//           });
//         }
//       }
//     } catch (e) {
//       if (LOG) log("error:", (e as Error).message);
//       if (client?.tui?.showToast) {
//         await client.tui.showToast({
//           body: {
//             message: `Roadmap normalization failed: ${(e as Error).message}`,
//             variant: "error",
//           },
//         });
//       }
//       // swallow errors to avoid loop-on-error
//     } finally {
//       running = false;
//       startedAt = 0;
//     }
//   }

//   function schedule() {
//     if (timer) clearTimeout(timer);
//     timer = setTimeout(() => void runNormalization(), 400);
//     if (LOG) log("scheduled normalization in 400ms");
//   }

//   // Start filesystem watcher on directory to catch atomic saves/renames
//   try {
//     const dirWatcher = watch(roadmapDir, { persistent: false });
//     dirWatcher.on("change", async (eventType, filename) => {
//       if (filename !== roadmapFile) return;
//       if (LOG) log("fs dir event", eventType, filename);
//       const currentHash = await sha256(roadmapPath);
//       if (currentHash && lastNormalizedHash && currentHash === lastNormalizedHash) {
//         if (LOG) log("skip fs trigger: identical hash");
//         return;
//       }
//       schedule();
//     });
//     if (LOG) log("watching dir", roadmapDir, "for", roadmapFile);
//   } catch (e) {
//     if (LOG) log("fs.watch dir not available:", (e as Error).message);
//   }

//   return {
//     // Fire when roadmap.md is written or edited via tools
//     "tool.execute.after": async (input, output) => {
//       const tool = input.tool;
//       const p = output?.args?.filePath || "";
//       if ((tool === "write" || tool === "edit") && p.endsWith(ROADMAP_REL)) {
//         const currentHash = await sha256(roadmapPath);
//         if (currentHash && lastNormalizedHash && currentHash === lastNormalizedHash) {
//           if (LOG) log("skip trigger: identical hash");
//           return;
//         }
//         if (LOG) log("trigger from", tool, "on", p);
//         schedule();
//       }
//     },
//   };
// };
