---
title: Docker 总结
comments: true
abbrlink: 8699d8dc
date: 2021-10-14 08:34:10
categories:
  - 记录
tags:
  - Docker
---

命令参考：<https://docs.docker.com/engine/reference/run/>

## 常用命令

- `docker ps` 列出正在运行的容器
  - `-a` 列出所有容器，包括未运行的
  - `-q` 只列出容器 id <!--more-->
- `docker container ls` 等同于 `docker ps`
- `docker image ls` 列出镜像
  - `-q` 只列出镜像 id
- `docker volume ls` 列出数据卷
  - `-q` 只列出数据卷 id
- `docker pull [OPTIONS] NAME[:TAG|@DIGEST]` 从 hub.docker.com 拉取镜像
- `docker create [OPTIONS] IMAGE [COMMAND] [ARG...]` 创建一个新的容器
  - `--name` 容器名称
  - `-v` 数据卷
  - `-e` 环境变量
  - `-p` 端口映射
- `docker run [OPTIONS] IMAGE [COMMAND] [ARG...]` 创建并运行一个容器

## MySQL

```
docker run --name mysql8 -v mysql8:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=<password> -d -p 3306:3306 mysql:8 --lower-case-table-names=1 --default-authentication-plugin=mysql_native_password
```

## MSSQL

```
docker run --name=mssql2019 -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=yourStrong(!)Password' -p 1433:1433 -v mssql2019:/var/opt/mssql -d mcr.microsoft.com/mssql/server:2019-latest
```

## MongoDB

```
docker run -it --name mongo5 -p 27017:27017 -v mongo5:/etc/mongo -v mongo5db:/data/db -v mongo5configdb:/data/configdb -d mongo:5 --auth

# 进入容器，并使用 admin 连接
$ docker exec -it mongo5 mongo admin
# 创建一个名为 admin，密码为 123456 的用户。
>  db.createUser({ user:'admin',pwd:'123456',roles:[ { role:'userAdminAnyDatabase', db: 'admin'},"readWriteAnyDatabase"]});
# 尝试使用上面创建的用户信息进行连接。
> db.auth('admin', '123456')
```

## Redis

```
docker run -itd --name redis6 -v redis6:/data -p 6379:6379 redis:6
```

指定配置

```
docker run -itd --name redis -v redis:/data -v redis-cfg:/etc/redis -p 6379:6379 redis:6.0 redis
-server /etc/redis/redis.conf --appendonly yes
```
