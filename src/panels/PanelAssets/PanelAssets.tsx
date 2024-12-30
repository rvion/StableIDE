import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'

import { useCSuite } from '../../csuite/ctx/useCSuite'
import { Frame } from '../../csuite/frame/Frame'
import { PanelHeaderUI } from '../../csuite/panel/PanelHeaderUI'
import { Panel, type PanelHeader } from '../../router/Panel'
import { PanelAssetsShelfUI } from './PanelAssetsShelfUI'

/** This is going to be rudementary for now, including only Loras atm. */
export const PanelAssets = new Panel({
   name: 'Assets',
   widget: (): React.FC<PanelAssetsProps> => PanelAssetsUI,
   header: (p: PanelAssetsProps): PanelHeader => ({ title: 'Assets' }),
   def: (): PanelAssetsProps => ({ active: -1, selected: new Set() }),
   icon: 'mdiBookOpenOutline',
   category: 'tools',
})

export type PanelAssetsProps = {
   uid?: number | string
   /** Should maybe be the item itself instead of a number? This is just for skeleton */
   active: number
   /** Array of indexes, not sure if I like this approach. I think I would prefer the item itself to know if it is selected. But each panel should have a different state, so hmmmm... */
   selected: Set<number>
}

export class PanelAssetsState {
   constructor(public props: PanelAssetsProps) {
      makeAutoObservable(this)
   }
}

export const PanelAssetsUI = observer(function PanelAssetsUI_(p: PanelAssetsProps) {
   const uist = useMemo(() => new PanelAssetsState({ active: -1, selected: new Set() }), [])
   // const panel = usePanel<PanelAssetsProps>()
   return (
      <>
         <PanelHeaderUI>This is in progress, nothing works</PanelHeaderUI>
         <AssetContent st={uist} />
      </>
   )
})

// TODO: (bird_d): Pages need a selectui to change the page viewing, unsure if that's the right approach though instead of just using filters.
const AssetContent = observer(function AssetContent_(p: { st: PanelAssetsState }) {
   return (
      <Frame //
         tw='flex h-full w-full overflow-auto'
      >
         <AssetPageLora st={p.st} />
         <PanelAssetsShelfUI st={p.st} />
      </Frame>
   )
})

/** Lora Assets Page
 * If connected to server, display a list of loras
 * The loras must have a drag handler, allowing us to drag a "Lora" "datatype"
 *  (Like drop and drag from the OS) in to various drop locations that will handle the Lora datatype.
 *
 *  What things should handle a drop
 *  WidgetPrompt: Insert the string of text that would add it to the prompt.
 *  Unified Canvas
 *      - Layers: Insert as a modifier for whichever layer (Generative only?)
 *      - Canvas:
 *          = Insert the Lora's pic?
 *          = Quickly generate an image using the lora and put it in the canvas?
 */
const AssetPageLora = observer(function AssetPageLora_(p: { st: PanelAssetsState }) {
   const loras = cushy.schema.getLoras()

   if (!cushy.mainHost.isConnected) {
      return 'Not connected to host, can not display Loras'
   }

   const theme = cushy.preferences.theme.value
   const selectedItems = p.st.props.selected

   return (
      <Frame //
         tw='flex h-full w-full gap-1 overflow-auto p-1'
         wrap
         onMouseDown={(e) => {
            // Prevent misclicks from de-selecting when trying to select more.
            if (e.ctrlKey || e.shiftKey) {
               return
            }

            // Deselect
            p.st.props.active = -1
            p.st.props.selected.clear()
         }}
      >
         {loras.map((loraPath, index) => {
            /**  I'm lazy, if there's a better way to do this string split.
             *  We should really be pulling info from the comfy instance itself.
             *  We need the model hash. Preferably all the metadata,
             *  but with the hash we can pull info from civit and then store it in the local DB.
             *
             */
            const name = loraPath.toString().split('/').pop()?.split('.safetensor').shift()
            const selected = p.st.props.selected.has(index)

            return (
               <Frame //
                  key={index}
                  tw='flex h-40 w-32 select-none flex-col overflow-clip !border-none'
                  tooltip={`${name}\nReplace with description of Lora.`}
                  active
                  border={false}
                  base={selected ? { contrast: 0.1, chroma: 0.11 } : { contrast: 0 }}
                  hover
                  roundness={theme.global.roundness}
                  onMouseDown={(e) => {
                     e.stopPropagation()
                     if (e.ctrlKey && e.shiftKey) {
                        return
                     }

                     // Toggle selection for this index, do not clear.
                     if (e.ctrlKey) {
                        if (selected) {
                           selectedItems.delete(index)

                           if (selectedItems.size == 0) {
                              p.st.props.active = -1
                           }
                           return
                        }

                        // Only make active when also adding to selected
                        p.st.props.active = index
                        selectedItems.add(index)
                        return
                     }

                     p.st.props.active = index

                     // Select all from an already selected previous index to the current position
                     if (e.shiftKey) {
                        // If none are selected, select and do nothing else
                        if (selectedItems.size == 0) {
                           selectedItems.add(index)
                           return
                        }
                        let start = -1
                        let end = -1

                        for (const i of [...selectedItems].sort((a, b) => a - b)) {
                           // If there wasn't anything before, but there is a selection after, select everything between those instead.
                           if (i > index) {
                              if (start == -1) {
                                 start = index
                                 end = i
                              }
                              break
                           }
                           start = i
                        }

                        if (end == -1) {
                           end = index
                        }

                        if (start == -1 || end == -1) {
                           return
                        }

                        for (let i = start; i <= end; i++) {
                           selectedItems.add(i)
                        }
                        return
                     }

                     // Deselect all (Normal click)
                     selectedItems.clear()
                     selectedItems.add(index)
                  }}
               >
                  <Frame //
                     tw='flex h-32 w-32 flex-1 flex-grow items-center justify-center'
                  >
                     <span tw='text-5xl'>🥚</span>
                  </Frame>
                  <div tw='flex-shrink-1 flex items-center justify-center whitespace-nowrap text-center'>
                     <span tw='truncate whitespace-nowrap p-1 text-sm'>{name}</span>
                  </div>
               </Frame>
            )
         })}
      </Frame>
   )
})
