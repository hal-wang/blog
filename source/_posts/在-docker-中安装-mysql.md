---
title: 在 docker 中安装 mysql
comments: true
abbrlink: 653fd091
date: 2021-08-10 12:17:26
categories:
  - 记录
tags:
  - Docker
  - MySQL
---

```
docker pull mysql:8
```

```
docker run --name mysql8 -v mysql8:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=<password> -d -p 3306:3306 mysql:8 --lower-case-table-names=1 --default-authentication-plugin=mysql_native_password
```

<!--more-->

## 命令解释

- --name: 容器名称
- -v: 数据卷
- -e: 环境变量
  - MYSQL_ROOT_PASSWORD: root 密码
- -p: 端口映射
- --lower-case-table-names: 表明大小写规则
- --default-authentication-plugin: 默认密码验证规则

## my.ini/my.cnf

在 docker 中修改 `my.ini/my.cnf` 不方便，而且每次创建容器都需要修改。但 docker 中的 mysql 支持加配置参数，相当于初始化即修改 `my.ini/my.cnf`

如：

- --lower-case-table-names
- --default-authentication-plugin

在 windows 中，可能需要配置 `lower-case-table-names`

使用 mysql8.0，目前很多情况下需要配置 `default-authentication-plugin` 为 `mysql_native_password`
