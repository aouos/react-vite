<h1 align="center">
React Vite
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/react-vite">
    <img src="https://img.shields.io/npm/v/react-vite.svg" alt="バージョン" />
  </a>
  <a href="https://www.npmjs.com/package/react-vite">
    <img src="https://img.shields.io/npm/dw/react-vite.svg" alt="週間ダウンロード数" />
  </a>
  <a href="https://github.com/boltguo/react-vite/actions/workflows/ci.yml">
    <img src="https://github.com/boltguo/react-vite/actions/workflows/ci.yml/badge.svg" alt="CI ステータス" />
  </a>
  <img src="https://img.shields.io/node/v/react-vite.svg" alt="対応 Node バージョン" />
  <img src="https://img.shields.io/npm/l/react-vite.svg" alt="ライセンス" />
</p>

<p align="center"><a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a> | 日本語</p>

> ミニマルな React + Vite プロジェクトを対話式で作成。TypeScript、Tailwind
> CSS、React Router、ESLint + Prettier、Zustand を必要なものだけ選択 ——
> 生成後すぐに起動できます。

## `npm create vite@latest` ではなく `rv` を使う理由

Vite 公式のスキャフォールドはフレームワークと JS/TS の選択だけで、Tailwind
やルーター、状態管理、lint のことは知りません —— 生成後に自分で配線する
必要があります。`rv` はそこまで面倒を見ます：

| 得られるもの                               | `npm create vite@latest`       | `rv`                                  |
| ------------------------------------------ | ------------------------------ | ------------------------------------- |
| React + Vite ベースライン                  | あり                           | あり                                  |
| TypeScript バリアント                      | あり                           | あり                                  |
| **Tailwind v4（配線済み）**                | なし（手動設定）               | あり —— プラグイン + CSS `@import`    |
| **React Router の動作サンプル**            | なし                           | あり —— 2 ルート（`/`、`/about`）     |
| **Zustand ストア + カウンター例**          | なし                           | あり                                  |
| **ESLint フラット設定 + Prettier**         | ESLint のみ、Prettier なし     | 両方。TS 選択時は TS 対応             |
| **`git init` + エディタ拡張の推奨**        | なし                           | あり —— `.vscode/extensions.json` 付き |
| **既存ディレクトリへの初期化**             | なし（`create-*` は新規のみ）  | あり —— `rv init` で安全にマージ      |
| **生成後のジェネレーター**                 | なし                           | あり —— `rv add page/component/store` |
| **プロジェクトのヘルスチェック**           | なし                           | あり —— `rv doctor`                   |
| **依存関係のインストール代行**             | なし                           | あり —— PATH 上の PM を自動検出       |

すべての機能はオプトインです。何も選ばなければ、Vite 公式テンプレートと
同じ最小構成が得られます —— 余計なファイルも依存もありません。

## 動作要件

Node.js `^20.19.0 || ^22.13.0 || >=24.0.0`（生成されるプロジェクトと同じ）。

## インストール

```bash
npm install -g react-vite
# または
pnpm add -g react-vite
# または
yarn global add react-vite
```

等価な 2 つのグローバルコマンド `rv`（短縮形）と `react-vite`（`rv` が
エイリアスと衝突した場合の代替）がインストールされます。インストールせずに
実行することもできます：

```bash
npx react-vite create my-app
```

## 使い方

### 新規プロジェクトの作成

```bash
rv create my-app
```

`./my-app` を作成し（ディレクトリは空か未作成であること）、機能とパッケージ
マネージャーを質問した後、プロジェクトを生成して `git init` を実行します
（`--no-git` でスキップ。既に git リポジトリ内にいる場合や git 未インストール
時は自動的にスキップ —— 最初のコミットは常にあなたに委ねられます）。
ディレクトリ引数を省略すると対話式で質問されます。

### カレントディレクトリで初期化

```bash
mkdir my-app && cd my-app
rv init
```

空でないディレクトリでも動作します：

- 既存の `package.json` は置き換えではなく**マージ**されます —— name、
  version、無関係なフィールドや scripts は保持され、生成された依存関係と
  scripts が追加されます。
- 生成ファイルが既存ファイルを上書きしそうな場合は、**上書き**・既存を
  **保持**・**キャンセル**（何も書かない）から選択できます。

### ジェネレーター：既存プロジェクトへの追加

```bash
rv add page blog-post     # 遅延ロードのルート + ナビリンク（router 必須）
rv add page blog/detail   # ネストしたルートパスも可
rv add component user-card
rv add store cart         # zustand ストア（zustand 必須）
```

各ジェネレーターは `package.json` から TypeScript と Tailwind を検出し、
プロジェクトの他の部分と同じスタイルでファイルを生成します：

- **`rv add page <name>`** —— `src/pages/BlogPost.tsx`（または `.jsx`）を
  生成し、`src/router` に遅延ロードの `/blog-post` ルートを登録（追加ページ
  はそれぞれ独立したチャンクに）、`src/layouts/RootLayout` にナビリンクを
  追加します。React Router 機能が必要です。
- **`rv add component <name>`** —— `src/components/UserCard.tsx` を生成。
- **`rv add store <name>`** —— 型付き zustand ストアの雛形
  `src/store/useCart.ts` を生成。Zustand 機能が必要です。

ルートとナビの自動登録は、生成プロジェクトに含まれる `// rv:route` 形式の
アンカーコメントに依存します。これらのファイルを再構成した場合（または
v0.0.7 より前に作成されたプロジェクトの場合）でもページ自体は生成され、
手動で追加すべきコードが表示されます。

