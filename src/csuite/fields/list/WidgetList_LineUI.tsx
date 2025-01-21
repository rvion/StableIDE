import type { Field_list } from './FieldList'

import { observer } from 'mobx-react-lite'
import { type FC } from 'react'

import { ListControlsUI } from './ListControlsUI'

// TODO (bird_d): Make collapse button on left, probably just re-use a "Group" component in this widget.
export const WidgetList_LineUI: FC<{ field: Field_list<any> }> = observer(function WidgetList_LineUI_(p: {
   field: Field_list<any>
}): React.JSX.Element {
   return (
      <div tw='COLLAPSE-PASSTHROUGH flex flex-1 items-center'>
         {p.field.isAuto ? null : (
            <ListControlsUI field={p.field}>
               <div tw='whitespace-nowrap text-sm italic text-gray-500'>{p.field.length} items</div>
            </ListControlsUI>
         )}
      </div>
   )
})
