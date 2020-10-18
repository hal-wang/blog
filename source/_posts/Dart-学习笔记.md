---
title: Dart 学习笔记
comments: true
abbrlink: e91e088f
date: 2020-10-12 11:57:12
categories:
  - 学习
tags:
  - Dart
  - Flutter
---

官方文档：[https://dart.cn/guides](https://dart.cn/guides)
在线测试：[https://dartpad.cn/](https://dartpad.cn/)

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

`const` 关键字不仅仅可以用来定义常量，还可以用来创建 常量值，该常量值可以赋予给任何变量。

```dart
const a = []; // 常量，可修改数组内容，但不能重新给a赋值
var a = const [] // 常量值，不可修改数组内容，但可重新给a赋值
```

使用时，dart 中的`final`像 JS 中的`const`，dart 中的`const`像 C#中的`const`

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

类似于 C#中的接口，但与接口不同的是，写法与普通类相同，功能也与普通类相同，比接口更丰富。

#### 定义 mixin 类

定义一个类继承自 Object 并且不为该类定义构造函数，这个类就是 Mixin 类，除非你想让该类与普通的类一样可以被正常地使用，否则可以使用关键字 `mixin` 替代 `class` 让其成为一个单纯的 Mixin 类：

```dart
mixin MixinClass {
  var num = 1;
  void addNum() {
    this.num ++
  }
}

// 或

class MixinClass {
  // ...
}
```

#### 使用

使用`with`关键字让类使用 mixin。

```dart

class OtherClass extends DemoClass with MixinClass {
  // ···
}
```

如果使用多个 mixin，用逗号分隔。

#### 指定类

可以使用关键字 on 来指定哪些类可以使用该 Mixin 类

```dart
class Musician {
  // ...
}
mixin MusicalPerformer on Musician {
  // ...
}
class SingerDancer extends Musician with MusicalPerformer {
  // ...
}
```

此处`MusicalPerformer`只允许继承`Musician`的类使用

可使用多个 mixin 类，用逗号分隔。

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

三个单引号`'''`或三个双引号`"""`可创建多行字符串

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

## Lists

### 自动推断

dart 可自动推断 list 类型

```dart
var list = [1, 2, 3];

// 等同于

List<int> list = [1, 2, 3];
```

### 扩展操作符

- `...`
- `...?`

```dart
var list = [1, 2, 3];
var list2 = [0, ...list];
assert(list2.length == 4);
```

`...?`和`...`的区别是当数组变量为`null`时不会产生异常，此时类似于数组为空数组`[]`

### 集合控制流

根据条件创建数组

#### Collection If

```dart
var nav = [
  'Home',
  'Furniture',
  'Plants',
  if (promoActive) 'Outlet'
];
```

#### Collection For

```dart
var listOfInts = [1, 2, 3];
var listOfStrings = [
  '#0',
  for (var i in listOfInts) '#$i'
];
// listOfStrings = ['#0','#1','#2','#3']
assert(listOfStrings[1] == '#1');
```

## 级联运算符

级联运算符 `..` ，可以在同一个对象上连续调用语句

```dart
querySelector('#confirm') // 获取对象 (Get an object).
  ..text = 'Confirm' // 使用对象的成员 (Use its members).
  ..classes.add('important')
  ..onClick.listen((e) => window.alert('Confirmed!'));
```

相当于

```dart
var button = querySelector('#confirm');
button.text = 'Confirm';
button.classes.add('important');
button.onClick.listen((e) => window.alert('Confirmed!'));
```

### 嵌套

```dart
final addressBook = (AddressBookBuilder()
      ..name = 'jenny'
      ..email = 'jenny@example.com'
      ..phone = (PhoneNumberBuilder()
            ..number = '415-555-0100'
            ..label = 'home')
          .build())
    .build();
```

## 异常

Dart 提供了 `Exception` 和 `Error` 两种类型的异常以及它们一系列的子类。

### 抛出

可抛出`Exception` 和 `Error`（推荐），也可抛出其他任何对象。

### 捕获

使用 `on` 来指定异常类型，使用 `catch` 来捕获异常对象

```dart
try {
  breedMoreLlamas();
} on OutOfLlamasException {
  // 指定异常
  buyMoreLlamas();
} on Exception catch (e) {
  // 其它类型的异常
  print('Unknown exception: $e');
} catch (e, s) {
  // // 不指定类型，处理其它全部
  print('Something really unknown: $e');
}
```

`catch` 有两个参数，第一个是异常对象，第二个是栈信息 `StackTrace` 对象。

`rethrow`可再次抛出异常

## 库

### 导入

与 JS 相同，使用`import`关键字。

- dart 内置库：`dart:xxxxxx`
- 其他库：`package:xxxxxx`

```dart
import 'dart:html';
import 'package:test/test.dart';
```

### 指定前缀

如果两个库冲突，可指定前缀

```dart
import 'package:lib1/lib1.dart';
import 'package:lib2/lib2.dart' as lib2;

// 使用 lib1 的 Element 类。
Element element1 = Element();

// 使用 lib2 的 Element 类。
lib2.Element element2 = lib2.Element();
```

### 导入部分

```
// 只导入 lib1 中的 foo。(Import only foo).
import 'package:lib1/lib1.dart' show foo;

// 导入 lib2 中除了 foo 外的所有。
import 'package:lib2/lib2.dart' hide foo;
```

### 延迟加载

使用时才会加载，引用时用`deferred as`关键字，加载时用`loadLibrary`函数

```dart
import 'package:greetings/hello.dart' deferred as hello;

// 使用时
Future greet() async {
  await hello.loadLibrary(); // 先手动加载，再使用
  hello.printGreeting();
}
```

## 异步

Dart 中的异步分两种

### Future

与 C#中的 Task 类似，用法相同。

### Stream

与 C#中的 IAsyncEnumerable 类似，用法`await for-in`与 C#中的`await foreach-in`一样。

## 其他

- Dart 也有静态方法/变量，关键字与 C#相同
- Dart 没有成员访问限定符，以下划线`_`开头的名命则为私有 变量/方法
- Dart 未初始化的变量全部是`null`，包括`int`、`double`等
- Dart 支持`for-in`，与 C# 中的`foreach-in`相同
