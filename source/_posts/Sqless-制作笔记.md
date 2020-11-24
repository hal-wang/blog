---
title: Sqless 制作笔记
comments: true
abbrlink: da876015
date: 2020-08-27 21:05:42
categories:
  - 记录
tags:
  - Sqless
  - C#
  - sql
  - WebApi
---

前段时间了解到腾讯云的 Cloudbase，很喜欢它数据库、对象存储、和云函数，尤其是通过权限和登录信息，来控制数据库读写权限的功能。本想将某个项目转移到上面，但其 C#的 SDK 功能残缺，完全无法管理用户，对已有项目不咋友好。于是就想造个类似的 Cloudbase 数据库的轮子。

<!--more-->

![Sqless](https://sqless.hubery.wang/logo.png)

_logo 好像有些丑_

**目前只写了 Sql Server**

## 计划

### 实现目标：

1. 不直接执行 SQL 语句或存储过程，可以将 C#语言安全转换为 SQL 再执行。
2. 通过权限控制，让数据库内容安全可控。
3. 用户登录认证系统，让客户端安全操作数据库，全栈开发不用边写客户端边写 API。

### 数据库基本操作：

增删改查

1. Select
2. Update
3. Delete
4. Insert

### 扩展功能

1. Upsert: 如果存在记录则更新，不存在则新增
2. SelectFirstOrDefault: 如果存在记录则返回第一条，否则返回默认值
3. SelectFirst: 如果存在记录返回第一条，否则报错
4. Count：满足条件的记录条数

## 开始

首先不考虑登录认证和权限问题，只写好数据库操作。

至少需要有个类记录请求信息，有个类用来将请求转化为 SQL。

## 封装请求

思路：每个请求是一个对象，其中包含请求类型，查询条件等。如简单的 Delete，需要包含删除数据所在表、查询条件。

### 查询条件

大部分请求都有查询条件。其中查询表一般为当前请求操作的表，但对于连接查询，会涉及到多个表。

#### 查询类型

一般查询条件有以下几种类型：

1. 比较
2. 字符串查询
3. 是否空

创建以下枚举：

```CSharp
public enum SqlessQueryType
{
    Equal = 1,
    NotEqual = 2,

    StartWith = 11,
    EndWith = 12,
    Contain = 13,

    LessThan = 21,
    GreaterThan = 22,
    LessEqual = 23,
    GreaterEqual = 24,

    Null = 31,
    NotNull = 32
}
```

#### 查询类

创建以下查询类，用于记录每条查询的查询类型、查询值、查询表、查询字段

```CSharp
public class SqlessQuery
{
    public SqlessQueryType Type { get; set; }
    public string Value { get; set; }
    public string Table { get; set; }
    public string Field { get; set; }
}
```

### 请求基类

由于请求都有上述共同特性，因此创建请求基类：

```CSharp
public class SqlessRequest
{
    public string Table { get; set; }

    public List<SqlessQuery> Queries { get; set; } = new List<SqlessQuery>();
}
```

### 各类请求

#### Delete

Delete 请求较简单，直接继承`SqlessRequest`即可满足

#### Count

计算满足条件的数据条数。计算时，有可能计算的是某个字段，也可能用`Distinct`修饰查询，因此创建 Count 请求类：

```CSharp
public class SqlessCountRequest : SqlessRequest
{
    public string Field { get; set; } = null;

    public bool Distinct { get; set; } = false;
}
```

#### Insert & Update

插入和更新数据类似，都需要插入/更新的

** 未完待续 **