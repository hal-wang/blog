---
title: "C#读取已安装字体"
comments: true
tags:
  - "C#"
abbrlink: 2fb47029
date: 2019-09-15 17:54:43
categories:
  - 记录
reward: true
---

**先安装 NuGet 包“SharpDX.Dircet2D1”以支持读取字体**

### 获取字体

```
SharpDX.DirectWrite.Factory factory = new SharpDX.DirectWrite.Factory();
using (var fontCollection = factory.GetSystemFontCollection(false))
{
    //操作
}
```

<!--more-->

其中`FontCollection.FontFamilyCount`属性是当前已安装字体数量，`FontCollection.GetFontFamily(int)`函数可以获取按首字母排序好的字体，参数为索引。

`FontCollection.GetFontFamily(int)`得到的是 FontFamily 对象，该对象的`FamilyNames`属性即为对应字体在系统中的名称。

<p>还要使用<code>FamilyNames.GetString(int)</code>函数来获取本地化的名称。比如<em>微软雅黑</em>字体，如果参数为0，则为英文。C#根据这个<code>int</code>参数来获取对应本地化名称。</p>

### 获取本地化名称

如果想获取中文名称，使用函数

```
FontFamily.FamilyNames.FindLocalName(string, out int)
```

第一个参数为区域标识，比如 en-us、zh-cn 等，也可以使用`CultureInfo.CurrentCulture.Name`来获取当前区域并作为函数的第一个参数。

第二个参数即为`FamilyNames.GetString(int)`参数中需要的值。

返回值为 bool 类型，如果该字体包含本地化结果，则返回 True，否则返回 False。 比如我们只需要中文和英文，其中英文的索引为 0，只需判断中文：

```
var fontFamily = fontCollection.GetFontFamily(i);
if (!fontFamily.FamilyNames.FindLocaleName(CultureInfo.CurrentCulture.Name, out int index))
{
    index = 0;
}
```

如果找到中文名称，则 index 为中文对应的索引，否则 index 为 0，即英文的索引。

### 使用

可以在 RichEditBox 或 TextBlock 等控件中，显示对应的字体。只需设置 FontFamily 属性为获取到的字体名称即可，使用本地化后的名称也行
