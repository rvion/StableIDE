import type { Field_list } from './FieldList'

import { observer } from 'mobx-react-lite'

import { Button } from '../../button/Button'

// const ListDragHandleUI = ((p: { ix: number; field: Field, ref?: ObservableRef<HTMLDivElement>}, ref) => {
//    return (
//       //TODO (bird_d): FIX UI - Needs to be Button when ref is implemented.
//       <div ref={ref} onClick={(ev) => p.field.toggleCollapsed()}>
//          <Button size='input' subtle borderless square icon='mdiDragHorizontalVariant' />
//       </div>
//    )
// })

export const ListItemMoveUpButtonUI = observer(function ListItemMoveUpButtonUI_({
   listField,
   ix,
}: {
   listField: Field_list<any>
   ix: number
}) {
   return (
      <Button
         disabled={ix === 0}
         onClick={(ev) => {
            listField.moveItem(ix, ix - 1)
            listField.touch()
            ev.preventDefault()
            ev.stopPropagation()
         }}
         square
         borderless
         subtle
         size='xs'
         icon='mdiArrowUp'
      />
   )
})
