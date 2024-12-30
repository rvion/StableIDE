import type { ComfyUIAPIRequest } from '../comfyui/comfyui-prompt-api'
import type { LiteGraphJSON } from '../comfyui/litegraph/LiteGraphJSON'
import type { CushyScriptL } from '../models/CushyScript'
import type { STATE } from '../state/state'
import type { AppMetadata } from './AppManifest'
import type { Library } from './Library'
import type { BuildContext, BuildResult, Metafile, OutputFile } from 'esbuild'

import { readFileSync } from 'fs'
import { makeAutoObservable, runInAction } from 'mobx'
import path, { basename, dirname } from 'pathe'

import { checkLibraryScriptFences } from '../apps/scriptFences'
import { convertLiteGraphToPrompt } from '../comfyui/litegraphToApiRequestPayload'
import { createEsbuildContextFor } from '../compiler/transpiler'
import { extractErrorMessage } from '../csuite/formatters/extractErrorMessage'
import { exhaust } from '../csuite/utils/exhaust'
import { ManualPromise } from '../csuite/utils/ManualPromise'
import { toastError } from '../csuite/utils/toasts'
import { asCushyScriptID } from '../db/TYPES.gen'
import { FPath } from '../models/FPath'
import { asAbsolutePath } from '../utils/fs/pathUtils'
import { getPngMetadataFromUint8Array } from '../utils/png/_getPngMetadata'

// prettier-ignore
export type LoadStrategy =
    | 'asCushyStudioAction'
    | 'asComfyUIWorkflow'
    | 'asComfyUIPrompt'
    | 'asComfyUIGeneratedPng'
    | 'asA1111PngGenerated'

// prettier-ignore
type LoadStatus =
    | { type: 'SUCCESS', script: CushyScriptL, warning?: string }
    | { type: 'FAILURE', msg?: string }

// prettier-ignore
export type ScriptExtractionResult =
    | { type: 'failed' }
    | { type: 'cached', script: CushyScriptL }
    | { type: 'newScript'; script: CushyScriptL }

/**
 * wrapper around files in the library folder
 * responsible to convert files to scripts
 */
export class LibraryFile {
   constructor(
      public library: Library,
      public absPath: AbsolutePath,
      public relPath: RelativePath,
   ) {
      this.st = library.st
      this.strategies = this.findLoadStrategies()
      makeAutoObservable(this, {
         fPath: false,
         _esbuildContext: false,
      })
   }

   /** the new abstraction around files */
   get fPath(): FPath {
      const out = new FPath(this.absPath)
      Object.defineProperty(this, 'fPath', { value: out })
      return out
   }

   get baseName(): string {
      return basename(this.relPath)
   }
   /** access to the global app state */
   st: STATE

   /** abs path to the folder this file is in */
   get folderAbs(): AbsolutePath {
      // console.log(`[🧐] 🔴`, dirname(this.absPath))
      return asAbsolutePath(dirname(this.absPath))
   }

   /** true if file match current library search */
   matchesSearch = (search: string): boolean => {
      if (search === '') return true
      const searchLower = search.toLowerCase()
      const nameLower = basename(this.relPath).toLowerCase()
      return nameLower.includes(searchLower)
   }

   // scripts = new LiveCollection<CushyScriptL>({
   //     table: () => this.st.db.cushy_scripts,
   //     where: () => ({ path: this.relPath }),
   // })

   get scriptInDB(): Maybe<CushyScriptL> {
      return this.st.db.cushy_script.get(this.relPath) // script is IS the relPath
      // return this.st.db.cushy_scripts.findOne({ path: this.relPath })
   }

   strategies: LoadStrategy[] = []

   // --------------------------------------------------------
   // loaded = new ManualPromise<true>()
   errors: {
      title: string
      body: string
      details?: any
   }[] = []
   resetErrors(): void {
      this.errors = []
   }
   addError(title: string, details: any = null): LoadStatus {
      this.errors.push({ title, body: extractErrorMessage(details), details })
      return { type: 'FAILURE' }
   }

   // the first thing to do to load an app is to get the Cushy Script from it.
   private codeJS?: Maybe<string> = null
   private metafile?: Maybe<Metafile> = null

   liteGraphJSON?: Maybe<LiteGraphJSON> = null
   promptJSON?: Maybe<ComfyUIAPIRequest> = null
   png?: Maybe<AbsolutePath> = null

