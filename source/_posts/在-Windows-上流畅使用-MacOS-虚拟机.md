---
title: 在 Windows 上流畅使用 MacOS 虚拟机
comments: true
abbrlink: 7afa8fc1
date: 2022-03-10 12:50:53
categories:
  - 记录
tags:
  - Linux
  - KVM
  - MacOS
  - WSL
---

本教程使用 WSL2 + KVM 运行 MacOS 虚拟机，MacOS 运行在 Linux 虚拟机中的 KVM 虚拟机，即嵌套虚拟化，但由于 Windows 对 WSL2 优化很好，个人感觉此方案比其他方案更好。

步骤较多，操作较繁琐，但成果很值得。

<!--more-->

![finished](./finished.png)

<center>

_在 Windows 宿主机中成果截图_

</center>

文中所出现的 WSL，如果没有特指，都是 WSL2。

## 前提条件

- Windows 10/11 22000+
- 开启 WSL2，详见 <https://docs.microsoft.com/zh-cn/windows/wsl/install>

## 与其他方案相比

### VMware/VitualBox

#### 优点

- 上手简单，安装快捷，“懒人版”更是无脑式安装
- VMware 搭配 `VMware Tools` 更是可以与宿主机互相复制文件，也能自适应窗口尺寸

#### 缺点

- 运行不如此方案流畅
- 启动速度慢，固态硬盘启动时间可能也要几分钟
- 与 Hyper-V 兼容有问题，在开启 Hyper-V 的情况下，由于宿主机也是运行在 Hyper-V 的虚拟机，而 VMware/VitualBox 不支持嵌套虚拟化，不能虚拟化 CPU 的 MacOS 虚拟机能卡出翔。

### Docker-OSX

Docker 中运行 MacOS 较成熟的项目是 <https://github.com/sickcodes/Docker-OSX>

#### 优点

上手简单，安装快捷，一行命令就可以启动一个运行 MacOS 的容器

#### 缺点

Docker 中的 MacOS 也是运行在 Linux 中的 KVM

- Docker 容器没有 WSL 启动便捷
- 没有 WSL 优化的好，因此流畅度不如此方案

## WSL2 开启 GUI

> 此部分参考 <https://docs.microsoft.com/zh-cn/windows/wsl/tutorials/gui-apps>

此部分用于在 Windows 中以窗口形式操作 MacOS 虚拟机

完成后你也可以运行其他 Linux GUI 应用程序，你可以像本地应用一样运行 WSL Linux 中的应用程序，也可以将应用添加到开始菜单、固定到任务栏等

安装后可以得到无缝的 Linux + Windows 桌面体验

### 安装 vGPU 驱动

安装 vGPU 驱动后可以使用虚拟 GPU，可以使用硬件加速 OpenGL 渲染

根据你电脑显卡下载安装：

