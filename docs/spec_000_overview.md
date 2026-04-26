# SPEC 000 Overview

## Goal

TL-GroupTravel 向け Tampermonkey ユーザースクリプトを、TypeScript で安全に開発し、ビルド成果物とブラウザ接続手順をリポジトリ内へ固定する。

## In Scope

- userscript の TypeScript 開発基盤
- `dist/*.user.js` の生成
- Chrome remote debugging と CDP 接続の初期導線
- 最小限の運用ドキュメント
- 後続スレッドで仕様を詰めるための開始点

## Out of Scope

- TL-GroupTravel 固有の業務ロジック実装
- 対象 URL や対象画面の最終確定
- Playwright による本格的な E2E テスト
- 配布用の自動リリース以外の運用自動化

## Architecture

- `src/main.ts`: userscript 本体の入口
- `userscript.config.mjs`: userscript metadata の正本
- `scripts/build.mjs`: metadata 付き bundle を生成
- `scripts/open-chrome-debug.ps1`: デバッグ用 Chrome を専用プロファイルで起動
- `scripts/attach-chrome.mjs`: CDP で Chrome へ接続し、ブラウザ制御の入口にする

## Verification

1. Node.js を導入する
2. `npm install` を実行する
3. `npm run check` を実行する
4. `npm run chrome:debug` で Chrome を起動する
5. Tampermonkey に `dist/*.user.js` を読み込み、対象ページで起動を確認する
