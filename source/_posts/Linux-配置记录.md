---
title: Linux 配置记录
comments: true
abbrlink: 7781afc
date: 2020-11-24 21:29:36
categories:
  - 记录
tags:
  - Linux
---

## Ubuntu 更换国内源

在国内使用国内源速度更快

修改文件 `/etc/apt/sources.list` 为以下源内容

### 清华源

```bash
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-updates main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-backports main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-security main restricted universe multiverse

# 源码镜像
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-updates main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-backports main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-security main restricted universe multiverse

# 预发布软件源
# deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-proposed main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-proposed main restricted universe multiverse
```

### 阿里源

```bash
deb http://mirrors.aliyun.com/ubuntu/ focal main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ focal-security main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ focal-updates main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ focal-proposed main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ focal-backports main restricted universe multiverse

# 源码镜像
# deb-src http://mirrors.aliyun.com/ubuntu/ focal main restricted universe multiverse
# deb-src http://mirrors.aliyun.com/ubuntu/ focal-security main restricted universe multiverse
# deb-src http://mirrors.aliyun.com/ubuntu/ focal-updates main restricted universe multiverse
# deb-src http://mirrors.aliyun.com/ubuntu/ focal-proposed main restricted universe multiverse
# deb-src http://mirrors.aliyun.com/ubuntu/ focal-backports main restricted universe multiver
```

## 更新源

```bash
apt update
apt upgrade
```

## 缺省 Ubuntu

安装 `build-essential`

```bash
apt install build-essential
```

## 配置 MySql

### 安装

```bash
apt install mysql-server
```

查看随机密码

```bash
cat /etc/mysql/debian.cnf
```

### 启动/停止

```bash
service mysql start
service mysql stop
service mysql restart
```

### 用户操作

#### 删除

```sql
drop 'name'@'host';
```

#### 创建

```sql
CREATE USER 'name'@'host' IDENTIFIED BY 'password';
```

#### 刷新权限

```sql
FLUSH PRIVILEGES;
```

#### 开启远程登陆

MySql 默认不允许远程登录，所以需要开启远程访问权限

只需将 `host` 字段设置为 `%` 即可

```sql
use mysql;
update user set host = '%' where user = 'name';
FLUSH PRIVILEGES;
```

#### 查看用户

```sql
use mysql;
select user,host,plugin,authentication_string from user;
```

#### 更改旧版验证方式

```sql
alter user 'name'@'%' identified with mysql_native_password by 'password';
```

### 大小写敏感

```bash
# Ubuntu下配置文件是/etc/mysql/mysql.conf.d/mysqld.cnf
# CentOS下配置文件是/etc/my.cnf，在[mysqld]下添加配置

lower_case_table_names = 1/2/3
```

### 卸载

```bash
rm /var/lib/mysql/ -R
rm /etc/mysql/ -R
apt autoremove mysql* --purge
apt remove apparmor
```