- [Intel GPU 驱动程序](https://www.intel.com/content/www/us/en/download/19344/intel-graphics-windows-10-windows-11-dch-drivers.html)
- [AMD GPU 驱动程序](https://www.amd.com/en/support/kb/release-notes/rn-rad-win-wsl-support)
- [NVIDIA GPU 驱动程序](https://developer.nvidia.com/cuda/wsl)

### 更新 wsl

```
wsl --update
```

然后重启

```
wsl --shutdown
```

### GUI 测试

测试一下 GUI 能否正常使用

`Nautilus`是 gnome 的文件管理器，这里用来安装测试

```
sudo apt install nautilus -y
```

安装完成后可以直接打开，像 windows 应用一样

```
nautilus
```

![nautilus](./nautilus.png)

<center>

_在 Windows 宿主机中 Nautilus 运行截图_

</center>

以后在 windows 的 cmd 中执行 `wsl nautilus` 即可直接打开

## 允许 WSL 嵌套虚拟化

默认 WSL 没有支持嵌套虚拟化，需要修改一下配置。

在 Windows 中，用户文件夹下编辑或新建文件 `C:\Users\%User%\.wslconfig`。_（User 是你的 Windows 系统用户名）_

### 内容如下

```
[wsl2]
networkingMode=bridged
vmSwitch=ex
memory=32G
processors=8
swap=32G
localhostForwarding=true
nestedVirtualization=true
pageReporting=true
kernelCommandLine=intel_iommu=on iommu=pt kvm.ignore_msrs=1 kvm-intel.nested=1 kvm-intel.ept=1 kvm-intel.emulate_invalid_guest_state=0 kvm-intel.enable_shadow_vmcs=1 kvm-intel.enable_apicv=1
```

### 简单说明

此部分参考 <https://docs.microsoft.com/zh-cn/windows/wsl/wsl-config>

- nestedVirtualization 关键，是否允许嵌套虚拟化
- memory 允许的 WSL 内存
- processors 虚拟 CPU 线程
- swap 要向 WSL 2 VM 添加的交换空间量，0 表示无交换文件。 交换存储是内存需求超过硬件设备限制时使用的基于磁盘的 RAM。

### 重启 WSL

```
wsl --shutdown
```

## 开始安装 MacOS

使用 OSX-KVM 安装 MacOS 虚拟机

此部分参考 <https://github.com/kholia/OSX-KVM>

### 下载

#### 先安装需要用到的包

```
sudo apt-get install qemu uml-utilities virt-manager git wget libguestfs-tools p7zip-full make -y
```

#### 给 KVM 增加一个开关配置

```
echo 1 > /sys/module/kvm/parameters/ignore_msrs
```

#### 设置权限

```
sudo usermod -aG kvm $(whoami)
sudo usermod -aG libvirt $(whoami)
```

#### 拉取 OSX-KVM

```
git clone https://github.com/kholia/OSX-KVM.git

cd OSX-KVM
```

### 下载 MacOS 安装镜像

```
./fetch-macOS-v2.py
```

运行显示

```
1. High Sierra (10.13)
2. Mojave (10.14)
3. Catalina (10.15)
4. Big Sur (11.6) - RECOMMENDED
5. Monterey (latest)

Choose a product to download (1-5):
```

实测 4 和 5 都可以，而且完成后 Big Sur 也能正常升级到 Monterey，其他没试。

下载完成后会有 BaseSystem.dmg 文件，需要转为 img 格式

```
dmg2img BaseSystem.dmg BaseSystem.img
```

### 创建虚拟磁盘文件

```
qemu-img create -f qcow2 mac_hdd_ng.img 128G
```

其中 `mac_hdd_ng.img` 是文件名，可以任意修改

### 执行脚本

先修改 `OpenCore-Boot.sh` 文件

- `ALLOCATED_RAM` 运行内存，建议最低改为 8G
- `CPU_THREADS` CPU 线程
- `CPU_CORES` CUP 核心数
- `-drive id=MacHDD,if=none,file="$REPO_PATH/mac.img",format=qcow2` 其中的 `$REPO_PATH/mac_hdd_ng.img` 为上一步创建的虚拟磁盘文件

执行脚本

```
./OpenCore-Boot.sh
```

执行完成后应该会弹出 QEMU 窗口。

如果没有，请确认前面的步骤 WSL2 是否正确开启 GUI，vGPU 驱动是否已正常安装。

再次启动也是运行这个脚本

### 正在安装

安装流程和其他方式安装大致相同，只用注意一点，安装完成后，再次启动会多出个引导盘，选择多出来的那个。

#### 安装界面

![安装界面](./install.png)

#### 安装完成后启动

选择如图第二个启动项

![startup](./startup.png)

还需要安装一会，才能进入系统。

### 为什么选择 OXS-KVM 而不是 macOS-Simple-KVM

`macOS-Simple-KVM` 项目地址：<https://github.com/foxlet/macOS-Simple-KVM>

这个项目好像已经停滞不更新，截至目前已经一年多没更新了。

引导方式是四叶草，最高版本只支持 mojave，连 xcode 都不能用

故放弃

## 使用 virt-manager 管理

现在虽然你已经能成功使用 MacOS 了，但不方便管理，而且每次启动都需要运行脚本，如果有多个虚拟机就更难管理。

你可以放弃这一步，若放弃这一步：

1. 你以后每次启动虚拟机，只能用命令 `./OpenCore-Boot.sh`
1. 虚拟机运行期间，命令行窗口不能关闭
1. 虚拟机运行期间，QEMU 窗口不能关闭
1. 若修改虚拟机配置，需要修改脚本文件，不方便操作
1. 不能快捷启动，此部分完成后可以在 Windows 宿主机中运行 `wsl virt-manager` 直接打开管理界面

我们现在开始使用 `virt-manager` 管理这个虚拟机，提升使用体验。

### 启用 systemd

如果不是 WSL，Linux 应该都能使用 `systemctl` 命令，但 WSL 的启动方式决定其不支持 `systemctl` 命令，因此也无法开启 `libvirtd`，如果执行 `service libvirtd start` 会报找不到这个命令的错误，所以 `virt-manager` 就无法连接到 WSL 中的虚拟机。

但我们可以使用 `genie` 工具启用 `systemctl`。

启用 `systemctl` 的部分参考 <https://gist.github.com/djfdyuruiry/6720faa3f9fc59bfdf6284ee1f41f950>

此部分是在 WSL Linux 系统中操作

#### 安装 systemd-genie

后面脚本需要用这个插件

```
apt install systemd-genie
```

#### 下载脚本

```
cd /tmp
wget --content-disposition \
  "https://gist.githubusercontent.com/djfdyuruiry/6720faa3f9fc59bfdf6284ee1f41f950/raw/952347f805045ba0e6ef7868b18f4a9a8dd2e47a/install-sg.sh"
```

#### 修改脚本

这一步是可选操作，为了安装新版 genie

genie Release 列表可以在这里查看 <https://github.com/arkane-systems/genie/releases>

```
vim /tmp/install-sg.sh
```

目前最新版是，2.2，因此修改 `GENIE_VERSION` 值为 2.2，如

```
GENIE_VERSION="2.2"
```

#### 执行脚本

```
chmod +x /tmp/install-sg.sh
/tmp/install-sg.sh && rm /tmp/install-sg.sh
```

### 开启 libvirtd

在 WSL 中执行

```
genie -c systemctl start libvirtd
```

这个命令表示进入 genie 并执行 `systemctl start libvirtd` 命令，等同于：

```
genie -s
systemctl start libvirtd
exit
```

正常启动后就可以使用 virt-manager 了，但是我们还没有将刚才创建的虚拟机加入 virt-manager。

**注意：**这时你不能使用 vGPU，因为启动方式没有采用 WSL 默认的方式。你需要退出 WSL 并重新用 `wsl` 命令进入 WSL，才可以继续操作

### 将虚拟机加入 virt-manager

此部分参考 <https://github.com/kholia/OSX-KVM>

- 进入前面步骤使用 git 下载的 OSX-KVM 项目目录下，编辑虚拟机配置文件`macOS-libvirt-Catalina.xml`，把 `CHANGEME` 全部换为你的 wsl 用户名

```
vim ./macOS-libvirt-Catalina.xml
```

- 你也可以用以下脚本快速替换：

```
sed "s/CHANGEME/$USER/g" macOS-libvirt-Catalina.xml > macOS.xml

virt-xml-validate macOS.xml
```

- 执行下面命令将虚拟机加入 virt-manager

```
virsh --connect qemu:///system define macOS.xml
```

- 执行 `virt-manager` 以打开 `virt-manager`，你将能看到名称为 `macOS` 的虚拟机

![virt-manager](./virt-manager.png)

<center>

_在 Windows 宿主机中 virt-manager 截图_

</center>

现在你可以用 UI 的方式，编辑或启动名为 macOS 的虚拟机了

## 快捷启动

`virt-manager` 正确配置后，在 Windows 宿主机中，创建 `.bat` 脚本文件，内容为

```
wsl genie -c systemctl start libvirtd
wsl virt-manager
```

每次运行这个脚本就可以快速打开 `virt-manager` 了

## 遇到的问题

下面是可能会遇到的问题，有已解决的，也有未解决但有替代方案的

### virt-manager 检测不到 libvirtd

在 `使用 virt-manager 管理` 部分有说明

### MacOS 一段时间不操作假死

在 MacOS 中，关闭节能

设置位于 `系统偏好设置 -> 节能`

- `此时间段后关闭显示器` 设为 `永不`
- 取消勾选 `如果可能，使硬盘进入睡眠`

![关闭节能](./energy.png)

### Waiting for systemd....!

运行 `genie` 命令可能出现这个问题，是由于 `genie` 在等待 systemd 回应

你可以 `Control + C` 取消并继续操作，也可以永久性的解决这个问题，参考

<https://github.com/arkane-systems/genie/wiki/Systemd-units-known-to-be-problematic-under-WSL>

### 和 Windows 宿主机的文件/剪切板传输

可以用其他传输工具和剪切板共享工具

暂时没有直接复制粘贴的方法

### 虚拟机中无法收到 Win 键的响应

即徽标键，在 MacOS 中是 Command 键，影响如 `Command + C`, `Command + V` 等快捷键

可以临时改建，或用 VNC 连接 MacOS 使用

暂未没有更好的方法
