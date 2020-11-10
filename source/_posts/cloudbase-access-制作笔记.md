---
title: cloudbase-access 制作笔记
comments: true
abbrlink: 2d5e04ac
date: 2020-11-10 09:17:37
categories:
  - 记录
tags:
  - JS
  - TS
  - NodeJS
  - CloudBase
  - cloudbase-access
---

Serverless 的开发模式一直在演进，各个云服务商也有自己的产品，其中代表性的就是云函数，也就是使用 NodeJS 写的 API。云函数比较轻量，不需要服务器即可实现运算。我最喜欢的是腾讯云 [CloudBase](https://www.cloudbase.net/) 中的云函数，虽然腾讯云也有独立的云函数，但与其他云服务商的云函数都差不多，没什么特点。

## 为什么选择 CloudBase

CloudBase 中的云函数与其他云函数写法相同，使用 HTTP 调用的用法也类似，但它相比于独立的云函数，有以下优点：

1. 在 CloudBase 中有个数据库，根据用法猜测这个数据库是基于 `MongoDB` 的，但是用法又改了一些。这个数据库不需要单独购买，属于 CloudBase 环境中的一环，因此在云函数中调用十分方便。
2. VSCode 插件成熟，在 VSCode 中写 CloudBase 云函数还是很惬意的。

当然我觉得 CloudBase 也有要改进的地方，其中一个最重要的，就是对象存储无法生成上传连接。也就是说，想用 CloudBase 的对象存储，必须遵循 CloudBase 的权限规则。但是，对于一个想自己管理用户的后台来说，这是不现实的。因此目前最好还是把文件放在独立的对象存储中吧，免得被绑死了。

## 云函数痛点

云函数是微服务框架，在各个云服务商的云函数文档中，对于云函数的介绍或者示例，都是一个云函数实现一个简单的功能。这样做是也是为了实现微服务体系，达到轻量级服务。但是各个云函数彼此解耦，在写函数时，一些通用方法必然要写多份，这就造成了代码复用率很低，可能同样的代码要出现在几个云函数中。

当然也有对此的解决方案：

1. 写单独通用云函数，通过云函数调用方式。这种方式会造成云函数调用频率过高，而且效率无法保证，也不能享受到代码智能提示。最重要的，还是太麻烦，写个新通用功能可能要折腾好几个步骤。

2. 把通用功能打包发布至 npm，再在需要的云函数中 install。这种也十分麻烦，每次更改都需要 npm publish，各云函数需要 npm update。

因此解决方案只是妥协，并没有解决实质问题。

## cloudbase-access 前身

苦于以上痛点，我想到了在一个云函数中实现多个功能，通过传入不同参数来分辨，这种不通用的方法，也算是临时解决了我的问题。

```JSON
// https://***/api
{
  "path":"user/login",
  "data":{
    "account":"123",
    "password":"abcdef"
  }
}
```

但对代码有强迫症的我，看着这蹩脚的写法，越看越难受。后来偶然发现云函数调用的环境 `event` ，有个`path`字段，可以获取到访问路径，如调用 `https://***/api/user/login`，path 字段值为 `/user/login`，既然能获取到访问路径，就好办多了，开始重构！

## 初版 cloudbase-access

现有 API 已经使用了之前蹩脚的做法，重构的工程量稍大，因此就想着写个 npm 包，这也是我第一次尝试发布 npm 包。

把原来的 API 和路由有关的部分提出来，新写了个项目 `cloudbase-access`，目的是写出通用的 MVC API 框架。

### 做法

根据环境`event`中的`path`字段值，来访问位于`controller`中的`action`，这个 action 是个 js 文件，基本功能是在这个文件中实现。这种做法其实是参考了 asp.net mvc 的思想。

### 传参

重构之后，前面的传参就改成了下面这种：

```JSON
// https://***/api/user/login
{
  "account":"123",
  "password":"abcdef"
}
```

现在就简单通用多了。

## 改用 ts

NodeJS 写 API 有一个很严重的问题，就是弱类型语言很容易带来错误，比如以下典型错误：

```JS
1 + "0" = "10"
```

在强类型语言种，我可以明确知道变量类型，但是在弱类型语言中，为了保证数据类型的正确性就得手动验证变量类型，必须验证接口参数的数据类型，因为你不知道是谁调用了这个接口。虽然手动验证也可以，但工作量太大，也容易出错。

目前对于 JS 类型检查，主要是`Flow`和`TS`，但 TS 目前以压倒性优势胜出。此外，作为 npm 包，应该使用 ts 来写，这样其他 ts 也好调用。

在`2020.10.29`改用了 TS，初次转 TS 只是把原先的功能使用 TS 实现，并没有更改逻辑和结构。

这次改 TS 的过程，也让我发现了一些现有的很多不足：

1. 返回值封装不完善
2. 路由功能简单
3. action 没有封装
4. 没有单元测试
5. 没有 Demo

后续改进，一个一个解决。

## 返回值

云函数返回的 HTTP 网关，必须符合特定格式，因此在 cloudbase-access 中封装了返回结构。

此前使用 JS，没有过多的封装，返回值也只是个 JSON 对象，有一些内置函数，可以生成返回的对象，但是使用起来总是不方便：需要先加引用再使用，而且没有智能提示。

以前的 JS 返回结构：

```JS
// base.js
module.exports = function (statusCode, body, headers) {
  return {
    isBase64: false,
    statusCode: statusCode,
    headers: Object.assign(
      {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      headers || {}
    ),
    body: body
  }
}
```

```JS
// ok.js
const base = require('./base')

module.exports = function (body, headers) {
  return base(200, body, headers)
}
```

改用 ts 后封装了返回值 `HttpResult`，该类有个 get 属性 `result`，可以获得最终结果，并且加了通用返回头部、返回结果验证等功能。

现在的 TS 返回结果：

```TS
export default class HttpResult {
  constructor(
    public readonly statusCode: number,
    public readonly body?: unknown,
    public readonly headers?: Record<string, unknown>
  ) {}

  get result(): Record<string, unknown> {
    return <Record<string, unknown>>{
      isBase64: false,
      statusCode: this.statusCode,
      headers: Object.assign(HttpResult.baseHeaders, this.headers),
      body: this.body,
    };
  }

  get isSuccess(): boolean {
    return this.statusCode >= 200 && this.statusCode < 300;
  }

  static readonly baseHeaders = <Record<string, unknown>>{
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "nodejs-api": "cloudbase-access",
  };

  static base = function (
    statusCode: number,
    body?: unknown,
    headers?: Record<string, unknown>
  ): HttpResult {
    return new HttpResult(statusCode, body, headers);
  };
  static ok = function (body?: unknown): HttpResult {
    return new HttpResult(200, body);
  };
  // more
}

```


## 中间件



## 封装Action