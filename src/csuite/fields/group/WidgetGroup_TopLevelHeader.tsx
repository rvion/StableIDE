import type { Field_group, Field_group_types } from './FieldGroup'
import type { ReactNode } from 'react'

import { observer } from 'mobx-react-lite'

import { Button } from '../../button/Button'
import { UI } from '../../components/UI'
import { useCSuite } from '../../ctx/useCSuite'

// import { WidgetSingleLineSummaryUI } from '../../form/WidgetSingleLineSummaryUI'

export const WidgetGroup_LineUI = observer(function WidgetGroup_LineUI_(p: {
   field: Field_group<Field_group_types<any>>
}) {
   const field = p.field
   // if (p.field.serial.collapsed)
   //    return <WidgetSingleLineSummaryUI>{p.field.summary}</WidgetSingleLineSummaryUI>
   const preferences = cushy.preferences

   const presets = field.config.presets
   const presetCount = presets?.length ?? 0
   const out: ReactNode[] = []
   const showFoldButtons = preferences.interface.value.widget.showFoldButtons
   const hasFoldableSubfields = field.hasFoldableSubfields
   if (presets && presetCount > 0 && field.config.presetButtons) {
      out.push(
         ...presets.map((preset, ix) => (
            <UI.Button //
               key={preset.label + ix}
               // square
               // subtle
               icon={preset.icon}
               onClick={(ev) => {
                  preset.apply(field)
                  ev.stopPropagation()
                  field.touch()
               }}
               children={preset.label}
            />
         )),
      )
   }
   if (showFoldButtons && hasFoldableSubfields) {
      out.push(
         <div tw='ml-auto flex gap-0.5' key='lShd8JZuFZ'>
            <Button //
               square
               subtle
               borderless
               icon='mdiUnfoldMoreHorizontal'
               disabled={!field.hasFoldableSubfieldsThatAreFolded}
               onClick={() => {
                  p.field.expandAllChildren()
                  field.touch()
               }}
            />

            <Button //
               square
               subtle
               borderless
               icon='mdiUnfoldLessHorizontal'
               disabled={!field.hasFoldableSubfieldsThatAreUnfolded}
               onClick={() => {
                  p.field.collapseAllChildren()
                  field.touch()
               }}
            />
         </div>,
      )
   }
   if (out.length == 0) return null
   return out
})
