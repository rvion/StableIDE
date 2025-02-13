import type { ComfyManagerPluginInfo } from '../types/ComfyManagerPluginInfo'
import type { Requirements } from './Requirements'

import { observer } from 'mobx-react-lite'

import { MessageWarningUI } from '../../csuite'
import { MessageErrorUI } from '../../csuite/messages/MessageErrorUI'
import { exhaust } from '../../csuite/utils/exhaust'
import { Button_InstallCustomNodeUI } from './Button_InstallCustomNodeUI'
import { Button_InstalModelViaManagerUI } from './Button_InstalModelViaManagerUI'
import { IntallBtnForKnownCivitaiModelId, IntallBtnForKnownCivitaiModelVersionId } from './FOOBAR'
import { QuickHostActionsUI } from './QuickHostActionsUI'

export const Panel_InstallRequirementsUI = observer(function Panel_InstallRequirementsUI_(p: {
   requirements: Requirements[]
}) {
   const rr = p.requirements
   const host = cushy.mainHost
   const manager = host.manager
   const repo = cushy.comfyAddons
   return (
      <div tw='flex flex-col gap-2 p-2'>
         <MessageWarningUI
            tw='text-sm'
            markdown='make sure your `ComfyUI\custom_nodes\ComfyUI-Manager\config.ini` properly has `bypass_ssl = True`'
         />
         <QuickHostActionsUI host={host} tw='flex flex-wrap gap-1' />
         <hr />
         <div tw='flex flex-col gap-2 overflow-scroll'>
            {rr.map((req) => {
               // ------------------------------------------------
               if (req.type === 'customNodesByNameInCushy') {
                  const plugins: ComfyManagerPluginInfo[] =
                     repo.plugins_byNodeNameInCushy.get(req.nodeName) ?? []
                  if (plugins.length == 0)
                     return <MessageErrorUI markdown={`node plugin **${req.nodeName}** not found`} />
                  if (plugins.length === 1)
                     return (
                        <Button_InstallCustomNodeUI //
                           optional={req.optional ?? false}
                           plugin={plugins[0]!}
                        />
                     )
                  return (
                     <div tw='bd'>
                        <MessageErrorUI>
                           <div>
                              <div>Ambiguous node "{req.nodeName}" required</div>
                              <div>It is found in {plugins.length} packages:</div>
                           </div>
                        </MessageErrorUI>
                        {plugins.map((x) => {
                           return (
                              <Button_InstallCustomNodeUI //
                                 optional={req.optional ?? false}
                                 key={x.title}
                                 plugin={x}
                              />
                           )
                        })}
                     </div>
                  )
               }
               // ------------------------------------------------
               if (req.type === 'customNodesByTitle') {
                  const plugin = cushy.comfyAddons.plugins_byTitle.get(req.title)
                  if (!plugin) {
                     console.log(`[❌] no plugin found with title "${req.title}"`)
                     return (
                        <MessageErrorUI markdown={`no plugin found with title **${req.title}** not found`} />
                     )
                  }
                  return <Button_InstallCustomNodeUI optional={req.optional ?? false} plugin={plugin} />
               }

               // ------------------------------------------------
               if (req.type === 'customNodesByURI') {
                  const plugin = cushy.comfyAddons.plugins_byFile.get(req.uri)
                  if (!plugin) {
                     console.log(`[❌] no plugin found with uri "${req.uri}"`)
                     return <MessageErrorUI markdown={`no plugin found with URI **${req.uri}** not found`} />
                  }
                  return <Button_InstallCustomNodeUI optional={req.optional ?? false} plugin={plugin} />
               }

               // ------------------------------------------------
               // models
               if (req.type === 'modelCustom') {
                  const modelInfo = req.infos
                  return (
                     <Button_InstalModelViaManagerUI //
                        optional={req.optional ?? false}
                        modelInfo={modelInfo}
                     />
                  )
               }

               // ------------------------------------------------
               if (req.type === 'modelInCivitai') {
                  return (
                     <div>
                        <IntallBtnForKnownCivitaiModelId civitaiModelId={req.civitaiModelId} />
                        <IntallBtnForKnownCivitaiModelVersionId /* civitaiModelId={req.civitaiModelId} */ />
                     </div>
                  )
               }
               if (req.type === 'modelInManager') {
                  const modelInfo = repo.knownModels.get(req.modelName)
                  if (!modelInfo) {
                     console.log(`[❌] no model found with name "${req.modelName}"`)
                     return (
                        <MessageErrorUI
                           markdown={`no model found with name **${req.modelName}** not found`}
                        />
                     )
                  }
                  return (
                     <Button_InstalModelViaManagerUI //
                        optional={req.optional ?? false}
                        modelInfo={modelInfo}
                     />
                  )
               }
               exhaust(req)

               // const enumName = getModelInfoEnumName(mi, x.modelFolderPrefix ?? '')
               // const isInstalled = false // 🔴 p.widget.possibleValues.find((x) => x === enumName.nix || x === enumName.win)
               // const host = st.mainHost
               // // const rootComfyUIFolder = host.absolutPathToDownloadModelsTo
               // // const dlPath = host.manager.getModelInfoFinalFilePath(mi)
               // return (
               //     <div key={mi.url}>
               //         <Button
               //             onClick={async () => {
               //                 // 🔴 TODO
               //                 // https://github.com/ltdrdata/ComfyUI-Manager/blob/main/js/model-downloader.js#L11
               //                 // copy Data-it implementation
               //                 // download file
               //                 const res = await host.manager.installModel(mi)
               //                 if (!res) return
               //
               //                 // const res = await host.downloadFileIfMissing(m.url, dlPath)
               //                 // retrieve the enum info
               //                 // add the new value (BRITTLE)
               //
               //                 // ⏸️ const enumInfo = st.schema.knownEnumsByName //
               //                 // ⏸️     .get(p.widget.enumName)
               //                 // ⏸️ enumInfo?.values.push(mi.filename)
               //             }}
               //             key={mi.name}
               //         >
               //             {isInstalled ? '✅' : null}
               //             <span>{mi.name}</span>
               //         </Button>
               //         {/* <RevealUI> */}
               //         {/* <div>infos</div> */}
               //         {/*
               //         ⏸️ <div tw='text-sm italic'>
               //         ⏸️     <div tw='italic'>enumName: {enumName.win}</div>
               //         ⏸️     <div tw='italic'>desc: {mi.description}</div>
               //         ⏸️     <div tw='italic'>url: {mi.url}</div>
               //         ⏸️ </div>
               //          */}
               //         {/* </RevealUI> */}
               //     </div>
               // )
            })}
         </div>
         {/* <MessageWarningUI //
                markdown='this widget is beta; Clicking install does not show progress yet; check your ComfyUI logs'
            /> */}
      </div>
   )
})
