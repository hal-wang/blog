---
title: 解决台电tbook10s没有WiFi、无线网卡驱动
comments: true
tags:
  - 驱动
abbrlink: fb5c96fb
date: 2019-09-09 16:39:07
categories:
  - 教程
reward: true
---

重装系统后台电 tbook10s 的无线网卡死活装不上，这垃圾平板我折腾了几次写个总结。
原因：应该是无线网卡驱动和蓝牙驱动有冲突，导致安装好蓝牙驱动后无线网卡驱动无法启动。
解决思路：先卸载蓝牙和无线网卡驱动，再安装无线网卡驱动，最后安装蓝牙驱动

<!--more-->

### 卸载驱动

打开设备管理器，卸载

- 蓝牙驱动：**系统设备\Broadcom Serial Bus Driver over UART Bus Enumerator**
- WIFI 驱动：**网络适配器\Broadcom 802.11n Wireless SDIO Adapter**

### 安装无线网卡驱动

先下载驱动并**解压**：

> 下载链接：[https://pan.baidu.com/s/1ffAUk2zkhsT6laZBR7or_w](https://pan.baidu.com/s/1ffAUk2zkhsT6laZBR7or_w "百度网盘")
> 提取码：epm0

蓝牙驱动和无线网卡驱动卸载完后，设备管理器的“其他设备”会有个设备有感叹号，右键单击它，然后点“更新驱动程序”，再点“浏览我的计算机...”![安装驱动](./1.png)
然后定位到下载的驱动解压后的文件夹（有很多文件的那个文件夹，不是上层文件夹），再安装，完了就可以连无线了。

### 安装蓝牙驱动

这个随便用“驱动人生”、“驱动精灵”、“驱动大师”等都可以，不用蓝牙不安装也可以

**P.S. 如果安装的是 windows server 系统，需先在“服务器管理器”中“添加角色和功能”勾选“无线 LAN 服务”**![添加角色和功能](./2.png)
