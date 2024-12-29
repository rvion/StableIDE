const { mkdirSync } = require('fs')
const { cwd } = require('process')
const { clipboard } = require('electron')
const { execSync, spawn } = require('child_process')

void START()

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

async function START() {
    const mode = process.env['CUSHY_RUN_MODE']
    if (mode == null) throw new Error('CUSHY_RUN_MODE is not defined')
    const allowedModes = ['dev', 'dist']
    if (!allowedModes.includes(mode)) {
        console.error(`CUSHY_RUN_MODE is not allowed: ${mode}`)
        process.exit(1)
    }

    const EXPRESS_PORT = 8688
    const VITE_PORT = 8788
    const UI_PORT = mode === 'dist' ? EXPRESS_PORT : VITE_PORT
    // ===//=====//======//======//======//======//======//======//======//======//======//======//==
    // ==//=====//======//======//======//======//======//======//======//======//======//======//===
    // 1. START VITE DEV SERVER

    // DIST MODE ------------------------------------------
    const express = require('express')
    const expressApp = express()
    const bodyParser = require('body-parser')
    expressApp.use(bodyParser.json({ limit: '20mb' }))
    expressApp.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }))
    const path = require('path')

    if (mode === 'dist') {
        expressApp.get('/', (req, res) => {
            res.sendFile(path.join(cwd() + '/release/index.html'))
        })
        // Directory paths for the two public folders
        expressApp.use(express.static('release'))
        // expressApp.use(express.static('library'))
        // expressApp.use(express.static('public'))
        expressApp.use(express.static(cwd()))
        // Define a simple route for the home page
        // Start the server on port ${PORT}
    }
    // DEV MODE ------------------------------------------
    else {
        const { createServer } = require('vite')
        async function startDevServer() {
            // Create a Vite development server
            const server = await createServer({
                // Pass any options you need for the server here
                // For example, to specify the root directory:
                // root: './path-to-your-root-directory'
            })
            server.middlewares.use(express.static('release'))
            server.middlewares.use(express.static('library'))
            server.middlewares.use(express.static('public'))
            // Start the server
            await server.listen()

            server.printUrls()
        }
        console.log(`[✅] starting vite dev-server`)
        startDevServer().catch((error) => {
            console.error(error)
            process.exit(1)
        })

        // start CSS builder
        console.log(`[✅] starting tailwind dev-server`)
        void spawn('./node_modules/.bin/tailwindcss', ['--watch', '-o', 'src/theme/twin.css'], { stdio: 'inherit' })
        // void spawn('./node_modules/.bin/unocss', ['--watch', '-o', 'src/theme/twin.css'], { stdio: 'inherit' })
    }

    // ===//=====//======//======//======//======//======//======//======//======//======//======//==
    // ==//=====//======//======//======//======//======//======//======//======//======//======//===

    // ⏸️ try {
    // ⏸️     const patchElectronIconAndName = require('./patch.js').default
    // ⏸️     patchElectronIconAndName()
    // ⏸️ } catch (error) {
    // ⏸️     console.log('❌ error patching electron icon and name', error)
    // ⏸️ }

    const Electron = require('electron')
    const { app, BrowserWindow, globalShortcut, ipcMain, session, } = Electron

    ipcMain.handle('proxy',async (event, arg) => {
        console.log(`[🔎] proxy received with arg:`, arg)
        const {object, method, props} = arg
        const stuff = Electron[object][method]
        if (typeof stuff !== 'function') return stuff
        return await Electron[object][method](...props)
    })
    ipcMain.on('resize-for-video-capture', (event, arg) => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow) focusedWindow.setSize(1920, 1080)
    })

    ipcMain.on('search-stop', (event, arg) => {
        console.log(`[🔎] search-stop received with arg:`, arg)
        const focusedWindow = BrowserWindow.getFocusedWindow()
        const webContents = focusedWindow.webContents
        webContents.stopFindInPage('clearSelection')
    })
    ipcMain.on('search-start', (event, arg, options) => {
        console.log(`[🔎] search-start received with query:`, arg, options)
        if (arg.length < 2) return
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow == null) return console.log(`[🔎] ❌ no focusedWindow`)
        const webContents = focusedWindow.webContents
        webContents.findInPage(arg, options)
    })
    ipcMain.on('resize-for-laptop', (event, arg) => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow) focusedWindow.setSize(1280, 720)
    })
    ipcMain.on('toggle-devtools', (event, arg) => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow) focusedWindow.webContents.toggleDevTools()
    })
    ipcMain.on('open-devtools', (event, arg) => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow) focusedWindow.webContents.openDevTools()
    })
    ipcMain.on('close-devtools', (event, arg) => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow) focusedWindow.webContents.closeDevTools()
    })
    ipcMain.on('copy-image-to-clipboard', (event, arg) => {
        try {
            // Always use 'image/png' for now as it seems like nothing supports anything but image/png
            clipboard.writeBuffer('image/png', arg.buffer)
            event.sender.send('image-copied', { result: true, data: arg.buffer })
        } catch (err) {
            console.error(err)
            event.sender.send('image-copied', { result: false, data: err })
        }
    })

    // required to interract with ComfyUI
    // | https://github.com/electron/electron/issues/18940
    // | https://gist.github.com/nornagon/ff2f8ab8d1ef1ddcc394de1e892015ad
    app.commandLine.appendSwitch('disable-site-isolation-trials')

    // update dock icon and text
    const nativeImage = require('electron').nativeImage
    const image = nativeImage.createFromPath('src/public/CushyLogo.png')
    // const image = nativeImage.createFromPath('src/public/CushyLogo-512.icns')

    // ❌ cause a bug for warloardruby (sent on matrix):
    // ❌ cannot read property 'setIon' of undefined
    // app.dock.setIcon(image)

    // ❌ makes an ugly label in the osx dock
    // app.dock.setBadge('🛋️ CushySudio')

    async function createWindow() {
        const mainWindow = new BrowserWindow({
            // https://stackoverflow.com/questions/39091964/remove-menubar-from-electron-app
            autoHideMenuBar: true,

            icon: image,
            title: '🛋️ CushySudio',
            //
            // width: 800,
            // height: 600,
            webPreferences: {
                plugins: true,
                nodeIntegration: true,
                nodeIntegrationInWorker: true,
                nodeIntegrationInSubFrames: false,
                contextIsolation: false,
                backgroundThrottling: false,
                webviewTag: true,
                webSecurity: false, // Disable CORS
                allowRunningInsecureContent: true, // Disable CORS
                // 💬 2024-10-27 rvion:
                // | this doesn't work since we have  {..., contextIsolation: false }
                // ❌ preload: path.join(__dirname, 'preload.js'),
            },
        })

        // 2024-08-16 rvion: 🏑
        // | attempt to fix `cmd+w` closing the whole app when triggerd from an iframe
        // | every possible fix (diabling global events, injecting js code, etc etc) fails.
        // | I tried 5+ solutions and none of them worked, despite the fact all of them should
        // | have worked. My guess is that there is some hard-coded stuff somewhere in electron
        // | below is some weird-ass solution that seems to work
        // Use 'before-input-event' to intercept the Cmd+W combination
        mainWindow.webContents.on('before-input-event', (event, input) => {
            if (input.key === 'w' && input.meta) {
                console.log(`[🏑] custom 'cmd+w'`)
                event.preventDefault() // Prevent the default close behavior
                mainWindow.webContents.send('custom-cmd-w')
            }
            if (input.key === 'w' && input.control) {
                console.log(`[🏑] custom 'ctrl+w'`)
                event.preventDefault() // Prevent the default close behavior
                mainWindow.webContents.send('custom-ctrl-w')
            }
        })

        // remove the menu bar on windows & linux
        try {
            console.log(`[🤠] process.platform =`, process.platform)
            if (process.platform !== 'darwin') mainWindow.removeMenu()
        } catch (error) {
            console.error('❌ error removing menu bar', error)
        }

        // START EXPRESS + MOUNT PUBLIC EXTERNAL API ================================================
        const promiseStore = new Map()
        ;(() => {
            expressApp.get('/execute', async (req, res) => {
                const payload = {
                    params: req.params,
                    query: req.query,
                    body: req.body,
                    url: req.url,
                    headers: req.headers,
                }
                console.log(`[API] /execute(${payload})`)
                // res.sendFile(path.join(cwd() + '/release/call-draft.html'))
                const uid = `req-${Date.now()}+${Math.random()}`
                mainWindow.webContents.send('execute', { uid, payload })
                let yes, no
                const promise = new Promise((resolve, reject) => {
                    yes = resolve
                    no = reject
                })
                promiseStore.set(uid, { yes, no })
                const result = await promise
                res.json(result)
            })
            expressApp.listen(EXPRESS_PORT, () => console.log(`API server running on http://localhost:${EXPRESS_PORT}`))
        })()

        ipcMain.on('executed', (event, arg) => {
            const promise = promiseStore.get(arg.uid)
            if (promise == null) return
            promise.yes(arg)
            promiseStore.delete(arg.uid)
            // const focusedWindow = BrowserWindow.getFocusedWindow()
            // if (focusedWindow) focusedWindow.setSize(1920, 1080)
        })
        // ==========================================================================================

        // ❓ mainWindow.webContents.on('found-in-page', function (event, result) {
        // ❓     if (result.finalUpdate) {
        // ❓         mainWindow.webContents.send('search-result', result)
        // ❓         // console.log(`[🤠] final update. result =`, result)
        // ❓     }
        // ❓ })
        // ------------------------------------------------------------
        // https://github.com/electron/electron/pull/573
        //remove X-Frame-Options headers on all incoming requests.
        mainWindow.webContents.session.webRequest.onHeadersReceived({ urls: ['*://*/*'] }, (details, callback) => {
            if (details && details.responseHeaders) {
                if (details.responseHeaders['X-Frame-Options']) {
                    delete details.responseHeaders['X-Frame-Options']
                } else if (details.responseHeaders['x-frame-options']) {
                    delete details.responseHeaders['x-frame-options']
                }
            }
            callback({ cancel: false, responseHeaders: details.responseHeaders })
        })

        // ------------------------------------------------------------
        mainWindow.maximize()
        mkdirSync('outputs/_downloads', { recursive: true })
        // https://www.electronjs.org/docs/latest/api/download-item
        // https://www.electronjs.org/docs/latest/api/download-item#class-downloaditem

        const pathe = require('pathe')
        mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
            const originalFileName = item.getFilename()
            const finalFileName = `${Date.now()}-${originalFileName}`
            const relativePath = `outputs/_downloads/${finalFileName}`

            // Set the save path, making Electron not to prompt a save dialog.
            item.setSavePath(relativePath)

            item.on('updated', (event, state) => {
                if (state === 'interrupted') {
                    console.log('Download is interrupted but can be resumed')
                } else if (state === 'progressing') {
                    if (item.isPaused()) {
                        console.log('Download is paused')
                    } else {
                        console.log(`Received bytes: ${item.getReceivedBytes()}`)
                    }
                }
            })
            item.once('done', (event, state) => {
                if (state === 'completed') {
                    console.log('Download successfully')
                    mainWindow.webContents.send('filedownloaded', {
                        fileName: finalFileName,
                        originalFilename: originalFileName,
                        relativePath: relativePath,
                        absolutePath: pathe.resolve(relativePath),
                    })
                } else {
                    console.log(`Download failed: ${state}`)
                }
            })
        })

        // Open DevTools automatically
        // if (mode === 'dev') {
        //     mainWindow.webContents.openDevTools()
        // }

        // check if cushy is running
        let serverStarted = false
        const sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration))
        let retryCount = 0
        do {
            console.log('waiting for cushy to start')
            retryCount++
            try {
                res = await fetch(`http://localhost:${UI_PORT}`) //
                    .catch((err) => fetch(`http://127.0.0.1:${UI_PORT}`))

                if (res.status !== 200) {
                    console.log(`[VITE] UI not yet ready (status:: ${res.status})`)
                    await sleep(1000)
                } else {
                    console.log(`[VITE] vite started`)
                    serverStarted = true
                }
            } catch (error) {
                if (retryCount > 100) console.log('❌ error:', error)
                await sleep(100)
            }
        } while (!serverStarted)

        // load cushy
        void mainWindow.loadURL(`http://localhost:${UI_PORT}`, { extraHeaders: 'pragma: no-cache\n' }) // Load your localhost URL

        // Open DevTools (optional)
        // mainWindow.webContents.openDevTools();
    }

    void app.whenReady().then(() => {
        void session.defaultSession.clearStorageData(null, (error) => {
            if (error) console.log(error)
            // in our case we need to restart the application
            // app.relaunch();
            // app.exit();
        })

        // https://stackoverflow.com/questions/54969526/react-dev-tools-unable-to-use-profiler-in-electron-application
        // https://stackoverflow.com/questions/37927929/electron-how-to-add-react-dev-tool
        const installExtensions = async () => {
            const installer = require('electron-devtools-installer')
            const forceDownload = !!process.env.UPGRADE_EXTENSIONS
            const extensions = ['REACT_DEVELOPER_TOOLS']
            return Promise.all(
                //
                extensions.map((name) =>
                    installer
                        .default(installer[name], forceDownload)
                        .catch(console.log)
                        .then((name) => console.log(`Added Extension:  ${name}`)),
                ),
            ) //
        }

        void createWindow()
        app.on('activate', function () {
            if (BrowserWindow.getAllWindows().length === 0) void createWindow()
        })

        if (mode === 'dev' && !!process.env.USE_REACT_DEVTOOLS) {
            void app.whenReady().then(installExtensions)
        }
    })

    app.on('window-all-closed', function () {
        console.log('window-all-closed')
        app.quit()
        // if (process.platform !== 'darwin')
    })

    app.on('ready', () => {
        // globalShortcut.unregisterAll()
        app.on('browser-window-focus', () => {
            globalShortcut.unregisterAll()
            // globalShortcut.registerAll(['CommandOrControl+W'], () => {
            //     return
            // })
        })
        app.on('browser-window-blur', () => {
            globalShortcut.unregisterAll()
        })
        // globalShortcut.register('CommandOrControl+W', () => {
        //     //stuff here
        //     console.log('CommandOrControl+W')
        // })
    })
}
