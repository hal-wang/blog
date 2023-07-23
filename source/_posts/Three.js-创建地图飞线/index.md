---
title: Three.js 创建地图飞线
comments: true
abbrlink: 383ffbdc
date: 2023-03-21 23:06:53
categories:
  - 记录
tags:
  - Three.js
  - JS
---

使用 Three.js 在地图中创建有动画的飞线

能够根据输入坐标，创建飞线

示例代码均为 ts，效果如图

<!--more-->

![line](./line.png)

## 创建渲染类

用于封装飞线相关内容，完成后可方便被调用，最后面有完成的完整代码

构造函数接收 Scene 对象，用于添加模型

包含两个 public 方法

- render 传入点坐标，生成模型，仅需调用一次
- animation 在 Three.js 的动画中调用，用于渲染动画，会被多次调用

```TS
import * as THREE from 'three';

export class LineRender {
  constructor(private readonly scene: THREE.Scene) {}
  render(poses: [[number, number], [number, number]][]) {}
  animation() {}
}
```

## 创建飞线

此部分根据输入坐标创建飞线模型，并使其动起来

### 经纬度转 Three.js 坐标

使用 `d3` 转换

```TS
import * as d3 from 'd3';

d3.geoMercator().center([104.0, 37.5]).translate([0, 0])(lon, lat)
```

`center()` 函数传入地图中心经纬度

把这个方式封装一下

```TS
export class LineRender {
  private readonly projection = d3.geoMercator().center([104.0, 37.5]).translate([0, 0]);
}
```

此后使用方式如 `this.projection(lon, lat)`

### 解决 LineBasicMaterial 线宽无效

根据官方解释，由于 opengl 的限制，webgl 渲染器在大部分平台上会无视 lineWidth

> Due to limitations of the OpenGL Core Profile with the WebGL renderer on most platforms linewidth will always be 1 regardless of the set value.

我们改为使用 Line2

首先导入相关包并创建模型，使用 Line2 的方式如下

```TS
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

const lineGeometry = new LineGeometry();
lineGeometry.setPositions(points); // points 为各点数组，后面会有生成

const material = new LineMaterial({
  color: 0xf44336,
  linewidth: 2,
  side: THREE.DoubleSide,
});

const line = new Line2(lineGeometry, material);
this.scene.add(line);
```

### 二次贝塞尔曲线

按以上方式，我们要创建三维二次贝塞尔曲线

```TS
export class LineRender {
  private readonly lines: Line2[] = [];

  private lineConnect(posStartX: number, posStartY: number, posEndX: number, posEndY: number) {
    // 根据目标坐标设置3D坐标  z轴位置在地图表面
    const [x0, y0, z0] = [posStartX, posStartY, 0];
    const [x1, y1, z1] = [posEndX, posEndY, 0];

    // 使用QuadraticBezierCurve3() 创建 三维二次贝塞尔曲线
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(x0, -y0, z0),
      new THREE.Vector3((x0 + x1) / 2, -(y0 + y1) / 2, 20),
      new THREE.Vector3(x1, -y1, z1),
    );

    // 获取曲线 上的50个点
    const points = curve.getPoints(50).reduce((arr, cur) => {
      return arr.concat(cur.x, cur.y, cur.z);
    }, [] as number[]);

    const lineGeometry = new LineGeometry();
    lineGeometry.setPositions(points);

    const material = new LineMaterial({
      color: 0xf44336,
      linewidth: 2,
      side: THREE.DoubleSide,
    });

    material.resolution.set(window.innerWidth, window.innerHeight);
    const line = new Line2(lineGeometry, material);
    this.lines.push(line);
    this.scene.add(line);
  }
}
```

### 填充渐变色

有两种容易实现的方式让线动起来

- 再创建一个线，通过在动画函数中修改坐标点来实现移动效果
- 设置飞线的渐变色，并通过改变渐变色的方式让线看起来在移动

这里选的实现方式二

首先实现颜色的渐变，根据输入的颜色，生成一组渐变色

