---
title: 优雅的使用 ts 开发 Vue
comments: true
abbrlink: aad5ddf8
date: 2021-05-14 22:02:12
categories:
  - 记录
tags:
  - Vue
  - TS
---

本文主要针对 Vue2，有些内容适合 Vue3，但有些不适合。Vue3 对 ts 的支持已经很友好了，而且也有相应的文档。但在 Vue2 中，使用 ts 需要一定写法才能更优雅。

<!--more-->

## 创建项目

使用 `Vue CLI 4` 创建，可以用 `vue create proj-name` 或者 `vue ui`，按提示，选择 `ts` 模板。

## 使用 Vuex

在 vue2 中，官方的 vuex 写法完全没有 ts 的味道，类型判断也没有作用，好在有更好的写法，那就是使用 `vuex-module-decorators` 。

### 配置

运行下面命令安装 `vuex-module-decorators`

```shell
npm i vuex-module-decorators
```

OR

```shell
yarn add vuex-module-decorators
```

### 定义

在项目中，一般都会模块化 store，每个模块都定义在 `/store/modules/` 文件夹下的 `ts` 文件

在一个模块中，写法如下：

```TS
import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule,
} from "vuex-module-decorators";
import Cookies from "js-cookie";
import store from "@/store";

export interface IAppState {
  sidebarOpened: boolean;
}

@Module({ dynamic: true, store, name: "app" })
class AppStore extends VuexModule implements IAppState {
  public sidebarOpened = true;

  @Mutation
  TOGGLE_SIDEBAR() {
    this.sidebarOpened = !this.sidebarOpened;
  }

  @Action
  toggleSideBar() {
    this.TOGGLE_SIDEBAR();
  }

  get sidebarNotOpened() {
    return !this.sidebarOpened;
  }
}

export const AppModule = getModule(AppStore);
```

以上模块中包含控制 `sidebarOpened` 变量的内容。

#### state

内容直接以类成员变量方式定义

#### @Module

用于模块类，需要指定该模块的名称 `name`和 vuex 实例 `store`

#### @Mutation

和传统的 `mutation` 一样，但可以直接以 `this.` 方式获取和修改 `state` 变量

#### @Action

和传统的 `action` 一样，可以以 `this.` 方式直接调用 `mutation`，而不是 `commit`

可以设置 `commit` 值为 `@Mutation` 名称，并在函数结束时返回一个值，这将会自动调用对应 `@Mutation`，如

```TS
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

@Module
class Module1 extends VuexModule {
  count = 0

  @Mutation
  SET_COUNT(count: number) {
    this.count = count;
  }

  @Action({ commit: 'SET_COUNT' })
  setCount(count: number) {
    return count;
  }
}
```

#### getter

`get` 属性可以自动生成 `getter`

### 组合模块

引用多个 `state` 模块，在 `/store/index.ts` 中代码如下：

```TS
import Vue from "vue";
import Vuex from "vuex";

import { IUserState } from "./modules/user";
import { IAppState } from "./modules/app";

Vue.use(Vuex);

import { config } from "vuex-module-decorators";
config.rawError = true;

export interface IRootState {
  app: IAppState;
  user: IUserState;
}

export default new Vuex.Store<IRootState>({});
```

这里引入的都是模块中的 state 接口，便于调用处的类型提示。

### 使用

在需要使用 `vuex` 的地方，使用方法如下：

```TS
import { AppModule } from "@/store/modules/app";

const sidebarOpened = AppModule.sidebarOpened;
AppModule.toggleSideBar();
```

上述代码如果用传统方式，使用方式如下：

```TS
import store from '@/store'

const sidebarOpened = store.state.app.sidebarOpened;
store.dispatch('app/toggleSideBar')
```

使用 `vuex-module-decorators` 不仅定义简单，调用简单，更不易出错

## 使用类装饰器

如果使用`Vue-CLI`构建时，在`Use class-style component syntax`这一步选择了`Y`，那么就已经支持了类装饰器

否则需要单独安装：`npm i vue-property-decorator vue-class-component`

具体使用方式参考 [vue-property-decorator](https://github.com/kaorun343/vue-property-decorator)
