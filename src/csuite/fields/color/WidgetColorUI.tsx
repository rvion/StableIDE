import type { Field_color } from './FieldColor'

import { observer } from 'mobx-react-lite'

import { InputColorUI } from './InputColorUI'

export const WidgetColorUI = observer(function WidgetColorUI_(p: { field: Field_color }) {
   const field = p.field
   return (
      <InputColorUI //
         getValue={() => field.value_unchecked ?? ''}
         setValue={(value) => {
            field.value = value
            field.touch()
         }}
         // onBlur={() => field.touch()}
      />
   )
})
