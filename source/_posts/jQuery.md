---
title: jQuery
comments: true
tags:
  - js
  - jQuery
abbrlink: 3bf3e06d
date: 2019-12-05 17:08:04
categories:
---

## 1. 基础
### 1.1 $是个函数，等同于jQuery
```
Window.jQuery = window.$ = jQuery
```

### 1.2 $传递参数
* 匿名函数：入口函数
* #开头字符串：选择器，按ID选择元素
* dom对象：把dom对象转换成jQuery对象
* html标签：创建标签

## 2. dom对象与jQuery对象
* dom对象只能调用dom方法或属性，不能调用jQuery方法或属性
* jQuery对象只能调用jQuery方法或属性，不能调用dom方法或属性
* jQuery对象是通过选择器选择的
* jQuery对象是个伪数组，是dom对象的包装集

### 2.1 dom对象转jQuery对象
只用$()即可

### 2.2 jQuery对象转dom对象
* 使用下标（伪数组）取出来。
* 使用jQuery的get()方法

---
## 3. 设置获取文本
使用text()函数

* 获取：无参，会获取这个标签和子标签的文本
* 设置：字符串参数，覆盖原来的文本及标签，如果文本中有标签也不会解析

---
## 4. 设置/获取样式
使用css()函数

### 4.1 获取
* 一个字符串参数，是样式名。
* 如果获取多个dom对象，只能返回第一个dom的值

### 4.1 设置
* 两个参数，第一个是样式名，第二个是样式值。设置的样式是行内样式
* 一个对象参数，设置多个样式