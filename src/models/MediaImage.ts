import type { ComfyUIAPIRequest_Node } from '../comfyui/comfyui-prompt-api'
import type { ManualPromise } from '../csuite/utils/ManualPromise'
import type { LiveDB } from '../db/LiveDB'
import type { TABLES } from '../db/TYPES.gen'
import type { SafetyResult } from '../safety/Safety'
import type { ComfyNodeMetadata } from '../types/ComfyNodeID'
import type { ComfyPromptL } from './ComfyPrompt'
import type { ComfyWorkflowL } from './ComfyWorkflow'
import type { CushyAppL } from './CushyApp'
import type { CushyScriptL } from './CushyScript'
import type { DraftL } from './Draft'
import type { StepL } from './Step'
import type { MouseEvent } from 'react'

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { imageMeta } from 'image-meta'
import Konva from 'konva'
import { lookup } from 'mime-types'
import { runInAction } from 'mobx'
import { format, join, parse } from 'path'
import { basename, resolve } from 'pathe'
import sharp from 'sharp'

import { hasMod } from '../csuite/accelerators/META_NAME'
import { Trigger } from '../csuite/trigger/Trigger'
import { asSTRING_orCrash } from '../csuite/utils/bang'
import { sleep } from '../csuite/utils/sleep'
import { toastError, toastImage, toastInfo } from '../csuite/utils/toasts'
import { BaseInst } from '../db/BaseInst'
import { LiveRefOpt } from '../db/LiveRefOpt'
import { LiveTable } from '../db/LiveTable'
import { createHTMLImage_fromURL } from '../state/createHTMLImage_fromURL'
import { hashArrayBuffer } from '../state/hashArrayBuffer'
import { asAbsolutePath, asRelativePath } from '../utils/fs/pathUtils'
import { transparentImgURL } from '../widgets/galleries/transparentImg'
import {
   _createMediaImage_fromLocalyAvailableImage,
   createMediaImage_fromDataURI,
   type ImageCreationOpts,
} from './createMediaImage_fromWebFile'
import { FPath } from './FPath'
import { getCurrentRun_IMPL } from './getGlobalRuntimeCtx'

export class MediaImageRepo extends LiveTable<TABLES['media_image'], typeof MediaImageL> {
   constructor(liveDB: LiveDB) {
      super(liveDB, 'media_image', '🖼️', MediaImageL)
      this.init()
   }
}

export class MediaImageL extends BaseInst<TABLES['media_image']> {
   instObservabilityConfig: undefined
   dataObservabilityConfig: undefined

   static async cacheMissingSafetyRatings({
      //
      amount = 10,
      delay = 100,
      onProcess,
   }: {
      delay: number
      amount: number
      onProcess?: (i: MediaImageL) => void
   }): Promise<void> {
      const imagesWithoutSafetyRating = cushy.db.media_image.select((t) =>
         t
            .where('safetyRating', 'is', null) //
            .limit(amount),
      )
      for (const image of imagesWithoutSafetyRating) {
         console.log(`[🤠] processing`, image.absPath, 'to cache safety rattings')
         await sleep(delay)
         onProcess?.(image)
         // xxx.value.image = image
         try {
            await image.updateSafetyRating()
         } catch (e: any) {
            console.log(`[🤠] `, image.data.path, '=>', e)
         }
      }
   }

   static deleteAllMissingOnDisk(): void {
      const allPaths = cushy.db.media_image.selectRaw2((t) => t.select(['path', 'id']))
      console.log(`[🤠] allPaths.length`, allPaths)
      const toDelete: string[] = []
      for (const x of allPaths) {
         if (!existsSync(x.path)) {
            console.log(`[❌] delete ${x.path}`)
            toDelete.push(x.id)
            // cushy.db.media_image.delete2((t) => t.where('id', '=', x.id))
         } else {
            // console.log(`[🟢] keep   ${x.path}`)
         }
      }
      const xx = cushy.db.media_image.delete2((t) => t.where('id', 'in', toDelete))
      console.log(`[🤠] xx`, xx)
   }
   /** return the image filename */
   get filename(): string {
      return basename(this.data.path)
   }

   get step(): Maybe<StepL> {
      return this.prompt?.step
   }

   get draft(): Maybe<DraftL> {
      return this.step?.draft
   }

   get workflow(): Maybe<ComfyWorkflowL> {
      return this.prompt?.graph
   }

