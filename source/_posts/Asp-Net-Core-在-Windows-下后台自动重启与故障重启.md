---
title: Asp.Net Core 在 Windows 下后台自动重启与故障重启
comments: true
abbrlink: 8b05d23b
date: 2025-08-02 22:28:15
categories:
  - 记录
tags:
  - C#
  - .netcore
  - Windows
---

在 linux 下后台自动启动和故障重启可以用 systemd 实现，也较容易.

但在 windows 下文档并没有说如何实现，这里说下本人在 windows 下的使用方法和经验。

以下有两种实现方式，都亲测稳定使用。

<!--more-->

## 方法 1：任务计划管理程序

在 `计算机管理 -> 系统工具 -> 任务计划程序 -> 任务计划程序库` 中添加一个任务

- `常规` 选项卡
  - 填写名称，任意即可，如 `YourApi`
  - 勾选 `不管用户是否...`
  - 勾选 `不存储密码...`
  - 勾选 `使用最高权限...`
  - 勾选 `隐藏`
- `触发器` 选项卡，添加触发器，设为 `在系统启动时`
- `操作` 选项卡，新建操作，设置程序的路径和启动参数，如
  - `程序或脚本` 设置为 `E:\YourApi\YourApi.exe`
- `条件` 选择卡，取消勾选 `只有在计算机使用交流电源...`
- `设置` 选项卡
  - 勾选 `允许按需允许任务`
  - 勾选 `如果任务失败，按以下频率重新启动`，按需设置间隔和次数
  - 取消勾选 `如果任务允许时间超过...`
  - 取消勾选 `如果请求后任务还在运行...`

保存后，右键单击新建的条目，再点 `运行` 即可。

后续电脑重启都会自动运行，或者在任务计划程序这里通过点击右键菜单`运行`和`结束`来控制运行。

_实测中文路径可能会影响自动启动，建议使用无特殊字符的英文路径。_

## 方法 2：使用系统自带 sc.exe

这种方式可以将程序作为服务运行，需要修改代码才能支持

### 在 `Program.cs` 中添加代码

```cs
builder.Host.UseWindowsService();
```

如

```cs
using Microsoft.Extensions.Hosting.WindowsServices;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = WindowsServiceHelpers.IsWindowsService()
        ? AppContext.BaseDirectory
        : default
});

// 添加 Windows 服务支持
builder.Host.UseWindowsService();

var app = builder.Build();
app.Run();
```

### 编译后在目标计算机的控制台执行

```bat
sc create <name> binPath="<.exe 路径>" start=auto
```

`<name>` 是自定义服务名， `.exe 路径` 是编译后的可执行程序的绝对路径

如

```bat
sc create YourService binPath="D:\YourApi\YourApi.exe" start=auto
```

此时如果打开 `服务` 就能看到刚才新增的服务了。

打开 `服务` 窗口方式：win+R 运行输入 `services.msc`

### 设置故障重启

上面脚本已经开启了自动启动，因此这里只用设置故障重启即可。

可以使用 `服务` 窗口图形化设置，右键单击服务后点击 `属性`，在 `恢复` 选项卡中设置失败策略

也可以用脚本设置，如

```bat
sc failure "服务名" actions= restart/60000 reset= 86400
```

这表示服务失败后会自动重启（延迟 60 秒），如果 24 小时(86400 秒)内没有再次失败，则失败计数重置。
