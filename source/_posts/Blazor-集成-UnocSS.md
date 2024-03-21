---
title: Blazor 集成 UnoCSS
comments: true
abbrlink: c4cce22d
date: 2024-03-17 13:41:00
categories:
  - 记录
tags:
  - Blazor
---

在原子化 css 中，最热门的当属 `tailwindcss`，而且在 `Blazor` 中集成 `tailwindcss` 的教程也很多

本文使用一个更强大的 `UnoCSS`，目前 `Blazor` 集成 `UnoCSS` 的教程却一个也找不到

这里记录一下如何在 `Blazor` 中集成 `UnoCSS`，相信能给你带来更愉快的开发体验

本文对应源码：<https://github.com/hal-wang/BlazorUnoCSS>

<!--more-->

_本文均使用 pnpm，你也可以对应替换为 npm 或 yarn 等_

## `UnoCSS` 更强大好用

在 `Blazor` 中，网上的教程都是使用 `postcss` 集成 `tailwindcss`

但 `postcss` 对 `tailwindcss` 支持度在 `Blazor` 中其实不太好

举个例子，比如 `pt-30`、`pt-30.2`，在 `tailwindcss` 中不可以使用，因为没有预设这个

但是根据本教程在集成 `UnoCSS` 后的 `Blazor` 却可以

因此按本教程集成 `UnoCSS` 后，不需要看着文档开发，自由度也更高

---

**下面我们开始在 `Blazor` 集成 `UnoCSS`**

## 安装 js 依赖

在项目下执行语句，以创建 `package.json` 文件

```bash
npm init -y
```

在 `package.json` 文件中，增加 `postcss` 生成语句，用于生成 css

```js
  "scripts": {
    "buildcss": "postcss wwwroot/css/site.css -o wwwroot/css/site.min.css"
  },
```

安装依赖

```bash
pnpm add @unocss/postcss
pnpm add postcss-cli
pnpm add unocss
```

此时 `package.json` 应该类似下面这样

```json
{
  "name": "blazor-unocss",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "buildcss": "postcss wwwroot/app.css -o wwwroot/app.min.css"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@unocss/postcss": "^0.58.6",
    "postcss-cli": "^11.0.0",
    "unocss": "^0.58.6"
  }
}
```

## 配置 unocss 和 postcss

增加文件 `postcss.config.cjs`

```js
// postcss.config.cjs
module.exports = {
  plugins: {
    "@unocss/postcss": {},
  },
};
```

增加文件 `uno.config.ts`

```js
// uno.config.ts
import { defineConfig, presetUno } from "unocss";

export default defineConfig({
  content: {
    filesystem: ["**/*.{html,js,ts,jsx,tsx,razor,cshtml}"],
  },
  presets: [presetUno()],
});
```

增加或修改文件 `wwwroot/app.css`

```css
/* wwwroot/app.css */
@unocss;
```

现在如果执行语句 `npm run buildcss`，会在 `wwwroot/app.min.css`生成计算后的 css 文件

因此我们需要引用这个生成的文件

## 引用 css 文件

修改 App.razor 文件（有可能是其他文件，包含 html 头部基元信息）

增加

```html
<link rel="stylesheet" href="app.min.css" />
```

## 配置编译脚本

修改 Blazor 项目 .csproj 文件，增加 `PreBuild`

```xml
	<Target Name="PreBuild" BeforeTargets="PreBuildEvent">
		<Exec Command="npm run buildcss" />
	</Target>
```

之后每次编译项目，都会自动执行语句 `npm run buildcss`

不需要再手动执行

## 源码

GitHub: <https://github.com/hal-wang/BlazorUnoCSS>