### プロジェクトの健全性チェックと修復

```bash
rv doctor            # レポートのみ
rv update            # ずれた依存関係を rv 検証済みバージョンに固定し直す
rv update --dry-run  # update の変更内容をプレビュー
```

`rv doctor` は依存関係のドリフト（`rv` が固定・検証しているバージョンとの
差分）、Node バージョンの対応状況、ジェネレーターが動作するためのアンカー
の有無をレポートします。`rv update` はレポートの依存関係部分を
`package.json` に適用します。適用後はパッケージマネージャーで install を
実行してください。

### 変更を先にプレビュー

`create`、`init`、`add` は `--dry-run` を受け付けます：書き込まれる予定の
ファイル（`init` では既存ファイルとの競合も）を表示するだけで、ディスクには
触れません。

### 対話式プロンプト

`create` / `init` は 3 つの質問をします（引数で指定済みの項目はスキップ）：

1. **プロジェクトディレクトリ**（`create`）または**パッケージ名**（`init`）
2. **オプション機能** —— チェックボックス：TypeScript、Tailwind CSS、React
   Router、ESLint + Prettier、Zustand。全 32 通りの組み合わせがサポート・
   テストされています。
3. **依存関係のインストール** —— `PATH` 上で見つかったパッケージマネージャー
   から選択（npm / pnpm / yarn、lockfile に一致するものを優先表示）、または
   スキップ。

### 非対話式の利用（CI・スクリプト）

すべてのプロンプトに対応する引数があり、TTY なしでも実行できます：

```bash
rv create my-app --features all --install npm
rv create my-app --features typescript,tailwind --install none
rv init --name my-app --features router,zustand --install pnpm --conflicts keep
```

| オプション               | コマンド                       | 値                                                                                  |
| ------------------------ | ------------------------------ | ----------------------------------------------------------------------------------- |
| `-f, --features <list>`  | `create` `init`                | カンマ区切り：`typescript`、`tailwind`、`router`、`eslint`、`zustand`、または `all` / `none` |
| `--install <manager>`    | `create` `init`                | `npm`、`pnpm`、`yarn`、または `none`（インストールをスキップ）                      |
| `--name <package-name>`  | `init`                         | パッケージ名（既存の `package.json` かディレクトリ名がデフォルト）                  |
| `--conflicts <strategy>` | `init`                         | `overwrite`、`keep`、または `cancel`                                                |
| `--no-git`               | `create`                       | 自動 `git init` をスキップ                                                          |
| `--dry-run`              | `create` `init` `add` `update` | 何も書き込まずに変更をプレビュー                                                    |

機能名のエイリアスも使えます：`ts`、`tailwindcss`、`react-router`、
`react-router-dom`、`lint`、`prettier`、`store`。

## 各機能が追加するもの

| 機能                   | 追加される内容                                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **TypeScript**         | strict な `*.tsx` ソース、`tsconfig.json` プロジェクト参照（`app` + `node`）、`typecheck` スクリプト、ビルドに `tsc -b`           |
| **Tailwind CSS**（v4） | `vite.config` に `@tailwindcss/vite` プラグイン、`src/index.css` に `@import 'tailwindcss'` —— `tailwind.config.js` も PostCSS も不要 |
| **React Router**（v7） | `src/router`、ナビ付きレイアウト、`Home` / `About` ページ。非インデックスルートは route-level `lazy` でコード分割                  |
| **ESLint + Prettier**  | `eslint.config.js`（フラット設定、TS 選択時は TS 対応）、`.prettierrc.json`、`lint` / `lint:fix` / `format` / `format:check`      |
| **Zustand**            | `src/store/useCounter` とホームページで動作するカウンターコンポーネント                                                            |

機能は自由に組み合わせられます —— たとえば TS + Tailwind + Router + Zustand
なら、型付きルーターと Tailwind スタイルのカウンターが最初から動きます。

## 生成後

`rv` にインストールを任せた場合はすぐ開発を始められます。そうでなければ：

```bash
cd my-app
npm install
npm run dev
```

生成されるスクリプト：`dev`、`build`、`preview`。TypeScript 選択時は
`typecheck`、ESLint + Prettier 選択時は `lint` / `format` も追加されます。

## 依存関係のバージョン

テンプレートの依存関係は CLI 内の検証済みバージョンセットに固定されています
（[`src/package-json.js`](src/package-json.js) 参照）。今日生成した
プロジェクトは再現可能で、npm の `latest` タグの変動に左右されません。
`rv` の更新に合わせて固定バージョンも前進します。

現在のデフォルト：

- React 19 · React DOM 19
- Vite 8 · `@vitejs/plugin-react` 6
- TypeScript 6（TS 選択時）
- Tailwind CSS 4 · `@tailwindcss/vite` 4
- React Router 7（Router 選択時）
- Zustand 5（Zustand 選択時）
- ESLint 10 フラット設定 · `typescript-eslint` 8 · Prettier 3（ESLint 選択時）

すべてのリリースはスモークテストで検証されます：4 種類のプロジェクト構成
（最小/フル × JS/TS）を実際に生成・インストール・ビルド・型チェック・lint
します。

## 開発に参加する

```bash
pnpm install
pnpm test            # ユニットテスト（node --test）
pnpm smoke           # 実プロジェクトの生成 + インストール + ビルド
pnpm verify:release  # テスト + スモーク + npm pack --dry-run
```

PR の手順は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## ライセンス

[MIT](LICENSE)
