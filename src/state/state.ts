// VERY IMPORTANT: Dependency Injection for runtime
import '../models/asyncRuntimeStorage'

import type { ResilientWebSocketClient } from '../back/ResilientWebsocket'
import type { ActionTagMethodList } from '../cards/App'
import type { GithubRepoName } from '../cards/githubRepo'
import type { GithubUserName } from '../cards/GithubUser'
import type { ComfyNodeSlotName, ComfyUnionValue } from '../comfyui/comfyui-types'
import type { PreferedFormLayout } from '../config/ConfigFile'
import type { JsonFile } from '../core/JsonFile'
import type { Activity } from '../csuite/activity/Activity'
import type { CSuiteConfig } from '../csuite/ctx/CSuiteConfig'
import type { Tint } from '../csuite/kolor/Tint'
import type { AnyFieldSerial } from '../csuite/model/EntitySerial'
import type { RegionMonitor } from '../csuite/regions/RegionMonitor'
import type { TreeNode } from '../csuite/tree/TreeNode'
import type { Timestamp } from '../csuite/types/Timestamp'
import type { LiveDB } from '../db/LiveDB'
import type { ComfyManagerModelInfo } from '../manager/types/ComfyManagerModelInfo'
import type { ComfySchemaL } from '../models/ComfySchema'
import type { ComfyWorkflowL } from '../models/ComfyWorkflow'
import type { CushyAppL } from '../models/CushyApp'
import type { DraftL } from '../models/Draft'
import type { HostL } from '../models/Host'
import type { MediaImageL } from '../models/MediaImage'
import type { ProjectL } from '../models/Project'
import type { StepL } from '../models/Step'
import type { PreferenceMode } from '../panels/PanelPreferences/PanelPreferences'
import type { Database } from '../supa/database.types'
import type { CleanedEnumResult } from '../types/EnumUtils'
import type { StepOutput } from '../types/StepOutput'
import type { CSCriticalError } from '../widgets/CSCriticalError'
import type { Wildcards } from '../widgets/prompter/nodes/wildcards/wildcards'
import type { SupabaseClient } from '@supabase/supabase-js'

import { closest } from 'fastest-levenshtein'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { makeAutoObservable, observable, toJS } from 'mobx'
import { nanoid } from 'nanoid'
import { join } from 'pathe'
import { createRef } from 'react'
import { fromZodError } from 'zod-validation-error'

import { asAppPath } from '../cards/asAppPath'
import { Library } from '../cards/Library'
import { recursivelyFindAppsInFolder } from '../cards/walkLib'
import { STANDARD_HOST_ID } from '../config/ComfyHostDef'
import { type ConfigFile } from '../config/ConfigFile'
import { mkConfigFile } from '../config/mkConfigFile'
import { builder, cushyFactory, type CushyFactory } from '../controls/CushyBuilder'
import { Channel } from '../csuite' // WIP remove me 2024-06-25 🔴
import { activityManager, type ActivityManager } from '../csuite/activity/ActivityManager'
import { commandManager, type CommandManager } from '../csuite/commands/CommandManager'
import { CSuite_ThemeCushy } from '../csuite/ctx/CSuite_ThemeCushy'
import { run_tint } from '../csuite/kolor/prefab_Tint'
import { getGlobalRepository } from '../csuite/model/Repository'
import { regionMonitor } from '../csuite/regions/RegionMonitor'
import { createRandomGenerator } from '../csuite/rnd/createRandomGenerator'
import { Tree, type TreeStorageConfig } from '../csuite/tree/Tree'
import { treeElement } from '../csuite/tree/TreeEntry'
import { TreeView } from '../csuite/tree/TreeView'
import { VirtualHierarchy } from '../csuite/tree/VirtualHierarchy'
import { type SQLITE_boolean_, SQLITE_false, SQLITE_true } from '../csuite/types/SQLITE_boolean'
import { exhaust } from '../csuite/utils/exhaust'
import { toastError } from '../csuite/utils/toasts'
import { liveDB } from '../db/LiveDB'
import { quickBench } from '../db/quickBench'
import { asHostID } from '../db/TYPES.gen'
import { ComfyImporter } from '../importers/ComfyImporter'
import { ComfyManagerRepository } from '../manager/ComfyManagerRepository'
import { createMediaImage_fromPath } from '../models/createMediaImage_fromWebFile'
import { FPath } from '../models/FPath'
import { TreeApp } from '../panels/libraryUI/tree/nodes/TreeApp'
import { TreeDraft } from '../panels/libraryUI/tree/nodes/TreeDraft'
import {
   TreeAllApps,
   TreeAllDrafts,
   TreeFavoriteApps,
   TreeFavoriteDrafts,
} from '../panels/libraryUI/tree/nodes/TreeFavorites'
import { TreeFolder } from '../panels/libraryUI/tree/nodes/TreeFolder'
import { CushyLayoutManager } from '../router/Layout'
import { SafetyChecker } from '../safety/Safety'
import {
   type ComfyStatus,
   type PromptID,
   type PromptRelated_WsMsg,
   type WsMsg,
   WsMsg$Schema,
} from '../types/ComfyWsApi'
import { GitManagedFolder } from '../updater/updater'
import { ElectronUtils } from '../utils/electron/ElectronUtils'
import { SearchManager } from '../utils/electron/findInPage'
import { openInVSCode } from '../utils/electron/openInVsCode'
import { asAbsolutePath, asRelativePath } from '../utils/fs/pathUtils'
import { CushyDnDHandler } from '../widgets/galleries/dndIndicatorUI'
import { DanbooruTags } from '../widgets/prompter/nodes/booru/BooruLoader'
import { UserTags } from '../widgets/prompter/nodes/usertags/UserLoader'
import { AuthState } from './AuthState'
import { type $schemaFavbar, interfaceConf } from './conf/interfaceConf'
import { systemConf } from './conf/systemConf'
import { themeConf } from './conf/themeConf'
import { readJSON, writeJSON } from './jsonUtils'
import { Marketplace } from './Marketplace'
import { mkSupa } from './supa'
import { Uploader } from './Uploader'

