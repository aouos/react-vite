<h1 align="center">
React Vite
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/react-vite">
    <img src="https://img.shields.io/npm/v/react-vite.svg" alt="版本" />
  </a>
  <a href="https://www.npmjs.com/package/react-vite">
    <img src="https://img.shields.io/npm/dw/react-vite.svg" alt="周下载量" />
  </a>
  <a href="https://github.com/boltguo/react-vite/actions/workflows/ci.yml">
    <img src="https://github.com/boltguo/react-vite/actions/workflows/ci.yml/badge.svg" alt="CI 状态" />
  </a>
  <img src="https://img.shields.io/node/v/react-vite.svg" alt="支持的 Node 版本" />
  <img src="https://img.shields.io/npm/l/react-vite.svg" alt="协议" />
</p>

<p align="center"><a href="README.md">English</a> | 简体中文 | <a href="README.ja.md">日本語</a></p>

> 交互式创建极简的 React + Vite 项目，可按需勾选 TypeScript、Tailwind CSS、
> React Router、ESLint + Prettier、Zustand、shadcn/ui —— 只装你需要的，生成即可运行。

## 为什么用 `rv` 而不是 `npm create vite@latest`？

Vite 官方脚手架只让你选框架和 JS/TS 变体，不认识 Tailwind、路由、状态管理和
lint —— 生成之后这些都要自己手动接线。`rv` 把这些补齐了：

| 能力                                      | `npm create vite@latest`   | `rv`                                 |
| ----------------------------------------- | -------------------------- | ------------------------------------ |
| React + Vite 基础模板                     | 有                         | 有                                   |
| TypeScript 变体                           | 有                         | 有                                   |
| **Tailwind v4（完整接线）**               | 无，需手动配置             | 有 —— 插件 + CSS `@import` 就绪      |
| **React Router 可运行示例**               | 无                         | 有 —— 两个路由（`/`、`/about`）      |
| **Zustand store + 计数器示例**            | 无                         | 有                                   |
| **shadcn/ui（Tailwind v4）就绪**          | 无                         | 有 —— 主题、`cn()`、示例 `Button`    |
| **ESLint 扁平配置 + Prettier**            | 仅 ESLint，无 Prettier     | 两者都有，选 TS 时自动 TS 化         |
| **`git init` + 编辑器插件推荐**           | 无                         | 有 —— 附 `.vscode/extensions.json`   |
| **在已有目录中初始化**                    | 无（`create-*` 只建新目录）| 有 —— `rv init` 安全合并             |
| **脚手架之后的生成器**                    | 无                         | 有 —— `rv add page/component/store/hook/layout`  |
| **项目健康检查**                          | 无                         | 有 —— `rv doctor`                    |
| **代安装依赖（npm/pnpm/yarn）**           | 无                         | 有 —— 自动探测 PATH 中的包管理器     |

每个功能都是可选的：全部不选，得到的就是和 Vite 官方模板一样的最小产物，
没有任何多余文件和依赖。

## 环境要求

Node.js `^20.19.0 || ^22.13.0 || >=24.0.0`（与生成的项目一致）。

## 安装

```bash
npm install -g react-vite
# 或
pnpm add -g react-vite
# 或
yarn global add react-vite
```

会安装两个等价的全局命令：`rv`（短命令）和 `react-vite`（当 `rv` 与本机别名
冲突时的备用）。也可以免安装直接运行：

```bash
npx react-vite create my-app
```

## 使用

### 创建新项目

```bash
rv create my-app
```

创建 `./my-app`（目录必须为空或不存在），询问功能选择和包管理器，然后生成
项目并执行 `git init`（可用 `--no-git` 跳过；已处于 git 仓库内或未安装 git
时自动跳过 —— 首次提交始终留给你自己）。省略目录参数则进入交互式询问。

### 在当前目录初始化

```bash
mkdir my-app && cd my-app
rv init
```

非空目录也可以：

