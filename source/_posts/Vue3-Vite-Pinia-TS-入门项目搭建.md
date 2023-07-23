---
title: Vue3 + Vite + Pinia + TS 入门项目搭建
comments: true
abbrlink: bc60d1b8
date: 2022-03-17 11:43:34
categories:
  - 记录
tags:
  - Vue
  - Vite
  - Pinia
  - TS
  - prettier
---

本文将从零开始搭建一个 `Vue3` + `Vite` + `Pinia` + `TS` 入门项目

源码：<https://github.com/hal-wang/vue3-vite-ts-template>

```
git clone https://github.com/hal-wang/vue3-vite-ts-template.git
```

- Vue3 + Vite
- Pinia: 新的状态管理工具，替代 Vuex
- Vue Router 4: 路由管理
- TS + setup: TS 语法糖写法
- Prettier: 格式化工具
- ESlint: 格式标准工具
- Windi CSS: 功能类优先的 CSS 框架，与 Tailwind CSS 用法相同，但速度更快
- iconify + svg: iconify 是功能丰富的图标框架，加上 svg 文件解析，让你选图标随心所欲
- huskey + lint-staged 每次提交代码校验格式规范
- huskey + commitlint 每次提交代码校验提交消息规范

<!--more-->

文中都是用 yarn，如果你使用 npm，可以相应替换

## 创建项目

- 在特定目录下运行命令

```
yarn create @vitejs/app
```

- 按提示，输入项目名

- 选择 vue -> vue-ts 模板

- 进入项目，在项目目录下执行

```
yarn install
```

- 运行项目

```
yarn dev
```

## 基本配置

### 环境变量

如果你不需要区分多个环境，可以跳过这部分

Vite 使用 `ESM` 的方式访问环境变量，即不再使用 `process.env`

```TS
import.meta.env.VITE_NAME
```

你可以使用多个环境来用于 开发/生产 环境

#### 环境变量文件

在项目根目录下创建环境变量文件

命名格式为 `.env.<name>`，如 `.env.production` 和 `.env.development`

环境变量文件内容

```
NODE_ENV=development
# NODE_ENV=production

VITE_BASE_URL= 'Base api url'
# more...
```

其中 NODE_ENV 值为 `development` 或 `production`，对应 开发/生产 环境

#### 使用环境变量

在组件中，使用方式如下

```TS
const url = import.meta.env.VITE_BASE_URL
```

#### 指定环境

在 `package.json` 文件的 scripts 命令中，增加参数 `--mode <name>` 即可指定环境

如

```JSON
"dev": "vite",
"build": "vue-tsc --noEmit && vite build",
```

改为

```JSON
"dev": "vite --mode development",
"dev:prod": "vite --mode production",
"build:dev": "vue-tsc --noEmit && vite build --mode development",
"build:prod": "vue-tsc --noEmit && vite build --mode production",
```

#### 环境变量智能提示

添加文件 `src/types/global`

```TS
// 添加项目实际需要的内容
interface ViteEnv {
  readonly VITE_GLOB_API_PROXY_PREFIX: string;
  readonly VITE_GLOB_API_URL: string;
  readonly VITE_GLOB_PROXY_API_URL: string;
  readonly VITE_PORT: number;
  readonly VITE_GLOB_APP_TITLE: string;
  readonly VITE_PUBLIC_PATH: string;
  readonly VITE_DROP_CONSOLE: boolean;
}

interface ImportMetaEnv extends ViteEnv {
  __: unknown;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

添加文件 `src/build/env.ts`

```TS
export function wrapperEnv(envConf: Record<string, any>): ViteEnv {
  const ret: any = {};

  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, '\n');
    realName = realName === 'true' ? true : realName === 'false' ? false : realName;

    if (envName === 'VITE_PORT') {
      realName = Number(realName);
    }
    ret[envName] = realName;
    if (typeof realName === 'string') {
      process.env[envName] = realName;
    } else if (typeof realName === 'object') {
      process.env[envName] = JSON.stringify(realName);
    }
  }
  return ret;
}
```

在使用的地方可以这样

```TS
import { wrapperEnv } from '/@/build/env';
const viteEnv = wrapperEnv(env);
```

### 网络代理

配置网络代理可以解决开发时的跨域问题，此配置仅开发环境有效，生产环境应配合 nginx 等实现转发

如果你的项目不需要与后端交互，或无需考虑跨域问题，可忽略此部分

#### 创建帮助函数

添加文件 `src/build/proxy.ts`

创建 `createProxy` 函数用于创建代理

```TS
import type { ProxyOptions } from 'vite';

type ProxyItem = [string, string];
type ProxyList = ProxyItem[];
type ProxyTargetList = Record<string, ProxyOptions>;