export class STATE {
   // LEAVE THIS AT THE TOP OF THIS CLASS
   __INJECTION__: void = INJECT_CUSHY_GLOBALLY(this)

   /** hack to help closing prompt completions */
   currentPromptFocused: Maybe<HTMLDivElement> = null

   //file utils that need to be setup first because
   Channel = Channel // WIP remove me 2024-06-25 🔴
   resolve = (from: AbsolutePath, relativePath: RelativePath): AbsolutePath =>
      asAbsolutePath(join(from, relativePath))
   layout: CushyLayoutManager
   uid: string = nanoid() // front uid to fix hot reload
   db: LiveDB // core data
   uploader: Uploader
   supabase: SupabaseClient<Database>
   auth: AuthState
   comfyAddons = new ComfyManagerRepository({ check: false, genTypes: false })
   search: SearchManager = new SearchManager(this)
   forms: CushyFactory = cushyFactory
   repository = getGlobalRepository()
   commands: CommandManager = commandManager
   region: RegionMonitor = regionMonitor
   builder = builder
   tree1: Tree
   tree1View: TreeView
   tree2: Tree
   tree2View: TreeView
   libraryFolderPathAbs: AbsolutePath
   libraryFolderPathRel: RelativePath
   outputFolderPath: AbsolutePath
   status: ComfyStatus | null = null
   graphHovered: Maybe<{ graph: ComfyWorkflowL; pctTop: number; pctLeft: number }> = null
   sid: Maybe<string> = null
   comfyStatus: Maybe<ComfyStatus> = null
   configFile: JsonFile<ConfigFile>
   configMode: PreferenceMode = 'legacy'
   updater: GitManagedFolder
   hovered: Maybe<StepOutput> = null
   electron: ElectronUtils
   library: Library
   danbooru: DanbooruTags
   userTags = UserTags.build()
   actionTags: ActionTagMethodList = []
   importer: ComfyImporter

   _updateTime(): void {
      const now = Date.now()
      // console.log(`time is now ${now}`)
      this.liveTime = Math.round(now / 1000)
   }

   /** mobx hack to make things refresh every few seconds */
   liveTime: number = ((): Timestamp => {
      const store = this.hotReloadPersistentCache
      if (store.liveTimeInterval != null) clearInterval(store.liveTimeInterval)
      store.liveTimeInterval = setInterval(() => this._updateTime, 1000)
      return Date.now() as Timestamp
   })()

   get clickAndSlideMultiplicator(): number {
      return cushy.configFile.get('numberSliderSpeed') ?? 1
   }

   startupFileIndexing = async (): Promise<void> => {
      const allFiles = recursivelyFindAppsInFolder(this.library, this.libraryFolderPathAbs)
      console.log(`[🚧] startupFileIndexing: found ${allFiles.length} files`)
      for (const x of allFiles) await x.extractScriptFromFile()
   }

   forceRefreshAllApps = async (): Promise<void> => {
      const allFiles = recursivelyFindAppsInFolder(this.library, this.libraryFolderPathAbs)
      console.log(`[🚧] forceRefreshAllApps: found ${allFiles.length} files`)
      for (const x of allFiles) await x.extractScriptFromFileAndUpdateApps({ force: true })
   }
   /**
    * global hotReload persistent cache that should survive hot reload
    * useful to ensure various singleton stuff (e.g. dbHealth)
    */
   get hotReloadPersistentCache(): { [key: string]: any } {
      const globalRef = globalThis as any
      if (globalRef.__hotReloadPersistentCache == null) globalRef.__hotReloadPersistentCache = {}
      return globalRef.__hotReloadPersistentCache
   }

