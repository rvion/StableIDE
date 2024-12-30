import type { SchemaDict } from '../../model/SchemaDict'
import type { Field_choices } from './FieldChoices'

import { observer } from 'mobx-react-lite'

import OverflowingRowUI from '../../../panels/PanelDraft/OverflowingRowUI'
import { InputBoolUI } from '../../checkbox/InputBoolUI'
import { useCSuite } from '../../ctx/useCSuite'
import { Frame } from '../../frame/Frame'

export const WidgetChoices_HeaderTabBarUI = observer(function WidgetChoices_HeaderTabBarUI<
   T extends SchemaDict,
>(p: { field: Field_choices<T> }) {
   const field = p.field
   const choices = field.choicesWithLabels // choicesStr.map((v) => ({ key: v }))
   return (
      <Frame tw='h-widget grid grid-rows-1' expand>
         <OverflowingRowUI tw='h-full items-center gap-1'>
            {choices.map((c) => {
               const isSelected = field.isBranchEnabled(c.key) // serial.branches[c.key]
               return (
                  <InputBoolUI
                     toggleGroup={field.id}
                     icon={c.icon}
                     key={c.key}
                     value={isSelected}
                     display='button'
                     mode={p.field.isMulti ? 'checkbox' : 'radio'}
                     text={c.label ?? c.key}
                     onValueChange={(value) => {
                        if (value != isSelected) {
                           field.toggleBranch(c.key)
                        }
                     }}
                  />
               )
            })}
         </OverflowingRowUI>
      </Frame>
   )
})