const httpsRE = /^https:\/\//;
export function createProxy(list: ProxyList = []) {
  const ret: ProxyTargetList = {};
  for (const [prefix, target] of list) {
    const isHttps = httpsRE.test(target);
    ret[prefix] = {
      target: target,
      changeOrigin: true,
      ws: true,
      rewrite: (path) => path.replace(new RegExp(`^${prefix}`), ''),
      ...(isHttps ? { secure: false } : {}),
    };
  }
  return ret;
}
```

#### 配置

修改 `vite.config.ts` 文件，增加

```TS
  const viteEnv = wrapperEnv(env);
```

```TS
    server: {
      host: true,
      port: VITE_PORT,
      proxy: createProxy([[VITE_GLOB_API_PROXY_PREFIX, VITE_GLOB_PROXY_API_URL]]),
    },
```

`VITE_GLOB_API_PROXY_PREFIX` 为代理的路由段

#### 使用

开发环境调用接口时，需要增加 `/api` 开头，如

```TS
get('/api/user')
```

发布环境不能加 `/api` 开头，因此你需要封装网络访问，以防止每次请求都判断运行环境

代码如

```TS
if(dev){
  get('/api' + url)
}else{
  get(baseurl + url)
}
```

### 路径别名

配置路径别名后可以使用路径如 `/@/views/index.ts`, `/@/components/comp.ts` 等

- 在 `vite.config.ts` 文件中，增加内容

```TS
import { resolve } from 'path';

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /\/@\//,
        replacement: pathResolve("src") + "/",
      },
      {
        find: /\/#\//,
        replacement: pathResolve("types") + "/",
      },
    ],
  },
});
```

`/@/` 用于模块，`/#/` 用于类型

- `tsconfig.json` 中增加 `compilerOptions.paths` 和 `compilerOptions.baseUrl`，用于支持 TS 语法检查

```JSON
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "/@/*": ["src/*"],
      "/#/*": ["types/*"]
    }
  },
}
```

### VSCode 配置和断点调试

配置好编辑器，能让开发更顺畅

#### 基本配置

创建 `.vscode/settings.json` 文件，用于存储 vscode 配置信息

```JSON
{
  "typescript.tsdk": "./node_modules/typescript/lib",
  "volar.tsPlugin": true,
  "volar.tsPluginStatus": false,
  "npm.packageManager": "pnpm",
  "editor.tabSize": 2,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.eol": "\n",
  "search.exclude": {
    "**/node_modules": true,
    "**/*.log": true,
    "**/*.log*": true,
    "**/bower_components": true,
    "**/dist": true,
    "**/elehukouben": true,
    "**/.git": true,
    "**/.gitignore": true,
    "**/.svn": true,
    "**/.DS_Store": true,
    "**/.idea": true,
    "**/.vscode": false,
    "**/yarn.lock": true,
    "**/tmp": true,
    "out": true,
    "dist": true,
    "node_modules": true,
    "CHANGELOG.md": true,
    "examples": true,
    "res": true,
    "screenshots": true,
    "yarn-error.log": true,
    "**/.yarn": true
  },
  "files.exclude": {
    "**/.cache": true,
    "**/.editorconfig": true,
    "**/.eslintcache": true,
    "**/bower_components": true,
    "**/.idea": true,
    "**/tmp": true,
    "**/.git": true,
    "**/.svn": true,
    "**/.hg": true,
    "**/CVS": true,
    "**/.DS_Store": true
  },
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/.vscode/**": true,
    "**/node_modules/**": true,
    "**/tmp/**": true,
    "**/bower_components/**": true,
    "**/dist/**": true,
    "**/yarn.lock": true
  },
  "stylelint.enable": true,
  "stylelint.packageManager": "yarn",
  "path-intellisense.mappings": {
    "/@/": "${workspaceRoot}/src"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[less]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[vue]": {
    "editor.defaultFormatter": "johnsoncodehk.volar"
  },
}
```

#### F5 断点调试

- 创建 `.vscode/launch.json` 文件

```JSON
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "edge",
      "request": "launch",
      "name": "edge",
      "url": "http://localhost:3100",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true
    }
  ]
}
```

`edge` 可换为 `Chrome` 或其他浏览器

- 编辑 `vite.config.ts` 文件，增加

```TS
  build: {
    sourcemap: import.meta.env.DEV,
  }
```

即 development 环境下启用 source map，开启后调试器才能正确找到执行语句所在代码位置

`vite.config.ts` 整体配置如

```TS
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: import.meta.env.DEV,
  },
});
```

## 添加 Pinia

Pinia 是 Vue3 推荐的状态管理工具，对 TS 的支持很完善，用起来也比较舒服

### 安装

- 在项目下运行

```
yarn add pinia
```

### 创建文件

- 在 `src` 下创建 store 文件夹，在 store 文件夹下创建 `index.ts` 文件，便于统一管理

- `index.ts` 文件中添加代码

```TS
import type { App } from 'vue';
import { createPinia } from 'pinia';

const store = createPinia();

export function setupStore(app: App<Element>) {
  app.use(store);
}

export { store };
```

