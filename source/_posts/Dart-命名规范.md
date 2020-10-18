---
title: Dart 命名规范
comments: true
abbrlink: 85f56d44
date: 2020-10-17 21:43:58
categories:
  - 记录
tags:
  - Dart
  - Flutter
  - 规范
---

_代码既艺术，规范既灵魂_

<!--more-->

## 标识方案

Dart 有 3 中标识方案

### `PascalCase`

1. 类名

### `camelCase`

1. 变量名（包括全局变量和局部变量）
2. 常量名

### `hungarian_notation`

1. 库名
1. 导入包名
1. 文件/文件夹名

## 导包顺序

导包每部分有空行

- dart sdk 内的库
- 第三方库
- 自己的库
- 相对路径引用
