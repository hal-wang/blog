---
title: 搭建 Ngrok 服务器
comments: true
tags:
  - Ngrok
abbrlink: 38f11925
date: 2020-04-11 19:55:06
categories:
  - 记录
reward: true
---

Ngrok 可以实现内网穿透，能够借助一个具有公网 IP 的服务器，使内网电脑的某些端口能够被公网访问到。

### 准备工作

- 有公网 IP 的服务器
- 域名（顶级域名或二级域名） <!--more-->
- Linux 系统电脑（虚拟机也行）

_域名需使用 A 记录解析到服务器_

<br>

### 安装环境

- go 环境，由于 ngrok 是使用 go 语言编译，因此需要安装 go 语言环境
- git，也会使用 git 下载源码

在终端中执行

```
yum install gcc mercurial git bzr subversion golang
```

或者

```
sudo apt-get install gcc mercurial git bzr subversion golang
```

<br>

### 下载源码

使用 git 下载 ngrok 源码，在指定目录执行下面语句

```
git clone https://github.com/inconshreveable/ngrok.git
```

完成后会生成 ngrok 目录，进入该目录

```
cd ngrok
```

<br>

### 成证书

_将域名"ngrok.hal.wang"改成自己的域名_

```
mkdir cert

cd cert

export NGROK_DOMAIN="ngrok.hal.wang"

openssl genrsa -out rootCA.key 2048

openssl req -x509 -new -nodes -key rootCA.key -subj "/CN=$NGROK_DOMAIN" -days 5000 -out rootCA.pem

openssl genrsa -out device.key 2048

openssl req -new -key device.key -subj "/CN=$NGROK_DOMAIN" -out device.csr

openssl x509 -req -in device.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out device.crt -days 5000
```

<br/>

```
cp rootCA.pem ../assets/client/tls/ngrokroot.crt

cp device.crt ../assets/server/tls/snakeoil.crt

cp device.key ../assets/server/tls/snakeoil.key
```

<br>

**生成后的证书在 cert 目录**

<br>

### 生成

切换回 ngrok 目录

执行下面语句，生成对应服务端和客户端

```
GOOS=(系统) GOARCH=(位) make release-(服务端/客户端)
```

- 系统：linux/windows/darwin _(Mac)_
- 位：386 _(32 位)_/amd64 _(64 位)_
- 服务端：server/client

**生成后的运行程序在 bin 目录**

<br>

### 服务端运行

参数

- tlsKey 生成证书 cert 目录下的 device.key 文件
- tlsCrt 生成证书 cert 目录下的 device.crt 文件
- tunnelAddr：服务端通道端口，任意设置，默认 4443
- httpsAddr：https 端口，任意设置，默认 443
- httpAddr：http 端口，任意设置，默认 80

Windows：

```
start /b ngrokd
```

linux：

```
./bin/ngrokd -domain="\$NGROK_DOMAIN"
```

<br>

### 客户端运行

Windows:
创建 config 文件，内容如下：

```
server_addr: "ngrok.hal.wang:4443"
trust_host_root_certs: false
tunnels:
      tcpa:
        remote_port: 3390
        proto:
            tcp: 127.0.0.1:3389
```

域名改成自己的，端口是服务端开启的端口`tunnelAddr`

- remote_port 服务端使用的端口，在公网中使用这个
- tcp 端口 映射到本地使用的端口
