# 通义千问 Desktop

基于 Electron 开发的跨平台桌面客户端，支持Windows/macOS/Linux系统

## 功能特性

- 多平台支持（x64/arm64架构）
- 自动更新机制
- 网络连接状态检测
- 系统原生菜单支持

## 开发环境

```bash
# 安装依赖
npm install

# 开发模式运行
npm run start

## 构建命令
```bash
# 清理并构建所有平台
rm -rf dist && npm run build
# 单独构建平台
npm run build -- --mac # 构建macOS应用
npm run build -- --win # 构建Windows应用
npm run build -- --linux # 构建Linux应用
# 指定架构构建
npm run build -- --arm64 # ARM64架构
npm run build -- --x64 # x86_64架构
```

## 项目结构

```plaintext
├── main.js                 # 主进程
├── preload.js              # 预加载脚本
├── res/                    # 资源文件
│   ├── icon.icns           # macOS图标
│   ├── icon.ico            # Windows图标
│   └── icon.png            # Linux图标
└── electron-builder.yml    # 构建配置
```

## 注意事项

1. 图标文件需放置在res目录
2. 网络检测页面路径：network-check.html
3. 构建产物输出至dist目录
非官方客户端，与通义千问官方无关联

```plaintext
关键要素包含：
1. 多平台构建命令参数说明
2. 架构指定方式（arm64/x64）
3. 项目核心文件说明
4. 资源文件路径约定
5. 明确的开发/构建指令分离
```