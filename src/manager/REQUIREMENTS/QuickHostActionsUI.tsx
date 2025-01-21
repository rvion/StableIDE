import type { HostL } from '../../models/Host'

import { observer } from 'mobx-react-lite'

import { Button } from '../../csuite/button/Button'
import { RevealUI } from '../../csuite/reveal/RevealUI'

export const QuickHostActionsUI = observer(function QuickHostActionsUI_(p: {
   /** defaults to 'flex gap-1' */
   className?: string
   host?: HostL
}) {
   const host = p.host ?? cushy.mainHost
   return (
      <div className={p.className}>
         <RevealUI
            content={() => (
               <div tw='max-h-96 overflow-auto'>
                  {((): React.JSX.Element => {
                     if (host.manager.pluginList == null) return <div tw='loading loading-spinner'></div>
                     return (
                        <div tw='flex flex-col'>
                           {host.manager.titlesOfAllInstalledPlugins.map((name) => (
                              <div key={name}>{name}</div>
                           ))}
                        </div>
                     )
                  })()}
               </div>
            )}
         >
            <Button>See Installed</Button>
         </RevealUI>
         <Button //
            children='Reload Schema and Installed Plugins/Models'
            look='success'
            onClick={async () => {
               await host.fetchAndUpdateSchema()
               await host.manager.updateHostPluginsAndModels()
            }}
         />
         <Button //
            children='Reload Schema Only'
            onClick={async () => {
               await host.fetchAndUpdateSchema()
            }}
         />
         <Button //
            children='Reload Installed Plugins/Models Only'
            onClick={async () => {
               await host.manager.updateHostPluginsAndModels()
            }}
         />
         <Button //
            children='Restart ComfyUI'
            look='warning'
            onClick={() => host.manager.rebootComfyUIAndUpdateHostPluginsAndModelsAfter10Seconds()}
         />
      </div>
   )
})
