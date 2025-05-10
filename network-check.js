let lastNetworkState = null

// 添加页面可见性检测
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    checkNetwork();
  }
});

// 修改检查逻辑
function checkNetwork() {
  const testUrls = [
    'https://www.baidu.com',
    'https://www.qq.com',
    'https://www.google.com',
    'https://www.tongyi.com/'
  ]

  Promise.any(testUrls.map(url =>
    fetch(url, { mode: 'no-cors', timeout: 3000 })
  )).then(() => {
    if (lastNetworkState !== 'connected') {
      window.location.reload();
      lastNetworkState = 'connected';
    }
  }).catch((error) => {
    if (lastNetworkState !== 'disconnected') {
      document.getElementById('status').textContent =
        '网络连接异常，请检查网络设置...';
      lastNetworkState = 'disconnected';
    }
  })

  // 添加IPC监听
  ipcRenderer.on('reload-main-window', () => {
      window.location.reload();
  });
}

setInterval(() => {
    checkNetwork();
    if (lastNetworkState === 'disconnected') {
        document.getElementById('status').innerHTML =
            '网络连接异常，请检查网络设置，网络恢复后页面将重新加载';
        window.location.reload();
    }
}, 2000); // 缩短检测间隔
checkNetwork()