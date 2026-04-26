# STATUS

Last Updated: 2026-04-26

## Current Task Bundle

- 次スレッドで初回仕様を確定できるように、壁打ち、実サイト確認、task 化の入口を固定する
- 実装前の discovery-first workflow を docs 上で明文化する

## Current State

- TypeScript + esbuild の userscript ビルド基盤を配置した
- Chrome remote debugging 用の補助スクリプトを配置した
- `docs/`、`AGENTS.md`、`README.md` の最小骨格を配置した
- `userscript.config.mjs` の `match` を `https://www.tl-gt.net/*` に更新した
- GitHub 上の `tl-grouptravel-userscript` リポジトリへ push 済みで、local `main` と `origin/main` は同期している

## Recent Done

- `tl-grouptravel-userscript` ディレクトリを新設した
- starter 用の package / tsconfig / eslint / build scripts を追加した
- GitHub Pages 配布のひな形を入れる前提の repo 骨格を追加した
- 開いていた認証済み TL-GroupTravel ページから実 URL を確認し、metadata の `match` を確定した
- `npm install` と `npm run check` を実施し、starter の build / lint / typecheck が通る状態を確認した
- GitHub origin を設定し、現在の starter 状態を push した

## Next Re-entry

- 最初に読む正本: `docs/spec_000_overview.md` と `docs/tasks_backlog.md`
- 次にやること: 壁打ちで最初の対象画面、狙い、非目標を 1 つに絞る

## Verify / Confirmation State

- 実施済み: `npm install`
- 実施済み: `npm run check`
- 未実施: Tampermonkey への取り込み確認
- 未実施: 実サイト上での DOM / API 観測メモ整理

## Open Questions / Risks

- 最初に対象にする画面と DOM / API 依存範囲をまだ決めていない
- 壁打ち前に scope を広げすぎると、観測対象と task 粒度がぶれやすい
- GitHub Pages 配布を使うかどうかはリポジトリ公開時に再判断が必要

## References

- `docs/spec_000_overview.md`
- `docs/context/DECISIONS.md`
- `docs/tasks_backlog.md`
