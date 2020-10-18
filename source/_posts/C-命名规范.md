---
title: "C# 命名规范"
comments: true
abbrlink: 1534da57
date: 2020-10-17 22:07:18
categories:
  - 记录
tags:
  - C#
  - 规范
---

_代码既艺术，规范既灵魂_

<!--more-->

## 标识方案

C# 有 2 中标识方案

### `PascalCase`

1. 文件/文件夹名
1. 类名
1. 函数名
1. 属性
1. 公有变量
1. 静态变量

### `camelCase`

1. 局部变量
1. 函数参数

## 私有变量

下划线开头的`camelCase`

## 接口

以 `I`开始，使用`PascalCase`

## 特性

以`Attribute`结尾

## 异常

以`Exception`结尾
