---
title: C# 多线程总结
comments: true
abbrlink: 3189c6ac
date: 2024-05-07 10:48:04
categories:
  - 记录
tags:
  - C#
---

内容概要

- 前台线程/后台线程
- 线程优先级
- 实现多线程的方法 Thread / ThreadPool / Parallel / Task / BackgroundWorker
- 线程同步，线程锁

<!--more-->

## C# 中的多线程

在操作系统中创建进程 `Process` 比较耗资源，因此 CLI 引入了 `AppDomain`

AppDomain 并不存在于操作系统，只存在于 .NET CLI 中，并且不能脱离于 Process

一个 Process 中可以有多个 AppDomain，从而可以使用 AppDomain 隔离同一进程下的资源

多个 AppDomain 之间不能互相访问代码。在程序层面，一个 AppDomain 相当于一个独立的程序

每个 AppDomain 下可以拥有多个 Thread

在多线程程序开发中，一般使用的都是 Thread 或其封装类

## 前台/后台线程

线程按功能分为两类

- 前台线程
- 后台线程

### 前台线程

前台线程一般用来处理输入输出、响应事件、处理消息

UI 线程属于前台线程

如果前台线程都已经结束，那么这个程序就不再运行。反之只要有前台线程在运行，程序就在运行

如果程序退出后，因为异常而没有退出干净，在任务管理器中仍然能看到，就是因为存在没有结束的前台线程

### 后台线程

后台线程一般用于处理耗时的任务，不会造成界面卡顿

程序退出时，所有后台线程会被强制关闭。因此退出程序可以不用手动停止后台线程。

## 优先级

在多线程并发环境中，多线程的执行顺序是随机不可预测的

线程开始后，只是被放在线程池中等待 CPU 调度

优先级越高的线程， CPU 分配给该线程的时间片就更多

因此优先级高并不代表肯定先执行，只是先执行的机会更大，先执行结束的可能性也更大

## 实现多线程的方法

实现多线程最基础的方法是用 Thread，除此之外还有几种抽象出来的类也可以实现多线程

- Thread 线程
- ThreadPool 线程池
- Parallel
- Task
- BackgroundWorker

### Thread

使用多线程最基础的类

```cs
var thread = new Thread(()=>{
  // DO
});
thread.Start();
```

#### 传参

`Start` 函数也可以传参

```cs
var thread = new Thread((obj)=>{
  // DO
});
thread.Start("Thread");
```

#### 线程命名

Thread 有 Name 属性，赋值后有利于代码调试

Name 只能赋值一次

#### 前台/后台线程

Thread 类默认创建为前台线程，可通过 IsBackground 属性，设置或获取该线程属于前台线程还是后台线程

### ThreadPool

`ThreadPool`（线程池）维护了多个线程，用于执行小任务，防止频繁创建线程

在线程池中的线程执行完后不会自动移除，而是处于挂起的状态，如果再次向线程池发出请求，那么挂起的线程会被激活，不用创建新的线程就可以执行任务，可以节约创建和销毁线程的开销

```cs
using System.Diagnostics;

const int count = 1000;

{
    var watch = new Stopwatch();
    watch.Start();

    for (int i = 0; i < count; i++)
    {
        new Thread(() => { }).Start();
    }

    watch.Stop();
    Console.WriteLine($"Thread 创建 {count} 个线程需要花费时间 (Ticks)：{watch.ElapsedTicks}");
}

{
    var watch = new Stopwatch();
    watch.Start();

    for (int i = 0; i < count; i++)
    {
        ThreadPool.QueueUserWorkItem(new WaitCallback((obj) => { }));
    }

    watch.Stop();
    Console.WriteLine($"ThreadPool 创建 {count} 个线程需要花费时间 (Ticks)：{watch.ElapsedTicks}");
}


Console.ReadKey();
```

输出

```
Thread 创建 1000 个线程需要花费时间 (Ticks)：744179
ThreadPool 创建 1000 个线程需要花费时间 (Ticks)：814
```

可以看出 ThreadPool 创建线程消耗的时间是非常小的

#### 加入任务

```cs
public static bool QueueUserWorkItem(WaitCallback callBack);
public static bool QueueUserWorkItem(WaitCallback callBack, object? state);
public static bool QueueUserWorkItem<TState>(Action<TState> callBack, TState state, bool preferLocal);
```