   hasWildcard = (name: string): boolean => (this.wildcards as { [k: string]: any })[name] != null
   get wildcards(): Wildcards {
      const wcdsPath = this.resolveFromRoot(
         asRelativePath('src/widgets/prompter/nodes/wildcards/wildcards.json'),
      )
      const wcds = this.readJSON_<Wildcards>(wcdsPath)
      Object.defineProperty(this, 'wildcards', { value: wcds })
      return wcds
   }

   get defaultImage(): MediaImageL {
      const def = this.db.media_image.select((t) => t.where('path', '=', 'public/CushyLogo-512.png').limit(1))
      // const def = this.db.media_images.find({ path: 'public/CushyLogo-512.png' }, { limit: 1 })
      if (def[0] == null) return createMediaImage_fromPath(new FPath('public/CushyLogo-512.png'))
      return def[0]
   }

   openInVSCode(filePathWithinWorkspace: RelativePath): Promise<void> {
      return openInVSCode(filePathWithinWorkspace)
   }

   getKnownCheckpoints(): ComfyManagerModelInfo[] {
      return this.comfyAddons.getKnownCheckpoints()
   }

   reloadCushyMainWindow(): void {
      window.location.reload()
   }

   fullReset_eraseConfigAndSchemaFilesAndDB(): void {
      this.configFile.erase()
      this.db.erase()
      this.reloadCushyMainWindow()
   }

   resizeWindowForVideoCapture(): void {
      const ipcRenderer = window.require('electron').ipcRenderer
      ipcRenderer.send('resize-for-video-capture')
   }

   resizeWindowForLaptop(): void {
      const ipcRenderer = window.require('electron').ipcRenderer
      ipcRenderer.send('resize-for-laptop')
   }

   partialReset_eraseConfigAndSchemaFiles(): void {
      this.configFile.erase()
      this.reloadCushyMainWindow()
   }

   // main state api
   get schema(): ComfySchemaL {
      return this.mainHost.schema
   }

   showCommandHistory: boolean = false

   comfySessionId: string = 'temp' /** send by ComfyUI server */

   // paths
   cacheFolderPath: AbsolutePath

   /**
    * get the configured trigger words for the given lora
    * (those are user defined; hover your lora in any rich text prompt to edit them)
    */
   getLoraAssociatedTriggerWords = (loraName: string): Maybe<string> => {
      return this.configFile.value?.loraPrompts?.[loraName]?.text
   }

   /** helper to chose radomly any item from a list */
   chooseRandomly = <T>(key: string, seed: number, arr: T[]): T => {
      return createRandomGenerator(`${key}:${seed}`).randomItem(arr)!
   }

   get preferedFormLayout(): Maybe<PreferedFormLayout> {
      return this.configFile.value.preferedFormLayout ?? 'auto'
   }

   set preferedFormLayout(v: PreferedFormLayout) {
      this.configFile.update({ preferedFormLayout: v })
   }

   // history app size
   get historySizeStr(): string {
      return `${this.historySize}px`
   }

   set historySize(v: number) {
      this.configFile.update({ historyAppSize: v })
   }

   get historySize(): number {
      return this.configFile.value.historyAppSize ?? 32
   }

   // 🔴 MOVE THAT IN FIELD
   // latent size pct
   get latentSizeStr(): string {
      return `${this.latentSize}%`
   }

   // 🔴 MOVE THAT IN FIELD
   set latentSize(v: number) {
      this.configFile.update({ latentPreviewSize: v })
   }

   // 🔴 MOVE THAT IN FIELD
   get latentSize(): number {
      return this.configFile.value.latentPreviewSize ?? 25
   }

   //
   get githubUsername(): Maybe<GithubUserName> {
      return this.configFile.value.githubUsername as Maybe<GithubUserName>
   }

   get favoriteApps(): CushyAppL[] {
      return this.db.cushy_app.select(
         (q) => q.where('isFavorite', '=', SQLITE_true),
         ['cushy_app.isFavorite'],
      )
   }

   get favoriteDrafts(): DraftL[] {
      return this.db.draft.select((q) => q.where('isFavorite', '=', SQLITE_true), ['draft.isFavorite'])
   }

   get canvasTools(): DraftL[] {
      return this.db.draft.select(
         (q) => q.where('canvasToolCategory', '!=', 'null'),
         ['draft.canvasToolCategory'],
      )
   }

