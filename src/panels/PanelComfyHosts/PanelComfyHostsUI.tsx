import { observer } from 'mobx-react-lite'

import { useCSuite } from '../../csuite/ctx/useCSuite'
import { Frame } from '../../csuite/frame/Frame'
import { SelectUI } from '../../csuite/select/SelectUI'
import { HostUI } from '../host/HostUI'
import { AddHostBtnUI } from './AddHostBtnUI'

export type PanelComfyHostProps = {
   hostID?: HostID
}

export const PanelComfyHostsUI = observer(function PanelComfyHostsUI_(p: PanelComfyHostProps) {
   const allHosts = cushy.hosts
   const mainHost = cushy.mainHost
   const theme = cushy.preferences.theme.value

   return (
      <div tw='flex h-full w-full flex-col gap-2 p-2'>
         <div className='line'>
            <div>Primary Host</div>
            <Frame //
               align
               border
               line
               tw='flex flex-grow'
               roundness={theme.global.roundness}
            >
               <SelectUI
                  tooltip='The Primary host is the one used for typings, and to send prompts to by default.'
                  options={() => allHosts}
                  value={() => mainHost}
                  getLabelText={(host) => host.data.name}
                  onOptionToggled={(host) => host.electAsPrimary()}
               />
               <AddHostBtnUI />
            </Frame>
         </div>
         <div tw='text-xl font-bold'>My Custom Hosts</div>
         <div tw='flex flex-wrap gap-2'>
            {allHosts
               ?.filter((g) => !g.isReadonly)
               .map((host) => {
                  return <HostUI key={host.id} host={host} />
               })}
         </div>
         <div tw='divider'></div>
         <div tw='text-xl font-bold'>Pre-configured Hosts</div>
         <div tw='flex flex-wrap gap-2'>
            {allHosts
               ?.filter((g) => g.isReadonly)
               .map((host) => {
                  return <HostUI key={host.id} host={host} />
               })}
         </div>
      </div>
   )
})