- 在 `main.ts` 中修改代码如

```TS
import { createApp } from "vue";
import App from "./App.vue";
import { setupStore } from "/@/store";

const app = createApp(App);
setupStore(app);
app.mount("#app");
```

- 在 store 文件夹下创建 modules 文件夹，此后新增模块可以在这个文件夹中统一管理，如 `app.ts`

```TS
import { defineStore } from 'pinia';
import { store } from '/@/store';

interface AppState {
  count: number;
}
export const useAppStore = defineStore({
  id: 'app',
  state: (): AppState => ({
    count: 0,
  }),
  getters: {
    getCount(): number {
      return this.count;
    },
  },
  actions: {
    setCount(val: number) {
      this.count = val;
    },
  },
});

export function useAppStoreWithOut() {
  return useAppStore(store);
}
```

### 使用

在需要使用的地方

- 若在 setup 函数中你可以这样

```TS
const appStore = useAppStore();
const count = appStore.getCount();
```

- 在非 setup 函数中你可以这样

```TS
const appStore = useAppStoreWithOut();
const count = appStore.getCount();
```

- 同时有 `get` 和 `set` 的 `computed`

```TS
  const appStore = useAppStore();
  const count = computed({
    get: () => appStore.getCount,
    set: (val: number) => appStore.setCount(val),
  });
```

### 简单介绍

#### getters

pinia 中的 getters 和 vuex 中的 getters 功能相同

#### actions

- pinia 中 actions 可以不依赖 mutations，能够在 action 中直接修改状态值
- pinia 中的 actions 支持多个参数
- pinia 中的 actions 支持异步函数

## 添加路由

如果你的网站不涉及多页面跳转，可以忽略此部分内容

### 安装

- 在项目下运行

```
yarn add vue-router
```

### 使用

- 在 `src` 下创建 router 文件夹，在 router 文件夹下创建 `index.ts` 文件和 `modules` 文件夹，便于统一管理

```TS
import type { App } from "vue";
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const modules = import.meta.globEager("./modules/**/*.ts");
const routeModuleList: RouteRecordRaw[] = [];
Object.keys(modules).forEach((key) => {
  const mod = modules[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeModuleList.push(...modList);
});

// app router
export const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH as string),
  routes: routeModuleList,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// config router
export function setupRouter(app: App<Element>) {
  app.use(router);
}
```

以上代码可以动态加载 `router/modules` 中的路由文件，此后各个模块的路由可以在此文件夹下创建

- 在 `modules` 文件夹中创建路由文件，如 `home.ts`

```TS
import { RouteRecordRaw } from "vue-router";

const home: RouteRecordRaw = {
  path: "/home",
  name: "Home",
  component: () => import("/@/views/home/index.vue"),
  meta: {
    title: "主页",
  },
};

export default home;
```

上面示例同时需要创建 `views/home/index.vue` 文件

- 在 `main.ts` 中新增代码

```TS
setupRouter(app);
```

如

```TS
import { createApp } from "vue";
import App from "./App.vue";
import { setupRouter } from "/@/router";

const app = createApp(App);
setupRouter(app);
app.mount("#app");
```

- 在 `src/App.vue` 中添加

```HTML
 <router-view></router-view>
```

如

```HTML
<template>
  <router-view></router-view>
</template>
```

`router-view` 是用来渲染路由对应的页面组件

### 增加 nProgress

配置 nProgress 可以让页面顶部有个进度条

#### 安装插件

```
yarn add nprogress
yarn add @types/nprogress --dev
```

#### 增加路由钩子

- 创建文件 `src/router/guard.ts`

```TS
import { Router } from 'vue-router';
import nProgress from 'nprogress';

export function createProgressGuard(router: Router) {
  router.beforeEach(async () => {
    nProgress.start();
    return true;
  });

  router.afterEach(async () => {
    nProgress.done();
    return true;
  });
}
```

- 修改文件 `src/router/index.ts` 中的 `setupRouter` 函数，增加以下代码

```TS
  createProgressGuard(router);
```

现在函数为

```TS
// config router
export function setupRouter(app: App<Element>) {
  app.use(router);
  createProgressGuard(router);
}
```

#### 设置进度条样式

- 创建文件 `src/design/index.less`

```less
#nprogress {
  pointer-events: none;

  .bar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99999;
    width: 100%;
    height: 2px;
    background-color: @primary-color;
    opacity: 0.75;
  }
}
```

`@primary-color` 是后面 `增加 stylelint + postcss + less` 部分增加的 `less` 变量

- `main.ts` 中引入

```TS
import '/@/design/index.less';
```

## 添加 Prettier

Prettier 用于格式化代码

### 安装

在项目目录下执行以下命令安装插件

```
yarn add prettier --dev
```

### 配置

- 项目目录下创建 `prettier.config.js` 文件，代码如下

