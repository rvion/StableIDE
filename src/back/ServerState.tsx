import type { EmbeddingName } from '../core/Schema'
import type { ComfySchemaJSON } from '../types/ComfySchemaJSON'
import type { FlowExecutionStep } from '../types/FlowExecutionStep'

import fetch from 'node-fetch'
import { join } from 'path'
import * as WS from 'ws'
import { Maybe } from '../utils/types'
import { FlowRun } from './FlowRun'

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { makeAutoObservable } from 'mobx'
import { PromptExecution } from '../controls/ScriptStep_prompt'
import { PayloadID, getPayloadID } from '../core/PayloadID'
import { Schema } from '../core/Schema'
import { VSCodeEmojiDecorator } from '../extension/decorator'
import { ComfyImporter } from '../importers/ImportComfyImage'
import { logger } from '../logger/logger'
import { ComfyPromptJSON } from '../types/ComfyPrompt'
import { ComfyStatus, WsMsg } from '../types/ComfyWsPayloads'
import { MessageFromExtensionToWebview, MessageFromExtensionToWebview_ } from '../types/MessageFromExtensionToWebview'
import { sdkTemplate } from '../typings/sdkTemplate'
import { extractErrorMessage } from '../utils/extractErrorMessage'
import { AbsolutePath, RelativePath } from '../utils/fs/BrandedPaths'
import { asRelativePath } from '../utils/fs/pathUtils'
import { readableStringify } from '../utils/stringifyReadable'
import { CushyClient } from './Client'
import { CushyFile } from './CushyFile'
import { FlowDefinition, FlowDefinitionID } from './FlowDefinition'
import { GeneratedImage } from './GeneratedImage'
import { RANDOM_IMAGE_URL } from './RANDOM_IMAGE_URL'
import { ResilientWebSocketClient } from './ResilientWebsocket'
import { CushyServer } from './server'

export type CSCriticalError = { title: string; help: string }

export class ServerState {
    schema: Schema

    /** send by ComfyUI server */
    comfySessionId = 'temp'

    activeRun: Maybe<FlowRun> = null

    get cacheFolderPath(): AbsolutePath {
        return this.resolve(asRelativePath('.cushy/cache'))
    }

    runs: FlowRun[] = []
    comfyJSONUri: AbsolutePath
    embeddingsUri: AbsolutePath
    comfyTSUri: AbsolutePath
    cushyTSUri: AbsolutePath
    tsConfigUri: AbsolutePath

    /** write a binary file to given absPath */
    writeBinaryFile(absPath: AbsolutePath, content: Buffer) {
        writeFileSync(absPath, content)
    }

    /** read text file, optionally provide a default */
    readJSON = <T extends any>(absPath: AbsolutePath, def?: T): T => {
        console.log(absPath)
        const exists = existsSync(absPath)
        if (!exists) {
            if (def != null) return def
            throw new Error(`file does not exist ${absPath}`)
        }
        const str = readFileSync(absPath, 'utf8')
        const json = JSON.parse(str)
        return json
    }

    /** read text file, optionally provide a default */
    readTextFile = (absPath: AbsolutePath, def: string): string => {
        const exists = existsSync(absPath)
        if (!exists) return def
        const x = readFileSync(absPath)
        const str = x.toString()
        return str
    }

    writeTextFile(absPath: AbsolutePath, content: string, open = false) {
        writeFileSync(absPath, content, 'utf-8')
    }

    knownFlows = new Map<FlowDefinitionID, FlowDefinition>()
    knownFiles = new Map<AbsolutePath, CushyFile>()

    /** wrapper around vscode.tests.createTestController so logic is self-contained  */

    clients = new Map<string, CushyClient>()
    registerClient = (id: string, client: CushyClient) => this.clients.set(id, client)
    unregisterClient = (id: string) => this.clients.delete(id)

    lastMessagesPerType = new Map<MessageFromExtensionToWebview['type'], MessageFromExtensionToWebview>()

    broadCastToAllClients = (message_: MessageFromExtensionToWebview_): PayloadID => {
        const uid = getPayloadID()
        const message: MessageFromExtensionToWebview = { ...message_, uid }
        const clients = Array.from(this.clients.values())
        this.lastMessagesPerType.set(message.type, message)
        console.log(`sending message ${message.type} to ${clients.length} clients`)
        for (const client of clients) client.sendMessage(message)
        return uid
    }

