import type { LiveDB } from '../db/LiveDB'
import type { ComfyPromptT } from '../db/TYPES.gen'
import type { Runtime } from '../runtime/Runtime'
import type { ComfyNodeID } from '../types/ComfyNodeID'
import type {
   ComfyImageInfo,
   PromptRelated_WsMsg,
   WsMsgExecuted,
   WsMsgExecuting,
   WsMsgExecutionError,
   WsMsgExecutionSuccess,
} from '../types/ComfyWsApi'
import type { ComfyWorkflowL, ProgressReport } from './ComfyWorkflow'
import type { ImageCreationOpts } from './createMediaImage_fromWebFile'
import type { StepL } from './Step'

import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'pathe'
import sharp, { type FormatEnum } from 'sharp'

import { Status } from '../back/Status'
import { SQLITE_true } from '../csuite/types/SQLITE_boolean'
import { exhaust } from '../csuite/utils/exhaust'
import { BaseInst } from '../db/BaseInst'
import { LiveRef } from '../db/LiveRef'
import { LiveTable } from '../db/LiveTable'
import { type ComfyPromptUpdate, type TABLES } from '../db/TYPES.gen'
import { asRelativePath } from '../utils/fs/pathUtils'
import { getPngMetadataFromUint8Array } from '../utils/png/_getPngMetadata'
import {
   _createMediaImage_fromLocalyAvailableImage,
   createMediaImage_fromPath,
} from './createMediaImage_fromWebFile'
import { FPath } from './FPath'

export class ComfyPromptRepo extends LiveTable<TABLES['comfy_prompt'], typeof ComfyPromptL> {
   constructor(liveDB: LiveDB) {
      super(liveDB, 'comfy_prompt', '❓', ComfyPromptL)
      this.init()
   }
}
export class ComfyPromptL extends BaseInst<TABLES['comfy_prompt']> {
   instObservabilityConfig: undefined
   dataObservabilityConfig: undefined

   saveFormat: Maybe<ImageSaveFormat> = null

   private _resolve!: (value: this) => void
   private _rejects!: (reason: any) => void
   finished: Promise<this> = new Promise((resolve, rejects) => {
      this._resolve = resolve
      this._rejects = rejects
   })

   notifyEmptyPrompt = (): void => console.log('🔶 No work to do')

   onCreate = (): void => {
      const data: ComfyPromptT = this.data
      const pending = this.st._pendingMsgs.get(data.id)
      if (pending == null) return
      this.log(`🟢 onCreate: ${pending.length} pending messages`)
      for (const msg of pending) this.onPromptRelatedMessage(msg)
   }

   // onUpdate = (prev: Maybe<PromptT>, next: PromptT) => {
   //     // if (!prev?.executed && next.executed) this._finish()
   //     // if (next)
   // }

   get progressGlobal(): ProgressReport {
      if (this.data.status === 'Success') return { countDone: 1, countTotal: 1, isDone: true, percent: 100 }
      return this.graph.progressGlobal
   }

   get status(): 'New' | 'Scheduled' | 'Running' | 'Success' | 'Failure' {
      return this.data.status ?? 'New'
   }

   // link to step
   stepRef = new LiveRef<this, StepL>(this, 'stepID', 'step')

   get step(): StepL {
      return this.stepRef.item
   }

   // link to graph
   graphRef = new LiveRef<this, ComfyWorkflowL>(this, 'graphID', 'comfy_workflow')

   get graph(): ComfyWorkflowL {
      return this.graphRef.item
   }

   onPromptRelatedMessage = (msg: PromptRelated_WsMsg): void => {
      // console.debug(`🐰 ${msg.type} ${JSON.stringify(msg.data)}`)
      const graph = this.graph
      if (msg.type === 'execution_start') return
      if (msg.type === 'execution_cached') return graph.onExecutionCached(msg)
      if (msg.type === 'executing') return void this.onExecuting(msg)
      if (msg.type === 'progress') return graph.onProgress(msg)
      if (msg.type === 'executed') return this.onExecuted(msg)
      if (msg.type === 'execution_error') return void this.onError(msg)
      if (msg.type === 'execution_success') return void this.onExecutionSuccess(msg)
      console.log(`🔴 UNEXPECTED MESSAGE:`, msg)
      exhaust(msg)
      // await Promise.all(images.map(i => i.savedPromise))
      // const uris = FrontWebview.with((curr) => {
      //     return images.map((img: GeneratedImage) => {
      //         return curr.webview.asWebviewUri(img.uri).toString()
      //     })
      // })
      // console.log('📸', 'uris', uris)
      // this.sendMessage({ type: 'images', uris })
      // return images
      // }
   }

