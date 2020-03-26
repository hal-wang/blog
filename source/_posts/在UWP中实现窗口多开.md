---
title: 在UWP中实现窗口多开
comments: true
tags:
  - UWP
  - "C#"
abbrlink: 462699f1
date: 2019-09-18 12:20:07
categories:
reward: true
---

在 win10 16299 和以前，虽然也支持多窗口导航，但那些窗口都是在同一个`App`对象中生成，也就是每个窗口都对应一个`CoreApplicationView`。

但 17069 及以上现在才算真正支持了多窗口，因为在新版本中，增加了`AppInstance`这个类，也就是类似于 Win32 下的窗口句柄，可以实现每个窗口对应一个`App`对象，<!--more-->或者每个窗口对应一个窗口句柄。当然，以前的`CoreApplicationView`窗口功能也没有改变。

在这个新功能的前提下，真正的多窗口才可以实现。比如每次运行一个文件，都要打开一个新窗口；再次运行这个文件时，激活之前打开对应的窗口。但这又不能在 App.xaml.cs 中解决，因为每次生成窗口，都对应一个`App`对象，也就是说在 App.xaml.cs 中的`App`对象是在这个窗口中生成。这该怎么解决呢？
看看`App`类中的构造函数：

```
    /// &lt;summary&gt;
    /// 初始化单一实例应用程序对象。这是执行的创作代码的第一行，
    /// 已执行，逻辑上等同于 main() 或 WinMain()。
    /// &lt;/summary&gt;
    public App()
    {
        this.InitializeComponent();
    }
```

肯定会有不少人认为，这个就是 UWP 的入口，因为官方文档就这样介绍，而且注释说的也很清楚。其实不然，学 C#的都知道，程序入口就在`Main()`函数，UWP 也不例外，但 UWP 的`Main()`在哪呢？如果你尝试在解决方案下新建一个 Program 类，编译器就会提示你已经有过该类，于是用 F12 找到 Program 的定义处，是在 App.g.i.cs 文件中，并且该类中还有`Main()`函数，这就是 UWP 程序真正的入口点了，主函数如下：

```
    static void Main(string[] args)
    {
        Windows.UI.Xaml.Application.Start((p) = new App());
    }
```

可以看到，每次程序运行，主函数都新建一个`App`对象。因此我们如果想要实现打开新**文件就新建窗口、打开已经打开的文件就激活对应窗口**，需要在`Main`函数中做文章。但是这又出现新的问题：App.g.i.cs 是编译器自动创建和修改，我们怎么才能控制`Main`函数呢？那么我们就让编译器不要自动生成，由我们自己生成。这需要做以下操作：

1. 右键单击解决方案
2. 点击**属性**
3. 在**条件编译符号**中加上`DISABLE_XAML_GENERATED_MAIN;`。注意每项之间用”;"分隔。
4. 在解决方案下新建 Program 类
5. 在该类中写上主函数，如下：

```
static void Main(string[] args)
{
    //获得所有窗口句柄
    instances = AppInstance.GetInstances();
    //程序被激活

    IActivatedEventArgs activatedArgs = AppInstance.GetActivatedEventArgs();
    //如果程序由文件激活（即打开关联文件）
    if (activatedArgs is FileActivatedEventArgs fileArgs)
    {
        //如果运行多个文件，在这里仅打开第一个。也可以用循环打开多个
        IStorageItem file = fileArgs.Files.FirstOrDefault();
        if (file != null)
        {
            //查询或注册句柄，这里用文件路径作为Key，可以查询文件是否已经被打开
            var instance = AppInstance.FindOrRegisterInstanceForKey(file.Path);
            if (instance.IsCurrentInstance)
            {
                //如果文件没有被打开，则新建一个App对象。对应就打开一个新的窗口
                Windows.UI.Xaml.Application.Start((p) =&gt; new App());
            }
            else
            {
                // 如果文件已经被打开，则利用这个句柄来激活打开该文件的窗口
                instance.RedirectActivationTo();
            }
        }
    }
    else
    {
        //如果程序不是由文件激活，即直接运行程序。先注册一个句柄，在MainPage.cs中，要为打开的文件修改窗口句柄，以实现再次打开文件激活窗口
        AppInstance.FindOrRegisterInstanceForKey("REUSABLE" + App.Id.ToString());
        Windows.UI.Xaml.Application.Start((p) =&gt; new App());
    }
}
```

6. 如果是通过文件打开新程序，在 App.cs 中还要加上一个函数：

```
    protected override void OnFileActivated(FileActivatedEventArgs args)
    {
        Frame rootFrame = Window.Current.Content as Frame;
        if (rootFrame == null)
        {
            rootFrame = new Frame();
            Window.Current.Content = rootFrame;
        }

        StorageFile file = args.Files.FirstOrDefault() as StorageFile;
        if (rootFrame.Content == null)
        {
            rootFrame.Navigate(typeof(MainPage), file);
        }
        Window.Current.Activate();
    }
```

App.cs 中 OnFileActivated 函数和`OnLaunched`类似，也是在构建 App 对象之后运行该函数。不同之处在于当程序由文件激活时（也就是打开关联文件，并新建`App`对象时），程序运行`OnFileActivated`而不是`OnLaunched`。在这个函数中，可以对文件进行操作。
