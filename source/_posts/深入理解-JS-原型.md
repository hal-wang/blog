---
title: 深入理解 JS 原型
comments: true
abbrlink: 9c60be83
date: 2022-03-30 09:42:53
categories:
  - 记录
tags:
  - JS
---

JS 中的原型链是日常开发不常遇到的东西，而且在 ES6 之后，原型链就更少见了

但是，如果设计框架或封装组件，可能就需要了解原型链

ES6 的类，可以认为是 ES5 的语法糖，因此本文主要以探究 ES5 为主

<!--more-->

## JS 创建对象与其他语言区别

以 C# 为例，C++/JAVA 等类似

### C#

在 C# 中，类相当于一个模板，对象是模板创造的实例。代码编译后，类本身除了静态属性和静态函数，没有其他用处

### JS

在 JS 中，ES5 及之前是没有类的概念，对象是通过构造函数创建的，即构造函数承载了类的功能，在构造函数中可以使用 this 为实例对象增加字段和函数，以及赋值的操作。这点对于有其他语言基础的人来说，思想较难转变

构造函数其本身也是对象，也可以当成一个普通函数来用

```JS
function Func(){} // 构造函数
new Func(); // 用构造函数创建对象
Func(); // 调用普通函数
```

JS 通过构造函数创建对象，会有以下对象参与其中

- 构造函数：作为对象的构造函数
- 构造函数的原型对象：对象的对象原型将指向构造函数的原型对象

## 原型对象与对象原型

一般每个构造函数都有一个原型对象 `Func.prototype`，简单函数的原型对象是 `Object` 对象

一般每个对象都有一个对象原型 `obj.__proto__`，这个对象原型指向的是构造函数的原型对象，即

```JS
function Func(){} // 构造函数
const obj=new Func(); // 用构造函数创建对象
Func.prototype == obj.__proto__ // true
```

由于 JS 中调用对象方法时，先查找对象自身方法，再查找原型对象 `__proto__` 中的方法，因此对象可以使用对象原型中的方法

原型对象也可以置空，这样构造函数创建的对象将没有额外方法，如 `toString`, `hasOwnProperty` 等

原型对象都有 `constructor` 字段，指向对应的构造函数

## 原型链

由前面得出结论，对象和对象原型 `__proto__` 形成了一个原型链，原型链的最顶端是 `null`，形如

```JS
obj.__proto__.__proto__.__proto__ == null // true
```

上面可能有很多节点，也可能没有节点，取决于创建方法

类每多一次继承就会多一个节点，ES5 中的写法是给构造函数的 `prototype` 赋值并修改 `prototype.constructor`

```JS
function Father() {} // 父类构造函数
function Son() { // 子类构造函数
  Father.call(this); // 等同于ES6: this.super();
}
Son.prototype = new Father(); // 不能直接 = Father，这样会导致 Father 和 Son 的对象原型指向同一个原型对象
Son.prototype.constructor = Son; // 原型对象需要指向构造函数，如果不赋值，指向的是 Father 构造函数
```

下面写法会创建一个没有原型链的顶层对象，一般不会用到

```JS
const obj = Object.create(null, {})
console.log(obj.__proto__) // undefined
```

每个对象，都可以使用原型链中的任意方法，因为调用方法时会按原型链逐级向上查找

## ES6 类和对象

ES6 之前通过 `构造函数 + 原型` 实现面向对象编程
ES6 通过 `类` 实现面向对象编程

类的本质也是函数，也可以简单的认为，类就是 ES5 构造函数的简单写法
