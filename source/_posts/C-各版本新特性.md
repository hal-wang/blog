---
title: C# 各版本新特性
comments: true
abbrlink: db715eae
date: 2023-07-08 15:57:13
categories:
  - 速查
tags:
  - C#
---

仅记录 C# 5 及以后版本

## C# 5

随 Visual Studio 2012 发布

### 异步 async/await

```cs
async Task Func() {
  return await Task.Run(() => {

  });
}
```

### 调用方信息特征

可以通过特性，在函数参数，取得调用方信息

- CallerMemberName 调用者函数名/属性名等
- CallerFilePath 调用者文件地址
- CallerLineNumber 调用者代码行数

## C# 6

随 Visual Studio 2015 发布

### Using 静态引入

可以 using 引入类的静态成员

```cs
using static namespace.Class;
```

引入后可直接访问该类中的静态成员

### Using 引入别名

可以给引入的命名空间取别名

```cs
using name = namespace.subnamespace;

var obj = name.Class();
```

### 异常赛选器

支持异常的条件过滤

```cs
try
{

}
catch (Exception e) when (e.Message.StartsWith("demo"))
{

}
```

### 自动属性初始化表达式

为属性赋初始值

```cs
  public static int Id { get; set; } = 123;
```

### Expression-bodied 成员

用 Lambda 表达式定义类成员

只读属性

```cs
  public static DateTime Time => DateTime.Now;
```

get/set 属性

```cs
  public string Name
  {
    get => name;
    set => name = value;
  }
```

无返回值方法

```cs
  public void Func(int id) => this.Id = id;
```

有返回值方法

```cs
  public int Func(int id) => id + 1;
```

构造函数

```cs
public class Location
{
   public Location(string name) => this.Name = name;
}
```

### Null 传播器

运算符 `?.` 和 `?[]`

```cs
var title = user?.todos?[0]?.title;
```

### 字符串插槽

用 `$` 标识的字符串，其中 `{}` 内可写变量或表达式

```cs
var name = "hal.wang";
var text = $"你好，{name}";
```

### nameof 运算符

获取变量的名称

```cs
var user1 = new User();
var naem = nameof(user1); // true
```

## C# 7

随 Visual Studio 2017 发布

### out 变量

简化之前的 out 变量写法，可以不用单独定义变量

以前的写法为

```cs
var intput = "123";
int num;
if(int.TryParse(intput,out num)){
  //
}
```

现在的写法可以是

```cs
var intput = "123";
if(int.TryParse(intput,out var num)){
  //
}
```

### 元组

升级 Tuple 写法

```cs
(double, int) t1 = (4.5, 3);
var val1 = t1.Item1;
var val2 = t1.Item2;
```

```cs
(double Sum, int Count) t2 = (4.5, 3);
var val1 = t2.Sum;
var val2 = t2.Count;
```

```cs
var t3 = (Sum: 4.5, Count:3);
var val1 = t3.Sum;
var val2 = t3.Count;
```

类型相同可赋值

```cs
(double, int) t1 = (4.5, 3);
(sum, distance) = t1;
```

判断相等

```cs
(int a, byte b) left = (5, 10);
(long a, int b) right = (5, 10);
Console.WriteLine(left == right); // true

var left2 = (A: 5, B: 10);
var right2 = (B: 10, A: 5);
Console.WriteLine(left2 == right2); // true
```

### 模式匹配

用 `is` 和 `is not` 判断变量类型，也可以判断 null

```cs
var i = 1;
if (i is int num)
{
  //
}
```

比较离散值（switch）

```cs
public string Func(string command) => command switch
{
  "val1" => "result1",
  "val2" => "result2",
  _ => throw new Exception()
};
```

关系模式（switch）

```cs
public string Func(int num) => num switch
{
  <=5 => "result1",
  (>5 and <10) => "result2",
  11 => "result3",
  > 11 => "result4",
  _ => throw new Exception()
};
```

### 本地函数

函数内部定义函数

### 弃元

用 `_` 命名的变量，可重复

### 命名参数

默认参数可指定参数名传参

```cs
public void Func(int arg1 = null, int arg2 = null)
{

}

Func(arg2: 2);
Func(arg2: 2, arg1: 1);
```

## C# 8

是专门面向 .net core 的第一个主要 C# 版本

> 未完待续