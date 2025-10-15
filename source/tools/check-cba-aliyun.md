---
layout: "tools"
title: "阿里云资源检查"
date: 2025-05-16 23:24:00
---

  <style>
    #startBtn, #loginBtn {
      width: 100%;
      padding: 20px 0;
      font-size: 20px;
      font-weight: bold;
      margin-top: 10px;
      margin-bottom: 10px;
    }
  </style>

  <div>
    <button id="loginBtn">登录</button>
    <button id="startBtn">开始</button>
  </div>

  <script>
    !(() => {
      document.getElementById("loginBtn").onclick = async ()=>{
          window.open("https://account.aliyun.com/login/login.htm", "_blank");
      };
      
      document.getElementById("startBtn").onclick = async () => {
        const urls = `
          https://m.console.aliyun.com/ecs/cn-beijing/instances/i-2ze5xduwlgrsvfx2612k/monitor
          https://m.console.aliyun.com/ecs/cn-beijing/instances/i-2ze1vfjj2spayf2x7n78/monitor
          https://m.console.aliyun.com/ecs/cn-beijing/instances/i-2ze88tmjbxtca1rgcea0/monitor
          https://m.console.aliyun.com/ecs/cn-beijing/instances/i-2ze0x2857b1asoiut5l4/monitor
          https://m.console.aliyun.com/appmonitor/rds/monitor-list?regionId=cn-beijing&instanceId=rm-2zev2k7bcksnm8769
          https://m.console.aliyun.com/redis/cn-beijing/basic-list/r-2zem9dminsf4nu8w2r/monitor`
          .split("\n")
          .map((x) => x.trim())
          .filter((x) => !!x);

        for (var i = 0; i < urls.length; i++) {
          window.open(urls[i], "_blank");
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      };
    })();
  </script>
