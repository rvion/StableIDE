/** 🔶 NAMING DISCLAIMER: I call a "custom node package" => "PLUGIN" */

import type { HostL } from '../models/Host'
import type { ComfyManagerRepository } from './ComfyManagerRepository'
import type { KnownComfyPluginTitle } from './generated/KnownComfyPluginTitle'
import type { KnownModel_Name } from './generated/KnownModel_Name'
import type { PluginInstallStatus } from './REQUIREMENTS/PluginInstallStatus'
import type { ComfyManagerAPIFetchPolicy } from './types/ComfyManagerAPIFetchPolicy'
import type { ComfyManagerAPIModelList } from './types/ComfyManagerAPIModelList'
import type { ComfyManagerAPIPluginList } from './types/ComfyManagerAPIPluginList'
import type { ComfyManagerModelInfo } from './types/ComfyManagerModelInfo'
import type { ComfyManagerPluginInfo } from './types/ComfyManagerPluginInfo'

import { makeAutoObservable, observable, runInAction } from 'mobx'

import { toastError, toastSuccess } from '../csuite/utils/toasts'

export class ComfyManager {
   get repository(): ComfyManagerRepository {
      return cushy.comfyAddons
   }

   constructor(
      public host: {
         getServerHostHTTP: () => string
      },
   ) {
      makeAutoObservable(this, {
         host: false,
         repository: false,
         modelList: observable.shallow,
         pluginList: observable.shallow,
      })
      void this.updateHostPluginsAndModels()
   }
   updateHostPluginsAndModels = async (): Promise<void> => {
      const [_pluginList, _modelList] = await Promise.all([this.fetchPluginList(), this.fetchModelList()])
      runInAction(() => {
         this.pluginList = _pluginList
         this.modelList = _modelList
      })
   }

   // -----------
   configureLogging = (mi: boolean): Promise<any> => {
      // return this.repository.getModelInfoFinalFilePath(mi)
      return this.fetchGetText(`/manager/terminal?mode=${mi}`)
   }

   // utils ------------------------------------------------------------------------------
   getModelInfoFinalFilePath = (mi: ComfyManagerModelInfo): string => {
      return cushy.comfyAddons.getModelInfoFinalFilePath(mi)
   }

   waitForHostToBeBackOnline(maxAttempt: 10): Promise<true> {
      return new Promise<true>((yes, no) => {
         let attempt = 0
         let abortCtrl: AbortController
         const interval = setInterval(async () => {
            attempt++
            if (attempt > maxAttempt) {
               console.log(`   - failure`)
               clearInterval(interval)
               no()
            }
            if (abortCtrl) abortCtrl.abort()
            const url = this.host.getServerHostHTTP()
            abortCtrl = new AbortController()
            try {
               console.log(`   - trying...`)
               await fetch(url, { signal: abortCtrl.signal })
               clearInterval(interval)
               yes(true)
            } catch {
               /* empty */
            }
         }, 1000)
      })
   }

   // actions ---------------------------------------------------------------------------
   rebootComfyUIAndUpdateHostPluginsAndModelsAfter10Seconds(): Promise<void> {
      // 🔴 bad code
      setTimeout(() => void this.updateHostPluginsAndModels(), 10_000)
      // curl 'http://192.168.1.19:8188/api/manager/reboot' \
      //     -H 'Accept: */*' \
      //     -H 'Accept-Language: en-GB' \
      //     -H 'Cache-Control: max-age=0' \
      //     -H 'Comfy-User: undefined' \
      //     -H 'Connection: keep-alive' \
      //     -H 'Referer: http://192.168.1.19:8188/' \
      //     -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) cushystudio-shell/32.1.2 Chrome/128.0.6613.162 Electron/32.1.2 Safari/537.36'
      return this.fetchGetJSON('/manager/reboot')
   }

   // @server.PromptServer.instance.routes.get("/manager/reboot")
   rebootComfyUI = async (): Promise<unknown> => {
      return this.fetchGetJSON('/manager/reboot')
   }

   /** alias to rebootComfyUI since I was looking for that method instead. */
   restartComfyUI = async (): Promise<unknown> => {
      return this.rebootComfyUI()
   }

   // models --------------------------------------------------------------
   modelList: Maybe<ComfyManagerAPIModelList> = null

   fetchModelList = (): Promise<ComfyManagerAPIModelList> => {
      return this.fetchGetJSON<ComfyManagerAPIModelList>('/externalmodel/getlist?mode=cache')
   }
   fetchLogs = (): Promise<any> => {
      return this.fetchGetJSON<any>('/internal/logs')
   }

