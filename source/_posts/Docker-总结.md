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
  - `-n=?` 前几条
- `docker container ls` 等同于 `docker ps`
- `docker image ls` 列出镜像
  - `-q` 只列出镜像 id
- `docker iamges` 等同于 `docker image ls`
- `docker volume ls` 列出数据卷
  - `-q` 只列出数据卷 id
- `docker pull [OPTIONS] NAME[:TAG|@DIGEST]` 从 hub.docker.com 拉取镜像
- `docker create [OPTIONS] IMAGE [COMMAND] [ARG...]` 创建一个新的容器
  - `--name` 容器名称
  - `-v` 数据卷
  - `-e` 环境变量
  - `-p` 端口映射
  - `-it` 使用交互方式进行
- `docker run [OPTIONS] IMAGE [COMMAND] [ARG...]` 创建并运行一个容器
  - `-d` 后台运行
- `docker rm 容器id` 删除指定容器，参数和 `docker run` 很像
  - `docker rm -f $(docker ps -aq)` 删除所有容器
  - `docker --rm` 用完后删除，一般用于测试
- `docker rm iamge` 删除镜像
  - `docker rmi -f $(docker iamges -aq)` 删除所有镜像
- `docker rmi` 和 `docker rm iamge` 相同
- `docker exec [OPTIONS] CONTAINER COMMAND [ARG...]` 进入容器后开启一个新的终端
- `docker attach [OPTIONS] CONTAINER` 进入容器正在执行的终端
- `docker cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH|-` 拷贝文件

## DockerFile 常用命令

- FROM 基础镜像，一切从这里开始构建
- MAINTAINER 镜像的作者，姓名+邮箱
- RUN 镜像构建时要运行的脚本
- WORKDIR 镜像的工作目录
- VOLUME 挂载的目录
- EXPOST 暴漏端口
- CMD 指定容器启动时要运行的命令，只有最后一个会生效，可被替代
- ENTRYPOINT 和 CMD 类似，但可以追加命令
- ONBUILD 当构建一个被继承 DockerFile 时会运行
- COPY 类似 ADD，拷贝文件至镜像中
- ENV 环境变量

## Docker 网络

docker 使用桥接模式连接网络，使用技术是 `evth-pair`，`evth-pair` 是一对虚拟设备接口，他们都是成对出现的，一端连着协议，一端彼此相连。因此每启动一个容器，docker 会给容器分配一个 ip，并给宿主机分配一个 ip

宿主机和 docker 容器相互之间都能通过内网互联

### 网络模式

- bridge 桥接 docker（默认，自己创建也使用桥接）
- none 不配置网络
- host 和宿主机共享网络
- container 容器网络连通（用的少，局限大）

### 创建网络

不同集群使用不同的网络，可以保证集群安全

```
docker network create --driver bridge --subnet 192.168.0.0/16 --gateway 192.168.0.1 <name>
```

### 网络联通

```
docker network connect <net1> <net2>
```

执行后，就将 net1 的网络配置复制到了 net2 的网络下

## MySQL

```
docker run --name mysql5 -v mysql5:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=<password> -d -p 55105:3306 mysql:5.7.44
```

```
docker run --name mysql8 -v mysql8:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=<password> -d -p 55108:3306 mysql:8.4.3 --lower-case-table-names=1
```

## MSSQL

```
docker run --name=mssql2022 -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=yourStrong(!)Password' -p 55022:1433 -v /mnt/c/volumes/mssql2022:/var/opt/mssql/data -d mcr.microsoft.com/mssql/server:2022-latest
```

### 连接数据库

```
docker exec -it <container_id|container_name> /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P <your_password>
```

### 开启远程访问

连接数据库后运行

```SQL
EXEC sys.sp_configure N'remote access', N'1'
GO
RECONFIGURE WITH OVERRIDE
GO
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
docker run -itd --name redis7 -v redis7:/data -p 6379:6379 redis:7.4.1
```
