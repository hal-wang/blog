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

先上猫照

<center>

![滴滴](./index/didi.jpg)

</center>

<br>

#### 进入正题

```
    internal class Program
    {
        internal static void Main(string[] args)
        {
            var hbrwang = new
            {
                Avatar = "戴眼镜、黑眼圈、格子衫、牛仔裤、双肩包",
                Birthday = DateTime.Parse("1995-04-02"),
                WeChat = "hbrwang", 
                PhoneNumber = "187********", // I won't tell you. Please use email
                Email = "hbrwang@outlook.com",
                Hobby = new string[] { "电脑", "女朋友" },
                Sex = "男",
                Major = new string[] { "C#", "WPF", "Vue.js" },
                Minor = new string[] { "UWP", "Asp.NET", "Photoshop", "微信小程序", "SQL Server" },
                Working = "新奥特（北京）视频技术有限公司",
                WorkExperience = new TimeSpan(365 + 31 * 2),

            };

            Console.WriteLine(JsonConvert.SerializeObject(hbrwang));
        }
    }
```