   getCanvasToolsInCategory = (category: string): DraftL[] =>
      this.db.draft.select((q) => q.where('canvasToolCategory', '=', category), ['draft.canvasToolCategory'])
   /** list of all unified canvas tool categories */
   get canvasCategories(): string[] {
      return this.db.draft
         .selectRaw((q) => q.select('canvasToolCategory').distinct(), ['draft.canvasToolCategory'])
         .map((x) => x.canvasToolCategory!)
         .filter(Boolean)
   }
   get allDrafts(): DraftL[] { return this.db.draft.select() } // prettier-ignore
   get allApps(): CushyAppL[] { return this.db.cushy_app.select() } // prettier-ignore
   get allImageApps(): CushyAppL[] { return this.db.cushy_app.select(q => q.where('canStartFromImage','=', SQLITE_true)) } // prettier-ignore

   virtualDraftHierarchy = new VirtualHierarchy(() => this.allDrafts)
   virtualAppHierarchy = new VirtualHierarchy(() => this.allApps)
   // ---------------------------------------------------
   // --------------------------------------------------

   /** @deprecated */
   getConfigValue<K extends keyof ConfigFile>(k: K): ConfigFile[K] {
      return this.configFile.value[k]
   }

   /** @deprecated */
   setConfigValue<K extends keyof ConfigFile>(k: K, v: ConfigFile[K]): void {
      return this.configFile.update({ [k]: v })
   }

   /** @deprecated */
   isConfigValueEq<K extends keyof ConfigFile>(k: K, val: ConfigFile[K]): boolean {
      return this.configFile.value[k] === val
   }

   // ---------------------------------------------------
   // --------------------------------------------------
   get showPreviewInPanel(): boolean {
      return this.configFile.value.showPreviewInPanel ?? true
   }

   set showPreviewInPanel(v: boolean) {
      this.configFile.update({ showPreviewInPanel: v })
   }

   droppedFiles: File[] = []

   toggleFullLibrary(): void {
      this.layout.open('PanelAppLibrary', {})
   }

   /**
    * 🔴 this is not the right way to go cause it will cause the action to stay
    * pending in the background: fix that LATER™️
    */
   async stopCurrentPrompt(): Promise<void> {
      const promptEndpoint = `${this.getServerHostHTTP()}/interrupt`
      const res = await fetch(promptEndpoint, { method: 'POST' })
      console.log('🔥 INTERRUPTED.')
   }

   getProject = (): ProjectL => {
      if (this.db.project.size > 0) {
         return this.db.project.firstOrCrash()
      }
      console.log(`[🛋️] creating project`)
      const initialGraph = this.db.comfy_workflow.create({ comfyPromptJSON: {}, metadata: {} })
      const defaultAppPath = asAppPath('library/CushyStudio/default/SDUI.ts')
      // const initialDraft = this.db.drafts.create({
      //     appParams: {},
      //     title: 'initial draft',
      //     appPath: defaultAppPath,
      //     isOpened: SQLITE_true,
      // })
      const project = this.db.project.create({
         rootGraphID: initialGraph.id,
         name: 'new project',
         currentApp: defaultAppPath,
         filterNSFW: SQLITE_false,
         autostartDelay: 0,
         autostartMaxDelay: 100,
      })
      return project
   }

   safetyChecker = new SafetyChecker(this)
   draftsFolded: boolean = false

   fixEnumValue = (
      //
      candidateValue: Maybe<ComfyUnionValue>,
      slotName: ComfyNodeSlotName,
   ): CleanedEnumResult<any> => {
      // 0. retrieve enum dev
      const possibleValues = this.schema.knownUnionBySlotName.get(slotName)?.values ?? []

      // 1. when enum is empty
      if (possibleValues.length == 0) {
         return {
            finalValue: candidateValue ?? '❌ no value',
            ENUM_HAS_NO_VALUES: true,
            isSubstitute: candidateValue != null,
            candidateValue,
         }
      }

      // 2. when value is null
      if (candidateValue == null) {
         return { finalValue: possibleValues[0], isSubstitute: true, candidateValue }
      }

      // 3. when value is correct
      if (possibleValues.includes(candidateValue as any))
         return { finalValue: candidateValue, isSubstitute: false, candidateValue }

      // 4. when value is incorrect
      const possibleValuesStr = possibleValues.map((v) => v.toString())
      const closestMatch = closest(candidateValue.toString(), possibleValuesStr)
      const ix = possibleValuesStr.indexOf(closestMatch)
      if (ix === -1) throw new Error(`❌ THE IMPOSSIBLE HAPPENED IN 'FixEnumValue'`)
      return { finalValue: possibleValues[ix], isSubstitute: true, candidateValue }
   }

   comfyUIIframeRef = createRef<HTMLIFrameElement>()
   // dndVisualRef = createRef<HTMLDivElement>()
   dndHandler = new CushyDnDHandler()

   expandNodes: boolean = false

   showConfettiAndBringFun = async (): Promise<void> => {
      const confetti = (await import('https://cdn.skypack.dev/canvas-confetti' as any)).default
      confetti()
   }

