---
title: uniapp 上传文件至 COS
comments: true
categories:
  - 记录
tags:
  - UWP
  - C#
  - uniapp
abbrlink: 13ed501a
date: 2020-08-24 23:48:22
---

uniapp 上传文件至腾讯云对象存储 cos，折腾了两天，终于搞定了，赶紧记下来。。。激动！！

<!--more-->

## 开始入坑

由于以前 C#上传文件至 COS 的方式都是预签名，这种比较安全，但 COS 的预签名只支持 PUT 方式。

写 uniapp 时，也是这样做，然而，uniapp 的 `uni.uploadFile` 接口只有 POST 方式。

于是用`uni.request(OBJECT)`，`body`为`ArrayBuffer`，在 H5 和微信小程序测没问题。至此，本以为万事大吉。。。

等这方面功能写差不多了，用安卓上传文件（本人比较懒，安卓真机不经常测），发现上传的文件打不开，于是在对象存储控制台下载文件，发现文件内容只有文本“{}”。

然后开始了漫长的调试找 bug。。。终于，在 uniapp 官网看到令人无比绝望的话“App（自定义组件编译模式）不支持 ArrayBuffer 类型”。

## 越陷越深

为了适配 APP 端，只好放弃`uni.request(OBJECT)`，好像只能用`uni.uploadFile`+`POST`以表单方式上传，那就用吧。。。

但是并不好用啊，把 API 得到的预签名的参数放到 formData 中，仍然不行，按 uniapp 官网的用法，总是报错。

各种查文档，苦于 uniapp 和 COS 教程和解决方案都不多，只能看官方文档。

在 COS 文档看到`POST Object`的签名方式和预签名方式不同。。。另外也看到这部分：*3. 构造“策略”（Policy）*才知道，预签名的参数在这种方式中完全没用啊。

```JSON
{
    "expiration": "2019-08-30T09:38:12.414Z",
    "conditions": [
        { "acl": "default" },
        { "bucket": "examplebucket-1250000000" },
        [ "starts-with", "$key", "folder/subfolder/" ],
        [ "starts-with", "$Content-Type", "image/" ],
        [ "starts-with", "$success_action_redirect", "https://my.website/" ],
        [ "eq", "$x-cos-server-side-encryption", "AES256" ],
        { "q-sign-algorithm": "sha1" },
        { "q-ak": "AKIDQjz3ltompVjBni5LitkWHFlFpwkn9U5q" },
        { "q-sign-time": "1567150692;1567157892" }
    ]
}
```

## 找轮子

那就重新写计算签名的 API 吧。

一开始，想找现成的，查看.net 平台下 COS 的 sdk `qcloud-sdk-dotnet`，但并没有现成的计算`PostObject`的接口。

于是就开始翻源码，一顿操作下来，发现在`qcloud-sdk-dotnet`中并没有计算`Policy`，用法是头部传认证参数`Authorization`，摘部分源码：

```CSharp
// cacluate md5
if (CheckNeedMd5(request, cosRequest.IsNeedMD5) && request.Body != null)
{
    request.AddHeader(CosRequestHeaderKey.CONTENT_MD5, request.Body.GetMD5());
}
// content type header
if(request.Body != null && request.Body.ContentType != null &&
        !request.Headers.ContainsKey(CosRequestHeaderKey.CONTENT_TYPE)) {
    request.AddHeader(CosRequestHeaderKey.CONTENT_TYPE, request.Body.ContentType);
}

//cacluate sign, and add it.
if (requestUrlWithSign == null)
{
    CheckSign(cosRequest.GetSignSourceProvider(), request);
}
```

被坑怕了，这咋和文档不一样勒！没敢直接用。

再找 uniapp 插件市场，不得不说，uniapp 插件市场还是不错的。

在插件市场发现了个`腾讯云对象存储（COS）插件`，看了下这个源码，用法是使用`uniCloud`计算`PostObject`。

再继续看`uniCloud`使用的腾讯云函数`tencentcloud-uniapp-plugin-scf-template`，找到了计算`PostObject`的 JS 实现方式。摘部分源码：

