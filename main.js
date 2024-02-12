const { app, BrowserWindow, Menu } = require('electron');
const url = require('url');
const path = require('path');

function onReady() {
	win = new BrowserWindow({ width: 900, height: 6700 })
	win.loadURL(url.format({
		pathname: path.join(
			__dirname,
			'dist/finan-sys/index.html'),
		protocol: 'file:',
		slashes: true
	}))
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
}
];

// MENU 
const menu = Menu.buildFromTemplate(templateMenu);

Menu.setApplicationMenu(menu);

app.on('ready', onReady);