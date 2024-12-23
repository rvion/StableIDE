import type { PropsOf } from '../../csuite/types/PropsOf'
import type { PanelPersistedJSON } from '../PanelPersistedJSON'
import type { PanelName, Panels } from '../PANELS'
import type * as FL from 'flexlayout-react'
import type { IJsonModel } from 'flexlayout-react'

import { hashJSONObjectToNumber } from '../../csuite/hashUtils/hash'
import { getIconAsDataSVG } from '../../csuite/icons/iconStr'
import { panels } from '../PANELS'
import { getDefaultPerspective } from './default1.perspective'

export class PerspectiveHelper {
   // 🔴 todo: ensure we correctly pass ids there too
   defineTab<const PN extends PanelName>(p: {
      panelName: PN
      props: PropsOf<Panels[PN]['widget']>
      width?: number
      canClose?: boolean
   }): FL.IJsonTabNode {
      const { panelName, props } = p
      const id = `/${panelName}/${hashJSONObjectToNumber(props ?? {})}`
      const panel = panels[panelName]
      const { title } = panel.header(props as any)
      const icon = panel.icon
      const config: PanelPersistedJSON = { $props: props, $store: {}, $temp: {} }
      return {
         id: id,
         type: 'tab',
         name: title,
         config,
         component: p.panelName,
         enableClose: p.canClose ?? true,
         enableRename: false,
         enableFloat: false,
         // enablePopout: false,
         icon: getIconAsDataSVG(icon),
      }
   }

   getGlobalPerspectiveConfig(): FL.IGlobalAttributes {
      return {
         tabEnableFloat: false,
         // tabEnablePopout: false,
         splitterSize: 6,
         tabEnableRename: false,
         borderEnableAutoHide: true,
         borderAutoSelectTabWhenClosed: true,
         tabSetHeaderHeight: 24,
         tabSetTabStripHeight: 24,
         tabSetEnableSingleTabStretch: false /* 🔴 */,
         // tabSetEnableSingleTabStretch: true,
      }
   }
}

export const perspectiveHelper = new PerspectiveHelper()
