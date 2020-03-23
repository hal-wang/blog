---
title: EF
comments: true
tags:
  - 速查
  - C#
abbrlink: 53684d1a
date: 2020-02-16 22:09:32
categories:
---

## Code First

_初始化_

> Add-Migration InitialCreate

_更新_

> Update-Database

## Db First

_Sql Server_

> Scaffold-DbContext "Data Source=(IP,Port);Initial Catalog=Yt;User ID=sa;Password=(密码)" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models1

_MySql_

> Scaffold-DbContext "Data Source=(IP);port=3316;Initial Catalog=YT;user id=root;password=(密码)" Pomelo.EntityFrameworkCore.MySql
