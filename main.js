const { app, BrowserWindow, Menu } = require("electron");

var mainWindow = null;
// JANELA PRINCIPAL
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  await mainWindow.loadFile("src/pages/editor/index.html");
}

// ARQUIVO
var file = {};

// CRIAR NOVO ARQUIVO
function createNewFile() {
  file = {
    name: "novo-arquivo.txt",
    content: "",
    saved: false,
    path: app.getPath("documents") + "/novo-arquivo.txt",
  };
  console.log(file);
}

// TEMPLATE MENU
const templateMenu = [
  {
    label: "Arquivo",
    submenu: [
      {
        label: "Novo",
        click() {
          createNewFile();
        },
      },
      {
        label: "Abrir",
      },
      {
        label: "Salvar",
      },
      {
        label: "Salvar como",
      },
      {
        label: "Fechar",
        role: process.platform === "darwin" ? "close" : "quit",
      },
    ],
  },
];

// MENU
const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);

// ON READY
app.whenReady().then(createWindow);

// ACTIVATE
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