   /** update pointer to the currently executing node */
   private onExecuting = async (msg: WsMsgExecuting): Promise<void> => {
      this.graph.onExecuting(msg)

      if (msg.data.node == null) {
         // console.warn(`[❌] LEGACY PATH; SHOULD NOT BE CALLED; UPDATE COMFY ?`)
         // * When `msg.data.node` is null, it means the prompt has nothing
         //   to execute anymore, so it's done.
         // * Before marking it finished, we need to wait pending promises.
         // * Pending promises hold the async post-processing operations
         //   spawned when receiving outputs.
         // console.log(`[🔴🔴🔴🔴] ${this.pendingPromises.length} pending Promises`)
         // ⏸️ await Promise.all(this.pendingPromises)
         // ⏸️ return await this._finish({ status: 'Success' })
      }
   }

   private onExecutionSuccess = async (msg: WsMsgExecutionSuccess): Promise<void> => {
      await Promise.all(this.pendingPromises)
      return this._finish({ status: 'Success' })
   }

   private onError = async (msg: WsMsgExecutionError): Promise<void> => {
      console.error(msg)
      this.db.runtime_error.create({
         message: 'Prompt failed',
         infos: msg,
         promptID: this.id,
         graphID: this.graph.id,
         stepID: this.step.id,
      })
      this.step.update({ status: Status.Failure })
      return this._finish({ status: 'Failure', error: msg })
   }

   /**
    * maybe be set during CushyStudio lifetime;
    * NOT available once cushy has restarted
    */
   get RUNTIME(): Maybe<Runtime> {
      return this.step.runtime
   }

   /** update execution list */
   private onExecuted = (msg: WsMsgExecuted): void => {
      const promptNodeID = msg.data.node
      // if (!Array.isArray(msg.data.output.images)) {
      //     console.error(`❌ invariant violation: msg.data.output.images is not an array`, msg.data)
      //     return
      // }
      const images = msg.data.output?.images
      if (images) {
         for (const img of images) {
            this.pendingPromises.push(this.retrieveImage(img, promptNodeID))
         }
      }
   }
   private pendingPromises: Promise<void>[] = []

