const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const remote = require('@electron/remote/main')

let mainWindow

const { clipboard } = require('electron')

// 在ipcMain监听部分添加
ipcMain.on('clipboard:copy', (event, text) => clipboard.writeText(text))
ipcMain.handle('clipboard:paste', () => clipboard.readText())

// 在createWindow函数中添加上下文菜单
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      session: { persist: true }
    },
  })

  // 添加日志重定向逻辑
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log(`[RENDERER] ${message}`);
  });

  remote.initialize();
  remote.enable(mainWindow.webContents);

  const session = mainWindow.webContents.session
  // 添加 CSP 头修改逻辑
  session.webRequest.onHeadersReceived((details, callback) => {
    const headers = details.responseHeaders || {};
    // 获取或初始化 CSP 头
    let csp = headers['Content-Security-Policy'] || headers['content-security-policy'] || [''];
    // 允许加载 https://g.alicdn.com 的脚本
    if (!csp[0].includes('https://g.alicdn.com')) {
      csp[0] += ' https://g.alicdn.com';
    }
    headers['Content-Security-Policy'] = csp;
    callback({ responseHeaders: headers });
  });
  let networkState = 'unknown'

  // 统一网络检测逻辑
  const checkNetwork = async () => {
    try {
      await fetch('https://www.tongyi.com/', { timeout: 5000 })
      const targetURL = 'https://www.tongyi.com/qianwen/'

      if (networkState !== 'connected') {
        await mainWindow.loadURL(targetURL)
        networkState = 'connected'
      }
    } catch (error) {
      console.error('Network check failed:', error);  // 添加error处理逻辑
      if (networkState !== 'disconnected') {
        await mainWindow.loadFile('network-check.html');
        networkState = 'disconnected';
      }
    }
  }

  // 初始化加载
  checkNetwork()

  // 定时检测
  const networkCheckInterval = setInterval(checkNetwork, 5000)
  mainWindow.on('closed', () => clearInterval(networkCheckInterval))

  // 窗口事件处理
  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    mainWindow.loadURL(url)
    return { action: 'deny' }
  })

  // 菜单配置
  const menuTemplate = [{
    label: app.name,
    submenu: [
      {
        label: '关于 通义千问',
        click: () => {
          let iconPath;
          switch(process.platform) {
            case 'win32':
              // 使用Electron内置路径方法
              iconPath = path.join(app.getAppPath(), 'build/icon.ico');
              break;
            case 'darwin':
              iconPath = path.join(process.resourcesPath, 'build/icon.icns');
              break;
            case 'linux':
              iconPath = path.join(process.resourcesPath, 'build/icon.png');
              break;
          }

          if (!iconPath) {
            console.error('无法找到图标路径');
            return;
          }
          app.setAboutPanelOptions({
            applicationName: app.name,
            applicationVersion: app.getVersion(),
            authors: 'A Z <cdebook@outlook.com>',
            copyright: 'Copyright © 2025 ML Tech',
            credits: '此千问(Qwen) Desktop 桌面客户端基于 Electron 开发，非官方客户端(目前官方没有提供桌面客户端)',
            website: 'https://github.com/sht720/Qwen-Desktop',
            iconPath: iconPath
          });
          app.showAboutPanel();
        }
      },
      { type: 'separator' },
      {
        label: '退出 通义千问',
        click: () => app.quit()
      }
    ]
  }];

  if (process.platform === 'darwin') {
    menuTemplate[0].submenu.push(
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' }
    )
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))

  // 添加上下文菜单
  mainWindow.webContents.on('context-menu', (e, params) => {
    const menu = Menu.buildFromTemplate([
      {
        label: '复制',
        visible: params.selectionText.trim().length > 0,
        click: () => mainWindow.webContents.copy()
      },
      {
        label: '粘贴',
        visible: params.isEditable,
        click: () => mainWindow.webContents.paste()
      }
    ])
    menu.popup()
  })

  // 处理键盘快捷键
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.key === 'a' && input.meta) || (input.key === 'A' && input.meta)) {
      mainWindow.webContents.selectAll()
      event.preventDefault()
    }
    if ((input.key === 'c' && input.meta) || (input.key === 'C' && input.meta)) {
      mainWindow.webContents.copy()
      event.preventDefault()
    }
    if ((input.key === 'v' && input.meta) || (input.key === 'V' && input.meta)) {
      mainWindow.webContents.paste()
      event.preventDefault()
    }
  })
}

// IPC监听
ipcMain.on('close-about-window', () => {
  BrowserWindow.getFocusedWindow()?.close()
})

app.whenReady().then(createWindow)