   get autolayoutOpts(): {
      node_hsep: number
      node_vsep: number
      forceLeft: boolean
   } {
      const fv = this.graphConf.value
      return {
         node_hsep: fv.hsep,
         node_vsep: fv.vsep,
         forceLeft: fv.forceLeft,
      }
   }

   graphConf = cushyFactory.document(
      (b) =>
         b.fields({
            spline: b.float({ min: 0.5, max: 4, default: 2 }),
            vsep: b.int({ min: 0, max: 100, default: 20 }),
            hsep: b.int({ min: 0, max: 100, default: 20 }),
            forceLeft: b.bool(),
         }),
      {
         name: 'Graph Visualisation',
         serial: () => readJSON('settings/graph-visualization.json'),
         onSerialChange: (form) => writeJSON('settings/graph-visualization.json', form.serial),
      },
   )

   /** practical shortcut to start activity */
   startActivity(activity: Activity): void {
      activityManager.start(activity)
   }

   get activityManager(): ActivityManager {
      return activityManager
   }

   civitaiConf = cushyFactory.document(
      (b) =>
         b.fields({
            imgSize1: b.int({ min: 64, max: 1024, step: 64, default: 512 }),
            imgSize2: b.int({ min: 64, max: 1024, step: 64, default: 128 }),
            apiKey: b.string({ label: 'API Key' }),
            defaultQuery: b.string({ label: '(debug) default query' }),
            // civitaiApiSecret: ui.string({ label: 'API Secret' }),
         }),
      {
         name: 'Civitai Conf',
         serial: () => readJSON('settings/civitai.json'),
         onSerialChange: (form) => writeJSON('settings/civitai.json', form.serial),
      },
   )
   get favbar(): $schemaFavbar['$Field'] {
      return this.preferences.interface.fields.favBar
   }
   // favbar = cushyFactory.document(
   //     (b) =>
   //         b.fields({
   //             size: b.int({ text: 'Size', min: 24, max: 128, default: 48, suffix: 'px', step: 4 }),
   //             visible: b.bool(),
   //             grayscale: b.boolean({ label: 'Grayscale' }),
   //             appIcons: b.int({ text: 'App Icons', default: 100, step: 10, min: 1, max: 100, suffix: '%' }).optional(true),
   //         }),
   //     {
   //         name: 'SideBar Conf',
   //         serial: () => readJSON('settings/sidebar.json'),
   //         onSerialChange: (form) => writeJSON('settings/sidebar.json', form.serial),
   //     },
   // )

   /* TODO: This should be in a separate register_internal_forms file probably, along with any other headers we register in the future. After we can register them that is. */
   // playgroundHeader = Header_Playground
   // playgroundWidgetDisplay = FORM_PlaygroundWidgetDisplay

   displacementConf = cushyFactory.document(
      (b) =>
         b.fields({
            camera: b.choice({ orbit: b.group(), fly: b.group({}) }, { appearance: 'tab' }),
            menu: b.choice({ menu: b.group(), left: b.group(), right: b.group({}) }, { appearance: 'tab' }),
            displacementScale: b.number({ label: 'displacement', min: 0, max: 5, step: 0.1, default: 1 }),
            cutout: b.number({ label: 'cutout', min: 0, max: 1, step: 0.01, default: 0.08 }),
            removeBackground: b.number({ label: 'remove bg', min: 0, max: 1, step: 0.01, default: 0.2 }),
            ambientLightIntensity: b.number({ label: 'light', min: 0, max: 8, default: 1.5 }),
            ambientLightColor: b.colorV2({ label: 'light color', default: '#ffffff' }),
            isSymmetric: b.boolean({ label: 'Symmetric Model' }),
            // takeScreenshot: form.inlineRun({ label: 'Screenshot' }),
            metalness: b.float({ min: 0, max: 1 }),
            roughness: b.float({ min: 0, max: 1 }),
            skyBox: b.bool({}),
            ground: b.bool({}),
            usePoints: b.boolean({ label: 'Points', default: false }),
         }),
      {
         name: 'Displacement Conf',
         serial: () => readJSON<AnyFieldSerial>('settings/displacement.json'),
         onSerialChange: (form) => writeJSON('settings/displacement.json', form.serial),
      },
   )

   project: ProjectL
   primarySdkDtsPath: AbsolutePath
   marketplace: Marketplace

