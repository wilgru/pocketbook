import path from "node:path";
import { app, BrowserWindow, shell } from "electron";
import log from "electron-log";
import "src/notes/ipc/createNote";
import "src/notes/ipc/getNote";
import "src/notes/ipc/getNotes";
import "src/notes/ipc/updateNote";
import "src/notes/ipc/deleteNote";
import "src/pocketbooks/ipc/createPocketbook";
import "src/pocketbooks/ipc/getPocketbook";
import "src/pocketbooks/ipc/getPocketbooks";
import "src/pocketbooks/ipc/updatePocketbook";
import "src/pocketbooks/ipc/deletePocketbook";
import "src/tasks/ipc/createTask";
import "src/tasks/ipc/getTask";
import "src/tasks/ipc/getTasks";
import "src/tasks/ipc/updateTask";
import "src/tasks/ipc/deleteTask";
import "src/tags/ipc/createTag";
import "src/tags/ipc/getTag";
import "src/tags/ipc/getTags";
import "src/tags/ipc/updateTag";
import "src/tags/ipc/deleteTag";
import "src/tags/ipc/createTagGroup";
import "src/tags/ipc/updateTagGroup";
import "src/tags/ipc/deleteTagGroup";
import "src/updates/ipc/createUpdate";
import "src/updates/ipc/getUpdate";
import "src/updates/ipc/getUpdates";
import "src/updates/ipc/updateUpdate";
import "src/updates/ipc/deleteUpdate";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (started) {
//   app.quit();
// }

app.setName("Pocketbook");
log.initialize();

let mainWindow: BrowserWindow | null = null;

const isHttpUrl = (value: string) => {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

const createWindow = () => {
  const isDev = !app.isPackaged;
  const isMac = process.platform === "darwin";
  const isWindows = process.platform === "win32";

  mainWindow = new BrowserWindow({
    width: isDev ? 2000 : 1000,
    height: 800,
    title: "Pocketbook",
    titleBarStyle: "hidden",
    ...(isMac
      ? {
          trafficLightPosition: { x: 18, y: 18 },
        }
      : {}),
    ...(isWindows
      ? {
          frame: false,
          titleBarOverlay: {
            color: "#ffffff00",
            symbolColor: "#64748b",
            height: 50,
          },
        }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isHttpUrl(url)) {
      void shell.openExternal(url);
    }

    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!isHttpUrl(url)) {
      return;
    }

    const currentUrl = mainWindow?.webContents.getURL();

    if (currentUrl && isHttpUrl(currentUrl)) {
      const nextOrigin = new URL(url).origin;
      const currentOrigin = new URL(currentUrl).origin;

      if (nextOrigin === currentOrigin) {
        return;
      }
    }

    event.preventDefault();
    void shell.openExternal(url);
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
