import type { PerspectiveHelper } from './_PerspectiveBuilder'
import type { IJsonModel } from 'flexlayout-react'

export function getDefaultPerspective(p: PerspectiveHelper): IJsonModel {
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
               // width: 512,
               // enableClose: false,
               // enableDeleteWhenEmpty: false,
               children: [
                  //
                  p.defineTab({ panelName: 'Welcome', props: {}, width: 512 }),
                  p.defineTab({ panelName: 'PanelAppLibrary', props: {}, width: 512 }),
                  p.defineTab({ panelName: 'TreeExplorer', props: {}, width: 512 }),
               ],
               // enableSingleTabStretch: true,
            },
            {
               type: 'tabset',
               // enableClose: false,
               // enableDeleteWhenEmpty: false,
               minWidth: 100,
               minHeight: 100,
               selected: 0,
               children: [
                  p.defineTab({ panelName: 'Output', props: {}, canClose: false }),
                  // p.defineTab({ panelName: 'Hosts', props: {}, canClose: false }),
               ],
            },
            {
               type: 'tabset',
               // enableClose: false,
               // enableDeleteWhenEmpty: false,
               minWidth: 100,
               minHeight: 100,
               selected: 0,
               children: [
                  p.defineTab({ panelName: 'Gallery', props: {} }),
                  // p.defineTab({ panelName: 'Output', props: {}, canClose: false }),
                  // p.defineTab({ panelName: 'Hosts', props: {}, canClose: false }),
               ],
            },
            //     ],
            // },
         ],
      },
   }
}