#### 线程池的限制

- 线程池中的线程均为后台线程
- 不能设置优先级和名称
- 更适合执行时间短的任务，不应该阻塞线程池中的线程
- 最大允许 2048 个工作线程

#### 线程数量

线程池有最大线程数量和最小线程数量

##### 最大线程数量

如果线程的数量超出最大数量，会移除之前的线程

```cs
public static bool SetMaxThreads(int workerThreads, int completionPortThreads);
```

- workerThreads 线程池中辅助线程的最大数目
- completionPortThreads 线程池中异步 I/O 线程的最大数目

```cs
static void WriteCount()
{
    ThreadPool.GetMaxThreads(out var workerThreads, out var completionPortThreads);
    Console.WriteLine($"线程池中辅助线程的最大数为：{workerThreads}；线程池中异步I/O线程的最大数为：{completionPortThreads}");
}

Console.Write("设置前，");
WriteCount();
if (ThreadPool.SetMaxThreads(30000, 500))
{
    ThreadPool.QueueUserWorkItem(new WaitCallback((obj) =>
    {
        Console.WriteLine("执行线程池");
    }));

    Console.Write("设置后，");
    WriteCount();
}
else
{
    Console.WriteLine("没有设置");
}

Console.ReadLine();
```

##### 最小线程数量

线程池维持的最小的可用线程数，便于队列任务可以立即启动

```cs
public static bool SetMinThreads(int workerThreads, int completionPortThreads);
```

- workerThreads 当前由线程池维护的空闲辅助线程的最小数目
- completionPortThreads 当前由线程池维护的空闲异步 I/O 线程的最小数目

```cs
static void WriteCount()
{
    ThreadPool.GetMinThreads(out var minWorker, out var minCompletionPort);
    Console.WriteLine($"线程池维护的空闲辅助线程的最小数目为：{minWorker}；线程池维护的空闲异步 I/O 线程的最小数目为：{minCompletionPort}");
}

Console.Write("设置前，");
WriteCount();
if (ThreadPool.SetMinThreads(10, 2))
{
    Console.Write("设置后，");
    WriteCount();
}
else
{
    Console.WriteLine("没有设置");
}

Console.ReadLine();
```

### Parallel

`Parallel` 类位于 `System.Threading.Task` 命名空间中，命名空间与 `Task` 相同

Parallel 是对 Thread 和 ThreadPool 的封装和抽象

Parallel 提供下面几个函数

- For
- ForAsync
- ForEach
- ForEachAsync
- Invoke

#### Parallel.For

类似于 for 循环，可以并行迭代

以最简单的重载函数为例

```cs
public static ParallelLoopResult For(int fromInclusive, int toExclusive, Action<int> body);
```

前两个参数定义了循环的开始和结束

第三个参数是任务函数体，函数的参数是循环迭代的次数

还有一些重载版本，在重载版本中支持中断和线程初始化，后面会有介绍

#### Parallel.ForEach

用异步的方式遍历 `IEnumerable` 集合，不确定遍历顺序

以最简单的重载函数为例

```cs
public static ParallelLoopResult ForEach<TSource>(IEnumerable<TSource> source, Action<TSource> body);
```

第一个参数是 `IEnumerable<T>` 列表，第二个参数是一个 Action 委托，每个元素会执行一次委托

```cs
string[] data = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
Parallel.ForEach(data, (s) =>
{
    Console.WriteLine(s);
});
Console.ReadKey();
```

还有一些重载版本，在重载版本中支持中断和线程初始化，后面会有介绍

#### Parallel.Invoke

支持执行不同的方法，类似 `Task.WhenAll`

```cs
public static void Invoke(params Action[] actions);
```

```cs
static void Foo()
{
    Console.WriteLine("Foo");
}

static void Bar()
{
    Console.WriteLine("Bar");
}

Parallel.Invoke(Foo, Bar);
Console.ReadKey();
```

参数是一个 Action 委托数组

#### 异步版本

- ForAsync
- ForEachAsync

用法类似，只是返回 `Task`，可以等待执行结束

#### 中断执行

回调函数的重载版本，有的支持参数 `ParallelLoopState`

该对象有函数 `Break()` 和 `Stop`，可以中断任务的执行

```cs
public static ParallelLoopResult For(int fromInclusive, int toExclusive, Action<int, ParallelLoopState> body);
```

