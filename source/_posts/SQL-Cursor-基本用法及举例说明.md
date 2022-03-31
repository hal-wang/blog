---
title: SQL Cursor 基本用法及举例说明
comments: true
tags:
  - SQL
abbrlink: c127091f
date: 2019-09-18 16:33:39
categories:
  - 记录
reward: true
---

Cursor 即游标，我对其作用总结“操作想要操作的每条数据”
操作想要操作的每条数据看起来简单，其实如果不用游标有些操作实现起来比较困难，或者效率非常低（虽然游标的效率也低，但有些复杂操作游标相比效率较高一些）。

<!--more-->

## Cursor 格式

Cursor 一般用法都如下，主要操作在以下“SQL 语句执行过程”处。

```
DECLARE 游标名称 CURSOR FOR SELECT 字段1,字段2,字段3,... FROM 表名 WHERE ...
OPEN 游标名称
FETCH NEXT FROM 游标名称 INTO 变量名1,变量名2,变量名3,...
WHILE @@FETCH_STATUS=0
        BEGIN
                  SQL语句执行过程... ...
                  FETCH NEXT FROM 游标名称 INTO 变量名1,变量名2,变量名3,...
        END
CLOSE 游标名称
DEALLOCATE 游标名称
```

## 例 1

比如有个学校用来存储学生姓名的表 Students，结构如下：

```
Students
  ID INT
  Name NVARCHAR(10)
```

现在有个需求，要把名字为两位的两个字中间加上两个空格，以显示更美观（在显示的客户端或者网页更改更合适，但这里用于说明，改数据库）。
这个需求很多种方法可以实现，比如采用临时表，先找到名字为两位的数据放在临时表，再去更改，这个方法一方面效率很低，另一方面如果数据量比较大，临时表会占用太大的空间。
这时使用游标的优势就很明显了，正如前面所说的“操作想要操作的每条数据”。按照 Cursor 一般格式。每步的详细介绍看注释。

```
DECLARE @id INT //用于临时存储ID
DECLARE @name NVARCHAR(10) //用于临时存储名字

DECLARE cursor1 CURSOR FOR SELECT Name ID FROM Students WHERE LENGTH(Name) = 2 //选出想要操作的数据，在这里是找出名字长度为2的数据
OPEN cursor1 //打开游标
FETCH NEXT FROM cursor1 INTO @name,@id //将游标所在位置的Name和ID赋值到@name和ID以便操作
WHILE @@FETCH_STATUS = 0 //成功取到数据，即游标还没到头
        BEGIN
                  UPDATE Student SET Name = SUBSTRING(@name, 0, 1) + '  ' + SUBSTRING(@name, 1, 1) WHERE ID = @id //名字中间加空格
                  FETCH NEXT FROM cursor1 INTO @name,@id //游标下移一条数据，再次将Name和ID赋值到@name和ID
        END
CLOSE cursor1 //关闭游标
DEALLOCATE cursor1 //删除游标
```

## 例 2

表结构仍和例 1 一样，但现在需求变了：现有的数据都是按 ID 依次递增，并且这些 ID 是根据班级来划分的，比如 ID 1-50 为 1 班，51-100 为 2 班。但是某天 1 班来了个插班生，需要将其 ID 设为 51，2 班的所有 ID 依次加 1。当然这里 ID 不是自增主键，否则就不能更改了。仍按一般格式来做，详细介绍见注释。

```
DECLARE @newName NVARCHAR(10) //插班生的名字，假设已经赋值
DECLARE @id INT //用于临时存储ID

DECLARE cursor1 CURSOR FOR SELECT ID FROM Students WHERE ID > 50 ORDER BY ID DESC //这里需要从大到小排序，防止更改ID时有重复
OPEN cursor1 //打开游标
FETCH NEXT FROM cursor1 INTO @id //初始化游标
WHILE @@FETCH_STATUS=0 //成功取到数据，即游标还没到头
        BEGIN
                  UPDATE Students SET ID = ID + 1 WHERE ID = @id
                  FETCH NEXT FROM cursor1 INTO @id //游标下移一条数据，再次将ID赋值到@id
        END
CLOSE 游标名称
DEALLOCATE 游标名称

INSERT Students(ID, Name) VALUES(51, @newName) 插入插班生记录
```

此操作其实有更好的方法：`UPDATE Students SET ID = ID + 1 WHERE ID > 50`，只用一句命令即可实现上述 2 班 ID 增 1，此处是为了举例说明而使用了游标。

## 总结

使用游标实质是就是对每条数据都执行一个操作，而游标记录了当前要操作的数据所在位置，每次游标下移，即记录位置下移，以实现操作下一条数据，直到满足条件的数据都被操作了一遍。可想而知，游标的效率比较低，数据量比较大时尽量不去使用它。