- 已有的 `package.json` 是**合并**而非替换 —— 你的 name、version 及无关字段
  和 scripts 都会保留，生成的依赖和 scripts 增量并入。
- 若生成文件会覆盖已有文件，可选择**覆盖**、**保留**已有文件或**取消**
  （不写任何东西）。

### 生成器：往已有项目里加东西

```bash
rv add page blog-post     # 懒加载路由 + 导航链接（需 router）
rv add page blog/detail   # 也支持嵌套路由路径
rv add component user-card
rv add store cart         # zustand store（需 zustand）
rv add hook toggle        # src/hooks/useToggle
rv add layout admin       # Outlet 布局（需 router）
```

每个生成器都会从 `package.json` 探测 TypeScript 和 Tailwind，用和项目其余
部分一致的风格生成文件：

- **`rv add page <name>`** —— 生成 `src/pages/BlogPost.tsx`（或 `.jsx`），在
  `src/router` 注册懒加载的 `/blog-post` 路由（每个新页面独立分包），并在
  `src/layouts/RootLayout` 加导航链接。需要 React Router 功能。
- **`rv add component <name>`** —— 生成 `src/components/UserCard.tsx`。
- **`rv add store <name>`** —— 生成 `src/store/useCart.ts`，带类型的 zustand
  store 骨架。需要 Zustand 功能。
- **`rv add hook <name>`** —— 生成 `src/hooks/useToggle.ts`（或 `.js`），一个
  以 `use` 开头、可供扩展的小型 React hook。
- **`rv add layout <name>`** —— 生成带 `<Outlet />` 的
  `src/layouts/AdminLayout.tsx`，并打印如何在它下面嵌套路由。需要 React
  Router 功能。

路由和导航的自动注册依赖脚手架项目中 `// rv:route` 之类的锚点注释。如果你
重构过这些文件（或项目由 v0.0.7 之前的版本创建），页面仍会生成，`rv` 会
打印需要手动添加的代码。

### 检查与修复项目健康

```bash
rv doctor            # 只报告
rv update            # 把漂移的依赖固定回 rv 验证过的版本
rv update --dry-run  # 预览 update 会改什么
```

`rv doctor` 报告依赖漂移（与 `rv` 锁定并验证过的版本集的差异）、Node 版本
是否受支持、rv 锚点是否完好（决定生成器能否自动接线）。`rv update` 把报告
中的依赖部分应用到 `package.json`，之后自己跑一次安装即可。

### 任何改动先预览

`create`、`init`、`add` 都接受 `--dry-run`：只打印将写入哪些文件（`init`
还会标出与已有文件的冲突），不碰磁盘。

### 交互式询问

`create` / `init` 会问三件事（已通过参数提供的会跳过）：

1. **项目目录**（`create`）或**包名**（`init`）
2. **可选功能** —— 多选框：TypeScript、Tailwind CSS、React Router、
   ESLint + Prettier、Zustand、shadcn/ui，每一种组合都受支持且经过测试
   （勾选 shadcn/ui 会自动启用 TypeScript 和 Tailwind）。
3. **依赖安装** —— 从 `PATH` 中探测到的包管理器里选（npm / pnpm / yarn，
   有 lockfile 的优先预选），或跳过安装。

### 非交互用法（CI、脚本）

每个询问都有对应参数，无 TTY 也能运行：

```bash
rv create my-app --features all --install npm
rv create my-app --features typescript,tailwind --install none
rv init --name my-app --features router,zustand --install pnpm --conflicts keep
```

