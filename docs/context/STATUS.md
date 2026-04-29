# STATUS

Last Updated: 2026-04-29

## Current Task Bundle

- 現行の期間集計 UI 一式は実装と GUI verify まで完了した
- 次スレッドでは新要望が出た単位で task を追加して継続する

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
- 年またぎ月範囲を開始年基準で扱えるように更新した
- 画面表示と CSV 出力を別ボタンで実行できるように更新した
- 総合計料金グラフを円グラフのシェア表示へ更新した
- 期間指定を開始年/終了年ベースへ変更した
- 直近 12 か月と年度のクイック選択を追加した
- 前年同時期の比較値をサマリーと一覧へ表示するように更新した
- 集計結果一覧を総合計料金の降順で表示するように更新した
- クイック選択に 年(1月〜12月) と 年度(6月〜5月) を追加した
- 円グラフ凡例に前年数値と前年シェア率を追加した
- 直近12か月のクイック選択を前月起点の確定実績ベースへ調整した
- 円グラフをSVGセグメント化し、hover tooltip で詳細を見られるようにした
- 円グラフ tooltip をカスタム UI に置き換え、販売先名、当年、前年の 3 段構成で即時表示するようにした
- tooltip の表示位置をカーソル右側優先にし、必要に応じてグラフエリア外まで出せるようにした
- 一覧に実績室数、延人数、Wash率、室料金合計、室単価を追加した
- 催行率、Wash率、室単価を合算値から再計算するよう整理し、tooltip にも室数、Wash率、室単価を追加した
- 円グラフ凡例にも室数、Wash率、室単価を追加し、Wash率 は `率 (目減り室数 / 仮予約時点室数)` の形式で表示するようにした
- 全体サマリーに実績室数、Wash率、室単価を追加し、対象期間、前年同時期(選択条件内)、前年同時期(全体基準) の 3 行で比較できるようにした
- 全体サマリーは 3 行構成でも比較項目の位置を揃え、選択条件内は赤系、全体基準は黄系カードで区別するようにした
- 最新 build を Tampermonkey へ反映した状態で、クイック選択、一覧追加列、凡例、tooltip、全体サマリーを含む GUI 確認を完了した
- 画面表示では、販売先条件を `すべて` に戻した追加取得で当年/前年の全体分母を算出し、サマリ、凡例、tooltip のシェア率を全体基準で表示するよう更新した
- 全体サマリーは、対象期間、前年同時期(選択条件内)、前年同時期(全体基準) の 3 行構成で、各行の列項目位置を揃える形に更新した
- CSV 出力は従来どおり、選択条件内の集計結果だけを出力するまま維持した
- `npm run check` で全体基準の分母追加を含む最新コードの静的検証が通った

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
- `npm run check` で年またぎ範囲、表示・CSV 分離、円グラフ化を含む最新コードの静的検証が通った
- 実ブラウザを確認したところ、開いている TL-GroupTravel ページ上の userscript は旧版のままで、新 UI はまだ反映されていなかった
- `npm run check` で開始年/終了年、クイック選択、前年同時期比較を含む最新コードの静的検証が通った
- 実ブラウザ上の DOM を確認したところ、まだ開始年/終了年やクイック選択は出ておらず、ページ上の userscript は 1 つ前の版だった
- `npm run check` で一覧の売上順固定、追加クイック選択、凡例の前年シェア表示を含む最新コードの静的検証が通った
- `npm run check` で直近12か月の前月起点調整を含む最新コードの静的検証が通った
- `npm run check` で円グラフ tooltip 追加を含む最新コードの静的検証が通った
- `npm run check` で 3 段構成のカスタム tooltip 追加を含む最新コードの静的検証が通った
- `npm run check` で tooltip をグラフエリア外まで出せる位置調整を含む最新コードの静的検証が通った
- `npm run check` で一覧列追加と tooltip 指標追加を含む最新コードの静的検証が通った
- `npm run check` で凡例と全体サマリーの指標追加を含む最新コードの静的検証が通った
- `npm run check` で全体サマリーの 2 行化と前年比較カードの配色変更を含む最新コードの静的検証が通った
- 最新 build を Tampermonkey へ反映し、実画面で最終 UI を確認した
- `npm run check` で画面表示だけ全体基準の分母を追加する差分の静的検証が通った
- CDP 経由の実画面確認を試したところ、統計データ画面上の userscript は旧版のままで、全体基準ラベルはまだ反映されていなかった
- 最新 build を Tampermonkey へ反映し、画面表示だけ全体基準の分母を追加した差分と、全体サマリーの 3 行構成を実画面で確認した

## Next Re-entry

- 最初に読む正本: `docs/spec_001_sales_destination_annual_csv.md` と `docs/tasks_backlog.md`
- 次にやること: 新要望が出たら `docs/spec_001_sales_destination_annual_csv.md` と `docs/tasks_backlog.md` を起点に差分実装へ入る

## Verify / Confirmation State

- 実施済み: `npm install`
- 実施済み: `npm run check`
- 実施済み: 実サイト上での DOM / request / response 観測
- 実施済み: 3 か月超条件の server 側制約確認
- 実施済み: 月範囲集計 userscript の GUI 実装
- 実施済み: 2025 年 1 月〜12 月の集計実行と CSV 出力確認
- 実施済み: 年またぎ範囲、表示・CSV 分離、円グラフ化を含む `npm run check`
- 実施済み: 開始年/終了年、クイック選択、前年同時期比較を含む `npm run check`
- 実施済み: 一覧の売上順固定、追加クイック選択、凡例の前年シェア表示を含む `npm run check`
- 実施済み: tooltip の 3 段構成、右側表示、グラフエリア外表示を含む `npm run check`
- 実施済み: 実績室数、延人数、Wash率、室料金合計、室単価の一覧追加と tooltip 指標追加を含む `npm run check`
- 実施済み: 凡例と全体サマリーへの実績室数、Wash率、室単価追加を含む `npm run check`
- 実施済み: 全体サマリーの 2 行化と前年比較カードの赤系表示を含む `npm run check`
- 実施済み: 画面表示だけ全体基準の分母を追加する差分を含む `npm run check`
- 実施済み: Tampermonkey へ最新 build を反映した上での GUI 確認
- 実施済み: 年またぎ範囲の実サイト実行確認
- 実施済み: 4種類のクイック選択の実サイト確認
- 実施済み: 前年同時期比較表示の実サイト確認
- 実施済み: 一覧の売上順と凡例の前年シェア表示の実サイト確認
- 実施済み: tooltip の hover 体験と edge 表示の実サイト確認
- 実施済み: 一覧の追加列と室単価の再計算値の実サイト確認
- 実施済み: 凡例と全体サマリーの追加指標、および Wash率 の分母表示の実サイト確認
- 実施済み: 全体サマリーの 3 行レイアウトと前年比較カード配色、全体基準カード配色の実サイト確認
- 実施済み: 画面表示だけ全体基準の分母を追加した差分の実サイト GUI 確認
- 実施済み: 全体サマリーの 3 行構成と、前年同時期(全体基準) を含む実サイト GUI 確認

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