```JS
module.exports = {
  printWidth: 100,
  semi: true,
  vueIndentScriptAndStyle: true,
  singleQuote: true,
  trailingComma: 'all',
  proseWrap: 'never',
  htmlWhitespaceSensitivity: 'strict',
  endOfLine: 'auto',
};
```

- 项目目录下创建 `.prettierignore` 文件，用于配置那些文件需要忽略检查

```
/dist/*
.local
.output.js
/node_modules/**

**/*.svg
**/*.sh

/public/*
```

### 增加格式化脚本

在 package.json 中的 scripts 中新增

```JSON
    "lint:prettier": "prettier --write  \"src/**/*.{js,json,tsx,css,less,scss,vue,html,md}\"",
```

之后运行 `npm run lint:prettier` 即可格式化全部代码

## 添加 ESlint

ESlint 可以规范代码格式

### 安装

- 在项目目录下执行以下命令安装插件

```
yarn add @typescript-eslint/eslint-plugin --dev
yarn add @typescript-eslint/parser --dev
yarn add eslint --dev
yarn add eslint-plugin-vue --dev
yarn add vue-eslint-parser --dev
```

- 如果配合 prettier ，也需要安装

```
yarn add eslint-config-prettier --dev
yarn add eslint-plugin-prettier --dev
```

- 如果报错 `The engine "node" is incompatible with this module. Expected version ">= 16.9.0". Got "***"`，执行以下语句再重试

```
yarn config set ignore-engines true
```

### 配置

- 项目目录下创建 `.eslintrc.js` 文件

```JS
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    jsxPragma: 'React',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  rules: {
    'vue/script-setup-uses-vars': 'error',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'vue/custom-event-name-casing': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'space-before-function-paren': 'off',

    'vue/attributes-order': 'off',
    'vue/one-component-per-file': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-explicit-emits': 'off',
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'never',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'vue/multi-word-component-names': 'off',
  },
};
```

- 项目目录下创建 `.eslintignore` 文件，用于配置那些文件需要忽略检查

```
*.sh
node_modules
*.md
*.woff
*.ttf
.vscode
.idea
dist
/public
/docs
.local
/bin
Dockerfile
```

### 增加检查脚本

在 package.json 中的 scripts 中新增

```JSON
    "lint:eslint": "eslint --cache --max-warnings 0  \"{src,mock}/**/*.{vue,ts,tsx}\" --fix",
```

之后运行 `npm run lint:eslint` 即可检查全部代码是否有不规范的地方

## 增加 Windi CSS

Windi CSS 是一个功能类优先的 CSS 框架，与 Tailwind CSS 用法相同，但速度更快

### 安装

- 在项目目录下执行以下命令安装插件

```
yarn add windicss --dev
yarn add vite-plugin-windicss --dev
```

### 配置

- 修改 `vite.config.ts` 文件，增加如下代码

```
  plugins: [WindiCSS()],
```

整体代码如

```TS
import { defineConfig } from 'vite';
import WindiCSS from 'vite-plugin-windicss';

export default defineConfig({
  plugins: [WindiCSS()],
});
```

- 修改 `main.ts` 文件，增加如下代码

```TS
import 'virtual:windi.css'
```

- 增加 `windi.config.ts` 文件

```TS
import { defineConfig } from 'vite-plugin-windicss';

export default defineConfig({
  darkMode: 'class',
  plugins: [createEnterPlugin()],
  theme: {
    extend: {
      zIndex: {
        '-1': '-1',
      },
      colors: {
        primary: '#0084f4',
      },
      screens: {
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px',
        '2xl': '1600px',
      },
    },
  },
});

function createEnterPlugin(maxOutput = 6) {
  const createCss = (index: number, d = 'x') => {
    const upd = d.toUpperCase();
    return {
      [`*> .enter-${d}:nth-child(${index})`]: {
        transform: `translate${upd}(50px)`,
      },
      [`*> .-enter-${d}:nth-child(${index})`]: {
        transform: `translate${upd}(-50px)`,
      },
      [`* > .enter-${d}:nth-child(${index}),* > .-enter-${d}:nth-child(${index})`]: {
        'z-index': `${10 - index}`,
        opacity: '0',
        animation: `enter-${d}-animation 0.4s ease-in-out 0.3s`,
        'animation-fill-mode': 'forwards',
        'animation-delay': `${(index * 1) / 10}s`,
      },
    };
  };
  const handler = ({ addBase }) => {
    const addRawCss = {};
    for (let index = 1; index < maxOutput; index++) {
      Object.assign(addRawCss, {
        ...createCss(index, 'x'),
        ...createCss(index, 'y'),
      });
    }
    addBase({
      ...addRawCss,
      [`@keyframes enter-x-animation`]: {
        to: {
          opacity: '1',
          transform: 'translateX(0)',
        },
      },
      [`@keyframes enter-y-animation`]: {
        to: {
          opacity: '1',
          transform: 'translateY(0)',
        },
      },
    });
  };
  return { handler };
}
```