```TS
export class LineRender {
  // 颜色插值
  private gradientColors(start: string, end: string, steps: number, gamma = 1) {
    const parseColor = (hexStr: string) => {
      return hexStr.length === 4
        ? hexStr
            .substr(1)
            .split('')
            .map(function (s) {
              return 0x11 * parseInt(s, 16);
            })
        : [hexStr.substr(1, 2), hexStr.substr(3, 2), hexStr.substr(5, 2)].map(function (s) {
            return parseInt(s, 16);
          });
    };
    const pad = function (s) {
      return s.length === 1 ? `0${s}` : s;
    };
    let j;
    let ms;
    let me;
    const output: string[] = [];
    const so: string[] = [];
    const normalize = (channel: number) => {
      return Math.pow(channel / 255, gamma);
    };
    const startNum = parseColor(start).map(normalize);
    const endNum = parseColor(end).map(normalize);
    for (let i = 0; i < steps; i++) {
      ms = i / (steps - 1);
      me = 1 - ms;
      for (j = 0; j < 3; j++) {
        so[j] = pad(
          Math.round(Math.pow(startNum[j] * me + endNum[j] * ms, 1 / gamma) * 255).toString(16),
        );
      }
      output.push(`#${so.join('')}`);
    }
    return output;
  }
}
```

然后修改创建飞线的代码，让飞线填充渐变色

```TS
export class LineRender {
  private lineConnect(posStartX: number, posStartY: number, posEndX: number, posEndY: number) {
    // 根据目标坐标设置3D坐标  z轴位置在地图表面
    const [x0, y0, z0] = [posStartX, posStartY, 0];
    const [x1, y1, z1] = [posEndX, posEndY, 0];

    // 使用QuadraticBezierCurve3() 创建 三维二次贝塞尔曲线
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(x0, -y0, z0),
      new THREE.Vector3((x0 + x1) / 2, -(y0 + y1) / 2, 20),
      new THREE.Vector3(x1, -y1, z1),
    );

    // 获取曲线 上的50个点
    const points = curve.getPoints(50).reduce((arr, cur) => {
      return arr.concat(cur.x, cur.y, cur.z);
    }, [] as number[]);
    const lineGeometry = new LineGeometry();

    lineGeometry.setPositions(points);
    const colors = [
      ...this.gradientColors('#00ffff', '#f44336', points.length / 3 / 2),
      ...this.gradientColors('#f44336', '#f44336', points.length / 3 / 2),
    ].reverse();
    const colorArr = colors.reduce((arr: number[], item) => {
      const Tcolor = new THREE.Color(item);
      return arr.concat(Tcolor.r, Tcolor.g, Tcolor.b);
    }, []);
    lineGeometry.setColors(colorArr);

    const material = new LineMaterial({
      // color: 0xf44336,
      vertexColors: true,
      linewidth: 2,
      transparent: true,
      side: THREE.DoubleSide,
    });

    material.resolution.set(window.innerWidth, window.innerHeight);
    const line = new Line2(lineGeometry, material);
    line['_colors'] = colorArr;
    this.lines.push(line);
    this.scene.add(line);
  }

  // 颜色插值
  private gradientColors(start: string, end: string, steps: number, gamma = 1){}
}
```

```TS
import * as THREE from 'three';

export class LineRender {
  constructor(private readonly scene: THREE.Scene) {}

  private readonly lines: Line2[] = [];

  render(poses: [[number, number], [number, number]][]) {
    this.lines.splice(0);
    this.addLines(poses);
  }

  animation() {
    this.arclineAnimate();
  }

  private arclineAnimate() {
    for (const line of this.lines) {
      if (!line['_tick']) line['_tick'] = 0;
      line['_tick'] = (line['_tick'] + 1) % 4;
      if (line['_tick'] > 1) continue;

      const colors: any[] = line['_colors'];
      colors.splice(0, 0, ...colors.splice(colors.length - 3, 3));

      line.geometry.setColors(colors);
    }
  }

  private addLines(poses: [[number, number], [number, number]][]) {
    poses.forEach((item) => {
      const start = this.projection(item[0]);
      const end = this.projection(item[1]);
      if (start && end) {
        this.lineConnect(...start, ...end);
      }
    });
  }

    private lineConnect(posStartX: number, posStartY: number, posEndX: number, posEndY: number) {
    // 根据目标坐标设置3D坐标  z轴位置在地图表面
    const [x0, y0, z0] = [posStartX, posStartY, 0];
    const [x1, y1, z1] = [posEndX, posEndY, 0];

    // 使用QuadraticBezierCurve3() 创建 三维二次贝塞尔曲线
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(x0, -y0, z0),
      new THREE.Vector3((x0 + x1) / 2, -(y0 + y1) / 2, 20),
      new THREE.Vector3(x1, -y1, z1),
    );

