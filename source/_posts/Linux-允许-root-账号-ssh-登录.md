---
title: Linux 允许 root 账号 ssh 登录
comments: true
tags:
  - Linux
  - SSH
categories:
  - 记录
reward: true
abbrlink: 1f9e5277
date: 2021-10-06 21:51:13
---

默认情况 Linux 不允许 root 账号 ssh 登录，但有些远程命令如 `scp` 却需要 sudo 权限，因此需要使用 root 账号 ssh 登录

<!--more-->

## 开启 root 账号 ssh 登录

### 编辑 `/etc/ssh/sshd_config` 文件

```
vim /etc/ssh/sshd_config
```

将以下内容

```
#PermitRootLogin prohibit-password
```

修改为

```
PermitRootLogin yes
```

注意删除前面 `#`

### 重启 SSH 服务

```
systemctl restart sshd
```

## 无密码登录

配置 远程端公钥 和 本地端私钥，可无需密码连接

这里仅记录远程端 Linux 如何配置公钥

### 编辑 `/root/.ssh/authorized_keys` 文件

```
vim /root/.ssh/authorized_keys
```

添加公钥内容

### 登录

```
ssh root@<hostname>
```