## 增加 stylelint + postcss + less

- stylelint 是一个现代的、强大的 CSS 检测工具，用这个比 eslint 检查 css 更强大
- postcss 是一个使 CSS 更容易，更灵活，更快速工作的工具
- less 是一个 CSS 预处理器，便于管理和重用样式表

### 安装

在项目目录下执行以下命令安装插件

```
yarn add less --dev

yarn add postcss --dev
yarn add postcss-html --dev
yarn add postcss-less --dev

yarn add stylelint --dev
yarn add stylelint-config-html --dev
yarn add stylelint-config-prettier --dev
yarn add stylelint-config-recommended --dev
yarn add stylelint-config-recommended-less --dev
yarn add stylelint-config-standard --dev
yarn add stylelint-config-standard-vue --dev
yarn add stylelint-less --dev
yarn add stylelint-order --dev
```

### 增加检查脚本

在 package.json 中的 scripts 中新增

```JSON
    "lint:stylelint": "stylelint --cache --fix \"**/*.{vue,less,postcss,css,scss}\" --cache --cache-location node_modules/.cache/stylelint/",
```

之后运行 `npm run lint:stylelint` 即可检查全部代码是否有 CSS 不规范的地方

### 配置

- 项目目录下创建 `stylelint.config.js` 文件存放 stylelint 的配置

```JS
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-prettier',
    'stylelint-config-recommended-less',
    'stylelint-config-standard-vue',
  ],
  plugins: ['stylelint-order', 'stylelint-less'],
  overrides: [
    {
      files: ['**/*.(less|css|vue|html)'],
      customSyntax: 'postcss-less',
    },
    {
      files: ['**/*.(html|vue)'],
      customSyntax: 'postcss-html',
    },
  ],
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts', '**/*.json', '**/*.md', '**/*.yaml'],
  rules: {
    'no-descending-specificity': null,
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep'],
      },
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep'],
      },
    ],
    'function-no-unknown': null,
  },
};
```

- 项目目录下创建 `.stylelintignore` 文件，用于配置那些文件需要忽略检查

```
/dist/*
/public/*
public/*
```

- 在 `vite.config.ts` 文件中，增加下面预处理配置

```
css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#1e80ff', //  Primary color
          'success-color': '#55D187', //  Success color
          'error-color': '#ED6F6F', //  False color
          'warning-color': '#EFBD47', //   Warning color
          'font-size-base': '14px', //  Main font size
          'border-radius-base': '2px', //  Component/float fillet
          'app-content-background': '#fafafa', //   Link color
        },
        javascriptEnabled: true,
      },
    },
  },
```

完整代码如：

```TS
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#1e80ff', //  Primary color
          'success-color': '#55D187', //  Success color
          'error-color': '#ED6F6F', //  False color
          'warning-color': '#EFBD47', //   Warning color
          'font-size-base': '14px', //  Main font size
          'border-radius-base': '2px', //  Component/float fillet
          'app-content-background': '#fafafa', //   Link color
        },
        javascriptEnabled: true,
      },
    },
  },
});
```

## 增加 husky + lint-staged

使用 `husky` + `lint-staged` ，可以实现每次提交 git 前，自动检查代码的格式规范

### 安装

在项目目录下执行以下命令安装插件

```
yarn add lint-staged --dev
yarn add husky --dev
```

### 配置

#### lint-staged

在 package.json 中的 scripts 中新增

```JSON
    "lint:staged": "lint-staged",
```

之后运行 `npm run lint:staged` 即可手动检查

修改 package.json 文件，增加如下配置内容

```JSON
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "{!(package)*.json,*.code-snippets,.!(browserslist)*rc}": [
      "prettier --write--parser json"
    ],
    "package.json": [
      "prettier --write"
    ],
    "*.vue": [
      "eslint --fix",
      "prettier --write",
      "stylelint --fix"
    ],
    "*.{scss,less,styl,html}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.md": [
      "prettier --write"
    ]
  }
```

#### husky

在 package.json 中的 scripts 中新增

```JSON
    "prepare": "husky install",
```

然后执行下面语句自动创建 `.husky` 文件夹

```shell
yarn prepare
```

在此之后，每次执行 `yarn install` 语句，会自动执行上面的语句

然后创建文件 `.husky/pre-commit`，每次提交代码前会执行这个脚本

```shell
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint:staged
```

## 增加 husky + commitlint

使用 `husky` + `commitlint` ，可以实现每次提交 git 前，自动检查格式规范

规划化提交格式，可用于自动更新 `CHANGELOG.md`、自动生成 Release 内容等功能

husky 按前面的 `增加 husky + lint-staged` 部分安装和配置，此处仅介绍 `commitlint` 相关

### 安装

在项目目录下执行以下命令安装插件，

```
yarn add @commitlint/cli --dev
yarn add @commitlint/config-conventional --dev
```

