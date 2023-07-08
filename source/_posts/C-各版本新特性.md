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

<!--more-->

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

### ref

将值类型声明为引用类型

```cs
int number = 6;
ref int n = ref number;
n = 8;

Console.WriteLine($"number = {number}"); // 8
Console.WriteLine($"n = {n}"); // 8
```

## C# 8

是专门面向 .net core 的第一个主要 C# 版本

### 默认接口方法

可以不止是约束，也可以实现完整的方法

### 模式匹配

增强 switch 的模式匹配

#### 属性模式

可以匹配对象中的属性

```cs
public class Cls
{
  public string Prop { get; set; } = null!;
}

public static string Func(Cls obj) => obj switch
{
  { Prop: "val1" } => "result1",
  { Prop: "val2" } => "result2",
  { Prop: "val3" } => "result3",
  _ => "result4"
};

var v = Func(new Cls()
{
  Prop = "val2"
});
Console.WriteLine(v); // result2
```

#### 元组模式

可以匹配元组

#### 位置模式

按属性位置取，组成元组，然后匹配

### using 新版声明

using 块如果范围为整个函数，可以省略大括号

### 静态本地函数

本地函数可以声明为静态的

### 可处置的 ref 结构

可以用 ref 声明 struct，表示此 struct 的实例对象都是引用类型

### 可空引用类型

更灵活的可空特性

通过 `?` 为字段、属性、方法参数、返回值等添加是否可为 null 的特性

### 异步流

可以返回异步版本的迭代器

```cs
async IAsyncEnumerable<int> GetList()
{
  for (var i = 0; i < 100; i++)
  {
    await Task.Delay(100);
    yield return i;
  }
}

await foreach (var num in GetList())
{
  Console.WriteLine(num); // 0-99
}
```

### 异步释放

增加 IDisposable 的异步版本 IDisposableAsync

接口函数为 `DisposeAsync()`

```cs
public class Cls : IAsyncDisposable
{
  public async ValueTask DisposeAsync()
  {
  }
}
```

### 索引和范围

可以指定数组范围

```cs
var nums = new int[]{
  1,2,3,4,5
};
var nums2 = nums[^2]; // 倒数
var nums3 = nums[1..3];
var nums4 = nums[^2..^0]; // 倒数范围
var nums5 = nums[..];
var nums6 = nums[..3]; // 前三个
var nums7 = nums[2..]; // 第三个开始直到结尾
```

声明范围

```cs
Range rg = 1..4;
var n = nus[rg];
```

### null 合并赋值

语法 `??=`

如果左侧不为空，直接返回左侧

如果左侧为空，则将右侧赋值给左侧，然后返回左侧

```cs
// WPF 常用
private ICommand _okCommand = null;
public ICommand OkCommand => _okCommand ??= new DelegateCommand(() =>
{

});
```

### 内插字符串增强功能

可以结合 `$` 和 `@` 声明字符串，结合二者功能，声明顺序不分先后

```cs
var text = $@"abc\de{12}";
Console.WriteLine(text); // abc\de12
```

## C# 9

随 .NET5 一起发布，是面向 .NET5 版本的任何程序集的默认语言版本

### 记录类型

用 `record` 声明的类型

是新的引用类型，相当于引用类型的 `struct`

与类的区别是，`record` 可以使用基于值的相等性

#### 简单声明

可以简单声明只读记录

```cs
record Personal(string FirstName, string LastName);

var person = new Personal("n1", "n2");
Console.WriteLine($"FirstName = {person.FirstName}");
Console.WriteLine($"LastName = {person.LastName}");
```

#### 可初始化记录

也可以用 `init` 声明可初始化的记录，只能在构造函数中或初始化类时赋值

```cs
public record Personal
{
  public string FirstName { get; init; } = null!;
  public string LastName { get; init; } = null!;
}
```

#### 读写记录

也可以声明可读写记录

```cs
public record Personal
{
  public string FirstName { get; set; } = null!;
  public string LastName { get; set; } = null!;
}
```

#### 值相等性

同类 record 的两个实例对象，只要属性值都相同，`==` 运算符就为 `true`

运行时类型必须相等，派生类型也不行

#### 非破坏性修改

用 `with` 基于已有记录，新建一条记录

```cs
Personal person1 = new("n1", "n2");
Personal person2 = person1 with { FirstName = "John" };
```

#### ToString

.ToString 会格式化属性名和属性值

```
DailyTemperature { HighTemp = 57, LowTemp = 30, Mean = 43.5 }
```

### 仅限 Init 的资源库

用 init 替换 set 声明属性，只能在构造函数或初始化时设置属性值

### 顶级语句

不用 Main 方法和 namespace，直接写函数体代码

### 模式匹配增强功能

改进模式匹配

- 类型模式匹配一个与特定类型匹配的对象
- 带圆括号的模式强制或强调模式组合的优先级
- 联合 `and` 模式要求两个模式都匹配
- 析取 `or` 模式要求任一模式匹配
- 否定 `not` 模式要求模式不匹配
- 关系模式要求输入小于、大于、小于等于或大于等于给定常数。

```cs
public static bool IsLetter(this char c) =>
    c is >= 'a' and <= 'z' or >= 'A' and <= 'Z';
```

```cs
public static bool IsLetterOrSeparator(this char c) =>
    c is (>= 'a' and <= 'z') or (>= 'A' and <= 'Z') or '.' or ',';
```
 
 > 未完待续