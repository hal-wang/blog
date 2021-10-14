---
title: tfs 命令行用法
comments: true
abbrlink: 5f08ecb7
date: 2020-12-17 09:00:41
categories:
  - 记录
tags:
  - tfs
---

所在部门还在使用老旧的 tfs，开发前端项目时极不方便，领导也不愿意改用 git，我就学了些 tfs 命令编写脚本，简化一下工作量。

<!--more-->

## 需求示例

此部分的内容是一个 `简化前端项目更新tfs操作` 的示例，你可以参考，也可以跳过。

### 背景

之前我会在别处写项目，使用 git。完成一个功能后，做以下操作：

1. 打开 visual studio
1. 删除 tfs 上的项目文件
1. checkin
1. 将 git 管理的项目必要文件，复制到 tfs 项目目录
1. checkin

本来很简单的东西，却需要这一系列操作，真是影响工作心情啊

### 改进

在前端 nodejs 项目中的 `scripts` 节点加上以下语句：

```json
    "tfs": "tfs.bat",
```

在项目中新建文件 `tfs.bat`

内容如下：

```bat
set folder=folder name
set targetPath=target folder's parent folder
set sourcePath=source folder's parent folder

cd %targetPath%
tf delete %folder% /recursive
tf checkin /noprompt /comment:"update automatically"
md "%folder%"
cd %folder%

for %%i in (
  .browserslistrc,
  .eslintrc.js,
  .gitignore,
  babel.config.js,
  jest.config.js,
  package.json,
  tsconfig.json,
  vue.config.js
) do (
  cd %sourcePath%/%folder%
  copy "%sourcePath%/%folder%/%%i" "%targetPath%/%folder%/"
  cd %targetPath%/%folder%
  tf add "%targetPath%/%folder%/%%i"
)

for %%i in (
  public,
  src,
  tests,
) do (
  md "%%i"
  xcopy "%sourcePath%/%folder%/%%i" "%targetPath%/%folder%/%%i" /s
  tf add "%targetPath%/%folder%/%%i" /recursive
)

tf checkin /noprompt /comment:"update automatically"
```

如果复制到你的项目中，需要更改前三行路径，以及循环中要操作的文件和文件夹

每次更新功能，只需要运行一行语句

```shell
npm run tfs
```

终于，懒才是驱动进步的主要动力，可以愉快的用 git 了

## tfs 用法

接下来就是 tfs 内容了

具体请参考文档 <https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/z51z7zy0(v=vs.100)>

此处只摘取或补充部分

### 配置环境变量

默认 tf 命令需要打开：开始菜单 -> Visual Studio 2019 -> Developer Command Prompt for VS 2019

但是，我们也可以将 tf.exe 所在目录加入到环境变量，如： vs 2019

```
 C:\Program Files (x86)\Microsoft Visual Studio\2019\Professional\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer
```

完成后，在控制台输入 tf，能找到命令即设置正确

### tfs 命令常用参数

#### /recursive

递归操作，如 `add`,`delete`等对文件夹操作时，并不会递归操作文件夹中的文件。加上这个参数可以递归操作文件夹。

#### /noprompt

静默方式，如 `checkin` 默认要点击确认才继续，加上这个参数后会自动确认并继续执行。

### tfs 常用命令

#### add

将文件添加到工作区，注意如果添加的是文件夹，默认不会添加文件夹中的文件，需要参数 `/recursive`

```shell
tf add itemspec
```

#### delete

删除服务器文件，如果是删除非空文件夹，必须加上 `/recursive`。删除后需要 `checkin` 才生效。

#### checkin

将工作区文件提交到服务器，如果无需手动确认可加参数 `/noprompt`
