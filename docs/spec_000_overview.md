# SPEC 000 Overview

## Goal

TL-GroupTravel 向け Tampermonkey ユーザースクリプトを、TypeScript で安全に開発し、統計データ画面の販売先別期間集計をブラウザ上で提供できる状態を維持する。

## In Scope

- userscript の TypeScript 開発基盤
- `dist/*.user.js` の生成
- Chrome remote debugging と CDP 接続の初期導線
- 統計データ画面向けの期間集計 UI
- 分割 CSV 取得と local 集計
- 画面表示、円グラフ、tooltip、CSV 出力
- 継続開発に必要な運用ドキュメント

## Out of Scope

- 統計データ画面以外への機能展開
- Playwright による本格的な E2E テスト
- 配布用の自動リリース以外の運用自動化
- backend 側への新 API 追加

## Architecture

- `src/main.ts`: userscript 本体の入口。統計データ画面への UI 挿入、CSV 分割取得、local 集計、画面描画を持つ
- `userscript.config.mjs`: userscript metadata の正本
- `scripts/build.mjs`: metadata 付き bundle を生成
- `scripts/open-chrome-debug.ps1`: デバッグ用 Chrome を専用プロファイルで起動
- `scripts/attach-chrome.mjs`: CDP で Chrome へ接続し、ブラウザ制御の入口にする
- `docs/spec_001_sales_destination_annual_csv.md`: 現在の主要機能仕様の正本

## Current Workflow

現在の主要フローは次のとおり。

1. 統計データ画面の既存条件を userscript が読む
2. 対象期間を 3 か月以内のチャンクへ分割する
3. 各チャンクで既存 CSV 出力 Action を順次呼ぶ
4. userscript 側で `販売先名 x 取扱個所名` 単位に再集計する
5. 画面表示または統合 CSV 出力を行う

継続開発では、実サイトで観測した事実だけを `docs/spec_*.md` と `docs/context/*.md` に反映する。

## Verification

1. `npm install`
2. `npm run check`
3. Tampermonkey に `dist/*.user.js` を反映する
4. 統計データ画面で対象条件を作り、`表示する` と `CSV を出力` を確認する
5. 円グラフ、tooltip、前年同時期比較、一覧の並び順を確認する
