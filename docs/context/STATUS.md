# STATUS

Last Updated: 2026-04-26

## Current Task Bundle

- TL-GroupTravel 向け userscript 用の新規 starter repo を立ち上げる
- 仕様を別スレッドで作れるように、docs と build 基盤だけを先に固定する

## Current State

- TypeScript + esbuild の userscript ビルド基盤を配置した
- Chrome remote debugging 用の補助スクリプトを配置した
- `docs/`、`AGENTS.md`、`README.md` の最小骨格を配置した
- `userscript.config.mjs` の `match` は placeholder のままで、実 URL は未確定

## Recent Done

- `tl-grouptravel-userscript` ディレクトリを新設した
- starter 用の package / tsconfig / eslint / build scripts を追加した
- GitHub Pages 配布のひな形を入れる前提の repo 骨格を追加した

## Next Re-entry

- 最初に読む正本: `docs/tasks_backlog.md`
- 次にやること: TL-GroupTravel の実 URL パターンと最初の対象画面を決め、`userscript.config.mjs` と `docs/spec_*.md` を更新する

## Verify / Confirmation State

- 未実施: `npm install`
- 未実施: `npm run check`
- 未実施: Tampermonkey への取り込み確認

## Open Questions / Risks

- TL-GroupTravel の実 URL パターンをまだ確定していない
- 最初に対象にする画面と DOM / API 依存範囲をまだ決めていない
- GitHub Pages 配布を使うかどうかはリポジトリ公開時に再判断が必要

## References

- `docs/spec_000_overview.md`
- `docs/context/DECISIONS.md`
- `docs/tasks_backlog.md`
