---
title: Vue 命名规范
comments: true
abbrlink: e2b2fa01
date: 2020-10-17 20:59:30
categories:
  - 记录
tags:
  - Vue
  - JS
  - uniapp
  - 规范
---

_代码既艺术，规范既灵魂_

<!--more-->

此规范使用 Vue 写其他项目如 uni-app 等也适用。

## 项目名

使用 `kebab-case` 风格

## 组件

组件有两种

1. 全局通用组件，在`src/components`文件夹中
2. 页面组件，在页面文件夹内的`components`文件夹中

组件有两种存在形式

1. 单文件
2. 文件夹

### 组件文件夹

每个组件文件夹使用`PascalCase`命名

每个组件文件夹下应该有个 `index.vue` 文件，此外其他文件使用`PascalCase`命名

### 单个文件

使用`PascalCase`命名

### 引用

引用处使用`kebab-case`风格

## 页面文件夹

页面文件夹名称是`views`。

1. 使用`kebab-case`命名
2. 单个单词，尽量是名词

## 页面文件

页面文件有两种

1. 位于`views`下的单个页面文件
2. 页面文件在模块文件夹中

### `.js` 文件

类文件除 `index.js` 外使用 `PascalBase` 风格。其他类型的`.js` 文件，使用 `kebab-case` 命名

### `.vue` 文件

1. 除 index.vue 之外，其他.vue 文件统一用 `PascalBase` 命名。
2. 尽量是名词，至少两个单词
3. 列表组件以`Item`结尾

## 其他资源文件

使用 `kebab-case` 命名
