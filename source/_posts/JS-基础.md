---
title: JS 基础
comments: true
tags:
  - JS
abbrlink: 17c7b154
date: 2019-12-05 16:51:48
categories:
  - 记录
---

JS 学习

## 基础

### 类型和变量

<!--more-->

JS 数据类型分为两类

- 原始类型
- 包括数字、字符串、布尔值

两个特殊的原始值

- null
- undefined

### 对象类型

- 特殊的对象：函数
- 可自由进行数据类型转换
- 变量是无类型的，用 var 声明，不区分浮点和整型
- 浮点数值范围：+/-5\*10e-324 - +/-1.7976931348623157e+308
- 整数数值范围：-2^53 - 2^53
- infinity 是无穷大，-infinity 是负无穷大，除 0 时会返回这个值
- NaN 表示非数字（not a number），和任何值都不相等，包括自身，可用 isNaN(number)判断是否为 NaN
- JS 中没有字符型，只有字符串型
- 可用单引号或者双引号，用单引号定界，中间可以出现双引号，用双引号定界，中间可以出现单引号
- 字符串可拆分几行写，但是结尾要用（\）结束
- JS 和 HTML，最好使用不同的表示方法
- JS 中自动转换很灵活
- 除 null 和 undefine 外都可以用 toString 函数
- 如果有参数，则将数转换为参数表示的进制。比如 _`var n=17; n.toString(2) 转换为”10010”`_

### 变量的声明

- 用 var 声明。全局作用域可以省略，但局部变量必须使用
- 重复声明也是合法的
- 用 var 声明的全局变量是不可配置的，即无法删除
- 如果声明的变量没有定义，则自动创建全局变量，并且是可配置属性，可以删除
- JS 没有块作用域，有函数作用域
- 预编译时，编译器将变量声明提到函数开头（“声明提前”特性），因此可以在声明变量前使用该变量

### 表达式

#### 属性访问表达式

可以用和 C++相同的方法 a.b，也可以用 a[b]

#### 函数定义表达式

可以在赋值语句中定义函数，eg:

```
var square = function(x) {return x*x; }
```

function 是关键字

#### 对象创建表达式

格式和 C++相同

```
new a()
```

如果没有参数，可以把括号省去

### 运算符

#### ===运算符

表示恒等于，严格相等。比如

```
”1”==true结果为true
“1”===true结果为false
```

#### !==

类比===

#### in 运算符

- 左操作数为字符串或者能转换成字符串的值，右操作数为对象
- 判断：如果对象有名为字符串的属性，返回 true，否则返回 false

#### instanceof 运算符

左操作数是对象，右操作数是类。

如果左侧对象是右侧类的实例，返回 true，否则返回 false。

会同时判断父类，如果是父类也返回 true

#### eval()

是个函数，但被当作运算符对待。

只有一个参数。

- 如果参数不是字符串，则直接返回这个参数。
- 如果是字符串，则将其作为代码编译。
- 编译成功则执行并返回字符串最后一个表达式或语句的值
- 如果最好一个表达式或语句没有值，则返回 undefined

eg

```
eval(“function f(){ return x+1;}”);
//会定义一个函数
eval(“var y=3;”);
//声明一个新的变量y
```

## 一些常用的函数

1. toFixed()根据参数保留小数位，并转换为字符串
2. toExponential()使用指数记数法，小数点后位数由参数指定，将数字转换为字符串
3. toPrecision()根据参数保留有效数字，转换成字符串

## 事件循环

JS 的异步和多线程是通过事件循环（EventLoop） 实现的

### 宏任务/微任务

JS 把异步任务分为宏任务和微任务

宏任务是由宿主（浏览器、Node）发起的

微任务是 JS 引擎发起的任务

- 宏任务
  - script
  - setTimeout
  - setInterval
  - 事件
  - AJAX 请求
- DOM 渲染
- 微任务
  - Promise（Promise 本身是同步代码）
  - async/await

执行顺序

1. 同步代码（js 执行栈、回调栈）
2. 微任务的异步代码（js 引擎）
3. 宏任务的异步代码（宿主环境）

## Promise

使用 TS 实现的一个符合 `Promise/A+` 规范的 Promise

```TS
type ResolveCallback<T> = (result: T) => void;
type RejectCallback = (reason?: any) => void;

class CustomPromise<T = any> {
  constructor(
    executor: (resolve: ResolveCallback<T>, reject: RejectCallback) => void
  ) {
    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (e) {
      this.reject(e);
    }
  }

  private status: "pending" | "fullFilled" | "rejected" = "pending";
  private result?: T;
  private reason?: any;
  private onFullFilledCallbacks: RejectCallback[] = [];
  private onRejectedCallbacks: ResolveCallback<T>[] = [];

  resolve(result?: T) {
    if (this.status != "pending") {
      return;
    }

    this.status = "fullFilled";
    this.result = result;
    this.onFullFilledCallbacks.forEach((fn) => fn());
  }

  reject(reason?: any) {
    if (this.status != "pending") {
      return;
    }

    this.status = "rejected";
    this.reason = reason;
    this.onRejectedCallbacks.forEach((fn) => fn(this.reason));
  }

  then(onFulfilled?: ResolveCallback<T>, onRejected?: RejectCallback) {
    const nextPromise = new CustomPromise((resolve, reject) => {
      const onMicrotaskFulfilled: ResolveCallback<T> = () => {
        queueMicrotask(() => {
          try {
            if (typeof onFulfilled != "function") {
              resolve(this.result);
            } else {
              const val = onFulfilled(this.result);
              this.resolvePromise(nextPromise, val, resolve, reject);
            }
          } catch (e) {
            reject(e);
          }
        });
      };
      const onMicrotaskRejected: RejectCallback = () => {
        queueMicrotask(() => {
          try {
            if (typeof onRejected != "function") {
              resolve(this.reason);
            } else {
              const val = onRejected(this.reason);
              this.resolvePromise(nextPromise, val, resolve, reject);
            }
          } catch (e) {
            reject(e);
          }
        });
      };

      if (this.status == "fullFilled") {
        onMicrotaskFulfilled(this.result);
      }
      if (this.status == "rejected") {
        onMicrotaskRejected(this.reason);
      }
      if (this.status == "pending") {
        this.onFullFilledCallbacks.push(() => {
          onMicrotaskFulfilled(this.result);
        });
        this.onRejectedCallbacks.push(() => {
          onMicrotaskRejected(this.reason);
        });
      }
    });
    return nextPromise;
  }

  private resolvePromise<T>(
    promise: CustomPromise,
    val: T,
    resolve: ResolveCallback<T>,
    reject: RejectCallback
  ) {
    if ((val as any) == promise) {
      throw new TypeError("promise error");
    }
    if (val instanceof CustomPromise) {
      val.then((v) => {
        this.resolvePromise(promise, v, resolve, reject);
      }, reject);
    }
    if (
      (typeof val == "object" || typeof val == "function") &&
      "then" in val &&
      typeof val["then"] == "function"
    ) {
      let called = false;
      const rej = (r: any) => {
        if (called) return;
        called = true;
        reject(r);
      };
      try {
        val["then"].call(
          val,
          (v: T) => {
            if (called) return;
            called = true;
            this.resolvePromise(promise, v, resolve, reject);
          },
          (r: any) => {
            rej(r);
          }
        );
      } catch (e) {
        rej(e);
      }
    }
  }
}
```
