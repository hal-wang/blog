---
title: SfaJS 开发笔记
comments: true
abbrlink: d87acb4f
date: 2022-03-28 17:10:46
categories:
  - 记录
tags:
  - SfaJS
  - NodeJS
  - JS
  - TS
---

`sfa` 是一个轻量的可伸缩 web app 框架

`sfa` 可以运行于一般的 http，也可以运行于腾讯云、阿里云等云函数

## 设计初衷

- sfa 是为了 serverless 设计的，最求的是更轻量
- 云函数无法复用代码
- 除 Azure 外，云函数基本上都不支持 TS
- `koajs` 对 TS 支持不友好
- `nestjs` 在云函数中性能表现欠佳，每次函数调用都需要启动服务并加载全部路由。而且 `nestjs` 的装饰器过于泛滥，有许多冗余声明
- 深入底层，加深自己对 http 的理解和运用

<!--more-->

<img src="./logo.png" alt="logo" style="max-height:200px;"></img>

<center>

_SfaJS logo_

</center>

## 2022-03-28 开始记录

### 现状

- 已有几个中间件和运行环境
- 已支持 koa 和 koa 中间件，极大的增加了 sfa 的扩展性
- 已实现 mva 框架，可用于实际项目了
- 已实现注释生成 swagger 文档

### 短期目标

- router 中间件增加装饰器，用于便捷访问请求数据
- 降低 swagger 工作量，增加装饰器生成 swagger 文档的功能
- 增加依赖注入和控制反转的功能

## 文件和文件夹命名规范

写这段文字之前，文件和文件夹命名规范和 `typescript` 源码命名规范相同，即 `camelCase` 写法

后参考总多 nodejs 框架和工具，决定将文件和文件夹命名规范改为 `kebab-case`
