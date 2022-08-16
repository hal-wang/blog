---
title: Git 大文件 LFS
comments: true
abbrlink: 4e5ea5aa
date: 2022-08-16 10:39:41
categories:
  - 记录
tags:
  - Git
---

> Git LFS 是一个易于安装、易于配置，使用高效的 Git 拓展工具，它能有效的管理仓库中的大文件，避免仓库体积过大，影响项目管理效率

<!--more-->

## 为什么使用 LFS

> 这段是废话，既然看到了这里，说明你应该已经需要用 LFS 了，跳过吧！

1. 主流 Git 托管服务都支持 LFS，如 `GitHub`, `Gitee`, `GitLab`, 云效等
2. 有些托管服务的 Git 仓库限制了大文件，或者限制仓库总大小，如 `GitHub` 目前限制文件不能超过 `100MB`
3. 仓库太大每次 pull/push 都很慢
4. 大文件往往很少修改

使用 LFS 不仅能解决大文件带来的仓库问题，同时托管服务也对大文件做了传输速度优化

## 开启 LFS

按以下操作给已有仓库开启 LFS

- 初始化 lfs，在项目目录下运行：

```shell
git lfs install
```

- 跟踪大文件，并生成 `.gitattributes`：

```shell
git lfs track "xxx/file.mp4"
```

- 提交修改：

```shell
git add -A
git commit -m "message"
git push origin main
```

之后就和普通仓库一样操作即可

## 新增大文件

可以重复执行以上命令

```shell
git lfs track "xxx/file.mp4"
```

也可以手动修改文件 `.gitattributes` 添加文件，可以和 `.gitignore` 一样使用通配符

## 删除历史大文件

如果之前的提交有大文件，在不回退提交的前提下，删除文件是不会在 git 中删除大文件的

可以用以下方式修改历史提交，彻底删除大文件

### 查找大文件

- 查看文件大小

```bash
du -ah .git/object
```

如果在 Windows 系统无法执行上述语句，可以用 `sh` 命令切换到 git bash 中执行，后续命令同样如此

- 查看占用空间最多的五个文件

```bash
git rev-list --objects --all | grep "$(git verify-pack -v .git/objects/pack/*.idx | sort -k 3 -n | tail -5 | awk '{print$1}')"
```

### 删除大文件

- 修改历史提交以删除大文件

```bash
git filter-branch --force --index-filter 'git rm -rf --cached --ignore-unmatch 你的大文件名' --prune-empty --tag-name-filter cat -- --all
```

- 清理本地仓库

```bash
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now
git gc --aggressive --prune=now
```

- 提交并覆盖远程仓库

```bash
git push origin main --force
```

如果该分支被保护，需要在托管网站解除保护才能 `force` 提交
