import type { NO_PROPS } from '../../csuite/types/NO_PROPS'

import { observer } from 'mobx-react-lite'
import { useLayoutEffect } from 'react'

import { cushyFactory } from '../../controls/CushyBuilder'
import { UI } from '../../csuite/components/UI'
import { ErrorBoundaryUI } from '../../csuite/errors/ErrorBoundaryUI'
import { MessageInfoUI } from '../../csuite/messages/MessageInfoUI'
import { Panel, type PanelHeader } from '../../router/Panel'
import { readJSON, writeJSON } from '../../state/jsonUtils'
import { PlaygroundCustomPanelsUI } from './PlaygroundCustomPanelsUI'
import { PlaygroundElectronUI } from './PlaygroundElectron'
import { PlaygroundForms } from './PlaygroundForms'
import { PlaygroundGraphUI } from './PlaygroundGraphUI'
import { PlaygroundJSX } from './PlaygroundJSX'
import { PlaygroundMessages } from './PlaygroundMessages'
import { PlaygroundPanelStoreUI } from './PlaygroundPanelStoreUI'
import { PlaygroundRegisteredForms } from './PlaygroundRegisteredForms'
import { PlaygroundRenderUI } from './PlaygroundRender'
import { PlaygroundRequirements } from './PlaygroundRequirements'
import { PlaygroundScratchPad } from './PlaygroundScratchPad'
import { PlaygroundSelectUI } from './PlaygroundSelectUI'
import { PlaygroundSizeUI } from './PlaygroundSize'
import { PlaygroundSkinsUI } from './PlaygroundSkinsUI'
import { PlaygroundWidgetDisplay } from './PlaygroundWidgetDisplay'

export const PanelPlayground = new Panel({
   name: 'Playground',
   widget: (): React.FC<PanelPlaygroundProps> => PanelPlaygroundUI,
   header: (p: PanelPlaygroundProps): PanelHeader => ({ title: 'Welcome' }),
   def: (): PanelPlaygroundProps => ({}),
   icon: 'mdiLiquidSpot',
   category: 'developper',
})

export type PanelPlaygroundProps = NO_PROPS

export const PanelPlaygroundUI = observer(function PanelPlaygroundUI_(p: PanelPlaygroundProps) {
   const relPathToThisPage = './src/panels/PanelPlayground/PanelPlayground.tsx' as RelativePath
   const mode = Header_Playground.value

   useLayoutEffect(() => {
      cushy.layout.syncTabTitle('Playground', {}, 'DevPlayground')
   }, [])

   return (
      <UI.Panel tw='gap-1'>
         <UI.Panel.Header extensibleHeight>
            <Header_Playground.root.UI Shell={UY.Shell.HeaderOnly} />
         </UI.Panel.Header>
         <ErrorBoundaryUI /* 👇 playground sub-pages */>
            {mode.electron && <PlaygroundElectronUI />}
            {mode.forms && <PlaygroundForms />}
            {mode.render && <PlaygroundRenderUI />}
            {mode.requirements && <PlaygroundRequirements />}
            {mode.registeredForms && <PlaygroundRegisteredForms />}
            {mode.widgetShowcase && <PlaygroundWidgetDisplay />}
            {mode.scratchPad && <PlaygroundScratchPad />}
            {mode.graph && <PlaygroundGraphUI />}
            {mode.customPanels && <PlaygroundCustomPanelsUI />}
            {mode.messages && <PlaygroundMessages />}
            {mode.select && <PlaygroundSelectUI />}
            {mode.size && <PlaygroundSizeUI />}
            {mode.skins && <PlaygroundSkinsUI />}
            {mode.panelProps && <PlaygroundPanelStoreUI />}
            {mode.jsx && <PlaygroundJSX />}
            {/* {mode.value.comfyImport && <PlaygroundImportFromComfy />} */}
         </ErrorBoundaryUI>

         <MessageInfoUI>
            <div tw='inline overflow-clip text-sm'>
               <span>Use this panel as a scratchpad by modifying </span>
               <span tw='rounded px-1'>PlaygroundScratchPad</span>
               <span> in </span>
               <UI.Button //
                  tw='underline'
                  onClick={() => cushy.openInVSCode(relPathToThisPage)}
                  children={relPathToThisPage}
               />
            </div>
         </MessageInfoUI>
      </UI.Panel>
   )
})

const Header_Playground = cushyFactory.document(
   (ui) =>
      ui.choice(
         {
            electron: ui.empty(),
            skins: ui.empty(),
            jsx: ui.empty(),
            panelProps: ui.empty(),
            select: ui.empty(),
            size: ui.empty(),
            forms: ui.empty(),
            render: ui.empty(),
            customPanels: ui.empty(),
            requirements: ui.empty(),
            registeredForms: ui.empty(),
            widgetShowcase: ui.empty(),
            scratchPad: ui.empty(),
            graph: ui.empty(),
            comfyImport: ui.empty(),
            messages: ui.empty(),
         },
         { appearance: 'tab', default: 'scratchPad', tabPosition: 'start' },
      ),
   {
      name: 'Playground Conf',
      serial: () => readJSON('settings/playground_config.json'),
      onSerialChange: (form) => writeJSON('settings/playground_config.json', form.serial),
   },
)