```cs
var result = Parallel.For(0, 100, (i, state) =>
{
    Console.WriteLine($"i:{i}, thread id: {Thread.CurrentThread.ManagedThreadId}");
    if (i > 5) state.Break();
    Thread.Sleep(10);
});

Console.WriteLine($"IsCompleted: {result.IsCompleted}");
Console.WriteLine($"LowestBreakIteration: {result.LowestBreakIteration}");

Console.ReadKey();
```

```
i:24, thread id: 12
i:0, thread id: 1
i:54, thread id: 17
i:60, thread id: 18
i:48, thread id: 16
i:18, thread id: 11
i:30, thread id: 13
i:72, thread id: 20
i:42, thread id: 15
i:36, thread id: 14
i:6, thread id: 5
i:12, thread id: 8
i:66, thread id: 19
i:78, thread id: 21
i:84, thread id: 22
i:96, thread id: 24
i:90, thread id: 23
i:3, thread id: 11
i:1, thread id: 1
i:4, thread id: 11
i:2, thread id: 1
i:5, thread id: 11
IsCompleted: False
LowestBreakIteration: 6
```

#### 线程初始化

Parallel 下的模板函数重载版本，可以对每个线程进行初始化，如

```cs
public static ParallelLoopResult For<TLocal>(int fromInclusive, int toExclusive, Func<TLocal> localInit, Func<int, ParallelLoopState, TLocal, TLocal> body, Action<TLocal> localFinally);
public static ParallelLoopResult ForEach<TSource, TLocal>(IEnumerable<TSource> source, Func<TLocal> localInit, Func<TSource, ParallelLoopState, TLocal, TLocal> body, Action<TLocal> localFinally)
```

- localInit `localInit` 参数是一个 `Func` 委托，该委托会返回一个模板类型的值，回调的函数体可以通过参数获取到这个值。每个线程都会执行一次 `localInit` 委托，因此 `localInit` 可能会执行多次，也可能是 1 次

- localFinally `localFinally` 参数是一个 `Action` 委托，该委托会在每个线程完成后执行

```cs
Parallel.For(
    0,
    10,
    () =>
    {
        Console.WriteLine($"init thread {Environment.CurrentManagedThreadId},\t task {Task.CurrentId}");
        return $"t{Environment.CurrentManagedThreadId}";
    },
    (i, pls, str) =>
    {
        Console.WriteLine("body i {0} \t str {1} \t thread {2} \t task {3}", i, str, Environment.CurrentManagedThreadId, Task.CurrentId);
        Thread.Sleep(10);
        return $"i \t{i}";
    },
    (str) =>
    {
        Console.WriteLine($"finally\t {str}");
    });

Console.ReadKey();
```

输出

```
init thread 17,  task 15
init thread 16,  task 14
init thread 8,   task 8
init thread 15,  task 13
init thread 13,  task 11
init thread 1,   task 6
init thread 5,   task 7
body i 1         str t5          thread 5        task 7
init thread 14,  task 12
body i 6         str t14         thread 14       task 12
body i 9         str t17         thread 17       task 15
body i 8         str t16         thread 16       task 14
init thread 12,  task 10
body i 4         str t12         thread 12       task 10
body i 7         str t15         thread 15       task 13
body i 5         str t13         thread 13       task 11
body i 0         str t1          thread 1        task 6
init thread 11,  task 9
body i 3         str t11         thread 11       task 9
body i 2         str t8          thread 8        task 8
finally  i      5
finally  i      6
finally  i      0
finally  i      4
finally  i      7
finally  i      3
finally  i      8
finally  i      9
finally  i      2
finally  i      1
```

### Task

`Task` 提供的多线程更加灵活

- 支持并行任务
- 支持连续任务，即上一个任务结束后再决定是否执行下一个任务
- 支持任务嵌套，一个任务中可以再开启多个任务
- 可以获取任务的返回值
- 任务基于线程，最终执行是需要线程来执行的
- 任务和线程不是一对一关系，一个线程可能有多个任务
- 相比于线程，任务的开销更小，控制更精确

#### 启动任务

有多种方式启动一个任务

```cs
_ = Task.Run(() =>
{
    Console.WriteLine("Foo");
});
Console.ReadKey();
```

```cs
var task = new Task(() =>
{
    Console.WriteLine("Foo");
});
task.Start();
Console.ReadKey();
```

