import type { Field } from '../model/Field'

import { observer } from 'mobx-react-lite'

import { InputBoolUI } from '../checkbox/InputBoolUI'

export type WidgetToggleProps = {
   className?: string
   field: Field
}

export const WidgetToggleUI = observer(function WidgetToggleUI_(p: WidgetToggleProps) {
   const isTogglable = p.field.canBeToggledWithinParent
   if (!isTogglable) return null
   // if (!isFieldOptional(p.field)) return
   // const field = p.field as Field_optional
   const isActive = p.field.isEnabledWithinParent
   return (
      <InputBoolUI // toggle to activate/deactivate the optional widget
         toggleGroup={p.field.id}
         tw='UI-WidgetToggle !self-center'
         className={p.className}
         value={isActive}
         expand={false}
         onValueChange={(value) =>
            isActive //
               ? p.field.disableSelfWithinParent()
               : p.field.enableSelfWithinParent()
         }
      />
   )
})
