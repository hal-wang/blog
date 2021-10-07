---
layout: "about"
title: "关于"
date: 2020-03-21 04:48:33
comments: true
---

<br>

<center>

### 爱生活，爱编程

</center>

<br>

```JS
const hal = {
  avatar: "戴眼镜、黑眼圈、格子衫、牛仔裤、双肩包",
  birthday: new Date("1995-04-20"),
  weChat: "hbrwang",
  phoneNumber: "187********", // I won't tell you. Please use email
  email: "hi@hal.wang",
  hobby: ["电脑", "女朋友"],
  gender: "男",
  major: {
    "C#": ["WPF", "Asp.NET Core", "UWP", "Xamarin"],
    "js/ts": {
      Vue: ["Web", "uniapp"],
      NodeJS: ["KoaJS", "Express", "NestJS"],
    },
  },
  minor: [
    "Dart(Flutter)",
    "MSSQL/MySQL/MongoDB/Redis",
    "Photoshop (NOT PS ^o^/)"
  ],
  working: "Secret",
  workExperience: Math.round((new Date().getTime() - new Date("2019/01/17").getTime()) / (24 * 3600 * 1000)) + " days",
};

console.log("hal", hal);
```
