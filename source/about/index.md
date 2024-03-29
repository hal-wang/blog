---
layout: "about"
title: "关于本站"
date: 2020-03-21 04:48:33
comments: true
---

用下面的时间线记录博客变化

## 开始

在写这个博客之前，使用 OneNote 记录知识点，虽然 OneNote 很好用，但有两个问题

1. 无法便捷的分享
2. 如果写的东西只给自己看，就会比较马虎，不会注意到细节。虽然写公开的也没人看，但心理上会督促自己认真一些。同时写博客时就相当于让自己认真复习了一遍

## 2018.05

由于本人比较喜欢 C#，同时在校时就想学网页，就用 `asp.net + razor` 边学边做写了个博客

数据库用的 `sql server`，前端使用 `jquery`，界面很简单普通，主要为了学习

## 2018.10

为了准备工作的面试，优化博客内容和样式

并增加简历、证书、自我介绍等内容

## 2019.04

还未毕业，但已经在公司实习三个月了

为了督促自己写下学习记录，但同时也不想花太多精力去维护网站

于是转而选择主流博客网站记录内容

对比了几大主流博客：CSDN、博客园、简书等，大多看起来繁杂，界面有些老旧

毕竟要让自己心理上舒服一些，才能更好的写文章，最终我选择了简书作为我的博客

同时学习了 `Markdown` 语法，这对后面帮助很大

## 2019.08

在 2019.08，简书因为某些原因，一个月时间所有用户禁止发布公开文章

这时我才意识到，这些平台全都靠不住。所以还是自己整博客吧！

在查找合适博客期间，接触并学习了 `Hexo` 相关内容

将文章从简书转移到 Hexo，用云服务器托管

后来尝试更换过多次主题，有简约的，也有花里胡哨的，目前是 Next 主题

## 2020.03

不想运维服务器，并且每次上传也太费劲

于是将 Hexo 博客托管到 GitHub Pages

## 2020.04

GitHub 在国内经常访问不了

找到一个比较简洁功能又很好用的代码托管 Coding

## 2020.10

Coding 改版，托管静态网站必须在腾讯云设置 CDN 加速

而且通知当前的托管方式会在限定时间后移除

一个静态网站托管改成那么复杂？还要强制更新？

这里忍不住大力吐槽 Coding，和 GitHub 简直没法比

同时随着对于云开发的学习，将博客转移到腾讯云 CloudBase 的静态网站托管

## 2022.12

由于腾讯云 CloudBase 出现两次 Bug

1. 有个环境下的云函数突然全部无法访问，发起工单也找不到问题。我尝试另外新建一个云函数，其他云函数就都突然好了，全程莫名其妙
2. 域名更新 SSL 证书时卡住，无法取消也无法删除域名，只能删除环境才能释放域名

遂准备逐渐放弃不稳定的 CloudBase，同时博客回到 GitHub Pages

配合 GitHub Actions 使用，省心省力
