import type { PerspectiveHelper } from './_PerspectiveBuilder'
import type { IJsonModel } from 'flexlayout-react'

export function getEmptyPerspective(p: PerspectiveHelper): IJsonModel {
   return {
      global: p.getGlobalPerspectiveConfig(),
      layout: {
         id: 'rootRow',
         type: 'row',
         children: [
            {
               type: 'tabset',
               minWidth: 150,
               minHeight: 150,
               children: [p.defineTab({ panelName: 'Welcome', props: {}, width: 512 })],
            },
         ],
      },
   }
}
