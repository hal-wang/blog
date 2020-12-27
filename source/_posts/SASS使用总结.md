---
title: SASS使用总结
comments: true
categories:
  - 记录
tags:
  - SASS
  - CSS
abbrlink: c9bac016
date: 2020-07-17 16:31:03
---

## 在项目中安装 sass

```shell
yarn add node-sass 或 npm i node-sass -S
```

<!--more-->

### 使用淘宝源

```
npm i node-sass --sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
```

## 使用变量

以\$开头定义变量，如

```scss
$width: #409eff;

button: {
  min-width: $width;
}
```

### 插值

在字符串中使用时，用#{}包起来，如 `#{$width}`

## 嵌套

在 css 中

```css
.a-long-class-name .class1 {
  color: white;
}

.a-long-class-name .class1 {
  color: black;
}
```

在 scss 中

```scss
.a-long-class-name {
  .class1 {
    color: white;
  }

  .class1 {
    color: black;
  }
}
```

不用再把 class 写多遍

## 注释

### CSS 格式注释

使用/\* code \*/方式，编译后会保留到 CSS 中

```css
/*
这是注释
*/
```

### 单行注释

使用 //，编译后不存在 CSS

```scss
// 这是注释
// 这也是注释
```

### 重要注释

/\*! code \*/

编译后仍然存在，即使压缩后也存在，可用于声明版权等。

```scss
/*!
重要注释！不会被省略
*/
```

## 继承

可继承选择器，可复用很多代码。

```scss
.base {
  margin: 10px;
}

.children {
  @extend .base;

  padding: 6px;
}
```

children 继承 base 选择器

## 可重用代码块 Mixin

```scss
@mixin color($back: #000) {
  color: white;
  background-color: $back;
}

button {
  @include color(#666);
}
```

此处 button 的样式为灰底白字

### Mixin 示例

生成浏览器前缀

```scss
@mixin rounded($vert, $horz, $radius: 10px) {
  border-#{$vert}-#{$horz}-radius: $radius;
  -moz-border-radius-#{$vert}#{$horz}: $radius;
  -webkit-border-#{$vert}-#{$horz}-radius: $radius;
}

#navbar li {
  @include rounded(top, left);
}

#footer {
  @include rounded(top, left, 5px);
}
```

## 引用文件

可引用 css 和 scss 文件

```
　@import "path/filename.scss";
```

## 条件语句

可以使用 @if 和@else 判断

```scss
@if $width > 200 {
  color: #000;
} @else {
  color: #fff;
}
```

## 循环语句

### for 循环

在 sass 中 for 循环有 2 种方式

#### for through

包含结束值

```scss
@for $i from 1 through 100 {
  .class-#{$i} {
    width: #{$i + 100}px;
  }
}
```

此例从 1 循环到 100

#### for to

不包含结束值

```scss
@for $i from 1 to 100 {
  .class-#{$i} {
    width: #{$i + 100}px;
  }
}
```

此例从 1 循环到 99

### while 循环

```　scss
$i: 100;
@while $i > 0 {
  .class-#{$i} {
    width: #{$i + 100}px;
  }
  $i: $i - 1;
}
```

### each 循环

```scss
@each $color in red, green, yellow, blue {
  .btn_#{$color} {
    background-color: #{$color};
  }
}
```

编译的结果为

```css
.btn_red {
  background-color: red;
}

.btn_green {
  background-color: green;
}

.btn_yellow {
  background-color: yellow;
}

.btn_blue {
  background-color: blue;
}
```
