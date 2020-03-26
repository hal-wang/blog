---
title: Windows端口转发、IP转发
comments: true
tags:
  - Windows
abbrlink: dc8977d
date: 2019-09-19 16:27:51
categories:
reward: true
---

Windows 端口转发只需一条 Cmd 命令：

```
netsh interface portproxy add v4tov4 listenport=3306 listenaddress=172.17.0.1 connectport=3306 connectaddress=172.17.0.2
```

其中“3306、172.17.0.1、172.17.0.1”替换为自己需要的 IP 和端口：

<!--more-->

- listenaddress：本机 IP
- connectport：本机端口
- connectaddress：转发 IP（其他电脑）
- connectport：转发端口（其他电脑）

<br>

可用此方法，通过外网服务器在外网访问内网的数据库。比如云服务器有公网 IP，但云数据库一般只有内网 IP，此方法转发后，可实现外网能够访问云数据库
_如果是服务器想转内网，listenaddress 为内网 IP_
