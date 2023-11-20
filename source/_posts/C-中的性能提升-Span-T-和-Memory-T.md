---
title: C# 中的性能提升 - Span&lt;T&gt; 和 Memory&lt;T&gt;
comments: true
abbrlink: "4e254812"
date: 2023-11-19 11:34:23
categories:
  - 记录
tags:
  - C#
---

简单来说，`Span<T>` 和 `Memory<T>` 能够以安全的方式使用指针访问内存，它们提供了一种类型安全的方法来访问任意内存的连续区域。

他们表示连续的内存块，没有任何复制语义，类似于指针。

另外还有只读版本 `ReadOnlySpan<T>` 和 `ReadOnlyMemory<T>`

<!--more-->

## 类型

`C#` 允许以不安全的方式使用指针，类似 `C/C++`。虽然效率高，但指针不被 `GC` 跟踪，容易造成内存泄漏

为此在 `C# 7` 中引入了新的类型

- `Span<T>` 以类型安全的方式表示内存的连续部分
- `Memory<T>` 连续的内存区域
- `ReadOnlySpan<T>` 与 `Span<T>` 类似，但内存区域是只读的
- `ReadOnlyMemory<T>` 与 `ReadOnlyMemory<T>` 类似，但内存连续区域是只读的

`C# 7` 对应的 `.net` 版本是 `.NET Core 2.1`。在后续更新中逐渐增强完善

截至目前 `C#` 版本是 `C# 12`，因此本文内容也是以 `C# 12` 为基础

## Span&lt;T&gt; 的原理

`Span<T>` 是值类型的 `ref struct`，定义类似于

```cs
public readonly ref struct Span<T>
{
  private readonly ref T _pointer;
  private readonly int _length;
  ...
}
```

### ref struct

`ref struct` 和 `struct` 相比有一些使用限制

- 不能是数组的元素类型
- 不能是类或非 `ref struct` 的字段的声明类型
- 不能实现接口
- 不能被装箱为 `System.ValueType` 或 `System.Object`
- 不能是类型参数
- 变量不能由 `Lambda` 表达式或本地函数捕获
- 变量不能在 `async` 方法中使用。 但是，可以在同步方法中使用 `ref struct` 变量，例如，在返回 `Task` 或 `Task<TResult>` 的方法中。
- 变量不能在迭代器中使用

### 索引器

`Span<T>` 的索引器是使用 `ref T` 声明的，因此索引器返回的是实际存储位置的引用

```cs
public ref T this[int index]
{
    get
    {
        //
    }
}
```

## Memory&lt;T&gt;

`Memory<T>` 表示内存中一段连续的区域，对应的只读版本为 `ReadOnlyMemory<T>`。

`Memory<T>`很多用法与 `Span<T>` 相似

`Memory<T>` 实现原理类似如下

```cs
public readonly struct Memory<T>
{
  private readonly object _object;
  private readonly int _index;
  private readonly int _length;
  // ...
}
```

### 与 Span&lt;T&gt; 的区别

`Memory<T>` 的很多操作与 `Span<T>` 类似，可以通过数组创建 `Memory<T>` 并进行切片。

`Memory<T>` 不是 `ref struct` 类型，因此 `Memory<T>` 可以在存储在堆，所以有不同于 `Span<T>` 的特性

- 可以作为类的字段或属性
- 可以在异步函数中使用

`Memory<T>` 有个 `Span` 属性，可以获取 `Span<T>` 并处理

### 为什么需要 Memory&lt;T&gt;

有了 `Span<T>` 为什么还要 `Memory<T>`？

由于 `Span<T>` 无论何种情况，只能存在于栈中，因此 `Span<T>` 的使用限制比较多。

尤其是 `Span<T>` 无法在异步函数中使用，因此限制较少的 `Memory<T>` 更适用于这种场景。

```cs
static async Task<int> ChecksumReadAsync(Memory<byte> buffer, Stream stream)
{
  int bytesRead = await stream.ReadAsync(buffer);
  return Checksum(buffer.Span.Slice(0, bytesRead));
  // Or buffer.Slice(0, bytesRead).Span
}
static int Checksum(Span<byte> buffer) { ... }
```

## stackalloc 表达式

`stackalloc` 能在堆栈上分配内存块，分配的内存块不会被 `GC` 自动回收，生命周期仅限当前方法内

默认变量类型为指针，是不安全代码。但是可以将变量赋值给 `Span<T>` 或 `ReadOnlySpan<T>` 即为安全代码

```cs
unsafe
{
    var nums = stackalloc int[10]; // int* 类型, unsafe
}
```

```cs
Span<int> nums = stackalloc int[10]; // safe
```

可以和定义数组一样赋初值

```cs
Span<int> first = stackalloc int[3] { 1, 2, 3 };
Span<int> second = stackalloc int[] { 1, 2, 3 };
ReadOnlySpan<int> third = stackalloc[] { 1, 2, 3 };
```

## Span&lt;T&gt; 在字符串中的实践

`Span<T>` 的应用场景很广，这里只举例字符串，感受一下 `Span<T>` 的强大

`Span<T>` 对字符串的切片效率很高，在内存中不需要创建临时的字符串

比如对用户输入的表达式进行计算，这里仅简单的处理加法如 `11+22`

### 常规简单做法

使用 `string.SubString`，会在内存中生成临时字符串

如果在循环中执行次数很多，就会在堆中生成很多临时字符串

```cs
var text = "11+22";
var index = text.IndexOf('+');
var num1 = int.Parse(text[..index]);
var num2 = int.Parse(text[(index + 1)..]);
Console.WriteLine(num1 + num2); // 33
```

### 使用 Span&lt;T&gt; / ReadOnlySpan&lt;T&gt;

不会产生临时字符串，而且切片效率会高很多，没有给 GC 增加压力

```cs
var text = "11+22";
var index = text.IndexOf('+');
var span = text.AsSpan();
var num1 = int.Parse(span[..index]);
var num2 = int.Parse(span[(index + 1)..]);
Console.WriteLine(num1 + num2); // 33
```

## List&lt;T&gt; 自增的影响

`List<T>` 自增会造成 `Span<T>` 引用的位置错误，因此是这里是一个坑

先创建容量为 10 的 `List<int>`，并赋初值，使用 `CollectionsMarshal` 创建一个 `Span<int>`

```cs
var list = new List<int>(10);
Console.WriteLine($"Capacity: {list.Capacity}"); // Capacity: 10
for (var i = 0; i < 10; i++)
{
    list.Add(i);
}
var span = CollectionsMarshal.AsSpan(list);
```

到这里，span 就是 list 中元素的所在的内存段，对 `span[i]` 的读写都和 `list[i]` 的读写都是操作同一段内存数据，一切正常

现在我们给 list 增加一个元素，list 长度超过容量 10，因此容量会自增到 20

```cs
list.Add(10);
Console.WriteLine($"Capacity: {list.Capacity}"); // Capacity: 20
```

此时，span 指向的仍然是原来的 list 内存段，但现在 list 已经通过自增变为了另一个新的内存段

那么现在 `span` 和 `list` 两个变量就不相干了，给 `span[i]` 和 `list[i]` 赋值都互不影响，`span` 就失去了作用和意义

```cs
span[0] = 100;
Console.WriteLine($"span[0]: {span[0]}"); // span[0]: 100
Console.WriteLine($"list[0]: {list[0]}"); // list[0]: 0
```

或

```cs
list[1] = 100;
Console.WriteLine($"span[0]: {span[0]}"); // span[0]: 0
Console.WriteLine($"list[0]: {list[0]}"); // list[0]: 100
```
