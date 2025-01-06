import type { Field_bool } from './FieldBool'

import { observer } from 'mobx-react-lite'

import { InputBoolUI } from '../../checkbox/InputBoolUI'
import { SpacerUI } from '../../components/SpacerUI'

export const WidgetBoolUI = observer(function WidgetBoolUI_(p: { field: Field_bool }) {
   const field = p.field

   if (field.config.label2) {
      console.warn(
         'label2 is deprecated, please use the text option instead. label2 will be removed in the future',
      )
   }

   return (
      // <div tw='flex h-full w-full '>
      <InputBoolUI
         // config
         display={field.config.display}
         expand={field.config.display === 'button' ? field.config.expand : true}
         icon={field.icon}
         widgetLabel={field.config.text ?? field.config.label2}
         // value
         value={field.value_or_zero}
         onBlur={() => field.touch()}
         onValueChange={(value) => {
            field.value = value
            p.field.touch()
         }}
         toggleGroup={'field-bool'}
      />
      // <SpacerUI />
      // </div>
   )
})
