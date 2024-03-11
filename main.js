const { app, BrowserWindow, Menu } = require('electron');
const url = require('url');
const path = require('path');

function onReady() {
	win = new BrowserWindow({ width: 900, height: 6700, webPreferences: {nodeIntegration: true} })
	win.loadURL(url.format({
		pathname: path.join(
			__dirname,
			'dist/finan-sys/index.html'),
		protocol: 'file:',
		slashes: true
	}))
	  // Open the DevTools.
      win.webContents.openDevTools()
	  win.on('closed', function () {
        win = null
      })
}

// TEMPLATE MENU
const templateMenu = [{
	label: "Arquivo",
	submenu: [
		{ label: "Novo" },
		{ label: "Abrir" },
		{ label: "Salvar" },
		{ label: "Salvar Como" },
		{ label: "Fechar", role: process.platform === 'darwin' ? 'close' : 'quit' }
	]
},
{
	label: "Consultar Dados",
	submenu: [
		{label: 'Consultar Tipo Documento'}
	]
},
{
	label: "Relatórios",
	submenu: [
		{ label: 'Relatório Analítico' },
		{ label: 'Relatório de Receitas por Centro de Custo'}
	]
}
];

// MENU 
const menu = Menu.buildFromTemplate(templateMenu);

Menu.setApplicationMenu(menu);

app.on('ready', onReady);

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
  })

  app.on('activate', function () {
	if (win === null) createWindow()
  })