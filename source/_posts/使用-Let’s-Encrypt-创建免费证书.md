---
title: 使用 Let’s Encrypt 创建免费证书
comments: true
abbrlink: f965c2da
date: 2023-09-18 20:08:03
categories:
  - 记录
tags:
  - ssl
---

仅需简单几步，即可使用 Let’s Encrypt 创建免费的多域名和泛域名证书

<!--more-->

## 环境要求

- Linux

## 安装 cerbot

```sh
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install certbot
```

## 创建证书

这里是通过手动 dns 的方式验证域名

执行语句

```sh
sudo certbot certonly --manual --preferred-challenges dns
```

首次执行会让你输入安全邮箱

```sh
Enter email address (used for urgent renewal and security notices)
 (Enter 'c' to cancel):
```

然后同意几个协议，都输入 `Y` 并回车

同意协议后，需要输入域名，用空格分隔

```sh
Please enter the domain name(s) you would like on your certificate (comma and/or
space separated) (Enter 'c' to cancel):
```

输入域名后，等待验证 dns

```sh
Please deploy a DNS TXT record under the name:

_acme-challenge.domain.com.

with the following value:

68vo-beB0fF8csOEolL6ADkK-9FaqwaweaweUJfejSe
```

这时先按提示在云服务商添加 dns 的 TXT 记录，稍等片刻再回车

成功提示如下

```sh
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/domain.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/domain.com/privkey.pem
This certificate expires on 2023-12-17.
These files will be updated when the certificate renews.
```

证书位置在

```sh
/etc/letsencrypt/live/domain.com
```

## 证书链不完整

Let’s Encrypt 创建的证书可能会出现证书链不完整的错误

需要修复一下证书链

浏览器打开 `https://myssl.com/chain_download.html`

选择 `上传证书`

编辑证书文件，将文件内容拷出来，粘贴到网页，再点击 `获取证书链`，即得到修复后的证书内容

## 证书转换

PEM -> PFX/PKCS12

```bash
openssl pkcs12 -export -out cert.pfx -inkey privkey1.pem -in cert1.pem -certfile chain1.pem
```

PFX/PKCS12 -> PEM

```bash
openssl pkcs12 -in cert.pfx -out cert.pem -nodes
```