### 配置

增加文件 `.commitlintrc.js` 用于存放 `commitlint` 校验规则

```js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
        "typo",
      ],
    ],
  },
};
```

新增文件 `.husky/commit-msg` 存放提交代码前执行的脚本

```sh
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no-install commitlint --edit $1
```

## 增加 svg 支持

配置后能够解析 svg 图标文件

### 安装

- 在项目目录下执行以下命令安装插件

```
yarn add vite-plugin-svg-icons --dev
```

### 配置

- 修改 `vite.config.ts` 文件，增加如下代码

```
  plugins: [SvgIconsPlugin({
    iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
    symbolId: 'icon-[dir]-[name]',
    svgoOptions: true,
  })],
```

iconDirs 是配置图标文件目录，这里是 `src/assets/icons`，也可以修改为其他目录

整体代码如

```TS
import { defineConfig } from 'vite';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

export default defineConfig({
  plugins: [createSvgIconsPlugin({
    iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
    symbolId: 'icon-[dir]-[name]',
    svgoOptions: true,
  })],
});
```

- 修改 `main.ts` 文件，增加如下代码

```
import 'virtual:svg-icons-register';
```

### 封装组件

封装组件用起来更方便，否则只能每次用到的地方都这样写

```VUE
  <svg aria-hidden="true">
    <use :href="#icon-name" fill="black" />
  </svg>
```

在 `components/Icon` 下创建 `SvgIcon.vue` 文件，内容为

```VUE
<template>
  <svg
    :class="[$attrs.class, spin && 'svg-icon-spin']"
    :style="getStyle"
    :fill="color"
    aria-hidden="true"
  >
    <use :xlink:href="symbolId" />
  </svg>
</template>
<script lang="ts">
  import type { CSSProperties } from 'vue';
  import { defineComponent, computed } from 'vue';

  export default defineComponent({
    name: 'SvgIcon',
    props: {
      prefix: {
        type: String,
        default: 'icon',
      },
      name: {
        type: String,
        required: true,
      },
      size: {
        type: [Number, String],
        default: 16,
      },
      spin: {
        type: Boolean,
        default: false,
      },
      color: {
        type: String,
        default: '',
      },
    },
    setup(props) {
      const symbolId = computed(() => `#${props.prefix}-${props.name}`);

      const getStyle = computed((): CSSProperties => {
        const { size } = props;
        let s = `${size}`;
        s = `${s.replace('px', '')}px`;
        return {
          width: s,
          height: s,
        };
      });
      return { symbolId, getStyle };
    },
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'svg-icon';

  .@{prefix-cls} {
    display: inline-block;
    overflow: hidden;
    vertical-align: -0.15em;
    fill: currentcolor;
  }

  .svg-icon-spin {
    animation: loadingCircle 1s infinite linear;
  }
</style>
```

使用时

```VUE
<SvgIcon name="name" color="red"/>
```

## 增加 iconify

通过文件的方式使用 svg 还不够方便，用上更强大的 iconify 吧

iconify 是功能丰富的图标框架，可以与任意图标库一起使用

### 安装

- 在项目目录下执行以下命令安装插件

```
yarn add @iconify/iconify
yarn add vite-plugin-purge-icons --dev
yarn add @iconify/json --dev
```

### 配置

- 修改 `vite.config.ts` 文件，增加如下代码

```
  plugins: [PurgeIcons({})],
```

整体代码如

```TS
import { defineConfig } from 'vite';
import PurgeIcons from 'vite-plugin-purge-icons';

export default defineConfig({
  plugins: [PurgeIcons()],
});
```

### 使用 Iconify

在这里搜索图标即可使用，无需下载 <https://icon-sets.iconify.design/>

```HTML
<span class="iconify" data-icon="ic:baseline-add-reaction"></span>
```

### 封装组件

封装组件用起来更方便

在 `src/components` 下创建 `Icon` 文件夹和 `Icon/index.vue` 文件

```VUE
<template>
  <span
    ref="elRef"
    :class="[$attrs.class, 'app-iconify', spin && 'app-iconify-spin']"
    :style="getWrapStyle"
  ></span>
