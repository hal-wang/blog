---
title: UWP 关联文件
comments: true
tags:
  - UWP
  - C#
abbrlink: f2359bee
date: 2019-09-16 15:46:10
categories:
  - 记录
reward: true
---

实现关联文件后，可以用软件直接打开对应类型的文件。UWP 设置关联与 WPF 有所不同。

1. 在 vs 中双击 Package.appxmanifest
2. 打开声明选项卡
3. 下拉可用声明列表，找到文件类型关联并点击。如图：

<!--more-->

<center>

![UWP关联文件](./1.png)

</center>

4. 填写徽标路径，可以填相对路径，也可以浏览图标图片文件，vs 会自动添加到解决方案中
5. 填写名称，这个是必填的，一般写软件名称就好
6. 在支持的文件类型中的文件类型填写想要关联的文件类型，比如`.md`。
7. 重新部署 UWP 软件并运行，就可以使用自己的软件打开想要打开的文件类型了