```cs
var tf = new TaskFactory();
var task = tf.StartNew(() =>
{
    Console.WriteLine("Foo");
});
Console.ReadKey();
```

```cs
_ = Task.Factory.StartNew(() =>
{
    Console.WriteLine("Foo");
});
Console.ReadKey();
```

上述方法也都支持给任务传参

#### 任务的层次

在任务的内部，也可以创建多个子任务

父任务被取消时，子任务也会被取消

如果在任务内想创建父级任务，在创建任务时，为 `TaskCreationOptions` 赋值为 `TaskCreationOptions.DenyChildAttach`

```cs
var task = new Task(() =>
{
    Console.WriteLine("Foo");
}, TaskCreationOptions.DenyChildAttach);
task.Start();
Console.ReadKey();
```

#### 长任务

默认 Task 更适合短时间运行的任务，如果要创建长时间运行的任务，应该使用 `TaskCreationOptions.LongRunning`

这样就不再使用线程池中的线程，会告诉任务管理器创建一个新的线程

```cs
var task = new Task(() =>
{
    Console.WriteLine("Foo");
}, TaskCreationOptions.LongRunning);
task.Start();
Console.ReadKey();
```

#### 任务控制

##### task.Wait

调用函数 `Task.Wait` 可以等待任务执行完毕，即 `Task` 的状态变为 `Completed`

```cs
public void Wait();
public void Wait(CancellationToken cancellationToken);
public bool Wait(int millisecondsTimeout);
public bool Wait(int millisecondsTimeout, CancellationToken cancellationToken);
public bool Wait(TimeSpan timeout);
public bool Wait(TimeSpan timeout, CancellationToken cancellationToken);
```

##### Task.WaitAll

等待所有任务执行完毕，参数接收多个 Task 对象

```cs
public static void WaitAll(params Task[] tasks);
public static bool WaitAll(Task[] tasks, int millisecondsTimeout, CancellationToken cancellationToken);
public static void WaitAll(Task[] tasks, CancellationToken cancellationToken);
public static bool WaitAll(Task[] tasks, TimeSpan timeout);
public static bool WaitAll(Task[] tasks, int millisecondsTimeout);
```

##### Task.WatiAny

类似 `Task.WaitAll`，但只需要任一任务完成，就不再等待

##### task.ContinueWith

任务完成后自动执行下一个 Task，实现链式执行

```cs
Task task1 = Task.Run(() =>
{
    Console.WriteLine("Current Task id = {0}", Task.CurrentId);
    Console.WriteLine("执行任务1\r\n");
    Thread.Sleep(10);
});

Task task2 = task1.ContinueWith((t) =>
{
    Console.WriteLine("Last Task id = {0}", t.Id);
    Console.WriteLine("Current Task id = {0}", Task.CurrentId);
    Console.WriteLine("执行任务2\r\n");
    Thread.Sleep(10);
});

Task task3 = task2.ContinueWith((t) =>
{
    Console.WriteLine("Last Task id = {0}", t.Id);
    Console.WriteLine("Current Task id = {0}", Task.CurrentId);
    Console.WriteLine("执行任务3\r\n");
}, TaskContinuationOptions.OnlyOnRanToCompletion);

Console.ReadKey();
```

输出

```
Current Task id = 9
执行任务1

Last Task id = 9
Current Task id = 10
执行任务2

Last Task id = 10
Current Task id = 11
执行任务3
```

##### task.RunSynchronously

在当前线程上执行任务

如果当前线程是 UI 线程，这个操作会造成界面卡顿

#### 任务取消

启动任务时传入 Token，在任务中的各个适当位置判断 Tokan 状态并退出任务

```cs
var tokenSource = new CancellationTokenSource();
var token = tokenSource.Token;
var task = Task.Run(() =>
{
    for (var i = 0; i < 1000; i++)
    {
        Console.WriteLine(i);
        System.Threading.Thread.Sleep(1000);
        if (token.IsCancellationRequested)
        {
            Console.WriteLine("Abort mission success!");
            return;
        }
    }
}, token);
token.Register(() =>
{
    Console.WriteLine("Canceled");
});
Console.WriteLine("Press enter to cancel task...");
Console.ReadKey();
tokenSource.Cancel();
Console.ReadKey();
```

输出

```
Press enter to cancel task...
0
1
2
3
4
5
Canceled
Abort mission success!
```

