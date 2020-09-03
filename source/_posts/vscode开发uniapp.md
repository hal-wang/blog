---
title: vscode开发uniapp
comments: true
abbrlink: caf85fee
date: 2020-09-03 09:06:23
categories:
tags:
---

个人感觉使用 vs code 开发 uniapp 比官方的 HBuilderX 更好用。

<!--more-->

## 安装 vue-cli

若未安装 vue-cli，在已安装 nodejs 的环境下运行

```
npm install -g @vue/cli
```

## 创建项目

```
vue create -p dcloudio/uni-preset-vue uniapp-proj
```

下载完成后让选择模板，正常开发一般选“默认模板”，初次使用可选择“Hello uni-app”体验。

## 语法提示

在 vscode 中，对 uni-app 的语法提示也可以很友好

### vscode 插件

在 vscode 插件市场中安装`vetur`

### 组件语法提示

安装

```
npm i @dcloudio/uni-helper-json
```

### HBuilderX 自带的代码块

下载 [uni-app 代码块](https://github.com/zhetengbiji/uniapp-snippets-vscode)，放入根目录下的`.vscode`文件夹

## 运行

可以使用 HBuilderX 打开项目运行，也可以使用命令

```
npm run dev:%PLATFORM%
```

```
npm run build:%PLATFORM%
```

`$PLATFORM$`可见 [官网](https://uniapp.dcloud.io/quickstart?id=%e8%bf%90%e8%a1%8c%e3%80%81%e5%8f%91%e5%b8%83uni-app)

## eslint 语法检查

1. vs code 安装插件 ESLint
2. 下载安装 `eslint-config-standard` 后执行 `npx eslint --init`
3. 配置全局变量，在.eslintrc.js 文件的`gloabls`处加上

```JS
globals: {
   uni: true,
   plus: true
},
```