   constructor(
      /** path of the workspace */
      public rootPath: AbsolutePath,
   ) {
      // -----------------------------------------------------------
      // console.log('[🛋️] starting Cushy')
      this.cacheFolderPath = this.resolve(this.rootPath, asRelativePath('outputs'))
      this.primarySdkDtsPath = this.resolve(this.rootPath, asRelativePath('schema/global.d.ts'))
      this.outputFolderPath = this.cacheFolderPath // this.resolve(this.cacheFolderPath, asRelativePath('outputs'))
      this.libraryFolderPathRel = asRelativePath('library')
      this.libraryFolderPathAbs = this.resolve(this.rootPath, this.libraryFolderPathRel)

      // config files
      this.configFile = mkConfigFile()

      // core instances
      this.db = liveDB // new LiveDB()
      console.log(`[🤠] assing liveDB db`, liveDB._uid)
      this.supabase = mkSupa()
      this.marketplace = new Marketplace(this)
      this.electron = new ElectronUtils(this)
      // this.shortcuts = new CommandManager(allCommands, this, { name: nanoid() })
      // console.log(`[🛋️] ${this.shortcuts.shortcuts.length} shortcuts loaded`)
      this.uploader = new Uploader(this)
      this.layout = new CushyLayoutManager(this)
      this.updater = new GitManagedFolder(this, {
         absFolderPath: this.rootPath,
         shouldAutoUpdate: true,
         runNpmInstallAfterUpdate: true,
         canBeUninstalled: false,
         gitURLToFetchUpdatesFrom: 'rvion/CushyStudio',
         repositoryName: 'CushyStudio' as GithubRepoName,
         userName: 'rvion' as GithubUserName,
      })
      this.importer = new ComfyImporter(this)
      this.library = new Library(this)
      this.project = this.getProject()
      this.auth = new AuthState(this)
      this.danbooru = DanbooruTags.build(this)

      // 🔴 ensure getters are called at least once so we upsert the two core virtual hosts
      // 💬 2024-10-26 rvion: this is just bad
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      // this.virtualHostBase
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      // this.virtualHostFull
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.standardHost

      this.mainHost.CONNECT()

      const treeAdapter: TreeStorageConfig = {
         getNodeState: (node: TreeNode) => this.db.tree_entry.upsert({ id: node.id })!,
         updateAll: (data: { isExpanded: SQLITE_boolean_ | null }) =>
            this.db.tree_entry.updateAll({ isExpanded: data.isExpanded }),
      }

      this.tree1 = new Tree(
         [
            //
            treeElement({ key: 'favorite-apps', ctor: TreeFavoriteApps, props: {} }),
            treeElement({ key: 'favorite-drafts', ctor: TreeFavoriteDrafts, props: {} }),
            treeElement({ key: 'all-drafts', ctor: TreeAllDrafts, props: {} }),
            treeElement({ key: 'all-apps', ctor: TreeAllApps, props: {} }),
            // '#apps',
         ],
         treeAdapter,
      )
      this.tree1View = new TreeView(this.tree1, {
         onFocusChange: (node?: TreeNode): void => {
            if (node == null) return
            console.log(`[🌲] TreeView 1 selection changed to:`, node.path_v2)
            if (node.data instanceof TreeApp) return node.data.app?.revealInFileExplorer()
            if (node.data instanceof TreeDraft) return node.data.draft.revealInFileExplorer()
            return
         },
      })

      this.tree2 = new Tree(
         [
            // treeElement({ key: 'library', ctor: TreeFolder, props: asRelativePath('library') }),
            treeElement({ key: 'built-in', ctor: TreeFolder, props: asRelativePath('library/built-in') }),
            treeElement({ key: 'local', ctor: TreeFolder, props: asRelativePath('library/local') }),
            treeElement({
               key: 'sdk-examples',
               ctor: TreeFolder,
               props: asRelativePath('library/sdk-examples'),
            }),
            treeElement({ key: 'installed', ctor: TreeFolder, props: asRelativePath('library/installed') }),
            //
            // 'path#library',
            // 'path#library/built-in',
            // 'path#library/local',
            // 'path#library/sdk-examples',
         ],
         treeAdapter,
      )
      this.tree2View = new TreeView(this.tree2, {
         onFocusChange: (node): void => console.log(`[🌲] TreeView 2 selection changed to:`, node?.path_v2),
      })

      makeAutoObservable(this, {
         comfyUIIframeRef: false,
         wildcards: false,
         Channel: false, // WIP remove me 2024-06-25 🔴
      })
      void this.startupFileIndexing()
      setTimeout(() => quickBench.printAllStats(), 1000)
   }

   get mainComfyHostID(): HostID {
      return (
         this.configFile.value.mainComfyHostID ?? //
         STANDARD_HOST_ID
      )
   }

   // get virtualHostBase(): HostL {
   //    return this.db.host.upsert({
   //       id: asHostID(vIRTUAL_HOST_ID__BASE),
   //       hostname: 'localhost',
   //       useHttps: SQLITE_false,
   //       port: 8188,
   //       name: 'virtual-ComfyUI-base',
   //       isLocal: SQLITE_true,
   //       isVirtual: SQLITE_true,
   //       isReadonly: SQLITE_true,
   //    })
   // }

