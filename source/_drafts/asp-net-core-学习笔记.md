---
title: asp.net core 学习笔记
comments: true
abbrlink: 703f2894
date: 2021-05-17 16:15:17
categories:
tags:
---

## 环境变量

环境变量取值顺序：

1. appsettings.json
2. appsettings.{Environment}.json
3. User secrets
4. Environment variables
5. Command-line arguments

<!--more-->

### 取值

先在构造函数依赖注入 `IConfiguration configuration`

然后以以下方式调用

```CSharp
var value1 = configuration["key1"];
var value2 = configuration["key2:subkey"];
```

### User secrets

vs 右键项目，点击 `Manage User secrets` 可生成 `secrets.json` 文件，该文件与项目分离，但能够从中取值。

### Environment variables

在项目 `launchSettings.json` 文件中设置的环境变量，如

```JSON
"IIS Express": {
  "commandName": "IISExpress",
  "launchBrowser": true,
  "launchUrl": "swagger",
  "environmentVariables": {
    "ASPNETCORE_ENVIRONMENT": "Development",
    "YourKey": "YourValue"
  }
}
```

### Command-line arguments

使用 `dotnet` 命令启动时输入的参数，如

```shell
dotnet run key1="value1" key2="value2"
```

## 静态文件

如果使用静态文件，要使用 `UseStaticFiles` 中间件

如果定义默认文件，要使用 `UseDefaultFiles` 中间件

`UseDefaultFiles` 只能在 `UseStaticFiles` 前面

`UseFileServer` 结合了 `UseStaticFiles`, `UseDefaultFiles`, `UseDirectoryBrowser`（不推荐使用） 中间件

## Model

Model = 模型类 + 仓储

## Controller

处理传入的 http 请求并响应用户操作

## View

### RederSection

#### 模板声明

渲染节点，传参 `required:false` 则非必选

可以使用 `@if(IsSectionDefined(<name>))` 进行条件渲染

#### 使用

```cshtml
@section <name>{

}
```

### \_ViewStart.cshtml

可以在 Share 文件夹中，统一处理页面

支持文件分层，即也可以在试图文件夹中，统一处理同文件夹下页面

### \_Layout.cshtml

视图模板，默认命名为 `_Layout.cshtml`，也可自定义命名。

可以在试图中设置 `@Layout = "<LayoutName>"`，也可以在 `_ViewStart.cshtml` 中统一设置

### \_ViewImports.cshtml

用于统一引用命名空间

支持文件分层

## 依赖注入

### 优点

- 低耦合
- 提供测试性，容易添加单元测试

### 注册服务

- AddSingleton
- AddTransient
- AddScoped

## Taghelper

### environment

```HTML
<environment include = "Development">
  <!--
    ...
  -->
</environment>


<environment exclude = "Development,Staging">
  <!--
    ...
  -->
</environment>
```

### more

<https://docs.microsoft.com/en-us/aspnet/core/mvc/views/tag-helpers/intro?view=aspnetcore-5.0>

