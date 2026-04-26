# BACKLOG

## Rules

- ID は `P<phase>-<連番>` を使う
- 各タスクに Done 条件を 1 行で書く
- `Next候補` は 1〜3 件に絞る

## Phase 1

- [x] `P1-01` TL-GroupTravel の実 URL と metadata を確定する
  Done条件: `userscript.config.mjs` の `match` と `name` が対象サイト前提で確定している

- [x] `P1-02` Node.js と依存関係を導入する
  Done条件: `npm install` と `npm run check` が通る

- [x] `P1-03` 壁打ちで最初の対象画面と非目標を絞る
  Done条件: 次スレッドで扱う画面、狙い、非目標が 1 セットに絞られている

- [x] `P1-04` 実サイトで DOM と API の観測ポイントを整理する
  Done条件: 対象画面の主要 DOM anchor、利用候補 API、認証前提、観測方法を説明できる

- [x] `P1-05` 観測結果を具体タスクへ分解する
  Done条件: 実装可能な粒度の task が `docs/tasks_backlog.md` に追加され、順番と verify を説明できる

## Phase 2

- [x] `P2-01` 最初の機能仕様を固める
  Done条件: 対象画面、受け入れ条件、非目標が `docs/spec_*.md` に明文化されている

- [x] `P2-02` 年間集計 UI を統計データ画面へ追加する
  Done条件: 対象年の指定、実行、進捗表示、失敗表示が userscript 上で動く

- [x] `P2-03` 3か月チャンクの CSV 取得を実装する
  Done条件: 既存条件を保ったまま 1 年分を 4 チャンクへ分割し、各チャンクの CSV を取得できる

- [x] `P2-04` 年間集計ロジックと統合 CSV 出力を実装する
  Done条件: `販売先名 x 取扱個所名` で数値列を合算し、比率を再計算した統合 CSV を出力できる

- [x] `P2-05` Tampermonkey へ初回インポートして GUI verify を行う
  Done条件: `dist/*.user.js` を Tampermonkey へ読ませ、年間集計 CSV の出力を確認できる

- [ ] `P2-06` 月範囲 UI と表示内容を運用に合わせて磨く
  Done条件: 年またぎ範囲、表示と CSV の分離、円グラフのシェア表示を含む UI が運用上の要望を満たしている

- [ ] `P2-07` 最新 build を Tampermonkey へ反映して GUI verify を更新する
  Done条件: 年またぎ範囲、表示ボタン、CSV ボタン、円グラフシェア表示を実サイトで確認できる

## Next候補 (max 3)

1. `P2-07`
2. `P2-06`
