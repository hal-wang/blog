---
title: Dart 学习笔记
comments: true
abbrlink: e91e088f
date: 2020-10-12 11:57:12
categories:
  - 学习
tags:
  - Dart
---

Dart 官网：[https://flutterchina.club/](https://flutterchina.club/)

Dart 与我熟悉的 C#和 JS 也相似，这里大部分记录 Dart 与其他编程语言的区别，或 Dart 的特点

<!--more-->

## 构造函数

### 语法糖

Dart 的构造函数支持一种语法糖，能够简单给成员变量赋值

```dart
DemoClass(this.name, this.age) {
  // ...
}

// 等同于

DemoClass(name, age) {
  this.name = name
  this.age = age

  // ...
}

// 或

DemoClass(nameParam, ageParam)
    : name = nameParam,
      age = ageParam {
        // ...
}
```

### 初始化列表

在构造函数中为成员变量赋值

```dart
DemoClass(nameParam, ageParam)
    : name = nameParam,
      age = ageParam {
        // ...
}
```

在开发模式下，可以在初始化列表中使用 assert 来验证输入数据

```dart
DemoClass.withAssert(this.nameParam, this.ageParam) : assert(x >= 0) {
  // ...
}
```

### 命名构造函数

可以指定构造函数名

```dart
DemoClass.name(String name) : this(name, null);

DemoClass.age(String age) : this(null, age);
```

### 常量构造函数

如果类生成的对象是不变的，在构造函数前加`const`，该类的实例变量均为`final`

### 工厂构造函数

使用`factory`关键字标识构造函数，变为工厂构造函数。

工厂构造函数需要返回一个实例，作用类似于 _C#的静态函数返回实例_，但与 C#静态函数不同的是，Dart 的工厂构造函数与普通的构造函数调用方式相同。

```dart
class Logger {
  final String name;
  bool mute = false;

  // _cache 变量是库私有的，因为在其名字前面有下划线。
  static final Map<String, Logger> _cache =
      <String, Logger>{};

  factory Logger(String name) {
    return _cache.putIfAbsent(
        name, () => Logger._internal(name));
  }

  factory Logger.fromJson(Map<String, Object> json) {
    return Logger(json['name'].toString());
  }

  Logger._internal(this.name);

  void log(String msg) {
    if (!mute) print(msg);
  }
}

// 调用

var logger = Logger('UI');
logger.log('Button clicked');

var logMap = {'name': 'UI'};
var loggerJson = Logger.fromJson(logMap);
```

## 创建类

### new 关键字

new 关键字是可选的

```dart
var obj1 = new DemoClass('aaa',12)
var obj2 = DemoClass('aaa',12)
var obj3 = new DemoClass.name('aaa')
var obj4 = DemoClass.age(12)
```

### 调用父类构造函数

使用`: super.[父类构造函数]`

```dart
Child.name(String name) : super.name(name) {
  print('in Child');
}
```

## final & const

`final` 或者 `const`修饰的变量都不能被修改，但`final`可被赋值一次。

`const`是编译时常量，`final`只能在声明时赋值，或者在构造函数中的初始化列表中赋值。

`const` 变量也是`final`变量。

## Getters & setters

与 JS 类似

实例对象的每个属性都有隐式的`Getter`方法。非`final`属性有`Setter`方法。

可使用 `get` 和 `set` 关键字单独添加`Getter`和`Setter`方法

```dart
class Rectangle {
  double left, top, width, height;

  Rectangle(this.left, this.top, this.width, this.height);

  // 定义两个计算产生的属性：right 和 bottom。
  double get right => left + width;
  set right(double value) => left = value - width;
  double get bottom => top + height;
  set bottom(double value) => top = value - height;
}

void main() {
  var rect = Rectangle(3, 4, 20, 15);
  assert(rect.left == 3);
  rect.right = 12;
  assert(rect.left == -8);
}
```

## 隐式接口

每个类都有个隐式接口，通过关键之`implements`可实现类的隐式接口。

即仅需要类的定义，但不要其内部实现。

```dart
class Point implements Comparable, Location {/*...*/}
```

## 继承

使用`extends`关键字

```dart
class OtherClass extends DemoClass {
  // ···
}
```

Dart 是单继承的。使用`super`关键字调用父类。

### 重写

使用 `@override` 注解

```dart
class OtherClass extends DemoClass {
  @override
  void func() {/**/}
  // ···
}
```

## noSuchMethod

如果调用了对象上不存在的方法或实例变量将会触发 `noSuchMethod` 方法，可以重写 `noSuchMethod` 方法来追踪和记录这一行为

```dart
class A {
  // 除非你重写 noSuchMethod，否则调用一个不存在的成员会导致 NoSuchMethodError。
  @override
  void noSuchMethod(Invocation invocation) {
    print('你尝试使用一个不存在的成员：' + '${invocation.memberName}');
  }
}
```

## Extension 方法

使用`extension`/`on` 关键字。与 C#的扩展方法作用相同。

```dart
extension NumberParsing on String {
  int parseInt() => int.parse(this);
  // ···
}
```

## 枚举

```dart
enum Color { red, green, blue }
```

枚举包含`index`获取索引

```dart
assert(Color.red.index == 0);
```

枚举类包含`values`方法获取枚举值列表

```dart
List<Color> colors = Color.values;
```

### Mixin

类似于 C#中的接口，但与接口不同的是，写法与普通类相同，功能也与普通类相同

```dart
class MixinClass {
  var num = 1;
  void addNum() {
    this.num ++
  }
}

class OtherClass extends DemoClass with MixinClass {
  // ···
}
```

## 泛型

包括泛型类和泛型方法，大多语法与 C#相同，用法也一样。

### 限制参数化类型

在 C#中在类名后使用`where`，在 Dart 中在泛型`T`后使用 `extends`

```dart
class SomeClass<T extends SomeBaseClass> {
  String toString() => "'SomeClass<$T>' 的实例";
}
```

### 无参数泛型

```dart
class SomeClass<SomeBaseClass> {
  String toString() => "'SomeClass<$T>' 的实例";
}
```

此时类型为`Foo<SomeBaseClass>`

## 字符串

支持单引号和双引号。

### 插值

支持字符串插值 `${ }`，如果表达式是个标识符，可省略`{}`。

```dart
const s = '4 + 5 = ${ 4 + 5 }'
```

### 连接

字符串连接用 `+`，也可省略 `+` 。

### 多行字符串

```dart
const s = '''
  这是第一行，
  这是第二行，
  ...
  ''';
```

### 转义

加上前缀`r`忽略转义字符

```dart
var s = r'In a raw string, not even \n gets special treatment.';
```

三个单引号`'''`或三个双引号`"""`可创建多行字符串

## 其他

- Dart 也有静态方法/变量，关键字与 C#相同
- Dart 没有成员访问限定符，以下划线`_`开头的名命则为私有 变量/方法
- Dart 未初始化的变量全部是`null`，包括`int`、`double`等
