# TL-GroupTravel Userscript

TL-GroupTravel の統計データ画面に、販売先 x 取扱個所単位の期間集計 UI を追加する Tampermonkey userscript の開発リポジトリです。

現時点では、統計データ画面の既存 CSV 出力を 3 か月単位で分割取得し、userscript 側で再集計して、画面表示と統合 CSV 出力を行う機能まで実装済みです。

## 現在の機能

- 対象画面: `https://www.tl-gt.net/accomodation/Gscsc4010BackTo4000Action.do`
- 集計単位: 販売先 x 取扱個所
- 集計期間: 開始年、終了年、開始月、終了月の指定
- 期間上限: 12 か月以内
- クイック選択: `直近12か月`、`年(1月〜12月)`、`年度(4月〜3月)`、`年度(6月〜5月)`
- `直近12か月` は前月終点の確定実績ベース
- 実行モード: 画面表示のみ、統合 CSV 出力のみ
- 表示内容: 集計サマリー、前年同時期比較、総合計料金シェア円グラフ、集計結果一覧
- 円グラフは総合計料金の上位項目を表示し、凡例に当年 / 前年のシェア率と売上を表示する
- 円グラフの hover では `販売先`、`当年`、`前年` の 3 段 tooltip を表示する
- 一覧の並び順は総合計料金の降順固定
- 0 実績行は既定で除外し、checkbox で含めることも可能

## 重要な制約

- backend 側の `Gscsc4010CsvOutAction.do` は、集計期間・比較期間とも 3 か月以内でないと失敗する
- そのため、年間または年またぎ集計は backend の 1 回呼び出しではなく、userscript 側の分割取得と再集計で実現している
- 成功レスポンスは添付 CSV、失敗時は HTML になるため、HTTP 200 だけでは成功判定できない
- この userscript は統計データ画面の既存条件を前提にするため、TL-GroupTravel の認証済みセッションが必要
- 集計は `販売先単位` かつ `取扱個所まで集計単位に含める` が前提

## 前提

1. Node.js 22 LTS 以上
2. Google Chrome
3. Chrome 拡張の Tampermonkey
4. `pwsh`

## セットアップ

```powershell
npm install
npm run check
```

## 開発コマンド

- `npm run dev`: `dist/*.user.js` を watch build
- `npm run build`: 1 回ビルド
- `npm run typecheck`: TypeScript の型検査
- `npm run lint`: ESLint 実行
- `npm run check`: 型検査、lint、build をまとめて実行
- `npm run chrome:debug`: 専用プロファイルで remote debugging Chrome を起動
- `npm run chrome:debug:default-profile`: Default プロファイルを remote debugging 付きで起動
- `npm run chrome:debug:default-profile:resume`: Default プロファイルを前回セッション復元付きで起動
- `npm run chrome:profiles`: 利用可能な Chrome プロファイルを一覧表示
- `npm run chrome:pages`: CDP 経由で Chrome のページ一覧を表示

## Tampermonkey 反映

- 配布物と Tampermonkey へ投入するファイルは `dist/*.user.js`
- userscript metadata の正本は `userscript.config.mjs`
- GitHub Pages 配布 URL: [https://nemukei.github.io/tl-grouptravel-userscript/tl-grouptravel-userscript.user.js](https://nemukei.github.io/tl-grouptravel-userscript/tl-grouptravel-userscript.user.js)

GitHub Pages 配布を使う場合は、`GITHUB_PAGES_BASE_URL` をビルド時に渡すと `updateURL` と `downloadURL` が自動で入ります。

## 実画面での基本確認手順

1. Tampermonkey に最新の `dist/*.user.js` を反映する
2. TL-GroupTravel の統計データ画面を開く
3. `販売先単位` を選ぶ
4. `取扱個所まで集計単位に含める` を有効にする
5. 必要に応じて販売先条件を指定する
6. クイック選択または開始年 / 終了年 / 月で対象期間を作る
7. `表示する` で画面表示、`CSV を出力` で統合 CSV 出力を確認する
8. 円グラフの hover tooltip、一覧の売上順、前年同時期比較を確認する

## 現在の検証状況

- 実施済み: `npm run check`、統計データ画面の DOM / request / response 観測、backend の 3 か月制約確認、2025年1月〜12月の集計実行と CSV 出力確認、円グラフ tooltip を含む静的実装確認
- 未実施または継続確認が必要: Tampermonkey に最新 build を反映した状態での GUI 総合確認、4 種類のクイック選択の実サイト確認、tooltip の最終的な hover 体験と edge case の確認

## ドキュメントの正本

- `AGENTS.md`: リポジトリ常設ルール
- `docs/spec_000_overview.md`: リポジトリ全体の概要
- `docs/spec_001_sales_destination_annual_csv.md`: 統計データ画面の期間集計仕様
- `docs/context/STATUS.md`: 現況と再開ポイント
- `docs/context/DECISIONS.md`: 判断理由
- `docs/tasks_backlog.md`: 未完了タスク

## 次スレッドの開始順

1. `AGENTS.md`
2. `docs/spec_001_sales_destination_annual_csv.md`
3. `docs/context/STATUS.md`
4. `docs/context/DECISIONS.md`
5. `docs/tasks_backlog.md`

この順で読めば、仕様、現況、判断理由、残件まで追えるようにしてあります。
