---
title: Kendo
comments: true
abbrlink: baed8230
date: 2019-12-05 09:47:01
categories:
tags:
  - js
  - jQuery
  - Kendo
  - Web开发
---

_[API 文档：https://docs.telerik.com/kendo-ui/api/javascript/effects/common](https://docs.telerik.com/kendo-ui/api/javascript/effects/common)_

## 1. 继承

JS 中没有类，生成对象以“复制”方式。可用`kendo.Class.extend()`创建对象，参数为 JS 对象。其中 Class 是基类，若换成其他对象，则从该对象继承。

构造函数：init

---

## 2. 模板

### 2.1 格式

- 执行 JS 代码
  > `#...#`，eg: `#if(){#...#}#`
- 显示原始数据，如果有标签会解析
  > `#=…#`
- 显示 Html 元素，把标签当成文本显示

  > `#:…#`

- 可用\\#输出#字符串

### 2.2 使用模板

```
var template = kendo.template($("#模板id").html());
var result = template(数据);
```

kendo.template 函数返回值为函数，执行函数并传入数据，即将数据和模板合并，返回 html 文本

### 2.3 嵌入式模板 & 外部模板

#### 2.3.1 嵌入式模板

inline: 使用 JavaScript 字符串定义

#### 2.3.2 外部模板

external: 使用 HTML Script 块定义

```
 <script type="text/x-kendo-template" id="templateId">
    <!--Template content here-->
</script>
```

使用`script`标签定义，通过 id 使用模板

---

### 3. 动画

#### 3.1 基本

通过`kendo.fx()`函数 + `jQuery`选择器创建动画对象

```
kendo.fx($("#element")).fadeOut().play();
kendo.fx($("#element")).fade("out").play();
kendo.fx($("#element")).fade().direction("out").play();
```

#### 3.2 合并动画

使用动画对象的`add()`方法

```
var effectWrapper = kendo.fx($("#element"));

var fadeOutEffect = effectWrapper.fadeOut();
fadeOutEffect.add(effectWrapper.zoomOut());

fadeOutEffect.play();
```

### 3.3 多个元素同时开始动画

通过 `$.when()`和`$.then()` 方法

```
$.when(
    kendo.fx(eleFoo).fadeOut().play(),
    kendo.fx(eleBaz).fadeOut().play())
    .then(function(){
        //This will be called when both animations are done
        alert("Both elements faded!");
        });
```

---

## 4. Kendo UI Validator

用于表单验证，弥补 HTML5 的不足

---

## 5. MVVM
