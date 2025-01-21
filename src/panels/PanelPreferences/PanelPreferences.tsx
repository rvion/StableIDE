import type { NO_PROPS } from '../../csuite/types/NO_PROPS'

import { observer } from 'mobx-react-lite'
import { type FC, Fragment } from 'react'

import { openFolderInOS } from '../../app/layout/openExternal'
import { ToggleButtonUI } from '../../csuite/checkbox/InputBoolToggleButtonUI'
import { UI } from '../../csuite/components/UI'
import { FormUI } from '../../csuite/form/FormUI'
import { Panel, type PanelHeader } from '../../router/Panel'
import { usePanel } from '../../router/usePanel'
import { openInVSCode } from '../../utils/electron/openInVsCode'
import { PanelComfyHostsUI } from '../PanelComfyHosts/PanelComfyHostsUI'
import { LegacyOptions } from './LegacyOptions'

export type PreferenceMode = 'hosts' | 'input' | 'interface' | 'legacy' | 'system' | 'theme'

export const PanelPreferences = new Panel({
   name: 'Preferences',
   icon: 'mdiCog',
   category: 'settings',
   widget: (): FC<NO_PROPS> => PanelPreferencesUI,
   header: (p): PanelHeader => ({ title: 'Preferences', icon: undefined }),
   def: (): PanelPreferencesProps => ({}),
})

export type PanelPreferencesProps = NO_PROPS

const PreferenceTabs: PreferenceMode[] = ['hosts', 'input', 'interface', 'legacy', 'system', 'theme']

export const PanelPreferencesUI = observer(function Panel_Preferences_(p: PanelPreferencesProps) {
   const panel = usePanel()

   const panelState = panel.usePersistentModel('abcd', (ui) =>
      ui.fields({
         preferenceMode: ui.selectOneString(PreferenceTabs),
         //TODO(bird_d): Needs to be done through panel state?
         // shelfSize: ui.int(),
      }),
   )

   const modeField = panelState.fields.preferenceMode
   const page: React.JSX.Element = ((): React.JSX.Element => {
      switch (modeField.value) {
         case 'hosts': {
            return <PanelComfyHostsUI />
         }
         case 'input': {
            return <>Not Implemented</>
         }
         case 'interface': {
            return <FormUI tw='flex-1' field={cushy.preferences.interface} />
         }
         case 'legacy': {
            return <LegacyOptions />
         }
         case 'system': {
            return <FormUI tw='flex-1' field={cushy.preferences.system} />
         }
         case 'theme': {
            return <FormUI tw='flex-1' field={cushy.preferences.theme} />
         }
      }
      return <Fragment>❌ unknown tab</Fragment>
   })()

   return (
      <UI.Panel>
         <UI.Panel.Header>
            <UI.Dropdown
               title='Actions'
               content={() => (
                  <>
                     <UI.Dropdown.Item //
                        onClick={() => openInVSCode('CONFIG.json')}
                        label='Open legacy config file'
                     />
                     <UI.Dropdown.Item //
                        onClick={() => openFolderInOS('settings')}
                        label='Open config folder'
                     />
                  </>
               )}
            ></UI.Dropdown>
         </UI.Panel.Header>
         <UI.Frame expand row tw='overflow-auto'>
            <UI.Shelf anchor='left' defaultSize={140}>
               <UI.Shelf.Column>
                  <PreferenceTabButtonUI field={modeField} mode='legacy' />
                  <UI.Shelf.Group align hueShift={100}>
                     <PreferenceTabButtonUI field={modeField} mode='interface' />
                     <PreferenceTabButtonUI field={modeField} mode='input' />
                     <PreferenceTabButtonUI field={modeField} mode='theme' />
                  </UI.Shelf.Group>
                  <UI.Shelf.Group align hueShift={200}>
                     <PreferenceTabButtonUI field={modeField} mode='system' />
                     <PreferenceTabButtonUI field={modeField} mode='hosts' />
                  </UI.Shelf.Group>
               </UI.Shelf.Column>
            </UI.Shelf>
            <UI.Shelf.Content
            // (bird_d): This isn't actually part of the shelf's content? It's part of the region's/panel's.
            >
               {page}
            </UI.Shelf.Content>
         </UI.Frame>
      </UI.Panel>
   )
})

const PreferenceTabButtonUI = observer(function PreferenceTabButtonUI_(p: {
   //
   mode: PreferenceMode
   field: X.SelectOne_<PreferenceMode>
}) {
   return (
      <ToggleButtonUI //
         toggleGroup='preference-tab'
         tw='!h-10 capitalize'
         value={p.field.is(p.mode)}
         text={p.mode}
         onValueChange={(_) => p.field.setValue(p.mode)}
      />
   )
})