   get script(): Maybe<CushyScriptL> {
      if (this.lastSuccessfullExtractedScriptDuringSession)
         return this.lastSuccessfullExtractedScriptDuringSession
      if (this.scriptInDB) return this.scriptInDB
      void this.extractScriptFromFile()
      return null
   }
   /** load a file trying all compatible strategies */
   private successfullLoadStrategies: Maybe<LoadStrategy> = null
   private lastSuccessfullExtractedScriptDuringSession: Maybe<CushyScriptL> = null
   scriptExtractionAttemptedOnce: boolean = false
   currentScriptExtractionPromise: Maybe<ManualPromise<ScriptExtractionResult>> = null

   extractScriptFromFileAndUpdateApps = async (p?: { force?: boolean }): Promise<ScriptExtractionResult> => {
      const res: ScriptExtractionResult = await this.extractScriptFromFile(p)
      if (res.type === 'failed') {
         toastError(`${this.relPath} failed to load`)
         return res
      }
      const script = res.script
      script.evaluateAndUpdateAppsAndViews()
      return res
   }

   strategyStatus: { [key in LoadStrategy]?: string } = {}

   // 🔶 TODO: split into two functions for easier code path understanding from
   // 🔶 other locations.
   extractScriptFromFile = async (p?: { force?: boolean }): Promise<ScriptExtractionResult> => {
      // RACE CONDITIONS PREVENTION:
      // if we're alreay trying to extract => just return the current promise
      if (this.currentScriptExtractionPromise) {
         console.log(`[🔴] currentScriptExtractionPromise already present`)
         return this.currentScriptExtractionPromise
      }
      const currentScriptExtractionPromise = new ManualPromise<ScriptExtractionResult>()
      this.currentScriptExtractionPromise = currentScriptExtractionPromise

      // PERF: if we have alreay attempted extraction once, and if we don't have
      // any hint that re-trying will yield something different, let's just return
      // the cached value
      if (!p?.force) {
         // if we have already attempted extraction once during this session, return it
         if (this.lastSuccessfullExtractedScriptDuringSession) {
            this.currentScriptExtractionPromise = null
            return { type: 'cached', script: this.lastSuccessfullExtractedScriptDuringSession }
         }

         // if we have already attempted extraction once in a previous session, return it
         const scriptFromDB = this.st.db.cushy_script.get(this.relPath)
         if (scriptFromDB) {
            this.currentScriptExtractionPromise = null
            return { type: 'cached', script: scriptFromDB }
         }
         console.log(`[🔴] SEEING ${this.relPath} FOR THE FIRST TIME`)
      }

      // try every strategy in order
      let script: Maybe<CushyScriptL> = null
      this.strategyStatus = {}
      this.resetErrors()

      console.log(`[🔴] extracting ${this.relPath}`)
      for (const strategy of this.strategies) {
         const res = await this.loadWithStrategy(strategy)
         if (res.type === 'SUCCESS') {
            runInAction(() => {
               script = res.script
               this.lastSuccessfullExtractedScriptDuringSession = res.script
               this.successfullLoadStrategies = strategy
               this.strategyStatus[strategy] = res.warning ? `⚠️ ${res.warning}` : '✅'
               // console.log(`[🟢] LibFile: LOAD SUCCESS !`)
            })
            break
         } else {
            runInAction(() => {
               this.strategyStatus[strategy] = `❌ failed with error: "${res.msg}"`
            })
         }
      }

      // done
      this.scriptExtractionAttemptedOnce = true
      if (script == null) {
         console.log(`[🔴] LibFile: LOAD FAILURE !`)
         const RESULT: ScriptExtractionResult = { type: 'failed' }
         this.currentScriptExtractionPromise.resolve(RESULT)
         this.currentScriptExtractionPromise = null

         const scriptFromDB = this.st.db.cushy_script.get(this.relPath)
         if (scriptFromDB == null) {
            this.UPSERT_SCRIPT(`/* ERROR */`)
         }

         return RESULT
      } else {
         const RESULT: ScriptExtractionResult = { type: 'newScript', script }
         this.currentScriptExtractionPromise.resolve(RESULT)
         this.currentScriptExtractionPromise = null
         return RESULT
      }
   }