</template>
<script lang="ts">
  import type { PropType } from 'vue';
  import {
    defineComponent,
    ref,
    watch,
    onMounted,
    nextTick,
    unref,
    computed,
    CSSProperties,
  } from 'vue';
  import Iconify from '@purge-icons/generated';

  export default defineComponent({
    name: 'Icon',
    props: {
      // icon name
      icon: { type: String, required: true },
      // icon color
      color: { type: String, default: '' },
      // icon size
      size: {
        type: [String, Number] as PropType<string | number>,
        default: 16,
      },
      spin: { type: Boolean, default: false },
      prefix: { type: String, default: '' },
    },
    setup(props) {
      const elRef = ref<HTMLDivElement | null>(null);

      const getIconRef = computed(() => `${props.prefix ? props.prefix + ':' : ''}${props.icon}`);

      const update = async () => {
        const el = unref(elRef);
        if (!el) return;

        await nextTick();
        const icon = unref(getIconRef);
        if (!icon) return;

        const span = document.createElement('span');
        span.className = 'iconify';
        span.dataset.icon = icon;
        el.textContent = '';
        el.appendChild(span);
      };

      const getWrapStyle = computed((): CSSProperties => {
        const { size, color } = props;
        let fs = size;
        if (typeof size == 'string') {
          fs = parseInt(size, 10);
        }

        return {
          fontSize: `${fs}px`,
          color: color,
          display: 'inline-flex',
        };
      });

      watch(() => props.icon, update, { flush: 'post' });

      onMounted(update);

      return { elRef, getWrapStyle };
    },
  });
</script>
<style lang="less">
  .app-iconify {
    display: inline-block;
  }

  span.iconify {
    display: block;
    min-width: 1em;
    min-height: 1em;
    background-color: #5551;
    border-radius: 100%;
  }
</style>

```

使用时

```
<Icon icon="ant-design:aliyun-outlined"/>
```

### 与 svg 封装为一个组件

`Icon/index.vue` 修改为

```VUE
<template>
  <SvgIcon
    :size="size"
    :name="getSvgIcon"
    v-if="isSvgIcon"
    :class="[$attrs.class]"
    :spin="spin"
    :color="color"
  />
  <span
    v-else
    ref="elRef"
    :class="[$attrs.class, 'app-iconify', spin && 'app-iconify-spin']"
    :style="getWrapStyle"
  ></span>
</template>
<script lang="ts">
  import type { PropType } from 'vue';
  import {
    defineComponent,
    ref,
    watch,
    onMounted,
    nextTick,
    unref,
    computed,
    CSSProperties,
  } from 'vue';
  import SvgIcon from './SvgIcon.vue';
  import Iconify from '@purge-icons/generated';

  const SVG_END_WITH_FLAG = '|svg';
  export default defineComponent({
    name: 'Icon',
    components: { SvgIcon },
    props: {
      // icon name
      icon: { type: String, required: true },
      // icon color
      color: { type: String, default: '' },
      // icon size
      size: {
        type: [String, Number] as PropType<string | number>,
        default: 16,
      },
      spin: { type: Boolean, default: false },
      prefix: { type: String, default: '' },
    },
    setup(props) {
      const elRef = ref<HTMLDivElement | null>(null);

      const isSvgIcon = computed(() => props.icon?.endsWith(SVG_END_WITH_FLAG));
      const getSvgIcon = computed(() => props.icon.replace(SVG_END_WITH_FLAG, ''));
      const getIconRef = computed(() => `${props.prefix ? props.prefix + ':' : ''}${props.icon}`);

      const update = async () => {
        if (unref(isSvgIcon)) return;

        const el = unref(elRef);
        if (!el) return;

        await nextTick();
        const icon = unref(getIconRef);
        if (!icon) return;

        const svg = Iconify.renderSVG(icon, {});
        if (svg) {
          el.textContent = '';
          el.appendChild(svg);
        } else {
          const span = document.createElement('span');
          span.className = 'iconify';
          span.dataset.icon = icon;
          el.textContent = '';
          el.appendChild(span);
        }
      };

      const getWrapStyle = computed((): CSSProperties => {
        const { size, color } = props;
        let fs = size;
        if (typeof size == 'string') {
          fs = parseInt(size, 10);
        }

        return {
          fontSize: `${fs}px`,
          color: color,
          display: 'inline-flex',
        };
      });

      watch(() => props.icon, update, { flush: 'post' });

      onMounted(update);

      return { elRef, getWrapStyle, isSvgIcon, getSvgIcon };
    },
  });
</script>
<style lang="less">
  .app-iconify {
    display: inline-block;
    // vertical-align: middle;

    &-spin {
      svg {
        animation: loadingCircle 1s infinite linear;
      }
    }
  }

  span.iconify {
    display: block;
    min-width: 1em;
    min-height: 1em;
    background-color: #5551;
    border-radius: 100%;
  }
</style>
```

使用时

```VUE
<Icon icon="lavcode|svg" color="red" size="50"/>
<Icon icon="ant-design:aliyun-outlined"  color="red" size="50"/>
```

## 完整的 vite.config.ts

根据此教程，完整的 `vite.config.ts` 文件内容为

```TS
import { ConfigEnv, loadEnv, UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import WindiCSS from 'vite-plugin-windicss';
import PurgeIcons from 'vite-plugin-purge-icons';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import path from 'path';
import { createProxy } from '/@/build/proxy';
import { wrapperEnv } from '/@/build/env';

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}

