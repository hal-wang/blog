---
title: 成为 TypeScript 高手 - 快来做体操
comments: true
abbrlink: 7c21479a
date: 2024-07-01 13:50:36
categories:
tags:
---

快来做体操 —— 本文带你感受 ts 类型系统的魅力，提升 ts 的能力。

ts 类型体操，是对 ts 类型计算的一种戏称，因为 ts 的类型非常灵活，且复杂度够深。

做操之前，先保证了解这些：

- [JavaScript 语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide)
- [TypeScript 语法](https://www.typescriptlang.org/)

<!--more-->

## 基础

TypeScript 的类型系统也可以做很多运算，现在我们来了解一些基础逻辑运算。

### 交叉 `&`

对类型做合并

```ts
type NewType = { a: number } & { b: string };
```

### 联合 `|`

表示可以是多种类型之一

```ts
type Union = "a" | "b" | 1 | 2;
```

### 约束 `extends`

可以为模板类限制类型

```ts
interface Base {
  length: number;
}

// T extends Base 限制了 T 必须包含 length，而且 length 的类型必须是 number
function fn1<T extends Base>(arg: T): number {
  return arg.length;
}
```

### 条件 `T extends U ? X : Y`

类似三元表达式，即如果 T 是 U 的子类型，那么类型是 X，否则是 Y

```ts
type IsString<T> = T extends string ? string : number;

type t1 = IsString<1>; // number
type t2 = IsString<"abc">; // string
```

### 索引查询 `keyof T`

获取类型的所有键的联合类型

```ts
const obj = {
  name: "string",
  age: 1,
};
type t2 = keyof typeof obj; // 'name' | 'age'
```

### 索引访问 `T[K]`

取类型中索引的类型

```ts
type TestInterface = {
  name: string;
  age: number;
};

type t = TestInterface["name"]; // string
```

配合 `keyof` 还可以获取所有索引的联合类型

```ts
type TestInterface = {
  name: string;
  age: number;
};

type t = TestInterface[keyof TestInterface]; // string | number
```

### 遍历索引 `in`

用于遍历联合类型，常配合 keyof 使用，可以根据已有类型创建新类型

```ts
const obj = {
  name: "string",
  age: 1,
};

type t = {
  [P in keyof typeof obj]: string;
};

// 等同于
// type t = {
//   name: boolean;
//   age: boolean;
// };
```

再比如复制出一份只读类型，给所有索引都加上 `readonly` 修饰

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

或去掉 readonly

```ts
type NotReadonly<T> = {
  -readonly [P in keyof T]: T[P];
};
```

### 索引重映射 `as`

在索引后面加个 as 语句，可以对索引类型做过滤和转换

比如仅保留类型为 `number` 的索引

```ts
type FilterNumber<T> = {
  [P in keyof T as T[P] extends number ? P : never]: T[P];
};

type t1 = {
  name: string;
  age: number;
};

type t2 = FilterNumber<t1>;

// 等同于
// type t2 = {
//   age: number;
// };
```

再比如给索引都加上前缀 `prefix-`

```ts
type AddPrefix<T> = {
  [P in keyof T as `prefix-${P & string}`]: T[P];
};

type t1 = {
  name: string;
  age: number;
};

type t2 = AddPrefix<t1>;

// 等同于
// type t2 = {
//   "prefix-name": string;
//   "prefix-age": number;
// }
```

再如，交换类型的 key 和 value

```ts
type Flip<T extends Record<any, any>> = {
  [Key in keyof T as `${T[Key]}`]: Key;
};

type t1 = {
  name: "wang";
  age: 18;
};

type t2 = Flip<t1>;

// 等同于
// type t2 = {
//     wang: "name";
//     18: "age";
// }
```

## TypeScript 内置高级类型

内置高级类型是利用基础语法，做出各种变换，从而支持高级类型。类型体操也是同样的过程和操作

### Readonly

把索引改为只读，用 in 操作符遍历索引，映射为一个新类型，并将索引改为 readonly

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type t1 = {
  name: "string";
  age: 18;
};

type t2 = Readonly<t1>;

// 等同于
// type t2 = {
//   readonly name: 'string';
//   readonly age: 18;
// }
```

### Partial

把索引变为可选，用 in 操作符遍历索引，映射为一个新类型，给索引加上 `?`

```ts
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type t1 = {
  name: "string";
  age: 18;
};

type t2 = Partial<t1>;

// 等同于
// type t2 = {
//   name?: "string" | undefined;
//   age?: 18 | undefined;
// }
```

### Required

把索引变为必选，用 in 操作符遍历索引，映射为一个新类型，给索引移除 `?

```ts
type Required<T> = {
  [P in keyof T]-?: T[P];
};

type t1 = {
  name: "string";
  age?: 18;
};

type t2 = Required<t1>;

// 等同于
// type t2 = {
//   name: 'string';
//   age: 18;
// }
```

### Pick

用 in 遍历自定义参数，配合联合类型，生成新的映射类型

```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type t1 = {
  name: "string";
  age: 18;
  email: "string";
};

type t2 = Pick<t1, "name" | "age">;

// 等同于
// type t2 = {
//   name: "string";
//   age: 18;
// }
```

### Record

用 in 遍历自定义参数，创建新的映射类型

```ts
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

type t1 = {
  name: "string";
  age: 18;
  email: "string";
};

type t2 = Record<"name" | "age", boolean>;

// 等同于
// type t2 = {
//   name: boolean;
//   age: boolean;
// }
```

### Exclude

排除联合类型的部分类型

```ts
type Exclude<T, U> = T extends U ? never : T;

type t1 = Exclude<"name" | "age", "name">;

// 等同于
// type t1 = "age";
```

### Extract

取联合类型的部分类型，与 `Exclude` 相反

```ts
type Extract<T, U> = T extends U ? T : never;

type t1 = Extract<"name" | "age", "name">;

// 等同于
// type t1 = "name";
```

### Omit

删除类型中的部分索引

```ts
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

type t1 = {
  name: "string";
  age: 18;
  email: "string";
};

type t2 = Omit<t1, "name" | "age">;

// 等同于
// type t2 = {
//   email: "string";
// }
```

## 简单体操

_未完待续_