    // 获取曲线 上的50个点
    const points = curve.getPoints(50);
    const lineGeometry = new LineGeometry();

    const arr: number[] = [];
    points.forEach((item) => {
      arr.push(item.x);
      arr.push(item.y);
      arr.push(item.z);
    });
    lineGeometry.setPositions(arr);
    const colors = [
      ...this.gradientColors('#00ffff', '#f44336', points.length / 2),
      ...this.gradientColors('#f44336', '#f44336', points.length / 2),
    ].reverse();
    const colorArr = colors.reduce((arr: number[], item) => {
      const Tcolor = new THREE.Color(item);
      return arr.concat(Tcolor.r, Tcolor.g, Tcolor.b);
    }, []);
    lineGeometry.setColors(colorArr);

    const material = new LineMaterial({
      vertexColors: true,
      linewidth: 2,
      transparent: true,
      side: THREE.DoubleSide,
    });

    material.resolution.set(window.innerWidth, window.innerHeight);
    const line = new Line2(lineGeometry, material);
    line['_colors'] = colorArr;
    this.lines.push(line);
    this.scene.add(line);
  }

  // 颜色插值
  private gradientColors(start: string, end: string, steps: number, gamma = 1) {
    const parseColor = (hexStr: string) => {
      return hexStr.length === 4
        ? hexStr
            .substr(1)
            .split('')
            .map(function (s) {
              return 0x11 * parseInt(s, 16);
            })
        : [hexStr.substr(1, 2), hexStr.substr(3, 2), hexStr.substr(5, 2)].map(function (s) {
            return parseInt(s, 16);
          });
    };
    const pad = function (s) {
      return s.length === 1 ? `0${s}` : s;
    };
    let j;
    let ms;
    let me;
    const output: string[] = [];
    const so: string[] = [];
    const normalize = (channel: number) => {
      return Math.pow(channel / 255, gamma);
    };
    const startNum = parseColor(start).map(normalize);
    const endNum = parseColor(end).map(normalize);
    for (let i = 0; i < steps; i++) {
      ms = i / (steps - 1);
      me = 1 - ms;
      for (j = 0; j < 3; j++) {
        so[j] = pad(
          Math.round(Math.pow(startNum[j] * me + endNum[j] * ms, 1 / gamma) * 255).toString(16),
        );
      }
      output.push(`#${so.join('')}`);
    }
    return output;
  }
}
```

### 让线动起来

通过改变渐变色的方式让线看起来在移动

每次将颜色数组的最后一个颜色（r + g + b 三个数字），提到最前面

这里由于动画较快，通过 `_tick` 降低了动画的速率

```TS
export class LineRender {
  private readonly lines: Line2[] = [];
  private arclineAnimate() {
    for (const line of this.lines) {
      if (!line['_tick']) line['_tick'] = 0;
      line['_tick'] = (line['_tick'] + 1) % 4;
      if (line['_tick'] > 1) continue;

      const colors: any[] = line['_colors'];
      colors.splice(0, 0, ...colors.splice(colors.length - 3, 3));

      line.geometry.setColors(colors);
    }
  }
}
```

### 通过经纬度创建飞线

创建函数 `addLines` 并在 `render` 函数中调用

```TS
export class LineRender {
  private readonly lines: Line2[] = [];

  render(poses: [[number, number], [number, number]][]) {
    this.lines.splice(0);
    this.addLines(poses);
  }

  private addLines(poses: [[number, number], [number, number]][]) {
    poses.forEach((item) => {
      const start = this.projection(item[0]);
      const end = this.projection(item[1]);
      if (start && end) {
        this.lineConnect(...start, ...end);
      }
    });
  }
}
```

## 起始点动画

在飞线的开始和结尾处，有两个扩散动画的点，我们要增加点模型并让其动起来

### 创建模型

创建函数 `spotCircle`，根据坐标创建大小两个圆形

```TS
export class LineRender {
  private readonly circleYs: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>[] = [];