   get standardHost(): HostL {
      return this.db.host.upsert({
         id: asHostID(STANDARD_HOST_ID),
         hostname: 'localhost',
         useHttps: SQLITE_false,
         port: 8188,
         name: 'standard',
         isLocal: SQLITE_true,
         isVirtual: SQLITE_false,
         isReadonly: SQLITE_true,
      })
   }

   // get virtualHostFull(): HostL {
   //    return this.db.host.upsert({
   //       id: asHostID(vIRTUAL_HOST_ID__FULL),
   //       hostname: 'localhost',
   //       useHttps: SQLITE_false,
   //       port: 8188,
   //       name: 'virtual-ComfyUI-full',
   //       isLocal: SQLITE_true,
   //       isVirtual: SQLITE_true,
   //       isReadonly: SQLITE_true,
   //    })
   // }
   // ------------------------------------------------------------
   wipeOuputTopLevelImages = (): void => {
      const outputFolderPath = this.outputFolderPath
      const files = readdirSync(outputFolderPath)
      const confirm = window.confirm(
         `Are you sure you want to delete ${files.length} files in ${outputFolderPath}?`,
      )
      if (!confirm) return
      for (const file of files) {
         if (!file.endsWith('.png')) continue
         const absPath = join(outputFolderPath, file)
         console.log(`[🧹] deleting ${absPath}`)
         rmSync(absPath)
         // fs.rmSync(absPath)
      }
   }
   // ------------------------------------------------------------
   /**
    * main host websocket
    * (exposed here for legacy reasons)
    * */
   get ws(): Maybe<ResilientWebSocketClient> {
      return this.mainHost.ws
   }

   get hosts(): HostL[] {
      return this.db.host.select()
   }

   /** main host */
   get mainHost(): HostL {
      const selectedHost = this.db.host.get(this.mainComfyHostID)
      return selectedHost ?? this.standardHost
   }

   /** todo: rename */
   getServerHostHTTP(): string {
      return this.mainHost.getServerHostHTTP()
   }

   /** todo: rename */
   getWSUrl = (): string => {
      return this.mainHost.getServerHostHTTP()
   }

   // 🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴 ------------------------------
   // 🔴 THIS MUST BE MOVED TO HOSTS ?
   _pendingMsgs = new Map<PromptID, PromptRelated_WsMsg[]>()
   private activePromptID: PromptID | null = null
   temporize(prompt_id: PromptID, msg: PromptRelated_WsMsg): void {
      this.activePromptID = prompt_id
      const prompt = this.db.comfy_prompt.get(prompt_id)

      // case 1. no prompt yet => just store the messages
      if (prompt == null) {
         const msgs = this._pendingMsgs.get(prompt_id)
         if (msgs) msgs.push(msg)
         else this._pendingMsgs.set(prompt_id, [msg])
         return
      }
      // case 2. prompt exists => send the messages
      prompt.onPromptRelatedMessage(msg)
   }

   latentPreview: Maybe<{
      promtID: Maybe<PromptID>
      receivedAt: Timestamp
      blob: Blob
      url: string
   }> = null

   onMessage(e: MessageEvent, host: HostL): void {
      if (e.data instanceof ArrayBuffer) {
         // 🔴 console.log('[👢] WEBSOCKET: received ArrayBuffer', e.data)
         const view = new DataView(e.data)
         const eventType = view.getUint32(0)
         const buffer = e.data.slice(4)
         switch (eventType) {
            case 1: {
               const view2 = new DataView(e.data)
               const imageType = view2.getUint32(0)
               let imageMime
               switch (imageType) {
                  case 1:
                  default:
                     imageMime = 'image/jpeg'
                     break
                  case 2:
                     imageMime = 'image/png'
               }
               const imageBlob = new Blob([buffer.slice(4)], { type: imageMime })
               const imagePreview = URL.createObjectURL(imageBlob)
               this.latentPreview = {
                  blob: imageBlob,
                  url: imagePreview,
                  receivedAt: Date.now() as Timestamp,
                  promtID: this.activePromptID,
               }
               break
            }
            default:
               throw new Error(`Unknown binary websocket message of type ${eventType}`)
         }
         return
      }
      // 🔴 console.info(`[👢] WEBSOCKET: received ${e.data}`)
      const msg: WsMsg = JSON.parse(e.data as any)

      // silent whitelist
      if (typeof msg === 'object' && 'type' in msg) {
         if ((msg.type as any) === 'crystools.monitor') return
      }

      const shouldCheckPAYLOADS = true
      if (shouldCheckPAYLOADS) {
         const match = WsMsg$Schema.safeParse(msg)
         if (!match.success) {
            console.log(`[🔴] /!\\ Websocket payload does not match schema.`)
            console.log('🔴 payload', msg)
            console.log('🔴error: ❌', fromZodError(match.error))
         }
      }

      if (msg.type === 'status') {
         if (msg.data.sid) this.comfySessionId = msg.data.sid
         this.status = msg.data.status
         return
      }

      // defer accumulation to ScriptStep_prompt
      if (msg.type === 'progress') {
         const activePromptID = this.activePromptID
         if (activePromptID == null) {
            console.log(`❌ received a 'progress' msg, but activePromptID is not set`)
            return
         }
         this.temporize(activePromptID, msg)
         return
      }
      if (
         msg.type === 'execution_start' ||
         msg.type === 'execution_cached' ||
         msg.type === 'execution_error' ||
         msg.type === 'execution_success' ||
         msg.type === 'executing' ||
         msg.type === 'executed'
      ) {
         this.temporize(msg.data.prompt_id, msg)
         return
      }

      if (msg.type === 'manager-terminal-feedback') {
         host.addLog(msg.data.data)
         return
      }
      exhaust(msg)
      console.log('❌', 'Unknown message:', msg)

      toastError('Unknown message type: ' + JSON.stringify(msg.type))
      // throw new Error('Unknown message type: ' + JSON.stringify(msg))
   }

