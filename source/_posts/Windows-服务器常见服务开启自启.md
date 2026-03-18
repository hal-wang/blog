---
title: Windows 服务器常见服务开启自启
comments: true
abbrlink: eb0253e5
date: 2026-03-18 23:37:39
categories:
  - 记录
tags:
  - Windows
---

包含内容：

- Nginx
- Redis

<!--more-->

## Redis

1. 安装服务

在 redis 目录下以管理员身份执行

```cmd
redis-server --service-install redis.windows.conf
```

2. 启动 Redis 服务

```cmd
redis-server --service-start

或任意位置

net start nginx
```

3. 停止服务（如需）

```cmd
redis-server --service-stop

或任意位置

net stop nginx
```

## Nginx

Nginx 使用 WinSW 进行托管

1. 下载对应版本（x86/x64）的 WinSW <https://github.com/winsw/winsw/releases>
2. 将下载的 `WinSW-X86(X64).exe` 重命名为 `nginx-service.exe` 并和 `nginx.exe` 放一起
3. 新建文件 `nginx-service.xml`，并和 `nginx-service.exe` 放一起，内容如下

```xml
<service>
  <id>nginx</id>
  <name>Nginx</name>
  <description>Nginx Service</description>
  <executable>nginx.exe</executable>
  <stopexecutable>nginx.exe -s stop</stopexecutable>
  <logpath>logs/</logpath>
</service>
```

4. 在 nginx 目录下以管理员身份执行

```cmd
nginx-service.exe install

net start nginx
```
