# TL-GroupTravel Userscript

TL-GroupTravel 向け Tampermonkey ユーザースクリプトを、TypeScript で開発・ビルド・検証するための専用ワークスペースです。

## 目的

- TypeScript で userscript を記述する
- `dist/*.user.js` を安定して生成する
- Chrome に remote debugging で接続し、将来的な自動操作や検証へつなげる
- TL-GroupTravel 向け仕様を別スレッドで具体化できる土台を先に整える

## 現在の状態

このリポジトリは starter の段階です。対象サイトの URL パターンや初回機能仕様は、後続スレッドで確定する前提にしています。

現時点では次だけを先に固定しています。

- userscript のビルド基盤
- Chrome remote debugging の起動補助
- GitHub Pages 配布のひな形
- `docs/` と `AGENTS.md` を起点にした運用骨格

## 重要な注意

`userscript.config.mjs` の `match` はまだ placeholder です。実運用前に TL-GroupTravel の実 URL に置き換えてください。

## 前提

1. Node.js 22 LTS 以上
2. Google Chrome
3. Chrome 拡張の Tampermonkey
4. `npm run chrome:debug` を使う場合は PowerShell 7 (`pwsh`)

## 初期セットアップ

```powershell
npm install
npm run check
```

## 開発コマンド

- `npm run dev`: `dist/*.user.js` を watch build
- `npm run build`: 本番向けに 1 回ビルド
- `npm run typecheck`: TypeScript の型検査
- `npm run lint`: ESLint 実行
- `npm run check`: 型検査、lint、build をまとめて実行
- `npm run chrome:debug`: デバッグポート 9222 付きの Chrome を専用プロファイルで起動
- `npm run chrome:debug:default-profile`: 既存の Chrome Default プロファイルを remote debugging 付きで起動
- `npm run chrome:debug:default-profile:resume`: 既存の Chrome Default プロファイルを前回セッション復元付きで起動
- `npm run chrome:profiles`: 利用可能な Chrome プロファイルを一覧表示
- `npm run chrome:pages`: CDP 経由で Chrome に接続し、開いているページを一覧表示

## ドキュメントの正本

- `AGENTS.md`: リポジトリ全体の常設ルール
- `docs/spec_000_overview.md`: リポジトリ全体の仕様概要
- `docs/context/STATUS.md`: 現況の正本
- `docs/context/DECISIONS.md`: 判断理由の正本
- `docs/tasks_backlog.md`: 未実装タスクの管理

## 配布

`userscript.config.mjs` が userscript metadata の正本です。配布物と Tampermonkey への投入物は `dist/*.user.js` を正とします。

GitHub Pages 配布を使う場合は、`GITHUB_PAGES_BASE_URL` をビルド時に渡すと `updateURL` と `downloadURL` が自動で入ります。

## 次にやること

1. `userscript.config.mjs` の `match` を TL-GroupTravel の実 URL に置き換える
2. 仕様スレッドで最初の対象画面と受け入れ条件を決める
3. `src/main.ts` を対象画面に合わせて具体化する
