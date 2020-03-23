---
title: Loaded和OnNavigatedTo顺序
comments: true
tags:
  - 'C#'
  - UWP
abbrlink: 4bf2d4b5
date: 2019-09-17 15:29:56
categories:
---

UWP 在跳转页面后会触发两个事件，这两个事件可能会给很多初入门的人带来困惑：

```
Loaded()
OnNavigatedTo()
```

### 一般用途

- `Loaded`事件：一般在这里对页面进行初始化，如果是 MVVM 模式则可能需要对 ViewModel 进行初始化。
- `OnNavigatedTo`事件：一般用于页面间传值，展现页面之间的动画。触发该事件时，页面未必加载完成，如果使用后台代码更新 UI，可能会出现不可预知的问题，比如赋值无效、UI 对象为空等问题

### 正常顺序

调用顺序是先`OnNavigatedTo`再`Loaded`，并且是`OnNavigatedTo`执行完才会执行`Loaded()`。即使在`OnNavigatedTo()`中执行以下语句

```
Thread.Sleep(5000); //等待5秒
```

也是`OnNavigatedTo()`函数执行完毕才执行`Loaded()`

### 多线程

多线程情况下，虽然调用的顺序没有变化，但执行的先后顺序可能无法预测。即如果`OnNavigatedTo()`是异步函数，有可能会出现`OnNavigatedTo()`未执行完就执行`Loaded()`，甚至后者先执行完毕。
因此建议始终不要让`OnNavigatedTo()`成为异步（`async`）函数，不要在`OnNavigatedTo()`中出现 await，保证`OnNavigatedTo()`执行顺序早于`Loaded()`。

### 页面初始化正确顺序

由于`OnNavigatedTo`最好不能是异步函数，因此加载数据最好放在`Loaded`函数中，这也正是它应该要做的工作。因此正确的顺序应该是：

1. 在`OnNavigatedTo`中展现页面间过渡动画
2. 在`OnNavigatedTo`中接受到数据，进行简单的处理或不处理，并将数据使用私有字段临时存放。
3. 在`Loaded`中对私有字段引用做判断，并进行初始化和稍复杂数据处理。