   isModelInstalled = (name: KnownModel_Name): boolean => {
      return this.modelList?.models.some((x) => x.name === name && x.installed === 'True') ?? false
   }

   modelsBeeingInstalled = new Set<KnownModel_Name>()

   installModel = async (model: ComfyManagerModelInfo): Promise<boolean> => {
      try {
         this.modelsBeeingInstalled.add(model.name)
         const status = await this.fetchPost('/model/install', model)
         this.modelsBeeingInstalled.delete(model.name)
         toastSuccess('Model installed')
         return true
      } catch (exception) {
         console.error(`Install failed: ${/*model.title*/ ''} / ${exception}`)
         toastError('Model Installation Failed')
         this.modelsBeeingInstalled.delete(model.name)
         return false
      }
   }
   getModelStatus = (modelName: KnownModel_Name): PluginInstallStatus => {
      if (this.modelList == null) return 'unknown'
      const entry = this.modelList?.models.find((x) => x.name === modelName)
      const status = ((): PluginInstallStatus => {
         if (!entry) return 'unknown'
         if (entry?.installed === 'False') return 'not-installed'
         if (entry?.installed === 'True') return 'installed'
         if (entry?.installed === 'Update') return 'update-available'
         return 'error'
      })()
      return status
   }

   // PLUGINS (A.K.A. Custom nodes) ----------------------------------------------------------------------------
   pluginList: Maybe<ComfyManagerAPIPluginList> = null // hasModel = async (model: ModelInfo) => {

   get titlesOfAllInstalledPlugins(): KnownComfyPluginTitle[] {
      return (
         this.pluginList?.custom_nodes //
            .filter((x) => x.installed === 'True')
            .map((x) => x.title) ?? []
      )
   }

   isPluginInstalled = (title: KnownComfyPluginTitle): boolean => {
      if (!this.pluginList || !this.pluginList.custom_nodes) {
         return false
      }
      return this.pluginList.custom_nodes.some((x) => x.title === title && x.installed === 'True') ?? false
   }

   getPluginStatus = (title: KnownComfyPluginTitle): PluginInstallStatus => {
      if (this.pluginList == null) return 'unknown'
      const entry = this.pluginList?.custom_nodes.find((x) => x.title === title)
      const status = ((): PluginInstallStatus => {
         if (!entry) return 'unknown'
         if (entry?.installed === 'False') return 'not-installed'
         if (entry?.installed === 'True') return 'installed'
         if (entry?.installed === 'Update') return 'update-available'
         return 'error'
      })()
      return status
   }

   // --------------------------------------------------------------
   // https://github.com/ltdrdata/ComfyUI-Manager/blob/4649d216b1842aa48b95d3f064c679a1b698e506/js/custom-nodes-downloader.js#L14C25-L14C88
   fetchPluginList = async (
      /** @default: 'cache' */
      mode: ComfyManagerAPIFetchPolicy = 'cache',
      /** @default: true */
      skipUpdate: boolean = true,
   ): Promise<ComfyManagerAPIPluginList> => {
      try {
         const skip_update = skipUpdate ? '&skip_update=true' : ''
         const status = await this.fetchGetJSON(`/customnode/getlist?mode=${mode}${skip_update}`)
         return status as any
      } catch (exception) {
         console.error(`node list retrieval failed: ${exception}`)
         toastError('node list retrieveal failed')
         throw exception
      }
   }

   installPlugin = async (model: ComfyManagerPluginInfo): Promise<boolean> => {
      try {
         const status = await this.fetchPost('/customnode/install', model)
         console.log('✅ Custom Node installed')
         toastSuccess('Custom Node installed')
         return true
      } catch (exception) {
         console.error(`Install failed: ${/*model.title*/ ''} / ${exception}`)
         toastError('Custom Node Installation Failed')
         return false
      }
   }

   // --------------------------------------------------------------
   private fetchPost = async <In, Out>(endopint: string, body: In): Promise<boolean> => {
      const url = this.host.getServerHostHTTP() + endopint
      const response = await fetch(url, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(body),
      })

      const status = await response.json()
      console.log(`[👀]`, status)
      return status
   }

   private fetchGetJSON = async <Out>(endopint: string): Promise<Out> => {
      const url = this.host.getServerHostHTTP() + endopint
      const response = await fetch(url)
      const jsonResult = await response.json()
      // console.log(`[👀]`, jsonResult)
      return jsonResult
   }
   private fetchGetText = async (endopint: string): Promise<string> => {
      const url = this.host.getServerHostHTTP() + endopint
      const response = await fetch(url)
      const status = await response.text()
      return status
   }
}