   private loadWithStrategy = async (strategy: LoadStrategy): Promise<LoadStatus> => {
      if (strategy === 'asCushyStudioAction') return this.load_asTypescriptFile()
      if (strategy === 'asComfyUIPrompt') return this.load_asComfyUIPromptJSON()
      if (strategy === 'asComfyUIWorkflow') return this.load_asComfyUIWorkflowJSON()
      if (strategy === 'asComfyUIGeneratedPng') return this.load_asComfyUIGeneratedPng()
      if (strategy === 'asA1111PngGenerated') {
         if (this.png == null) this.png = this.absPath
         this.addError('❌ can not import file as Automaric1111 image', 'not supported yet')
         return { type: 'FAILURE' }
      }

      exhaust(strategy)
      throw new Error(`[💔] TOOL: unknown strategy ${strategy}`)
      // if (strategy)
   }

   // STRATEGIES ---------------------------------------------------------------------
   private findLoadStrategies(): LoadStrategy[] {
      if (this.absPath.endsWith('.ts')) return ['asCushyStudioAction']
      if (this.absPath.endsWith('.tsx')) return ['asCushyStudioAction']
      if (this.absPath.endsWith('.js')) return ['asCushyStudioAction']
      if (this.absPath.endsWith('.json')) return ['asComfyUIWorkflow', 'asComfyUIPrompt']
      if (this.absPath.endsWith('.png')) return ['asComfyUIGeneratedPng', 'asA1111PngGenerated']
      return [
         'asCushyStudioAction',
         'asComfyUIWorkflow',
         'asComfyUIPrompt',
         'asComfyUIGeneratedPng',
         'asA1111PngGenerated',
      ]
   }

   // LOADERS ------------------------------------------------------------------------
   // ACTION

   // public syncS

   private load_asTypescriptFile = async (): Promise<LoadStatus> => {
      try {
         // 1. transpile
         // await this.pkg.rebuild()
         // console.log('-- a', { eps: this.relPath })
         const ctx = await this._esbuildContext
         let res: BuildResult
         try {
            res = await ctx.rebuild()
         } catch (e) {
            console.error(`[🔴] LibraryFile > load_asTypescriptFile > ctx.rebuild() failed`, e)
            return { type: 'FAILURE', msg: extractErrorMessage(e) }
         }
         if (res.metafile == null) {
            return this.addError('❌ transpile error in load_asCushyStudioAction; res.metafile is null', '')
         }
         const fenceResult = checkLibraryScriptFences(this.relPath, res.metafile)
         if (!fenceResult.isValid) {
            return this.addError(
               `❌ transpile error in load_asCushyStudioAction; fences failed`,
               fenceResult.summary.text,
            )
         }

         if (res.outputFiles == null) {
            return this.addError(
               '❌ transpile error in load_asCushyStudioAction; res.outputFiles is null',
               null,
            )
         }

         if (res.outputFiles.length === 0) {
            return this.addError(
               '❌ transpile error in load_asCushyStudioAction; res.outputFiles is empty',
               null,
            )
         }
         // console.log(`[🧐] res`, Object.keys(res.metafile.inputs))
         //                                    🔴   V
         const outFile: OutputFile = res.outputFiles[0]!
         if (outFile.text == null) throw new Error('compilation failed')

         // const distPathWrongExt = path.join(this.folderAbs, 'dist', this.deckRelativeFilePath)
         // const ext = path.extname(distPathWrongExt)
         // const distPathJS = distPathWrongExt.slice(0, -ext.length) + '.js'

         this.codeJS = outFile.text // readFileSync(distPathJS, 'utf-8')
         this.metafile = res.metafile as Metafile
         const script = this.UPSERT_SCRIPT(this.codeJS, this.metafile)

         // 2. extract tools
         return { type: 'SUCCESS', script: script }
      } catch (e) {
         console.error(`[🔴] failed to load ${this.relPath}`, e)
         return this.addError('transpile error in load_asCushyStudioAction', e)
      }
   }
   /** the persistent esbuild context, used to allow for fast rebundling */
   get _esbuildContext(): Promise<BuildContext<any>> {
      // ensure typescript files
      if (!this.relPath.endsWith('.ts') && !this.relPath.endsWith('.tsx'))
         throw new Error('esbuild can only work on .ts or .tsx files')
      // create context
      const context = createEsbuildContextFor({
         entrypoints: [this.absPath],
         root: this.folderAbs,
      })
      // cache it
      Object.defineProperty(this, '_esbuildContext', {
         value: context,
      })
      return context
   }

