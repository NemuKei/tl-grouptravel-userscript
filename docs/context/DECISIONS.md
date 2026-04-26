# DECISIONS

> 形式は `ID | date | decision | spec_link | status` を使う。

## Entries

- `D-20260426-001` | 2026-04-26 | TL-GroupTravel 向けの新規 repo は、既存 userscript repo をそのまま複製せず、TypeScript + esbuild + Chrome remote debugging を持つ最小 starter として立ち上げる | `docs/spec_000_overview.md` | active
- `D-20260426-002` | 2026-04-26 | userscript metadata は `userscript.config.mjs` に集約し、対象サイトの起動 URL は `https://www.tl-gt.net/*` を既定にする | `docs/spec_000_overview.md` | active
- `D-20260426-003` | 2026-04-26 | repo-template-codex には現時点で Tampermonkey 専用テンプレートがないため、当面は consumer repo 側で starter を組み立て、後でテンプレート化を検討する | `docs/spec_000_overview.md` | active
