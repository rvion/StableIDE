import { observer } from 'mobx-react-lite'

import { ErrorBoundaryUI } from '../csuite/errors/ErrorBoundaryUI'
import { Frame } from '../csuite/frame/Frame'
import { useMemoAction } from '../csuite/utils/useMemoAction'
import { PanelWelcome } from '../panels/PanelWelcome/PanelWelcome'
import { PanelWelcomeUI } from '../panels/PanelWelcome/PanelWelcomeUI'
import { PanelState } from './PanelState'
import { PanelStateByNode } from './PanelStateByNode'
import { panelContext } from './usePanel'

// 💬 2024-10-18 rvion:
// | flexlayout-react do not support memo, so we can't wrap in observer
export const TabsetPlaceholderUI = (): React.JSX.Element => {
   return <TabsetPlaceholderHackUI />
}

const TabsetPlaceholderHackUI = observer((): React.JSX.Element => {
   const panelName = 'Welcome'
   const panelURI = '~TabsetPlaceholderUI~'
   const panelState = useMemoAction(() => {
      const ps = new PanelState(null, panelURI, PanelWelcome)
      PanelStateByNode.set(panelURI, ps)
      return ps
   }, [])

   return (
      <ErrorBoundaryUI>
         <panelContext.Provider value={panelState}>
            <Frame
               col
               tw='h-full w-full flex-1 overflow-auto'
               className={`Region-${panelName}`}
               data-panel-id={panelURI}
               id={panelURI}
               onMouseEnter={(e) => e.currentTarget.classList.add('Hovered-Region')}
               onMouseLeave={(e) => e.currentTarget.classList.remove('Hovered-Region')}
               onFocus={(e) => e.currentTarget.classList.add('Hovered-Region')}
               onBlur={(e) => e.currentTarget.classList.remove('Hovered-Region')}
            >
               <PanelWelcomeUI />
            </Frame>
         </panelContext.Provider>
      </ErrorBoundaryUI>
   )
})
