---
title: 用 rclone 将对象存储挂载为本地磁盘
comments: true
abbrlink: 20deb005
date: 2021-05-13 13:52:48
categories:
  - 教程
tags:
  - rclone
---

某些网盘商的突然倒闭，让人不再信任网盘。

于是很多人选择自建 NAT, 自建 NAT 有两种：

1. 自己搭建 NAT 设备，但 NAT 的设备价格不菲，甚至达到 10 年以上网盘商的会员费用，而且涉及到内网穿透等，可能又要买其他服务，所以说这只适合爱折腾的人使用，但并不实用。
2. 云服务器自建 NAT，硬盘费用较高，如果需要传输速度，那带宽费用就更高了。因此这种方式对于个人也不太好。

也有人想使用对象存储，但网页或命令行的操作方式，实在很不方便。

于是就引出了本文目标：让对象存储像本地文件一样简单操作。

<!--more-->

## 下载

1. Rclone

下载方式：[Rclone 官网](https://rclone.org/downloads/) 或 [GitHub](https://github.com/rclone/rclone/releases)

下载后解压到任意目录，如 `C:\Program Files\rclone`

2. Winfsp

下载方式：[GitHub](https://github.com/billziss-gh/winfsp/releases)

按提示默认安装

3. Git

下载方式： [Git 官网](https://gitforwindows.org/) 或 [GitHub](https://github.com/git-for-windows/git/releases/)

按提示默认安装

## 配置

1. 打开任意文件夹，并在左侧导航目录下找到【此电脑】，单击右键选择【属性】>【高级系统设置】>【环境变量】>【系统变量】>【Path】，单击【新建】。

2. 在弹出的窗口中，填写 Rclone 解压后的路径（E:\AutoRclone），单击【确定】。

3. 打开命令行，输入 rclone --version 命令，按 Enter，查看 Rclone 是否成功安装。（快捷键 win+r ，然后输入 cmd ，再回车确定可打开命令行）

4. 命令行中输入 `rclone config` 并回车，出现配置列表

5. 输入 `n` 并回车，然后输入磁盘名称，如 `sync`，然后回车。

6. 选择云服务列表，如果是阿里云/腾讯云等符合 s3 标准的云服务商，输入 4 并回车。然后选择具体云服务商，如果列表没有，则选择最后一个。

7. 配置云服务商
   1. `env_auth> `直接按回车
   2. `access_key_id>` 输入云服务商 SecretId
   3. 选择地域。输入相应序号并回车
   4. 选择权限。作为同步盘，建议 private(default)
   5. 选择存储类型。正常使用建议`低频存储`，选择 `STANDARD_IA`
8. `Edit advanced config`> 直接按回车
9. 确认无误，按回车确定，再输入 q 退出配置

## 挂载本地磁盘

在命令行中输入

```
rclone mount sync:/ S: --cache-dir D:\temp --vfs-cache-mode writes &
```

- sync 为上述配置的磁盘名称
- S 为挂载的盘符，不能与已有盘符重复
- D:\temp 为缓存目录，可任意设置

上述命令执行后如果出现提示 `The service rclone has been started` 则挂载成功

此时在`此电脑`已经能够看到挂载的盘符了。

## 每次开机自动挂载磁盘

如果不设置自动挂载，每次重启后挂载的磁盘都会消失，因此需要开机自动挂载磁盘。

1. win+r 打开运行窗口，输入`taskschd.msc`并回车，打开任务计划程序。
2. 选择最左侧 `任务计划程序库`，再点击最右侧 `创建基本任务`
3. 在 `创建基本任务向导` 中，输入名称和描述，然后点击下一步
4. `触发器`页面选择 `当前用户登陆时`，然后点击下一步
5. `操作` 页面选择 `启动程序`，然后点击下一步
6. `启动程序`页面，`程序或脚本` 处输入 `rclone `，`添加参数（可选）` 处输入 `mount sync:/ S: --cache-dir D:\temp --vfs-cache-mode writes &`，可参考前面 `挂载本地磁盘` 使用的命令行，然后点击下一步
7. `完成` 页面确认无误后点击 `完成`

> 可以愉快的使用对象存储来同步文件了