 private spotCircle(spot: [number, number]) {
    const geometry1 = new THREE.CircleGeometry(2, 200);
    const material1 = new THREE.MeshBasicMaterial({ color: '#F44336', side: THREE.DoubleSide });
    const circle = new THREE.Mesh(geometry1, material1);
    // 绘制地图时 y轴取反 这里同步
    circle.position.set(spot[0], -spot[1], 0.4);
    this.scene.add(circle);

    // 圆环
    const geometry2 = new THREE.RingGeometry(2, 1, 50);
    // transparent 设置 true 开启透明
    const material2 = new THREE.MeshBasicMaterial({
      color: 0xf44336,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const circleY = new THREE.Mesh(geometry2, material2);
    // 绘制地图时 y轴取反 这里同步
    circleY.position.set(spot[0], -spot[1], 0.4);
    this.scene.add(circleY);

    this.circleYs.push(circleY);
  }
}
```

修改前面的 `addLines` 函数，每创建一根飞线就创建两个动画点

```TS
export class LineRender {
  private addLines(poses: [[number, number], [number, number]][]) {
    poses.forEach((item) => {
      const start = this.projection(item[0]);
      const end = this.projection(item[1]);
      if (start && end) {
        this.spotCircle(start);
        this.spotCircle(end);
        this.lineConnect(...start, ...end);
      }
    });
  }
}
```

### 让点动起来

通过放缩点的大小，并改变其透明度，可实现动画效果

增加函数 `pointAnimate`，并在动画函数中调用

```TS
export class LineRender {
  private readonly circleYs: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>[] = [];

  animation() {
    this.pointAnimate();
  }

  private pointAnimate() {
    this.circleYs.forEach(function (mesh) {
      mesh['_s'] += 0.01;
      mesh.scale.set(1.1 * mesh['_s'], 1.1 * mesh['_s'], 1.1 * mesh['_s']);
      if (mesh['_s'] <= 2) {
        mesh.material.opacity = 2 - mesh['_s'];
      } else {
        mesh['_s'] = 1;
      }
    });
  }
}
```

## 最终代码

按以上步骤，最终实现的 `LineRender` 类代码如下

```TS
import * as THREE from 'three';
import * as d3 from 'd3';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

export class LineRender {
  constructor(private readonly scene: THREE.Scene) {}

  private readonly circleYs: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>[] = [];
  private readonly projection = d3.geoMercator().center([104.0, 37.5]).translate([0, 0]);
  private readonly lines: Line2[] = [];

  render(poses: [[number, number], [number, number]][]) {
    this.circleYs.splice(0);
    this.lines.splice(0);

    this.addLines(poses);
  }

  animation() {
    this.pointAnimate();
    this.arclineAnimate();
  }

  private pointAnimate() {
    this.circleYs.forEach(function (mesh) {
      mesh['_s'] += 0.01;
      mesh.scale.set(1.1 * mesh['_s'], 1.1 * mesh['_s'], 1.1 * mesh['_s']);
      if (mesh['_s'] <= 2) {
        mesh.material.opacity = 2 - mesh['_s'];
      } else {
        mesh['_s'] = 1;
      }
    });
  }

  private arclineAnimate() {
    for (const line of this.lines) {
      if (!line['_tick']) line['_tick'] = 0;
      line['_tick'] = (line['_tick'] + 1) % 4;
      if (line['_tick'] > 1) continue;

      const colors: any[] = line['_colors'];
      colors.splice(0, 0, ...colors.splice(colors.length - 3, 3));

      line.geometry.setColors(colors);
    }
  }

  private addLines(poses: [[number, number], [number, number]][]) {
    poses.forEach((item) => {
      const start = this.projection(item[0]);
      const end = this.projection(item[1]);
      if (start && end) {
        this.spotCircle(start);
        this.spotCircle(end);
        this.lineConnect(...start, ...end);
      }
    });
  }

  private spotCircle(spot: [number, number]) {
    const geometry1 = new THREE.CircleGeometry(2, 200);
    const material1 = new THREE.MeshBasicMaterial({ color: '#F44336', side: THREE.DoubleSide });
    const circle = new THREE.Mesh(geometry1, material1);
    // 绘制地图时 y轴取反 这里同步
    circle.position.set(spot[0], -spot[1], 0.4);
    this.scene.add(circle);

    // 圆环
    const geometry2 = new THREE.RingGeometry(2, 1, 50);
    // transparent 设置 true 开启透明
    const material2 = new THREE.MeshBasicMaterial({
      color: 0xf44336,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const circleY = new THREE.Mesh(geometry2, material2);
    // 绘制地图时 y轴取反 这里同步
    circleY.position.set(spot[0], -spot[1], 0.4);
    this.scene.add(circleY);

    this.circleYs.push(circleY);
  }

  private lineConnect(posStartX: number, posStartY: number, posEndX: number, posEndY: number) {
    // 根据目标坐标设置3D坐标  z轴位置在地图表面
    const [x0, y0, z0] = [posStartX, posStartY, 0];
    const [x1, y1, z1] = [posEndX, posEndY, 0];

    // 使用QuadraticBezierCurve3() 创建 三维二次贝塞尔曲线
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(x0, -y0, z0),
      new THREE.Vector3((x0 + x1) / 2, -(y0 + y1) / 2, 20),
      new THREE.Vector3(x1, -y1, z1),
    );

    // 获取曲线 上的50个点
    const points = curve.getPoints(50).reduce((arr, cur) => {
      return arr.concat(cur.x, cur.y, cur.z);
    }, [] as number[]);
    const lineGeometry = new LineGeometry();

    lineGeometry.setPositions(points);
    const colors = [
      ...this.gradientColors('#00ffff', '#f44336', points.length / 3 / 2),
      ...this.gradientColors('#f44336', '#f44336', points.length / 3 / 2),
    ].reverse();
    const colorArr = colors.reduce((arr: number[], item) => {
      const Tcolor = new THREE.Color(item);
      return arr.concat(Tcolor.r, Tcolor.g, Tcolor.b);
    }, []);
    lineGeometry.setColors(colorArr);

    const material = new LineMaterial({
      // color: 0xf44336,
      vertexColors: true,
      linewidth: 2,
      transparent: true,
      side: THREE.DoubleSide,
    });

    material.resolution.set(window.innerWidth, window.innerHeight);
    const line = new Line2(lineGeometry, material);
    line['_colors'] = colorArr;
    this.lines.push(line);
    this.scene.add(line);
  }

  // 颜色插值
  private gradientColors(start: string, end: string, steps: number, gamma = 1) {
    const parseColor = (hexStr: string) => {
      return hexStr.length === 4
        ? hexStr
            .substr(1)
            .split('')
            .map(function (s) {
              return 0x11 * parseInt(s, 16);
            })
        : [hexStr.substr(1, 2), hexStr.substr(3, 2), hexStr.substr(5, 2)].map(function (s) {
            return parseInt(s, 16);
          });
    };
    const pad = function (s) {
      return s.length === 1 ? `0${s}` : s;
    };
    let j;
    let ms;
    let me;
    const output: string[] = [];
    const so: string[] = [];
    const normalize = (channel: number) => {
      return Math.pow(channel / 255, gamma);
    };
    const startNum = parseColor(start).map(normalize);
    const endNum = parseColor(end).map(normalize);
    for (let i = 0; i < steps; i++) {
      ms = i / (steps - 1);
      me = 1 - ms;
      for (j = 0; j < 3; j++) {
        so[j] = pad(
          Math.round(Math.pow(startNum[j] * me + endNum[j] * ms, 1 / gamma) * 255).toString(16),
        );
      }
      output.push(`#${so.join('')}`);
    }
    return output;
  }
}
```

## 使用方式

在调用处可以很方便的根据经纬度生成飞线

初始化时，执行如下代码

```TS
const lineRender = new LineRender(scene);
lineRender.render(data);
```

在动画函数中，执行如下代码

```TS
lineRender.animation();
```

### 以 Vue 举例

```HTML
<script lang="ts" setup>
  const scene = new THREE.Scene();
  const lineRender = new LineRender(scene);

  onMounted(() => {
    lineRender.render(data); // 经纬度数据
    requestAnimationFrame(animation);
  });

  function animation() {
    requestAnimationFrame(animation);
    lineRender.animation();
  }
</script>
```

### 飞线经纬度的数据格式

此示例的数据需按如下格式，将生成三条飞线

```TS
export const data: [[number, number], [number, number]][] = [
  [
    [106.557691, 25.559296],
    [86.495721, 39.236797],
  ],
  [
    [116.557691, 39.559296],
    [139.495721, 36.236797],
  ],
  [
    [116.557691, 39.559296],
    [104.495721, 47.236797],
  ]
];
```