   /** attempt to convert an url to a Blob */
   async getUrlAsBlob(url: string): Promise<Blob> {
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

   // fetchPrompHistory = async () => {
   //     const res = await fetch(`${this.serverHostHTTP}/history`, { method: 'GET' })
   //     console.log(res.data)
   //     const x = res.data
   //     return x
   // }

   CRITICAL_ERROR: Maybe<CSCriticalError> = null

   schemaRetrievalLogs: string[] = []

   get schemaStatusEmoji(): string {
      if (this.schema.nodes.length > 10) return '🟢'
      return '🔴'
   }

   focusedStepOutput: Maybe<StepOutput> = null
   focusedStepID: Maybe<StepID> = null
   get focusedStepL(): Maybe<StepL> {
      if (this.focusedStepID) return this.db.step.get(this.focusedStepID) ?? this.db.step.last()
      return this.db.step.last()
   }

   // get imageToDisplayold(): MediaImageL[] {
   //     const maxImages = this.galleryConf.value.galleryMaxImages ?? 20
   //     // let query =
   //     // const stmt = this.db.db.prepare(`select * from media_image order by createdAt desc limit ? where tags like ?`)
   //     // this.db.prepareAll(this.infos, `select * from ${this.name} order by createdAt desc limit ?`)
   //     return this.db.media_images.getLastN(maxImages)
   // }

   // galleryFilterPath: Maybe<string> = null
   // galleryFilterTag: Maybe<string> = null
   galleryFilterAppName: Maybe<{ id: CushyAppID; name?: Maybe<string> }> = null

   // FILESYSTEM UTILS --------------------------------------------------------------------
   /** write a binary file to given absPath */
   writeBinaryFile(absPath: AbsolutePath, content: Buffer): void {
      // ensure folder exists
      const folder = join(absPath, '..')
      mkdirSync(folder, { recursive: true })
      writeFileSync(absPath, content)
   }

   readJSON = readJSON
   writeJSON = writeJSON
   /** read text file, optionally provide a default */
   readJSON_ = <T extends any>(absPath: AbsolutePath, def?: T): T => {
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

   writeTextFile(absPath: AbsolutePath, content: string): void {
      // ensure folder exists
      const folder = join(absPath, '..')
      mkdirSync(folder, { recursive: true })
      writeFileSync(absPath, content, 'utf-8')
   }

   preferences = {
      interface: interfaceConf,
      system: systemConf,
      theme: themeConf,
   }

   csuite: CSuiteConfig = new CSuite_ThemeCushy(this)

   get themeText(): Tint {
      return run_tint(this.preferences.theme.value.text)
   }

   resolveFromRoot(relativePath: RelativePath): AbsolutePath {
      return asAbsolutePath(join(this.rootPath, relativePath))
   }
}

function INJECT_CUSHY_GLOBALLY(CUSHY: STATE): void {
   //  globally register the state as this
   if ((window as any).CushyObservableCache == null) {
      ;(window as any).loco = undefined // 🔴 remove me ASAP
      ;(window as any).CushyObservableCache = observable({ st: CUSHY })
      ;(window as any).st = CUSHY // <- remove this once window.st usage has been cleend
   } else {
      ;(window as any).CushyObservableCache.st = CUSHY
      ;(window as any).st = CUSHY // <- remove this once window.st usage has been cleend
   }
   if ((window as any).cushy == null) {
      console.log(`[🛋️] window.cushy now defined`)
      Object.defineProperty(window, 'cushy', {
         get() {
            return (window as any).CushyObservableCache.st
         },
      })
   }
   if ((window as any).toJS == null) {
      ;(window as any).toJS = toJS
   }
}
