# STATUS

Last Updated: 2026-04-26

## Current Task Bundle

- 販売先別年間実績の初回仕様を固定する
- server 側制約を踏まえた実装方針を docs 上で固定する

## Current State

- TypeScript + esbuild の userscript ビルド基盤を配置した
- Chrome remote debugging 用の補助スクリプトを配置した
- `docs/`、`AGENTS.md`、`README.md` の最小骨格を配置した
- `userscript.config.mjs` の `match` を `https://www.tl-gt.net/*` に更新した
- GitHub 上の `tl-grouptravel-userscript` リポジトリへ push 済みで、local `main` と `origin/main` は同期している
- 統計データ画面の CSV 出力 Action と request payload を確認した
- `Gscsc4010CsvOutAction.do` が 3 か月超条件を server 側で `MGSC0095` により拒否することを確認した
- 成功 CSV の列構成と比率計算の元になる列を確認した
- 初回機能仕様を `docs/spec_001_sales_destination_annual_csv.md` に追加した

## Recent Done

- `tl-grouptravel-userscript` ディレクトリを新設した
- starter 用の package / tsconfig / eslint / build scripts を追加した
- GitHub Pages 配布のひな形を入れる前提の repo 骨格を追加した
- 開いていた認証済み TL-GroupTravel ページから実 URL を確認し、metadata の `match` を確定した
- `npm install` と `npm run check` を実施し、starter の build / lint / typecheck が通る状態を確認した
- GitHub origin を設定し、現在の starter 状態を push した
- 統計データ画面の DOM と送信先 Action を観測した
- 成功する CSV 出力 request を採取し、response が添付 CSV になることを確認した
- 3 か月超の CSV 出力 request を採取し、error HTML と `MGSC0095` を確認した
- ダウンロード済み CSV から列構成と再計算が必要な比率列を確認した

## Next Re-entry

- 最初に読む正本: `docs/spec_001_sales_destination_annual_csv.md` と `docs/tasks_backlog.md`
- 次にやること: 統計データ画面に年間集計 UI を足し、3 か月チャンク取得と CSV 統合を実装する

## Verify / Confirmation State

- 実施済み: `npm install`
- 実施済み: `npm run check`
- 実施済み: 実サイト上での DOM / request / response 観測
- 実施済み: 3 か月超条件の server 側制約確認
- 未実施: 年間集計 userscript の GUI 実装
- 未実施: Tampermonkey への取り込み確認

## Open Questions / Risks

- CSV 結合時の文字コードと改行コードを既存出力に合わせて扱う必要がある
- 実行中に複数チャンクのダウンロードをどう回収するかを userscript 側で安全に決める必要がある
- 実績 0 行除外の最終条件は、実装時に spot check を 1 回入れて確認する

## References

- `docs/spec_000_overview.md`
- `docs/spec_001_sales_destination_annual_csv.md`
- `docs/context/DECISIONS.md`
- `docs/tasks_backlog.md`