    server!: CushyServer

    decorator: VSCodeEmojiDecorator
    constructor(public wspUri: AbsolutePath) {
        this.comfyJSONUri = this.resolve(asRelativePath('.cushy/nodes.json'))
        this.embeddingsUri = this.resolve(asRelativePath('.cushy/embeddings.json'))
        this.comfyTSUri = this.resolve(asRelativePath('.cushy/nodes.d.ts'))
        this.cushyTSUri = this.resolve(asRelativePath('.cushy/cushy.d.ts'))
        this.tsConfigUri = this.resolve(asRelativePath('tsconfig.json'))
        this.server = new CushyServer(this)
        this.schema = this.restoreSchemaFromCache()
        this.decorator = new VSCodeEmojiDecorator(this)
        this.writeTextFile(this.cushyTSUri, sdkTemplate)

        this.autoDiscoverEveryWorkflow()
        this.ws = this.initWebsocket()
        this.watchForCOnfigurationChanges()
        this.createTSConfigIfMissing()
        makeAutoObservable(this)
    }

    createTSConfigIfMissing = () => {
        // create an empty tsconfig.json if it doesn't exist
        const tsConfigExists = existsSync(this.tsConfigUri.path)
        if (!tsConfigExists) {
            logger().info(`no tsconfig.json found, creating a default one`)
            const content = {
                compilerOptions: {
                    target: 'ESNext',
                    lib: ['ESNext'],
                },
                include: ['.cushy/*.d.ts', '**/*.ts'],
            }
            const contentStr = JSON.stringify(content, null, 4)
            this.writeTextFile(this.tsConfigUri, contentStr)
        }
        // const json = this.readJSON(this.tsConfigUri)
    }

    restoreSchemaFromCache = (): Schema => {
        let schema: Schema
        try {
            logger().info('⚡️ attemping to load cached nodes...')
            const cachedComfyJSON = this.readJSON<ComfySchemaJSON>(this.comfyJSONUri)
            const cachedEmbeddingsJSON = this.readJSON<EmbeddingName[]>(this.embeddingsUri)
            logger().info('⚡️ found cached json for nodes...')
            schema = new Schema(cachedComfyJSON, cachedEmbeddingsJSON)
            logger().info('⚡️ 🟢 object_info and embeddings restored from cache')
            logger().info('⚡️ 🟢 schema restored')
        } catch (error) {
            logger().error('⚡️ ' + extractErrorMessage(error))
            logger().error('⚡️ 🔴 failed to restore object_info and/or embeddings from cache')
            logger().info('⚡️ initializing empty schema')
            schema = new Schema({}, [])
        }
        return schema
    }

