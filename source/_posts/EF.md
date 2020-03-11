---
title: EF
comments: true
tags:
  - 速查
  - EF
  - C#
abbrlink: 53684d1a
date: 2020-02-16 22:09:32
categories:
---

## Code First
*初始化*
> Add-Migration InitialCreate

*更新*
> Update-Database

## Db First

*Sql Server*
> Scaffold-DbContext "Data Source=(IP,Port);Initial Catalog=Yt;User ID=sa;Password=(密码)" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models1

*MySql*
> Scaffold-DbContext "Data Source=(IP);port=3316;Initial Catalog=YT;user id=root;password=(密码)" Pomelo.EntityFrameworkCore.MySql