export default ({ mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();
  const env = loadEnv(mode, root);

  const viteEnv = wrapperEnv(env);

  const {
    VITE_GLOB_API_PROXY_PREFIX,
    VITE_GLOB_PROXY_API_URL,
    VITE_PORT,
    VITE_PUBLIC_PATH,
    VITE_DROP_CONSOLE,
  } = viteEnv;

  return {
    base: VITE_PUBLIC_PATH,
    root,
    plugins: [
      vue(),
      WindiCSS(),
      PurgeIcons(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]',
        svgoOptions: true,
      }),
    ],
    resolve: {
      alias: [
        {
          find: /\/@\//,
          replacement: pathResolve('src') + '/',
        },
        {
          find: /\/#\//,
          replacement: pathResolve('types') + '/',
        },
      ],
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            'primary-color': '#1e80ff', //  Primary color
            'success-color': '#55D187', //  Success color
            'error-color': '#ED6F6F', //  False color
            'warning-color': '#EFBD47', //   Warning color
            'font-size-base': '14px', //  Main font size
            'border-radius-base': '2px', //  Component/float fillet
            'app-content-background': '#fafafa', //   Link color
          },
          javascriptEnabled: true,
        },
      },
    },
    esbuild: {
      pure: VITE_DROP_CONSOLE ? ['console.log', 'debugger'] : [],
    },
    build: {
      sourcemap: import.meta.env.DEV
      outDir: 'dist',
    },
    server: {
      host: true,
      port: VITE_PORT,
      proxy: createProxy([[VITE_GLOB_API_PROXY_PREFIX, VITE_GLOB_PROXY_API_URL]]),
    },
  };
};
```

## 完整的 package.json

根据此教程，完整的 `package.json` 文件内容为

```JSON
{
  "name": "vue3-vite-ts-template",
  "version": "0.0.2",
  "author": {
    "name": "hal-wang",
    "email": "hi@hal.wang",
    "url": "https://github.com/hal-wang"
  },
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint:prettier": "prettier --write  \"src/**/*.{js,json,tsx,css,less,scss,vue,html,md}\"",
    "lint:eslint": "eslint --cache --max-warnings 0  \"{src,mock}/**/*.{vue,ts,tsx}\" --fix",
    "lint:stylelint": "stylelint --cache --fix \"**/*.{vue,less,postcss,css,scss}\" --cache --cache-location node_modules/.cache/stylelint/",
    "lint:staged": "lint-staged",
    "prepare": "husky install"
  },
  "dependencies": {
    "@iconify/iconify": "^3.1.0",
    "nprogress": "^0.2.0",
    "pinia": "^2.0.33",
    "vue": "^3.2.47",
    "vue-router": "^4.1.6"
  },
  "devDependencies": {
    "@commitlint/cli": "^17.4.4",
    "@commitlint/config-conventional": "^17.4.4",
    "@iconify/json": "^2.2.36",
    "@types/node": "^18.15.3",
    "@types/nprogress": "^0.2.0",
    "@typescript-eslint/eslint-plugin": "^5.55.0",
    "@typescript-eslint/parser": "^5.55.0",
    "@vitejs/plugin-vue": "^4.1.0",
    "eslint": "^8.36.0",
    "eslint-config-prettier": "^8.7.0",
    "eslint-plugin-prettier": "^4.2.1",
    "eslint-plugin-vue": "^9.9.0",
    "husky": "^8.0.3",
    "less": "^4.1.3",
    "lint-staged": "^13.2.0",
    "postcss": "^8.4.21",
    "postcss-html": "^1.5.0",
    "postcss-less": "^6.0.0",
    "prettier": "^2.8.4",
    "stylelint": "^15.3.0",
    "stylelint-config-html": "^1.1.0",
    "stylelint-config-prettier": "^9.0.5",
    "stylelint-config-recommended": "^11.0.0",
    "stylelint-config-recommended-less": "^1.0.4",
    "stylelint-config-standard": "^31.0.0",
    "stylelint-config-standard-vue": "^1.0.0",
    "stylelint-less": "^1.0.6",
    "stylelint-order": "^6.0.3",
    "typescript": "^5.0.2",
    "vite": "^4.2.0",
    "vite-plugin-purge-icons": "^0.9.2",
    "vite-plugin-svg-icons": "^2.0.1",
    "vite-plugin-windicss": "^1.8.10",
    "vue-eslint-parser": "^9.1.0",
    "vue-tsc": "^1.2.0",
    "windicss": "^3.5.6"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/hal-wang/vue3-vite-ts-template.git"
  },
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/hal-wang/vue3-vite-ts-template/issues"
  },
  "homepage": "https://github.com/hal-wang/vue3-vite-ts-template",
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "{!(package)*.json,*.code-snippets,.!(browserslist)*rc}": [
      "prettier --write--parser json"
    ],
    "package.json": [
      "prettier --write"
    ],
    "*.vue": [
      "eslint --fix",
      "prettier --write",
      "stylelint --fix"
    ],
    "*.{scss,less,styl,html}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.md": [
      "prettier --write"
    ]
  }
}
```