```JS
// 生成签名信息
const currentDate = new Date();
const expirationDate = new Date(currentDate.getTime() + expires * 1000);
const keyTime = `${Math.floor(currentDate.getTime() / 1000)};${Math.floor(expirationDate.getTime() / 1000)}`;
const policy = JSON.stringify({
  expiration: expirationDate.toISOString(),
  conditions: [
    { 'q-sign-algorithm': 'sha1' },
    { 'q-ak': secretId },
    { 'q-sign-time': keyTime },
  ],
});
const signKey = crypto.createHmac('sha1', secretKey).update(keyTime).digest('hex');
const stringToSign = crypto.createHash('sha1').update(policy).digest('hex');
const signature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex');
return {
  host: `https://${bucket}.cos.${region}.myqcloud.com`,
  signAlgorithm: 'sha1',
  ak: secretId,
  keyTime,
  signature,
  policy: Buffer.from(policy).toString('base64'),
};
```

## 造轮子

虽然我也使用腾讯云函数，而且在某个 APP 内就是使用云函数，在启动之初获取一些参数，比如服务器维护，防止 WebAPI 临时不能使用，提示用户服务器维护信息。

但是，云函数对我只是备选功能，对于一般功能，都用 WebAPI。

照着`PostObject`的 JS 实现方式，写个 C#版的。直接展示最终结果吧：

```CSharp
public PostObject GetPostObject(string key)
{
    var currentDate = DateTimeOffset.UtcNow;
    var expirationDate = currentDate.AddSeconds(60);
    var keyTime = $"{currentDate.ToUnixTimeSeconds()};{expirationDate.ToUnixTimeSeconds()}";
    var policy = new Policy()
    {
        Expiration = expirationDate.ToString("yyyy-MM-ddTHH:mm:ssZ"),
        Conditions = new List<object>()
        {
            new { q___sign___algorithm = "sha1" },
            new { q___ak = _secretId },
            new { q___sign___time = keyTime },
            new { bucket = Bucket },
            new { key = Folder + "/" + key }
        }
    };
    var policyStr = JsonConvert.SerializeObject(policy, new JsonSerializerSettings
    {
        ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver(),
    });
    policyStr = policyStr.Replace("___", "-");
    var signKey = GetHamcSha1ToHexString(Encoding.UTF8.GetBytes(_secretKey), Encoding.UTF8.GetBytes(keyTime));
    var stringToSign = GetSha1ToHexString(Encoding.UTF8.GetBytes(policyStr));
    var signature = GetHamcSha1ToHexString(Encoding.UTF8.GetBytes(signKey), Encoding.UTF8.GetBytes(stringToSign));

    return new PostObject()
    {
        Key = Folder + "/" + key,
        Ak = _secretId,
        Host = $"https://{Bucket}.cos.{_region}.myqcloud.com",
        SignAlgorithm = "sha1",
        KeyTime = keyTime,
        Signature = signature,
        Policy = Convert.ToBase64String(Encoding.UTF8.GetBytes(policyStr))
    };
}
```

函数 `GetHamcSha1ToHexString`

```CSharp
private string GetHamcSha1ToHexString(byte[] key, byte[] content)
{
    HMACSHA1 hmacSha1 = new HMACSHA1(key);
    byte[] result = hmacSha1.ComputeHash(content);
    hmacSha1.Clear();
    return result.ToX2();
}
```

函数 `GetSha1ToHexString`

```CSharp
private string GetSha1ToHexString(byte[] content)
{
    SHA1 sha1 = new SHA1CryptoServiceProvider();
    byte[] result = sha1.ComputeHash(content);
    sha1.Clear();
    return result.ToX2();
}
```

扩展函数`ToX2`是`HTools`中`DataExtend`类的扩展函数

```CSharp
public static string ToX2(this byte[] data)
{
    StringBuilder sb = new StringBuilder();
    for (var i = 0; i < data.Length; i++)
    {
        sb.Append(data[i].ToString("x2"));
    }
    return sb.ToString();
}
```

Policy 类

```CSharp
public class Policy
{
    public string Expiration { get; set; }
    public List<object> Conditions { get; set; }
}
```

其中，\_secretId，Bucket 是 COS 配置参数，Folder 是 COS 文件夹路径。

至于为什么会出现`q___sign___algorithm`,`q___ak`这种三个下划线，是因为在 C#中没法以减号`-`命名，于是先用三个下划线，再替换为减号。

虽然看起来蛮简单，但是写的过程充满恐惧，一点小问题都会怀疑“此路不通”。也可能是因为 COS 的错误提示不太清楚吧。

写的过程有两个坑：

1. `Conditions`是数组，一开始我用的 `Dictionary<string,string>`，转的不对，COS 只提示 _Condition you provide in policy is not well-formated_ 。
2. 对象转 JSON 字符串，属性名必须转小写。COS 仍然只提示 _Condition you provide in policy is not well-formated_ ，找了很久这个问题才发现。

**又可以愉快的玩耍 uniapp 了**