   // PROMPT
   private load_asComfyUIPromptJSON = async (): Promise<LoadStatus> => {
      try {
         const comfyPromptJSON = JSON.parse(readFileSync(this.absPath, 'utf-8'))
         const filename = path.basename(this.absPath)
         const author = path.dirname(this.absPath)
         const title = filename
         this.codeJS = this.st.importer.convertPromptToCode(comfyPromptJSON, {
            title,
            author,
            preserveId: true,
            autoUI: false,
         })
         this.promptJSON = comfyPromptJSON
         return { type: 'SUCCESS', script: this.UPSERT_SCRIPT(this.codeJS) }
         // ⏸️ const graph = this.st.db.graphs.create({ comfyPromptJSON: comfyPromptJSON })
         // ⏸️ const workflow = await graph.json_workflow()
         // ⏸️ this.liteGraphJSON = workflow
         // ⏸️ return LoadStatus.SUCCESS
         // 🦊 const codeJSAuto = this.st.importer.convertPromptToCode(json, { title, author, preserveId: true, autoUI: true })
         // 🦊 const codeTSAuto = codeJS
         // 🦊 const toolsAuto =  this.RUN_ACTION_FILE({ codeJS: codeJSAuto })
         // 🦊 this.asAutoAction = __OK({ codeJS: codeJSAuto, codeTS: codeTSAuto, tools: toolsAuto }) // 🟢 AUTOACTION
      } catch (error) {
         return this.addError(`❌ [load_asComfyUIPrompt] crash`, error)
      }
   }

   // WOKRFLOW
   private load_asComfyUIWorkflowJSON = (): Promise<LoadStatus> => {
      const workflowStr = readFileSync(this.absPath, 'utf-8')
      return this.importWorkflowFromStr(workflowStr)
   }

   private load_asComfyUIGeneratedPng = async (): Promise<LoadStatus> => {
      console.log('🟢 found ', this.absPath)
      this.png = this.absPath

      // extract metadata
      const result = getPngMetadataFromUint8Array(readFileSync(this.absPath))
      if (result == null) return this.addError(`❌ [load_asComfyUIGeneratedPng] no metadata in png`, null)
      if (!result.success)
         return this.addError(`❌ [load_asComfyUIGeneratedPng] metadata extraction failed`, result.value)
      const metadata = result.value
      const workflowStr: string = (metadata as { [key: string]: any }).workflow
      // const promptStr: string = (metadata as { [key: string]: any }).prompt

      if (workflowStr == null)
         return this.addError(`❌ [load_asComfyUIGeneratedPng] no workflow in metadata`, metadata)
      const res = await this.importWorkflowFromStr(workflowStr, { illustration: this.relPath })
      return res
   }

   // LOADERS ------------------------------------------------------------------------
   private importWorkflowFromStr = async (
      workflowStr: string,
      metadata: AppMetadata = {},
   ): Promise<LoadStatus> => {
      // 1. litegraphJSON
      let workflowJSON: LiteGraphJSON
      try {
         workflowJSON = JSON.parse(workflowStr)
      } catch (error) {
         return this.addError(`❌3. workflow is not valid json`, error)
      }

      // 2. promptJSON
      let promptJSON: ComfyUIAPIRequest
      try {
         promptJSON = convertLiteGraphToPrompt(this.st.schema, workflowJSON)
      } catch (error) {
         console.error(error)
         return this.addError(`❌ failed to import workflow: cannot convert LiteGraph To Prompt`, error)
      }
      // at this point, we know the workflow is valid
      // and we have both the prompt, and the workflow
      this.liteGraphJSON = workflowJSON
      this.promptJSON = promptJSON

      // 3. asAction
      try {
         this.codeJS = this.st.importer.convertPromptToCode(promptJSON, {
            // metadat
            illustration: metadata.illustration,
            author: metadata.author,
            title: metadata.name ?? path.basename(this.absPath),
            // codegen
            preserveId: true,
            autoUI: true,
         })
         // this.codeTS = this.codeJS
         return { type: 'SUCCESS', script: this.UPSERT_SCRIPT(this.codeJS) }
      } catch (error) {
         return this.addError(`❌ failed to import workflow: cannot convert LiteGraph To Prompt`, error)
      }
   }

   UPSERT_SCRIPT = (
      //
      codeJS: string,
      metafile?: Metafile,
   ): CushyScriptL => {
      console.groupCollapsed(`[🧐] script extracted for ${this.relPath}`)
      console.log(codeJS)
      console.groupEnd()
      const script = this.st.db.cushy_script.upsert({
         id: asCushyScriptID(this.relPath),
         code: codeJS,
         path: this.relPath,
         metafile: metafile ?? null,
         lastExtractedAt: Date.now(),
      })
      // this.script = script
      return script
   }
}
