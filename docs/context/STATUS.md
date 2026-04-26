# STATUS

Last Updated: 2026-04-26

## Current Task Bundle

- 販売先別実績の月範囲集計 UI と画面表示を安定化する
- GUI 確認結果を踏まえて後続の改善点を整理する

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
- 統計データ画面に、対象年 + 対象月範囲の集計 UI を実装した
- 集計結果のサマリー、グラフ、一覧テーブル表示を実装した
- 指定月範囲の統合 CSV 出力を実装した

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
- userscript を更新したブラウザ上で、集計パネルの表示と 2025 年 1 月〜12 月の実行結果を確認した

## Next Re-entry

- 最初に読む正本: `docs/spec_001_sales_destination_annual_csv.md` と `docs/tasks_backlog.md`
- 次にやること: GUI 確認を増やし、表・グラフの表示項目と並び順の調整要否を判断する

## Verify / Confirmation State

- 実施済み: `npm install`
- 実施済み: `npm run check`
- 実施済み: 実サイト上での DOM / request / response 観測
- 実施済み: 3 か月超条件の server 側制約確認
- 実施済み: 月範囲集計 userscript の GUI 実装
- 実施済み: Tampermonkey 更新後の画面表示確認
- 実施済み: 2025 年 1 月〜12 月の集計実行と CSV 出力確認

## Open Questions / Risks

- CSV 結合時の文字コードと改行コードを既存出力に合わせて扱う必要がある
- 実行中に複数チャンクのダウンロードをどう回収するかを userscript 側で安全に決める必要がある
- 実績 0 行除外の最終条件は、運用上の期待とずれないかを spot check で追加確認する
- グラフの指標は現在 `総合計料金` 固定のため、他指標切替が必要かは運用確認が必要

## References

- `docs/spec_000_overview.md`
- `docs/spec_001_sales_destination_annual_csv.md`
- `docs/context/DECISIONS.md`
- `docs/tasks_backlog.md`
