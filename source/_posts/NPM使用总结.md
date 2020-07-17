---
title: NPM使用总结
comments: true
categories:
  - 学习
tags:
  - NPM
  - JS
  - 前端
abbrlink: 754bb81e
date: 2020-07-17 16:32:00
---

## 指定使用淘宝源

```
--registry=https://registry.npm.taobao.org
```

<!--more-->

## 使用 cnpm

```
npm install -g cnpm --registry=https://registry.npm.taobao.org
```

## 使用 yarn

yarn 速度更快但仍然避免不了墙

已安装 node.js 的环境下

```
npm install -g yarn
```

### yarn 常用命令

- yarn init 初始化
- yarn install 安装依赖
- yarn add [package] 添加依赖包
- yarn remove [package] 移除依赖包
- yarn run 执行 package.json 中 scripts 脚本

## 快速 push

git add .
git commit -m "更新"
git push origin master -f

## npm 常用参数

| 参数            | 简写 | 作用                                             |
| --------------- | ---- | ------------------------------------------------ |
| --global        | -g   | 全局安装                                         |
| --save          | -S   | 生产环境依赖，即添加到 dependencies 中           |
| --save-dev      | -D   | 开发环境依赖，即添加到 devDependencies 中        |
| --save-optional | -O   | 安装至可选依赖，即添加到 optionalDependencies 中 |
| --save-exact    | -E   | 精确安装某个版本，即版本号没用`^`符号            |
