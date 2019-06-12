# GitHub Gist Explorer

*使用Visual Studio Code管理你的GitHub Gists*
![Screenshot](https://raw.githubusercontent.com/k9982874/github-gist-explorer/master/images/guide-1.png)

*如果新欢这个扩展，请不吝赐星！*

## 20190612 新功能：订阅用户的Gist
## 20190610 新功能：导入/导出gist

## 功能描述
```
1. 列出你拥有的gist。
2. 收藏/取消收藏gist。
3. 创建公开/隐私gist。
4. 编辑/删除gist。
5. 创建、编辑、删除、重命名gist中的文件。
6. 支持从活动的编辑器直接创建gist。
7. 支持从选定文本创建gist。
8. 支持从剪切板创建gist。
9. 支持在Visual Studio Code中查看Gist历史。
10. 支持查看历史文件内容。
11. 支持历史文件与当前版本对比。
12. 支持导出gist到文件夹。
13. 支持导入本地文件到指定gist。
14. 支持导入目录
```

## 使用说明
GitHub Gist Explorer需要GitHub用户名和GitHub令牌来访问你的GitHub Gist。
请继续阅读下面的内容来了解如何设置Github Gist Explorer。

## 获取GitHub用户名
实际上就是GitHub的登录用户名，你可以在登录GitHub后的到它。如下图所示，在 *https://github.com/* 后面的就是你的用户名。
![Get User Name](https://raw.githubusercontent.com/k9982874/github-gist-explorer/master/images/guide-2.png)

## 一步一步获取GitHub令牌
这个扩展需要你的GitHub令牌。你可以参考下面的例子自行创建令牌。在创建令牌时请务必确认开放了**Gist**权限。

**[Generate New Token](https://github.com/settings/tokens/new?description=code-setting-sync&scopes=gist)**

![Select Scopes](https://raw.githubusercontent.com/k9982874/github-gist-explorer/master/images/guide-3.png)

**获取令牌**

![Get Access Token](https://raw.githubusercontent.com/k9982874/github-gist-explorer/master/images/guide-4.png)

> 请把创建好的令牌保存好，你无法在关闭页面后查看令牌。

## 设置Github Gist Explorer
现在，请在扩展配置页输入你得到的GitHub用户名和令牌输入。
![Setup Extension](https://raw.githubusercontent.com/k9982874/github-gist-explorer/master/images/guide-5.png)

## 如何添加gist
![Add Gist](https://raw.githubusercontent.com/k9982874/github-gist-explorer/master/images/add-gist.gif)

## 保存和剪藏！
![Clip & Save](https://raw.githubusercontent.com/k9982874/github-gist-explorer/master/images/clip-and-save.gif)

## 从剪切板创建
目前有两种方法可以从剪切板创建gist。
1. 在命令面板中运行命令。
2. 使用右键菜单。
![Paste](https://raw.githubusercontent.com/k9982874/github-gist-explorer/master/images/paste.gif)

## 查看历史
![History](https://raw.githubusercontent.com/k9982874/github-gist-explorer/master/images/history.gif)
