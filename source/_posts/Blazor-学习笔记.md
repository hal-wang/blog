---
title: Blazor 学习笔记
categories:
  - 记录
tags:
  - C#
  - Blazor
  - Razor
abbrlink: 1e28067e
date: 2021-10-13 10:22:24
---

之前就听说 Blazor，以为就是和 RazorPage 差不多就没怎么看。今天仔细查了一下，才发现自己错过了如此强大的框架，赶紧学习一下！

## 特点

- Blazor 很像 Vue 或 React，可以构建丰富的交互式 Web 应用
- Blazor 中的逻辑代码，完全是用 .net 代码写的，因此前端终于可以换个套路，不再用到 JS 了
- 页面语法仍然是 Razor ，但是多了一些特有的元素
- Blazor 真正实现了双向绑定，而不是像 RazorPage 那样的弱绑定。因此现在可以真正的用 MVVM 思想来写前端了

<!--more-->

## 学习资源

- Blazor 开源地址

<https://github.com/dotnet/aspnetcore>

- 微软官方 Blazor 网站

<https://dotnet.microsoft.com/apps/aspnet/web-apps/blazor>

- Blazor Extensions - 精选 Blazor 扩展

<https://github.com/BlazorExtensions>

- Study Blazor

<https://studyblazor.com>

- Ant Design Blazor

<https://ant-design-blazor.gitee.io>

## 运行模式

Blazor 分为两种模式

1. Blazor Server 即服务端模式
2. Blazor WebAssembly 即 WebAssembly 模式

### 服务端模式

服务端模式是在服务端运行并渲染，浏览器使用 SignalR 实时推送至服务器，服务器再返回给浏览器 DOM 差异部分。

也就是说，服务端模式是通过 SignalR 实现实时交互的

### WebAssembly 模式

WebAssembly 模式所有的 .net 代码都是在浏览器中通过 JavaScript 运行的，因此首次加载页面会比较慢，需要下载一些文件。

WebAssembly 模式是基于 WebAssembly（缩写 WASM）实现的

WASM 已支持所有现代浏览器，并且优化速度很快，接近本地性能，得益于 WASM，传统软件有望使用 web 实现
 