   get app(): Maybe<CushyAppL> {
      return this.draft?.app
   }

   get script(): Maybe<CushyScriptL> {
      return this.app?.script
   }

   /** flip image */
   // 👀 👉 https://github.com/lovell/sharp/issues/28#issuecomment-679193628
   // ⏸️ flip = async () => {
   // ⏸️     await sharp(this.absPath)
   // ⏸️         // .flip()
   // ⏸️         .toFile(this.absPath + '2')
   // ⏸️     renameSync(this.absPath + '2', this.absPath)
   // ⏸️ }

   /* XXX: This should only be a stop-gap for a custom solution that isn't hampered by the browser's security capabilities */
   /** Uses browser clipboard API to copy the image to clipboard, will only copy as a PNG and will not include metadata. */
   copyToClipboard_viaCanvas = async (
      /** NOT TAKEN INTO ACCOUNT FOR NOW */
      p?: {
         //
         format?: any /* 🔴 */
         quality?: any /* 🔴 */
      },
   ): Promise<Trigger> => {
      try {
         await createHTMLImage_fromURL(URL.createObjectURL(this.getAsBlob())).then((img) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)

            canvas.toBlob((blob) => {
               if (blob == null) {
                  toastError(`Could not copy image to clipboard: ${blob}`)
                  return
               }
               navigator.clipboard
                  .write([
                     new ClipboardItem({
                        [blob.type]: blob,
                     }),
                  ])
                  .then(() => {
                     toastInfo('Image copied to clipboard!')
                  })
                  .catch((error) => {
                     toastError(`Could not copy image to clipboard: ${error}`)
                     console.error('Error copying image to clipboard:', error)
                  })
            })
         })
         return Trigger.Success
      } catch (error) {
         toastError(`Could not copy image to clipboard: ${error}`)
         console.error('Error loading image:', error)
         return Trigger.FAILED
      }
   }
   /** Uses electron clipboard API to copy the image to clipboard, will only copy as PNG. */
   copyToClipboard = async (): Promise<void> => {
      try {
         await this.st.electron.copyImageToClipboard({
            format: this.extension.split('.').pop(),
            buffer: this.getArrayBuffer(),
         })
         toastImage(this.getBase64Url(), `Image copied to clipboard!`)
      } catch (err) {
         toastError(`Could not copy to clipboard: ${err}`)
      }
   }

   copyToClipboardAsBase64 = (): Promise<void> =>
      navigator.clipboard.writeText(this.getBase64Url()).then(() => {
         toastInfo('Image copied to clipboard!')
      })

   useAsDraftIllustration = (draft_?: DraftL): void => {
      const draft = draft_ ?? this.draft
      if (draft == null) return void toastError(`no related draft found`)
      draft.update({ illustration: this.url })
   }

   saveLocally = (localAbsolutePath: string): void => {
      mkdirSync(localAbsolutePath, { recursive: true })
      let absFilePath = join(localAbsolutePath, this.filename)

      // Check if the file already exists and append a timestamp if it does
      if (existsSync(absFilePath)) {
         const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
         const parsedPath = parse(absFilePath)
         absFilePath = format({
            dir: parsedPath.dir,
            name: `${parsedPath.name}-${timestamp}`,
            ext: parsedPath.ext,
         })
      }

      console.log(`Saving copy to: ${absFilePath}`)
      writeFileSync(absFilePath, this.getArrayBuffer())
   }

   get relPath(): RelativePath {
      return asRelativePath(this.data.path)
   }

   get relPathAsAbsPath(): string {
      return `/` + this.data.path
   }

   get baseName(): string {
      return basename(this.data.path)
   }

   get baseNameWithoutExtension(): string {
      const fname = this.baseName
      return fname.slice(0, fname.lastIndexOf('.'))
   }

   /**
    * return file extension including dot
    * e.g. `.png`, or `.webp`
    * */
   get extension(): string {
      const fname = this.baseName
      return fname.slice(((fname.lastIndexOf('.') - 1) >>> 0) + 1)
   }

   onMouseEnter = (ev: MouseEvent): void => {
      cushy.hovered = this
   }

   onMouseLeave = (ev: MouseEvent): void => {
      if (cushy.hovered === this) cushy.hovered = null
   }

   onMiddleClick = (): void => {
      return void cushy.layout.open('Image', { imageID: this.id }, { where: 'biggest' })
   }

   onRightClick = (): void => {}

   onClick = (ev: MouseEvent): void => {
      //Delete if not starred
      if (ev.ctrlKey && ev.shiftKey && ev.altKey && !this.star) {
         ev.stopPropagation()
         ev.preventDefault()
         return void this.delete({})
      }
      if (hasMod(ev)) {
         ev.stopPropagation()
         ev.preventDefault()
         return void cushy.layout.open('Image', { imageID: this.id })
      }
      if (ev.shiftKey) {
         ev.stopPropagation()
         ev.preventDefault()
         return void cushy.layout.open('Canvas', { startingImgID: this.id })
      }
      if (ev.altKey) {
         ev.stopPropagation()
         ev.preventDefault()
         return void cushy.layout.open('Paint', { imgID: this.id })
      }

      return
   }

   /** get the expected enum name */
   get enumName(): Comfy.Slots['LoadImage.image'] {
      // return `${this.baseNameWithoutExtension}-${this.data.hash}${this.extension}`
      return `${this.data.hash}${this.extension}` as Comfy.Slots['LoadImage.image']
   }

   uploadAndReturnEnumName = async (): Promise<Comfy.Slots['LoadImage.image']> => {
      const finalName = await this.st.uploader.upload_Image(this, { type: 'input', override: true })
      return finalName
   }

   loadInWorkflow = async (workflow_?: ComfyWorkflowL): Promise<Comfy.Node['LoadImage']> => {
      const workflow = workflow_ ?? getCurrentRun_IMPL().workflow
      const enumName = await this.uploadAndReturnEnumName()
      const img = workflow.builder.LoadImage({ image: enumName })
      return img
   }

   /** load an image as mask in a comfy workflow beeing created */
   loadInWorkflowAsMask = async (
      /** "alpha" | "blue" | "green" | "red" */
      channel: Comfy.Slots['LoadImageMask.channel'],
      /** workflow to load image as mask into (default to current workflow) */
      workflow_?: ComfyWorkflowL,
   ): Promise<Comfy.Node['LoadImageMask']> => {
      const workflow = workflow_ ?? getCurrentRun_IMPL().workflow
      const enumName = await this.uploadAndReturnEnumName()
      const mask: Comfy.Node['LoadImageMask'] = workflow.builder.LoadImageMask({ image: enumName, channel })
      return mask
   }

   /**
    * live reference to the prompt this image comes from
    * null if the image is not generated by comfy
    * @since v.2384
    */
   promptRef = new LiveRefOpt<this, ComfyPromptL>(this, 'promptID', 'comfy_prompt')

   /**
    * return the Comfy prompt instance from which this image was generated
    * null if the image is not generated by comfy
    * @since v.2384
    */
   get prompt(): Maybe<ComfyPromptL> {
      return this.promptRef.item
   }

   /**
    * return the workflow from which this image was generated
    * @since v.2384
    */
   get graph(): ComfyWorkflowL | undefined {
      return this.prompt?.graph
   }

   /** return the json of the ComfyNode that led to this image */
   get ComfyNode(): Maybe<ComfyUIAPIRequest_Node> {
      const nodeID = this.data.promptNodeID
      if (nodeID == null) return null
      return this.graph?.data.comfyPromptJSON[nodeID]
   }

   asHTMLImageElement_wait = async (): Promise<HTMLImageElement> => {
      return createHTMLImage_fromURL(this.url)
   }

   get asHTMLImageElement_noWait(): HTMLImageElement {
      const img: HTMLImageElement = new Image()
      img.src = this.url
      return img
   }

   get width(): number {
      return this.data.width
   }

   get height(): number {
      return this.data.height
   }

   openInImageEditor = (): void => {
      this.st.layout.open('Paint', { imgID: this.id })
   }

   openInCanvasEditor = (): void => {
      this.st.layout.open('Canvas', { startingImgID: this.id })
   }

   // ---------------------------------------------------------------
   /**
    * add a tag to MediaImage.tags
    * internally stored as coma-separated string
    * */
   addTag = (...tags: string[]): this => {
      this.update({ tags: this.data.tags ? `${this.data.tags},${tags.join(',')}` : tags.join(',') })
      return this
   }

   toggleTag = (...tags: string[]): this => {
      const curr = new Set(this.tags)
      for (const tag_ of tags) {
         const tag = tag_.trim()
         if (curr.has(tag)) curr.delete(tag)
         else curr.add(tag)
      }
      this.update({ tags: [...curr.values()].join(',') })
      return this
   }

   /** remove image tag */
   removeTag = (...tagsToRemove: string[]): this => {
      if (this.data.tags == null) return this
      const tags = new Set(this.data.tags.split(','))
      for (const tag of tagsToRemove) tags.delete(tag)
      this.update({ tags: [...tags].join(',') })
      return this
   }

   // ---------------------------------------------------------------
   /** get tags as string list (de-duplicated) */
   get tags(): string[] {
      if (this.data.tags == null) return []
      // temporary fix to deduplicate tags
      return [...new Set(this.data.tags.split(','))]
   }

   set tags(str: string) {
      this.update({ tags: str })
   }

   get star(): number {
      if (this.data.star == null) return 0
      return this.data.star
   }

   set star(n: number) {
      if (n < 0 || n > 5) throw new Error('star must be between 0 and 5')
      this.update({ star: n })
   }

   /**
    * return the metadata of the ComfyNode that led to this image
    * null if not generated by comfy throu a CushyStudio prompt
    * null if no metadata associated in the node in CushyStudio
    */
   get ComfyNodeMetadata(): Maybe<ComfyNodeMetadata> {
      const nodeID = this.data.promptNodeID
      if (nodeID == null) return null
      return this.graph?.data.metadata[nodeID]
   }

   /**
    * return the base64 url for this file, regardless of it's exact representation
    * includes the prefix `data:image/<type>;base64,`
    */
   getBase64Url(): string {
      const imgType = this.data.type ?? 'png'
      return `data:image/${imgType};base64,${this.getBase64Payload()}`
   }

   /**
    * return the base64 url for this file, regardless of it's exact representation
    * does not includes the prefix `data:image/png;base64,`
    */
   getBase64Payload(): string {
      const bin = this.getArrayBuffer()
      return bin.toString('base64')
   }

   /** return the ArrayBuffer for this file, regardless it's exact representation  */
   getArrayBuffer(): Buffer {
      const bin = readFileSync(this.data.path)
      return bin
   }

   /** return as web `Blob` */
   getAsBlob(): Blob {
      const filePath = this.data.path
      const mime = asSTRING_orCrash(lookup(filePath), '❌ invalid mime type')
      const blob = new Blob([readFileSync(filePath)], { type: mime })
      return blob
   }

   /** return as web `File` */
   getAsFile(): File {
      const filePath = this.data.path
      const mime = asSTRING_orCrash(lookup(filePath), '❌ invalid mime type')
      const file = new File([readFileSync(filePath)], basename(filePath), { type: mime })
      return file
   }

   /** ready to be used in image fields */
   get url(): string {
      return `file://${this.absPath}?hash=${this.data.hash}`
   }

   /** absolute path on the machine running CushyStudio */
   get absPath(): AbsolutePath {
      const path = this.data.path
      if (path.startsWith('outputs/')) return this.st.resolveFromRoot(asRelativePath(path))
      return asAbsolutePath(resolve(this.st.rootPath, path))
   }

   get isSafe(): ManualPromise<SafetyResult> {
      return this.st.safetyChecker.isSafe(this.url)
   }

   async updateSafetyRating(): Promise<void> {
      const sr = await this.st.safetyChecker.isSafe(this.url)
      this.update({
         safetyRating: sr,
         updatedAt: Date.now(),
      })
   }

   get existsLocally(): boolean {
      return this.absPath != null
   }

   // THUMBNAIL ------------------------------------------------------------------------------------------

   /** allow to pick the best source to preserve CPU and MEMORY */
   urlForSize = (size: number): string => {
      // 32 x 32 mini-thumb
      // 🛝 const forceThumb = this.st.galleryConf.fields.onlyShowBlurryThumbnails.value
      // 🛝 if (forceThumb) return this.thumbhashURL
      if (size < 32) return this.thumbhashURL

      // 100 x 100 thumb
      if (size < 256) return this.thumbnailURL

      // full image
      return this.url
   }

   // THUMBNAIL ------------------------------------------------------------------------------------------
   _thumbnailReady: boolean = false
   get thumbnailURL(): string {
      // console.log(`[🤠] get thumbnailURL(): string`)
      // ⏸️ if (this._efficientlyCachedTumbnailBufferURL) return this._efficientlyCachedTumbnailBufferURL
      // no need to add hash suffix, cause path already uses hash
      if (this._thumbnailReady || existsSync(this._thumbnailAbsPath))
         return `file://${this._thumbnailAbsPath}`
      void this._mkThumbnail()
      return transparentImgURL
   }

   /** relative path to the thumbnail */
   get _thumbnailRelPath(): RelativePath {
      return `outputs/.thumbnails/${this.data.hash}.jpg` as RelativePath
   }

   /** absolute path to the thumbnail */
   get _thumbnailAbsPath(): AbsolutePath {
      // 💬 2024-03-14 👉 not using join cause it's slow (trying to fix gallery perf problems)
      return `${this.st.rootPath}/${this._thumbnailRelPath}` as AbsolutePath
   }

   processImage = async (
      p: (ctx: CanvasRenderingContext2D) => void,
      conf?: { quality?: number; format?: 'image/jpeg' | 'image/webp' | 'image/png' },
   ): Promise<MediaImageL> => {
      const img = await this.asHTMLImageElement_wait()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx == null) throw new Error('could not get 2d context')
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      p(ctx)
      const newDataURL = canvas.toDataURL(conf?.format, conf?.quality)
      const out = createMediaImage_fromDataURI(newDataURL, undefined, this._imageCreationOpts)
      return out
   }

   addWatermark_withCanvas = async (text: string, p?: WatermarkProps): Promise<MediaImageL> => {
      const img = await this.asHTMLImageElement_wait()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx == null) throw new Error('could not get 2d context')
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      ctx.font = `${p?.fontSize ?? 30}px ${p?.font ?? 'Arial'}`
      ctx.fillStyle = p?.color ?? 'white'
      ctx.fillText(text, p?.x ?? 0, p?.y ?? 0)
      const newDataURL = canvas.toDataURL(p?.format, p?.quality)
      const out = createMediaImage_fromDataURI(newDataURL, undefined, this._imageCreationOpts)
      return out
   }

   addWatermark_withKonva = async (text: string, p?: WatermarkProps): Promise<MediaImageL> => {
      return this.processWithKonva(
         ({ stage, layer }) => {
            const textNode = new Konva.Text({
               x: p?.x ?? 0,
               y: p?.y ?? 0,
               text,
               fontSize: p?.fontSize ?? 30,
               fontFamily: p?.font ?? 'Arial',
               fill: p?.color ?? 'white',
            })
            layer.add(textNode)
            stage.draw()
         },
         { format: p?.format, quality: p?.quality },
      )
   }

   recache(opts?: ImageCreationOpts, preBuff?: Buffer | ArrayBuffer): this {
      const buff: Buffer | ArrayBuffer = preBuff ?? readFileSync(this.absPath)
      const uint8arr = new Uint8Array(buff)
      const fileSize = uint8arr.byteLength
      const meta = imageMeta(uint8arr)
      if (meta.width == null) throw new Error(`❌ size.width is null`)
      if (meta.height == null) throw new Error(`❌ size.height is null`)

      const hash = hashArrayBuffer(uint8arr)
      if (this.data.hash === hash) {
         console.log(`[🏞️] exact same imamge; updating promptID and stepID`)
         const fieldsToUpdate = {}
         this.update({
            promptID: opts?.promptID ?? this.data.promptID,
            stepID: opts?.stepID ?? this.data.stepID,
         })
      } else {
         const relPath = this.relPath
         console.log(`[🏞️] updating existing image (${relPath})`)
         this.update({
            orientation: meta.orientation,
            type: meta.type,
            fileSize: fileSize,
            width: meta.width,
            height: meta.height,
            hash,
            path: relPath,
            promptID: opts?.promptID ?? this.data.promptID,
            stepID: opts?.stepID ?? this.data.stepID,
         })
      }
      return this
   }

   /**
    * Modify the image directly (inplace) by passing it though a `Sharp` pipeline
    * Sharp is a high performance image processing library.
    *
    */
   processWithSharp_inplace = async (
      /** processing function */
      fn: (sharp: sharp.Sharp) => sharp.Sharp,
   ): Promise<this> => {
      const buff = await fn(sharp(this.absPath)).toBuffer()
      writeFileSync(this.absPath, buff)
      this.recache({}, buff)
      return this
   }

   /**
    * Allow to run an image though some `Sharp` pipeline to produce an other image.
    * Sharp is a high performance image processing library.
    * to modify the image directly (inplace), use `processWithSharp_inplace` instead.
    */
   processWithSharp = async (
      /** processing function */
      fn: (sharp: sharp.Sharp) => sharp.Sharp,
      path: string = `outputs/sharp-${Date.now()}`,
      tags?: string[],
   ): Promise<MediaImageL> => {
      const buff = await fn(sharp(this.absPath)).toBuffer()
      const fpath = new FPath(path)
      const suffix = this.extension
      fpath.write(buff)
      return _createMediaImage_fromLocalyAvailableImage(fpath, buff, this._imageCreationOpts)
   }

   processWithKonva = async (
      fn: (p: { stage: Konva.Stage; layer: Konva.Layer; image: Konva.Image }) => void,
      imageOpts?: {
         /** if provieded, final converstion to image will use given format */
         format?: 'image/jpeg' | 'image/webp' | 'image/png'
         /** if provided, alongside a loosy format (e.g. webp or jpeg), this will change final image quality */
         quality?: number
      },
   ): Promise<MediaImageL> => {
      const img = await this.asHTMLImageElement_wait()
      const headlessKonvaContainer = document.createElement('div')
      const stage = new Konva.Stage({
         width: img.width,
         height: img.height,
         container: headlessKonvaContainer,
      })
      const layer = new Konva.Layer({ width: img.width, height: img.height })
      const konvaImg = new Konva.Image({ image: img, x: 0, y: 0, width: img.width, height: img.height })
      layer.add(konvaImg)
      stage.add(layer)
      fn({ stage, layer, image: konvaImg })
      const newDataURL = stage.toCanvas().toDataURL(imageOpts?.format, imageOpts?.quality)
      const out = createMediaImage_fromDataURI(newDataURL, undefined, this._imageCreationOpts)
      return out
   }

   get _imageCreationOpts(): ImageCreationOpts {
      return {
         comfyUIInfos: this.data.comfyUIInfos,
         promptID: this.data.promptID,
         promptNodeID: this.data.promptNodeID,
         stepID: this.data.stepID,
      }
   }

   _mkThumbnail = async (): Promise<void> => {
      // 🔴 BAD TRY CATCH HERE
      try {
         // console.log(`[🤠] creating thumbnail for`)
         // resize image to 100px
         //  2024-08-11 rvion:          ⁉️ WHAT ⁉️
         //                             VVVVVVVVV
         const img = sharp(this.absPath).rotate().resize(100).jpeg({ mozjpeg: true })
         // then save file to disk for later use (when app restart, let's not re-compute the thumbnail)
         mkdirSync(resolve(this.st.rootPath, 'outputs/.thumbnails'), { recursive: true })
         await img.toFile(this._thumbnailRelPath)
         // then refresh the thumbnail
         runInAction(() => {
            this._thumbnailReady = true
         })
      } catch {
         console.log(`[❌] _mkThumbnail failed for image ${this.data.path}`)
         //
      }
   }

   // THUMBHASH ------------------------------------------------------------------------------------------
   // ❌ https://evanw.github.io/thumbhash/
   _mkThumbhash = async (): Promise</* { binary: Uint8Array; url: string } */ string> => {
      const image2 = await sharp(this.absPath)
         .resize(32, 32, { fit: 'inside' })
         .webp({ quality: 1 })
         .toBuffer()
      const x = image2.toString('base64')
      // console.log(`[🤠] this.data.thumbnail 🟢 =`, x.length)
      return x
   }

   get thumbhashURL(): string {
      if (this.data.thumbnail && !this.data.thumbnail.startsWith('data:')) {
         // console.log(`[🤠] this.data.thumbnail 🔴 =`, this.data.thumbnail.length)
         return `data:image/webp;base64,${this.data.thumbnail}`
      }
      void this._mkThumbhash()
         .then((url) => this.update({ thumbnail: url }))
         .catch((err) => console.log(`[❌] failed to generate thumbhash for file ${this.data.path}`, err))
      return ''
   }
}

export type WatermarkProps = {
   /** if provieded, final converstion to image will use given format */
   format?: 'image/jpeg' | 'image/webp' | 'image/png'
   /** if provided, alongside a loosy format (e.g. webp or jpeg), this will change final image quality */
   quality?: number
   /** watermark x placement */
   x?: number
   /** watermark y placement */
   y?: number
   /** watermark font */
   font?: string
   /** watermark font size */
   fontSize?: number
   /** watermark text color */
   color?: string
}
