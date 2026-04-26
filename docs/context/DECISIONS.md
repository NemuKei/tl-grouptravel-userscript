# DECISIONS

> 形式は `ID | date | decision | spec_link | status` を使う。

## Entries

- `D-20260426-001` | 2026-04-26 | TL-GroupTravel 向けの新規 repo は、既存 userscript repo をそのまま複製せず、TypeScript + esbuild + Chrome remote debugging を持つ最小 starter として立ち上げる | `docs/spec_000_overview.md` | active
- `D-20260426-002` | 2026-04-26 | userscript metadata は `userscript.config.mjs` に集約し、対象サイトの起動 URL は `https://www.tl-gt.net/*` を既定にする | `docs/spec_000_overview.md` | active
- `D-20260426-003` | 2026-04-26 | repo-template-codex には現時点で Tampermonkey 専用テンプレートがないため、当面は consumer repo 側で starter を組み立て、後でテンプレート化を検討する | `docs/spec_000_overview.md` | active
- `D-20260426-004` | 2026-04-26 | 初回機能は discovery-first で進め、壁打ちで scope を絞ったあとに実サイトで DOM / API を確認し、その観測結果を task と spec へ反映してから実装する | `docs/spec_000_overview.md` | active
- `D-20260426-005` | 2026-04-26 | 販売先別年間実績の初回機能は、団体案件一覧ではなく統計データ画面を入口にする。理由は、販売先単位、取扱個所単位、CSV 出力が既にそろっているため | `docs/spec_001_sales_destination_annual_csv.md` | active
- `D-20260426-006` | 2026-04-26 | `Gscsc4010CsvOutAction.do` は server 側で集計期間・比較期間とも 3 か月以内制限を持つため、年間参照は 1 回の POST ではなく 3 か月以内チャンクの分割取得と local 集計で実現する | `docs/spec_001_sales_destination_annual_csv.md` | active
- `D-20260426-007` | 2026-04-26 | 初回 deliverable はブラウザ表ではなく年間集計済み CSV の出力とする。ブラウザ一覧は後続拡張とする | `docs/spec_001_sales_destination_annual_csv.md` | active
- `D-20260426-008` | 2026-04-26 | 実装では、対象年だけでなく対象月範囲を指定できるようにし、同じ実行結果を画面内の表とグラフでも確認できるようにする | `docs/spec_001_sales_destination_annual_csv.md` | active
- `D-20260426-009` | 2026-04-26 | 対象月範囲は開始年基準で翌年までまたげるようにし、画面表示と CSV 出力は別ボタンで分離する。グラフの総合計上位はフォームの並び順ではなく総合計料金そのものの降順で算出する | `docs/spec_001_sales_destination_annual_csv.md` | active
- `D-20260426-010` | 2026-04-26 | 年またぎ指定は開始年と終了年を明示する方式に変え、直近12か月と年度のクイック選択を追加する。前年同時期の比較値はまず画面上のサマリーと一覧へ表示する | `docs/spec_001_sales_destination_annual_csv.md` | active