   // 🦊
   retrieveImage = async (
      //
      comfyImageInfo: ComfyImageInfo,
      promptNodeID: ComfyNodeID,
   ): Promise<void> => {
      // retrieve the node
      const promptNode = this.graph.data.comfyPromptJSON[promptNodeID]!
      const promptMeta = this.graph.data.metadata[promptNodeID]!
      if (promptNode == null) throw new Error(`❌ invariant violation: promptNode is null`)

      // get image url from ComfyUI
      const serverURL = this.st.mainHost.getServerHostHTTP()
      const imgUrl = serverURL + '/view?' + new URLSearchParams(comfyImageInfo).toString()

      // image metadata
      const imgCreationOpts: ImageCreationOpts = {
         stepID: this.step.id,
         promptID: this.id,
         promptNodeID: promptNodeID,
         comfyUIInfos: {
            comfyImageInfo: comfyImageInfo,
            comfyHostHttpURL: this.st.getServerHostHTTP(),
         },
      }

      // target path on disk
      const sf = this.saveFormat
      let outputRelPath = sf?.prefix
         ? join('outputs', sf.prefix, comfyImageInfo.filename)
         : join('outputs', comfyImageInfo.subfolder, comfyImageInfo.filename)

      if (sf?.format && sf.format !== 'raw') {
         const extension = sf.format.split('/')[1]
         outputRelPath += '.' + extension
      }
      const absPath = this.st.resolve(this.st.rootPath, asRelativePath(outputRelPath))
      const dir = dirname(absPath)
      mkdirSync(dir, { recursive: true })

      // ref
      let imgL

      // RE-ENCODE (COMPRESSED)
      if (sf && sf.format !== 'raw') {
         const response = await fetch(imgUrl, { headers: { 'Content-Type': 'image/png' }, method: 'GET' })

         const buff = await response.arrayBuffer()
         let textChunk = {}
         try {
            const res = getPngMetadataFromUint8Array(new Uint8Array(buff))
            if (res.success) textChunk = res.value
         } catch (error) {
            //
         }

         console.log(`[🟢🔴❓] `, textChunk)

         // await sharp(buff)
         //     .withMetadata()
         //     .withExifMerge(textChunk)
         //     .toFile(outputRelPath + '.png')

         // const exifBuff = (await sharp(buff).keepExif().keepMetadata().metadata()).exif
         // if (exifBuff != null) {
         //     console.log(`[🟢] A`, exif(exifBuff!))
         // } else {
         //     console.log(`[🔴] A NO EXIF`)
         // }

         const format = ((): keyof FormatEnum => {
            if (sf.format === 'image/jpeg') return 'jpeg'
            if (sf.format === 'image/png') return 'png'
            if (sf.format === 'image/webp') return 'webp'
            return 'png'
         })()

         await sharp(buff)
            .withMetadata()
            .withExif({ IFD0: textChunk })
            // sharp expect quality between 1 and 100
            .toFormat(format, sf.quality ? { quality: Math.round(sf.quality * 100) } : undefined)
            .toFile(outputRelPath)
         // .webp({ quality: 80 })

         // void openFolderInOS(dirname(outputRelPath) as AbsolutePath)
         // console.log(`[FUCK 2 🔴] `, await sharp(outputRelPath).metadata())
         // const canvas = document.createElement('canvas')
         // let ctx = canvas.getContext('2d')
         // const imgHtml = await createHTMLImage_fromURL(imgUrl)
         // const width = imgHtml.width
         // const height = imgHtml.height
         // // resize the canvas accordingly
         // canvas.width = width
         // canvas.height = height
         // // paste html image onto your canvas
         // ctx!.drawImage(imgHtml, 0, 0, width, height)
         // let dataUrl = canvas.toDataURL(sf.format, sf.quality)
         // const prefixToSlice = `data:${sf.format};base64,`
         // if (!dataUrl.startsWith(prefixToSlice))
         //     throw new Error(`❌ dataUrl doesn't start with the expected "${prefixToSlice}"`)
         // let base64Data = dataUrl.slice(prefixToSlice.length)
         // writeFileSync(outputRelPath, base64Data, 'base64')
         imgL = createMediaImage_fromPath(new FPath(outputRelPath), imgCreationOpts)
      }
      // SAVE RAW ------------------------------------------------------------------------------------------
      else {
         const response = await fetch(imgUrl, { headers: { 'Content-Type': 'image/png' }, method: 'GET' })
         const buff = await response.arrayBuffer()
         const uint8arr = new Uint8Array(buff)
         writeFileSync(absPath, uint8arr)
         imgL = _createMediaImage_fromLocalyAvailableImage(new FPath(outputRelPath), buff, imgCreationOpts)
      }

      // apply tags --------------------------------------------------------------------------------
      const tags: string[] = imgL.data.tags?.split(',') ?? []
      if (promptMeta.tag) tags.push(promptMeta.tag)
      if (promptMeta.tags) tags.push(...promptMeta.tags)
      if (tags.length) imgL.update({ tags: tags.join(',') })

      // update store --------------------------------------------------------------------------------
      if (this.step.runtime && promptMeta.storeAs) {
         this.step.runtime.Store.getImageStore(promptMeta.storeAs).set(imgL)
      }
   }

   /** finish this step */
   private alreadyFinished: boolean = false
   private _finish = async (p: Pick<ComfyPromptUpdate, 'status' | 'error'>): Promise<void> => {
      if (this.alreadyFinished) throw new Error(`❌ invariant violation: already finished`)
      this.alreadyFinished = true
      this.update({ ...p, executed: SQLITE_true })
      await Promise.all(this.pendingPromises)
      if (this._resolve == null) throw new Error('❌ invariant violation: ScriptStep_prompt.resolve is null.')
      this._resolve(this)
   }
}