### BackgroundWorker

`BackgroundWorker` 实现多线程运算更安全、更简单

- 提供几种事件，可以在任务的各个阶段触发
- 提供了 `CancleAsync` 方法，方便取消任务
- 能后台异步操作的同时，也能通知 UI 线程进度

```cs
using System.ComponentModel;

var worker = new BackgroundWorker()
{
    WorkerSupportsCancellation = true,
    WorkerReportsProgress = true,
};
worker.DoWork += Worker_DoWork;
worker.ProgressChanged += Worker_ProgressChanged;
worker.RunWorkerCompleted += Worker_RunWorkerCompleted;
worker.RunWorkerAsync();

void Worker_RunWorkerCompleted(object? sender, RunWorkerCompletedEventArgs e)
{
    Console.WriteLine($"RunWorkerCompleted, Cancelled: {e.Cancelled}");
}

void Worker_ProgressChanged(object? sender, ProgressChangedEventArgs e)
{
    Console.WriteLine($"ProgressChanged, ProgressPercentage:{e.ProgressPercentage}");
}

void Worker_DoWork(object? sender, DoWorkEventArgs e)
{
    var times = 1;
    while (!worker.CancellationPending)
    {
        if (times >= 6)
        {
            worker.CancelAsync();
        }

        worker.ReportProgress(times);
        Console.WriteLine($"DoWork {times++}");
        Thread.Sleep(100);
    }
}

Console.ReadKey();
```

输出

```
DoWork 1
ProgressChanged, ProgressPercentage:1
DoWork 2
ProgressChanged, ProgressPercentage:2
DoWork 3
ProgressChanged, ProgressPercentage:3
DoWork 4
ProgressChanged, ProgressPercentage:4
DoWork 5
ProgressChanged, ProgressPercentage:5
DoWork 6
ProgressChanged, ProgressPercentage:6
RunWorkerCompleted, Cancelled: False
```

## 线程同步

多个线程的执行顺序是不可预测的，但有时候需要多个线程访问共享的数据和资源，这个时候就需要使用一些方法来达到线程同步

### 线程锁

- Mutex 互斥锁
- SpinLock 自旋锁
- Monitor
- lock

#### Mutex

互斥锁，可以用于共享资源每次只能被一个线程访问的情况

Mutex 消耗的资源较大，不适合频繁操作

Mutex 可以跨进程，是系统级的。比如可以用 Mutex 实现一个程序不能多次打开

如果锁已被其他线程获取，第二次获取的线程将挂起，直到第一个线程释放互斥锁

- WaitOne() 阻止线程，直至收到信号，参数可以指定超时时间
- ReleaseMutex() 释放一次锁（其他线程即获取锁）
- OpenExisting() 获取指定命名的互斥锁

```cs
var mutex = new Mutex();
bool executed = false;
void Execute(int num)
{
    if (mutex.WaitOne())
    {
        try
        {
            if (!executed)
            {
                Console.WriteLine($"{num}：已执行");
                executed = true;
            }
            else
            {
                Console.WriteLine($"{num}：跳过执行");
            }
        }
        finally
        {
            mutex.ReleaseMutex();
        }
    }
}

for (int i = 1; i < 10; i++)
{
    _ = Task.Factory.StartNew(obj => { Execute((int)obj!); }, i);
}
Console.ReadLine();
```

输出

```
2：已执行
3：跳过执行
4：跳过执行
1：跳过执行
5：跳过执行
7：跳过执行
8：跳过执行
9：跳过执行
6：跳过执行
```

#### SpinLock

当一个线程获取锁对象时，如果锁已经被其他线程获取，那么这个线程就会循环等待（自旋），并且不断的获取锁，直至获取到锁

因此自旋锁不会让线程处于等待状态，有助于避免阻塞

一般用于短时间锁定的场景，如果有大量阻塞，旋转过多会影响性能

```cs
var spinLock = new SpinLock();
bool executed = false;
void Execute(int num)
{
    bool lockTaken = false;
    try
    {
        spinLock.Enter(ref lockTaken);

        if (!executed)
        {
            Console.WriteLine($"{num}：已执行");
            executed = true;
        }
        else
        {
            Console.WriteLine($"{num}：跳过执行");
        }
    }
    finally
    {
        if (lockTaken)
        {
            spinLock.Exit();
        }
    }
}

for (int i = 1; i < 10; i++)
{
    _ = Task.Factory.StartNew(obj => { Execute((int)obj!); }, i);
}
Console.ReadLine();
```

