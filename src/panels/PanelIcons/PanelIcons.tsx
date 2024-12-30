import type { NO_PROPS } from '../../csuite/types/NO_PROPS'

import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { FixedSizeGrid } from 'react-window'

import { Button } from '../../csuite/button/Button'
import { ToggleButtonUI } from '../../csuite/checkbox/InputBoolToggleButtonUI'
import { SpacerUI } from '../../csuite/components/SpacerUI'
import { useCSuite } from '../../csuite/ctx/useCSuite'
import { Frame } from '../../csuite/frame/Frame'
import { InputStringUI } from '../../csuite/input-string/InputStringUI'
import { PanelHeaderUI } from '../../csuite/panel/PanelHeaderUI'
import { useSizeOf } from '../../csuite/smooth-size/useSizeOf'
import { Panel, type PanelHeader } from '../../router/Panel'
import { usePanel } from '../../router/usePanel'
import { IconPanelStableState } from './PanelIconsState'

export const PanelIcon = new Panel({
   name: 'Icons',
   category: 'developper',
   widget: (): React.FC<NO_PROPS> => PanelIconUI,
   header: (_: NO_PROPS): PanelHeader => ({ title: 'Icons', icon: 'mdiImageSyncOutline' }),
   def: (): NO_PROPS => ({}),
   icon: 'mdiImageSyncOutline',
})

export const PanelIconUI = observer(function PanelIconUI_(p: NO_PROPS) {
   const { ref: refFn, size } = useSizeOf()
   const panel = usePanel()
   const form = panel.usePersistentModel('misc', (ui) =>
      ui.fields(
         {
            query: ui.string({ placeHolder: 'Search', default: '', innerIcon: 'mdiSearchWeb' }),
            size: ui.int({ text: 'Size', min: 32, max: 500, default: 64, step: 24 }),
         },
         { collapsed: false },
      ),
   )

   const uist = useMemo(() => new IconPanelStableState(), [])
   const allIcons = uist.allIcons
   const total = allIcons.length
   const itemSize = form.value.size
   const itemWidth = itemSize /* 100 */
   const itemHeight = itemSize /* 100 */
   const containerWidth = size.width ?? 100
   const containerHeight = size.height ?? 100
   const nbCols = Math.floor(containerWidth / itemWidth) || 1
   const nbRows = Math.ceil(total / nbCols) + 1
   const theme = cushy.preferences.theme.value

   return (
      <div tw='flex h-full w-full flex-col'>
         <PanelHeaderUI>
            {/* {form.fields.query.header()} */}
            <SpacerUI />
            <Frame // TODO(bird_d): (FIX-FIELD) Should use a "row" component here? Need a component so I don't have to keep adding the theming over and over for this
               align
               border={theme.global.border}
               roundness={theme.global.roundness}
            >
               <InputStringUI
                  // autoResize
                  clearable
                  placeholder='Search...'
                  icon='mdiMagnify'
                  autoFocus
                  getValue={() => uist.query}
                  setValue={(val) =>
                     runInAction(() => {
                        uist.query = val
                     })
                  }
               />
               <ToggleButtonUI
                  toggleGroup='panel-icon-filter'
                  value={uist.filter}
                  icon={uist.filter ? 'mdiFilter' : 'mdiFilterOff'}
                  hover
                  onValueChange={() => {
                     uist.filter = !uist.filter
                  }}
               />
            </Frame>
            <SpacerUI />
            <Button
               onClick={() => {
                  uist.recent = []
               }}
            >
               Clear Recent
            </Button>
            {form.renderAsConfigBtn({ title: 'Icon Settings' })}
         </PanelHeaderUI>

         <Frame // RECENTLY COPIED ICONS
            base={{ contrast: -0.025 }}
            tw='flex w-full items-center justify-center'
            style={{ height: itemHeight + 8, padding: '4px' }}
         >
            {uist.recent.map((iconName) => {
               return (
                  <Button //
                     key={iconName}
                     borderless
                     subtle
                     style={{ height: itemHeight, width: itemWidth }}
                     icon={iconName}
                     iconSize='80%'
                     onClick={() => uist.copy(iconName)}
                  />
               )
            })}
         </Frame>

         <Frame // MATCHING ICONS
            text={{ contrast: 0.5, chroma: 0.1, hueShift: 100 }}
            ref={refFn}
            tw='flex-1 overflow-clip'
         >
            <FixedSizeGrid //
               // key={``}
               // container
               height={containerHeight}
               width={containerWidth}
               // dims
               columnCount={nbCols}
               rowCount={nbRows}
               // items
               columnWidth={itemWidth}
               rowHeight={itemHeight}
            >
               {({ columnIndex, rowIndex, style }) => {
                  const iconName = allIcons[rowIndex * nbCols + columnIndex]
                  if (iconName == null) return
                  const matchPrimaryName = iconName.toLowerCase().includes(uist.query)
                  const aliases = uist.aliasesFor(iconName)
                  // if (matchPrimaryName) return '🟢'
                  // return '🔴'
                  return (
                     <Button //
                        borderless
                        subtle
                        tooltip={iconName + (aliases != null ? ` (aliases: ${JSON.stringify(aliases)})` : '')}
                        base={{ hueShift: matchPrimaryName ? undefined : -100 }}
                        style={style}
                        icon={iconName}
                        iconSize='80%'
                        onClick={() => uist.copy(iconName)}
                     />
                  )
               }}
            </FixedSizeGrid>
         </Frame>
      </div>
   )
})