    watchForCOnfigurationChanges = () => {
        logger().info('watching for configuration changes...')
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('cushystudio.serverHostHTTP')) {
                logger().info('cushystudio.serverHostHTTP changed')
                this.fetchAndUdpateSchema()
                return
            }
            if (e.affectsConfiguration('cushystudio.serverWSEndoint')) {
                logger().info('cushystudio.serverWSEndoint changed')
                this.ws.updateURL(this.getWSUrl())
                return
            }
        })
    }

    autoDiscoverEveryWorkflow = () => {
        // pre-populate the tree with any open documents
        for (const document of vscode.workspace.textDocuments) this.updateNodeForDocument(document)

        // auto-update the tree when documents are opened or changed
        const _1 = vscode.workspace.onDidOpenTextDocument(this.updateNodeForDocument)
        const _2 = vscode.workspace.onDidChangeTextDocument((e) => this.updateNodeForDocument(e.document))
        this.context.subscriptions.push(_1, _2)
    }

    /** will be created only after we've loaded cnfig file
     * so we don't attempt to connect to some default server */
    ws: ResilientWebSocketClient

    getServerHostHTTP(): string {
        return vscode.workspace //
            .getConfiguration('cushystudio')
            .get('serverHostHTTP', 'http://localhost:8188')
    }

    getWSUrl = (): string => {
        return vscode.workspace //
            .getConfiguration('cushystudio')
            .get('serverWSEndoint', `ws://localhost:8188/ws`)
    }
    initWebsocket = () =>
        new ResilientWebSocketClient({
            onClose: () => {
                this.broadCastToAllClients({ type: 'cushy_status', connected: false })
            },
            onConnectOrReconnect: () => {
                this.broadCastToAllClients({ type: 'cushy_status', connected: true })
                this.fetchAndUdpateSchema()
            },
            url: this.getWSUrl,
            onMessage: this.onMessage,
        })

    /** ensure webview is opened */
    ensureWebviewPanelIsOpened = async (): Promise<void> => {
        if (this.clients.size > 0) return
        return await this.openWebview()
    }

    forwardImagesToFrontV2 = (images: GeneratedImage[]) => {
        this.broadCastToAllClients({ type: 'images', images: images.map((i) => i.toJSON()) })
    }

    onMessage = (e: WS.MessageEvent) => {
        logger().info(`🧦 received ${e.data}`)
        const msg: WsMsg = JSON.parse(e.data as any)

        this.broadCastToAllClients({ ...msg })

        if (msg.type === 'status') {
            if (msg.data.sid) this.comfySessionId = msg.data.sid
            this.status = msg.data.status
            return
        }

        const currentRun: Maybe<FlowRun> = this.activeRun
        if (currentRun == null) {
            logger().error('🐰', `❌ received ${msg.type} but currentRun is null`)
            return
            // return console.log(`❌ received ${msg.type} but currentRun is null`)
        }

        // ensure current step is a prompt
        const promptStep: FlowExecutionStep = currentRun.step
        if (!(promptStep instanceof PromptExecution)) return console.log(`❌ received ${msg.type} but currentStep is not prompt`)

        // defer accumulation to ScriptStep_prompt
        if (msg.type === 'progress') {
            logger().debug(`🐰 ${msg.type} ${JSON.stringify(msg.data)}`)
            return promptStep._graph.onProgress(msg)
        }

        if (msg.type === 'executing') {
            logger().debug(`🐰 ${msg.type} ${JSON.stringify(msg.data)}`)
            return promptStep.onExecuting(msg)
        }

        if (msg.type === 'executed') {
            logger().info(`${msg.type} ${JSON.stringify(msg.data)}`)
            const images = promptStep.onExecuted(msg)
            this.forwardImagesToFrontV2(images)
            return
            // await Promise.all(images.map(i => i.savedPromise))
            // const uris = FrontWebview.with((curr) => {
            //     return images.map((img: GeneratedImage) => {
            //         return curr.webview.asWebviewUri(img.uri).toString()
            //     })
            // })
            // console.log('📸', 'uris', uris)
            // this.sendMessage({ type: 'images', uris })
            // return images
        }

        // unknown message payload ?
        console.log('❌', 'Unknown message:', msg)
        throw new Error('Unknown message type: ' + msg)
    }

    /** attempt to convert an url to a Blob */
    getUrlAsBlob = async (url: string = RANDOM_IMAGE_URL) => {
        const response = await fetch(url, {
            headers: { 'Content-Type': 'image/png' },
            method: 'GET',
            // responseType: ResponseType.Binary,
        })
        const blob = await response.blob()
        // console.log('📦', 'typeof blob', typeof blob)
        // console.log('📦', 'blob.constructor.name', blob.constructor.name)
        // console.log('📦', 'blob', blob)
        // const binArr = new Uint8Array(numArr)
        return blob
        // return new Blob([binArr], { type: 'image/png' })
    }

    resolve = (relativePath: RelativePath): AbsolutePath => {
        return join(this.wspUri, relativePath)
    }

    // fetchPrompHistory = async () => {
    //     const res = await fetch(`${this.serverHostHTTP}/history`, { method: 'GET' })
    //     console.log(res.data)
    //     const x = res.data
    //     return x
    // }

    CRITICAL_ERROR: Maybe<CSCriticalError> = null

    /** retri e the comfy spec from the schema*/
    fetchAndUdpateSchema = async (): Promise<ComfySchemaJSON> => {
        // 1. fetch schema$
        let schema$: ComfySchemaJSON
        try {
            // 1 ------------------------------------
            const object_info_url = `${this.getServerHostHTTP()}/object_info`
            logger().info(`[.... step 1/4] fetching schema from ${object_info_url} ...`)
            const headers: HeadersInit = { 'Content-Type': 'application/json' }
            const object_info_res = await fetch(object_info_url, { method: 'GET', headers })
            const object_info_json = (await object_info_res.json()) as { [key: string]: any }
            const knownNodeNames = Object.keys(object_info_json)
            logger().info(`[.... step 1/4] found ${knownNodeNames.length} nodes`) // (${JSON.stringify(keys)})
            schema$ = object_info_json as any
            logger().info('[*... step 1/4] schema fetched')

            // 1 ------------------------------------
            const embeddings_url = `${this.getServerHostHTTP()}/embeddings`
            logger().info(`[.... step 1/4] fetching embeddings from ${embeddings_url} ...`)
            const embeddings_res = await fetch(embeddings_url, { method: 'GET', headers })
            const embeddings_json = (await embeddings_res.json()) as EmbeddingName[]
            vscode.workspace.fs.writeFile(this.embeddingsUri, Buffer.from(JSON.stringify(embeddings_json)))
            // const keys2 = Object.keys(data2)
            // logger().info(`[.... step 1/4] found ${keys2.length} nodes`) // (${JSON.stringify(keys)})
            // schema$ = data as any
            logger().info(JSON.stringify(embeddings_json))
            logger().info('[*... step x/4] embeddings fetched')

            // 2 ------------------------------------
            http: logger().info('[*... step 2/4] updating schema...')
            const comfyJSONStr = readableStringify(schema$, 3)
            const comfyJSONBuffer = Buffer.from(comfyJSONStr, 'utf8')
            vscode.workspace.fs.writeFile(this.comfyJSONUri, comfyJSONBuffer)
            this.schema.update(schema$, embeddings_json)
            logger().info('[**.. step 2/4] schema updated')

            // 3 ------------------------------------
            logger().info('[**.. step 3/4] udpatin schema code...')
            const comfySchemaTs = this.schema.codegenDTS()
            logger().info('[***. step 3/4] schema code updated ')

            // 4 ------------------------------------
            logger().info('[**** step 4/4] saving schema')
            const comfySchemaBuff = Buffer.from(comfySchemaTs, 'utf8')
            vscode.workspace.fs.writeFile(this.comfyTSUri, comfySchemaBuff)
            logger().info('[**** step 4/4] 🟢 schema updated')
        } catch (error) {
            vscode.window.showErrorMessage('FAILURE TO GENERATE nodes.d.ts', extractErrorMessage(error))
            logger().error('🐰', extractErrorMessage(error))
            logger().error('🦊', 'Failed to fetch ObjectInfos from Comfy.')
            schema$ = {}
        }

        // this.objectInfoFile.update(schema$)
        // this.comfySDKFile.updateFromCodegen(comfySdkCode)
        // this.comfySDKFile.syncWithDiskFile()

        return schema$
    }

    get schemaStatusEmoji() {
        if (this.schema.nodes.length > 10) return '🟢'
        return '🔴'
    }

    status: ComfyStatus | null = null

    notify = (msg: string) => vscode.window.showInformationMessage(`🛋️ ${msg}`)

    addProjectFromComfyWorkflowJSON = (
        //
        relPath: RelativePath,
        title: string,
        comfyPromptJSON: ComfyPromptJSON,
        opts: { preserveId: boolean },
    ): vscode.Uri => {
        let code: string
        try {
            code = new ComfyImporter(this).convertFlowToCode(title, comfyPromptJSON, opts)
        } catch (error) {
            console.log('🔴', error)
            throw error
        }
        // const fileName = title.endsWith('.ts') ? title : `${title}.ts`
        const uri = this.resolve(relPath)
        // const relativePathToDTS = posix.relative(posix.dirname(uri.path), this.cushyTSUri.path)
        // const codeFinal = [`/// <reference path="${relativePathToDTS}" />`, code].join('\n\n')
        this.writeTextFile(uri, code, true)
        return uri
    }

    // --------------------------------------------------

    getWorkspaceTestPatterns() {
        if (!vscode.workspace.workspaceFolders) return []
        return vscode.workspace.workspaceFolders.map((workspaceFolder) => ({
            workspaceFolder,
            pattern: new vscode.RelativePattern(workspaceFolder, '**/*.cushy.ts'),
        }))
    }

    async findInitialFiles(controller: vscode.TestController, pattern: vscode.GlobPattern) {
        for (const file of await vscode.workspace.findFiles(pattern)) {
            this.getOrCreateFile(controller, file)
        }
    }
}
