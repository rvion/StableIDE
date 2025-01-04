import type { Field } from '../../model/Field'
import type { Field_number } from './FieldNumber'

import { observer } from 'mobx-react-lite'
import { type ReactNode } from 'react'

import { InputNumberUI } from '../../input-number/InputNumberUI'

export const WidgetNumberUI = observer(function WidgetNumberUI_(p: { field: Field_number }) {
   const field = p.field
   const value = field.value_or_zero
   const mode = field.config.mode
   const step = field.config.step ?? (mode === 'int' ? 1 : 0.1)

   return (
      <InputNumberUI
         mode={mode === 'int' ? 'int' : 'float'}
         value={value}
         hideSlider={field.config.hideSlider}
         max={field.config.max}
         min={field.config.min}
         softMin={field.config.softMin}
         softMax={field.config.softMax}
         step={step}
         suffix={field.config.suffix}
         text={field.config.text}
         onValueChange={(next) => void (field.value = next)}
         forceSnap={field.config.forceSnap}
         tooltip={<WidgetTooltipUI field={field} />}
      />
   )
})

export const WidgetTooltipUI = observer(function WidgetTooltipUI_({ field }: { field: Field }) {
   return (
      <div tw='py-1 px-2'>
         <div tw='flex flex-col'>
            <span>{field.labelText}</span>
            {field.config.description ? <span>{field.config.description}</span> : <></>}
            {cushy.preferences.interface.DeveloperOptions.ShowDeveloperTooltips.value && (
               <span tw='opacity-75'>{field.path}</span>
            )}
         </div>
      </div>
   )
})
