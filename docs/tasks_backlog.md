# BACKLOG

## Rules

- ID は `P<phase>-<連番>` を使う
- 各タスクに Done 条件を 1 行で書く
- `Next候補` は 1〜3 件に絞る

## Phase 1

- [ ] `P1-01` TL-GroupTravel の実 URL と metadata を確定する
  Done条件: `userscript.config.mjs` の `match` と `name` が対象サイト前提で確定している

- [ ] `P1-02` Node.js と依存関係を導入する
  Done条件: `npm install` と `npm run check` が通る

- [ ] `P1-03` Tampermonkey へ初回インポートする
  Done条件: `dist/*.user.js` を Tampermonkey へ読ませて対象ページで起動確認できる

## Phase 2

- [ ] `P2-01` 最初の機能仕様を固める
  Done条件: 対象画面、受け入れ条件、非目標が `docs/spec_*.md` に明文化されている

- [ ] `P2-02` 最初の画面拡張を実装する
  Done条件: 仕様に沿った最小機能が `src/` に入り、verify と GUI 確認結果を説明できる

## Next候補 (max 3)

1. `P1-01`
2. `P1-02`
3. `P1-03`