| 参数                     | 命令                           | 取值                                                                          |
| ------------------------ | ------------------------------ | ----------------------------------------------------------------------------- |
| `-f, --features <list>`  | `create` `init`                | 逗号分隔：`typescript`、`tailwind`、`router`、`eslint`、`zustand`、`shadcn`，或 `all` / `none` |
| `--install <manager>`    | `create` `init`                | `npm`、`pnpm`、`yarn`，或 `none` 跳过安装                                     |
| `--name <package-name>`  | `init`                         | 包名（默认取已有 `package.json` 或目录名）                                    |
| `--conflicts <strategy>` | `init`                         | `overwrite`、`keep` 或 `cancel`                                               |
| `--no-git`               | `create`                       | 跳过自动 `git init`                                                           |
| `--dry-run`              | `create` `init` `add` `update` | 预览改动，不写任何文件                                                        |

功能名支持别名：`ts`、`tailwindcss`、`react-router`、`react-router-dom`、
`lint`、`prettier`、`store`、`shadcn-ui`、`ui`。

## 每个功能会加什么

| 功能                  | 生成内容                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **TypeScript**        | 严格模式 `*.tsx` 源码、`tsconfig.json` 项目引用（`app` + `node`）、`typecheck` 脚本、构建脚本带 `tsc -b`                     |
| **Tailwind CSS**（v4）| `vite.config` 加 `@tailwindcss/vite` 插件、`src/index.css` 加 `@import 'tailwindcss'` —— 无需 `tailwind.config.js` 和 PostCSS |
| **React Router**（v7）| `src/router`、带导航的布局、`Home` 和 `About` 页面；非首页路由通过 route-level `lazy` 自动分包                               |
| **ESLint + Prettier** | `eslint.config.js`（扁平配置，选 TS 时自动 TS 化）、`.prettierrc.json`，以及 `lint`、`lint:fix`、`format`、`format:check` 脚本 |
| **Zustand**           | `src/store/useCounter` 和首页上可用的计数器组件                                                                              |
| **shadcn/ui**         | `components.json`、`src/lib/utils` 中的 `cn()`、Tailwind v4 主题（浅色/深色 CSS 变量）、`@/` 导入别名（Vite + tsconfig），以及 `src/components/ui` 中的示例 `Button`。隐含启用 TypeScript + Tailwind |

功能可以自由组合 —— 比如 TS + Tailwind + Router + Zustand 会得到带类型的
路由和 Tailwind 样式的首页计数器，开箱即用。加上 shadcn/ui，
`npx shadcn@latest add <component>` 即刻可用 —— `src/components/ui`
会被当作 vendored（外部引入）代码，排除在 lint / format 之外。

## 脚手架之后

如果让 `rv` 代跑了安装，直接开写；否则：

```bash
cd my-app
npm install
npm run dev
```

生成的脚本：`dev`、`build`、`preview`，选 TypeScript 时另有 `typecheck`，
选 ESLint + Prettier 时另有 `lint` / `format`。

## 依赖版本

模板依赖固定在 CLI 内的一份已验证版本集里（见
[`src/package-json.js`](src/package-json.js)），今天生成的项目是可复现的，
不受 npm 上 `latest` 标签波动影响。`rv` 升级时，这些版本会同步前进。

当前默认：

- React 19 · React DOM 19
- Vite 8 · `@vitejs/plugin-react` 6
- TypeScript 6（选 TS 时）
- Tailwind CSS 4 · `@tailwindcss/vite` 4
- React Router 7（选 Router 时）
- Zustand 5（选 Zustand 时）
- ESLint 10 扁平配置 · `typescript-eslint` 8 · Prettier 3（选 ESLint 时）
- shadcn/ui 依赖：`class-variance-authority`、`clsx`、`tailwind-merge`、`@radix-ui/react-slot`、`tw-animate-css`（选 shadcn/ui 时）

每次发版都会经过冒烟测试：真实生成、安装、构建、类型检查并 lint 四种项目
组合（最小/全功能 × JS/TS）。

## 参与开发

```bash
pnpm install
pnpm test            # 单元测试（node --test）
pnpm smoke           # 生成 + 安装 + 构建真实项目
pnpm verify:release  # 测试 + 冒烟 + npm pack --dry-run
```

PR 流程见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 协议

[MIT](LICENSE)
