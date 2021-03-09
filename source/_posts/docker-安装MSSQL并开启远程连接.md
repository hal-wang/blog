---
title: docker 安装 MSSQL 并开启远程连接
comments: true
abbrlink: 6a03a8f1
date: 2021-03-09 23:12:41
categories:
  - 教程
tags:
  - docker
  - WSL
---

在 windows 系统上，使用 docker 运行 MSSQL 能避免系统逐渐变得臃肿，并且可以很方便的运行多个不同版本的 MSSQL。

## 前提条件

1. WSL 安装和升级 WSL 2
2. 安装 Linux 子系统并更新至 WSL 2
3. 安装 docker desktop

## 创建 MSSQL 容器

详情见 <https://hub.docker.com/_/microsoft-mssql-server>

下载镜像

```
docker pull mcr.microsoft.com/mssql/server
```

创建容器

```
docker run --name=MSSQL -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=yourStrong(!)Password' -p 1433:1433 -d mcr.microsoft.com/mssql/server:2019-latest
```

连接数据库

```
docker exec -it <container_id|container_name> /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P <your_password>
```

接下来可以以命令行方式使用 MSSQL 了

## 开启远程访问

连接数据库后运行

```SQL
EXEC sys.sp_configure N'remote access', N'1'
GO
RECONFIGURE WITH OVERRIDE
GO
```
