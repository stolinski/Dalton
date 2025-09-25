---
description: Update or refine the roadmap Phase sections for this repo
agent: roadmap_planner
---

Edit ./planning/roadmap.md to reflect current priorities and maintain the “### Phase <n> — <title>” sections. Do NOT restart at 1. Preserve numbering before the first decimal phase. When decimals are present (e.g., 8.5), promote that phase to the next integer at or above its base (8.5 -> 9) and shift all subsequent phases forward by +1 to keep a contiguous sequence (9 -> 10, 10 -> 11, …). Never delete content; migrate it under the new integer heading. If a matching phase file exists (./planning/phases/phase\_<n>.md) for any affected heading, do not rename files here; only adjust roadmap headings and ensure the 'current/next' link points to the correct next phase.

- Keep it concise; avoid task-level detail.
- Ensure it links to the current or next ./planning/phases/phase\_<n>.md.
- Do not create or archive phase files here.
- Implementation notes: implement a single-pass, idempotent renumber. 1) Parse headings in document order matching `^###\s*Phase\s+(\d+(?:\.\d+)?)(?:\s*[-:]\s*)(.*)$`. 2) Find the first pivot where a decimal occurs or sequence breaks. 3) Keep numbers before the pivot unchanged. 4) Set the pivot to `max(prev+1, ceil(original))`. 5) For each subsequent phase, set number = previous number + 1. 6) Preserve titles and content; never delete sections. 7) Compute the full new content and write once (avoid multiple `edit` calls). 8) If parsing fails or headings are missing, no-op with a clear message. 9) Do not rename files; only adjust roadmap headings and update the 'current/next' link to the correct next phase.
