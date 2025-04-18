---
title: Windows 端口转发、IP 转发
comments: true
tags:
  - Windows
abbrlink: dc8977d
date: 2019-09-19 16:27:51
categories:
  - 记录
reward: true
---

Windows 有自带转发命令

## 增加转发

只需一条 cmd 命令：

```sh
netsh interface portproxy add v4tov4 listenport=3306 listenaddress=0.0.0.0 connectport=3306 connectaddress=192.168.3.6
```

<!--more-->

其中“3306、192.168.3.6”替换为自己需要的 IP 和端口：

- listenaddress：本机 IP
- connectport：本机端口
- connectaddress：转发 IP（其他电脑）
- connectport：转发端口（其他电脑）

<br>

可用此方法，通过外网服务器在外网访问内网的数据库。比如云服务器有公网 IP，但云数据库一般只有内网 IP，此方法转发后，可实现外网能够访问云数据库
_如果是服务器想转内网，listenaddress 为内网 IP_

## 查看已有转发

```sh
netsh interface portproxy show all
```

## 删除转发

需指定 `listenport` 和 `listenaddress`

```sh
netsh interface portproxy delete v4tov4 listenport=3306 listenaddress=0.0.0.0
```
