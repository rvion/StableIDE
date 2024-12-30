import { observer } from 'mobx-react-lite'

import { SpacerUI } from '../csuite/components/SpacerUI'
import { Frame } from '../csuite/frame/Frame'
import { defineMenu } from '../csuite/menu/Menu'
import { ConnectionInfoUI } from '../panels/host/HostWebsocketIndicatorUI'
import { UpdateBtnUI } from '../updater/UpdateBtnUI'
import { MenuAppsUI } from './MenuApps'
import { MenuNSFWCheckerUI } from './MenuNSFWChecker'
import { cushyMenu } from './menus/cushyMenu'
import { editMenu } from './menus/editMenu'
import { helpMenu } from './menus/helpMenu'
import { menuView } from './MenuWindowUI'
import { PerspectivePickerUI } from './PerspectivePickerUI'

const mainMenu = defineMenu({
   title: 'mainMenu',
   entries: () => [
      //
      cushyMenu,
      menuView,
      editMenu,
      // viewMenu,
      helpMenu,
   ],
   // horizontalMenuGroup: true,
})

export const AppBarUI = observer(function AppBarUI_(p: {}) {
   const mainHost = cushy.mainHost
   return (
      <Frame
         //
         base={cushy.preferences.theme.value.appbar ?? { contrast: -0.077 }}
         tw={['flex items-center overflow-auto px-2 pt-0.5', 'shrink-0 overflow-auto']}
         id='CushyAppBar'
      >
         <mainMenu.MenuBarUI />
         <MenuAppsUI />
         {/* <PanelHeaderUI tw='flex items-center px-2 overflow-auto'> */}
         {/* <div tw='px-1'>CushyStudio</div> */}
         {/* <MenuPanelsUI /> */}
         {/* <MenuCommandsUI /> */}
         {/* <MenuComfyUI /> */}
         {/* <MenuEditUI /> */}
         {/* <MenuAboutUI /> */}
         {/* <MenuDebugUI /> */}
         <PerspectivePickerUI tw='ml-auto' />

         <SpacerUI />
         <UpdateBtnUI updater={cushy.updater} />
         <Frame line>
            <ConnectionInfoUI host={mainHost} />
            {/* <HostWebsocketIndicatorUI host={mainHost} /> */}
            {/* <HostSchemaIndicatorUI host={mainHost} /> */}
            <MenuNSFWCheckerUI />
         </Frame>
         {/* </PanelHeaderUI> */}
      </Frame>
   )
})
