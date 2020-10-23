const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  ipcMain,
  shell,
} = require("electron");
const fs = require("fs");
const path = require("path");

var mainWindow = null;
// JANELA PRINCIPAL
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  await mainWindow.loadFile("src/pages/editor/index.html");

  // mainWindow.webContents.openDevTools();

  createNewFile();

  ipcMain.on("update-content", (event, data) => {
    file.content = data;
  });
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

  mainWindow.webContents.send("set-file", file);
}

// SALVA ARQUIVO NO DISCO
function writeFile(filePath) {
  try {
    fs.writeFile(filePath, file.content, (error) => {
      // ERRO
      if (error) throw error;

      // ARQUIVO SALVO
      file.path = filePath;
      file.saved = true;
      file.name = path.basename(filePath);

      mainWindow.webContents.send("set-file", file);
    });
  } catch (error) {
    console.log(error);
  }
}

// SALVAR COMO
async function saveFileAs() {
  // DIALOG
  let dialogFile = await dialog.showSaveDialog({
    defaultPath: file.path,
  });

  // VERIFICAR CANCELAMENTO
  if (dialogFile.canceled) {
    return false;
  }

  // SALVAR ARQUIVO
  writeFile(dialogFile.filePath);
}

// SALVAR ARQUIVO
function saveFile() {
  // SALVAR
  if (file.saved) {
    return writeFile(file.path);
  }

  // SALVAR COMO
  return saveFileAs();
}

// LER ARQUIVO
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    console.log(error);
    return "";
  }
}

// ABRIR ARQUIVO
async function openFile() {
  // DIALOGO
  let dialogFile = await dialog.showOpenDialog({
    defaultPath: file.path,
  });

  // VERIFICAR CANCELAMENTO
  if (dialogFile.canceled) {
    return false;
  }

  // ABRIR O ARQUIVO
  file = {
    name: path.basename(dialogFile.filePaths[0]),
    content: readFile(dialogFile.filePaths[0]),
    saved: true,
    path: dialogFile.filePaths[0],
  };

  mainWindow.webContents.send("set-file", file);
}

// TEMPLATE MENU
const templateMenu = [
  {
    label: "Arquivo",
    submenu: [
      {
        label: "Novo",
        accelerator: "CmdOrCtrl+N",
        click() {
          createNewFile();
        },
      },
      {
        accelerator: "CmdOrCtrl+O",
        label: "Abrir",
        click() {
          openFile();
        },
      },
      {
        accelerator: "CmdOrCtrl+S",
        label: "Salvar",
        click() {
          saveFile();
        },
      },
      {
        accelerator: "CmdOrCtrl+Shift+S",
        label: "Salvar como",
        click() {
          saveFileAs();
        },
      },
      {
        label: "Fechar",
        role: process.platform === "darwin" ? "close" : "quit",
      },
    ],
  },
  {
    label: "Editar",
    submenu: [
      {
        label: "Desfazer",
        role: "undo",
      },
      {
        label: "Refazer",
        role: "redo",
      },
      {
        type: "separator",
      },
      {
        label: "Copiar",
        role: "copy",
      },
      {
        label: "Recortar",
        role: "cut",
      },
      {
        label: "Colar",
        role: "Paste",
      },
    ],
  },
  {
    label: "Ajuda",
    submenu: [
      {
        label: "Repository",
        click() {
          shell.openExternal("https://github.com/hpaes");
        },
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
