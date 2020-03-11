---
title: Git
comments: true
tags:
  - Git
  - 速查
abbrlink: 69c3279c
date: 2019-12-05 17:24:23
categories:
---

git init 创建代码仓

git clone 克隆代码仓

git status 查看代码仓状态

git log 列出代码仓。关于git log后都可以加上指定SHA以查看指定的commit

git log --oneline单行显示

git log --stat显示详细修改信息

git log --patch可简写-p，显示详细修改内容

git log -p -w显示补丁信息，但忽略仅修改空格的行

git log --decorate 在Git 1.13之后，默认的git log就是这个命令。之前这个显示更多信息

可以将SHA作为最后一个参数在-p之后，以查看指定commit

git show 显示最近的 commit

git show <指定commit的SHA> 查看指定commit

git add <名称 可多个> 向暂存区添加文件或文件夹。可接受多个文件名，用空格分隔。可用句点.代替文件列表

git commit 提交暂存区

git commit --amend 更改最后一个commit

git rm <名称> 在暂存区移除文件或文件夹

git diff 查看未提交的更改

在.gitignore文件中添加的文件，会被忽略。
* 忽略格式通配符：
* #注释
* *与>=0个字符匹配
* ？与1个字符匹配
* [abc]与a、b或c匹配
* \*\*与嵌套目录匹配。比如a/\*\*/z匹配：a/z、a/b/z、a/b/c/z等

git tag 查看标签

git tag -a <标签> 创建标签，如果没有-a则没有注释。比如git tag -a v1.0

git tag -d <标签> <要删除commit对应的SHA> 删除标签

git branch列出仓库中的分支

git branch <分支> 创建新分支

git branch <分支> <SHA> 创建新分支，并使其指向指定SHA的commit

git branch -d <分支> 删除分支。无法删除当前所在分支。无法删除含有独有commit的分支（除非使用-D强制删除）

git checkout <分支> 切换分支

git revert <SHA> 恢复之前创建的commit

^ 表示父 commit。HEAD后有多少个^，就是当前commit的多少级父

~ 表示第一个父 commit。HEAD后一个~，~后的数字是当前commit的多少级父

如果^后有数字，以第一个父 commit 是运行 git merge 时所属的分支开始数，而第二个父 commit 是被合并的分支，依次类推

git reset --mixed <HEAD^> 将指定commit中做出的更改移至工作目录中

git reset --soft <HEAD^> 将指定commit中做出的更改移至暂存区

git reset --hard <HEAD^> 清除指定commit中做出的更改

---

### GitHub

1. git remote add origin https://'用户名':'密码'@github.com/'用户名'/'项目名'.git
2. git pull origin master
3. git push -u origin master