# miniapp-performance-watcher
## 背景
面向开发者的多端小程序运行时性能监控插件，实时监控所有页面/组件中setData的频率和耗时。

## 安装
请自行查看各端小程序安装npm包的方法
例如微信小程序：https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html

## 使用
```javaScript
// 小程序入口文件app.js
const Watcher = require('miniapp-performance-watcher')
new Watcher().run()
```

## 效果
![image](https://i.ibb.co/Fz17jSD/Wechat-IMG12.jpg)