输出

```
2：已执行
3：跳过执行
1：跳过执行
4：跳过执行
7：跳过执行
5：跳过执行
6：跳过执行
8：跳过执行
9：跳过执行
```

#### Monitor

Monitor 是一种轻量级的互斥锁，能确保同一时刻只有一个线程执行代码块

Monitor.Enter 方法锁定对象
Monitor.Exit 方法释放对象
Monitor.TryEnter 可以指定获取对象锁的最长时间，能避免出现死锁

```cs
var obj = new object();
Monitor.Enter(obj);
try
{
    // TODO
}
finally
{
    Monitor.Exit(obj);
}
```

#### lock

lock 的本质就是 Monitor 实现的，因此在 lock 块中可以使用 Monitor 的所有方法

```cs
var obj = new object();
lock(obj){
  // TODO
}
```

等同于

```cs
var obj = new object();
Monitor.Enter(obj);
try
{
    // TODO
}
finally
{
    Monitor.Exit(obj);
}
```

### 事件

有两种可以实现线程同步的事件

- AutoResetEvent
- ManualResetEvent

可以控制是否阻塞线程

- WaitOne() 阻塞当前线程，直到收到释放信号，可以传参指定超时时长，避免死锁
- Set() 释放阻塞
- Reset() 将状态改为非终止状态，即阻塞所有的 WaitOne

#### AutoResetEvent

AutoResetEvent 收到 Set 只会有一个线程的 WaitOne 被处理，其他线程继续等待

```cs
var resetEvent = new AutoResetEvent(false);

void Execute(int num)
{
    Console.WriteLine($"{num} 等待");
    resetEvent.WaitOne();

    Console.WriteLine($"{num} 执行");

    Thread.Sleep(1000);
    Console.WriteLine($"{num} 结束");
    resetEvent.Set();
}

for (int i = 1; i < 5; i++)
{
    _ = Task.Factory.StartNew(obj => { Execute((int)obj!); }, i);
    Thread.Sleep(50);
}

resetEvent.Set();
Thread.Sleep(7000);
resetEvent.WaitOne();
_ = Task.Factory.StartNew(obj => { Execute((int)obj!); }, 10);

Thread.Sleep(1000);
resetEvent.Set();
resetEvent.WaitOne();
Console.WriteLine($"结束");

Console.ReadLine();
```

输出

```
1 等待
2 等待
3 等待
4 等待
2 执行
2 结束
4 执行
4 结束
3 执行
3 结束
1 执行
1 结束
10 等待
10 执行
10 结束
结束
```

#### ManualResetEvent

ManualResetEvent 收到 Set 会处理所有线程的 WaitOne，而且新进入的 WaitOne 也不再等待

除非调用了 `Reset` 重置信号，才会将 Set 产生的影响消除

如果将前面示例代码的 AutoResetEvent 类换成 ManualResetEvent

输出

```
1 等待
2 等待
3 等待
4 等待
4 执行
3 执行
2 执行
1 执行
3 结束
2 结束
1 结束
4 结束
10 等待
10 执行
10 结束
结束
```

### 信号量

- Semaphore 可以是系统范围信号量，也可以是本地信号量，限制可同时访问某一资源或资源池的线程数
- SemaphoreSlim 更轻量、速度更快，用于单个进程内的等待，是 Semaphore 的轻量替代

构造函数的参数 `initialCount` 表示同时允许多少个 Wait() 不等待

- Release() 退出信号量
- WaitOne() 阻塞线程，直到收到信号

```cs
var semaphore = new SemaphoreSlim(3);

void Execute(int num)
{
    Console.WriteLine($"{num}等待");
    semaphore.Wait();
    Console.WriteLine($"{num}执行");
    Thread.Sleep(100);
    Console.WriteLine($"{num}结束");
    semaphore.Release();
}

for (int i = 1; i < 6; i++)
{
    _ = Task.Factory.StartNew(obj => { Execute((int)obj!); }, i);
}

Console.ReadLine();
```

输出

```
4等待
1等待
3等待
2等待
5等待
4执行
2执行
5执行
5结束
4结束
2结束
1执行
3执行
1结束
3结束
```
