import type { DropdownProps } from '../../../csuite/dropdown/Dropdown'
import type { Field } from '../../../csuite/model/Field'

import { observer } from 'mobx-react-lite'

import { UI } from '../../../csuite/components/UI'

export type WidgetPresetsProps = {
   field: Field
} & Omit<DropdownProps, 'title'>

export const WidgetPresetsUI = observer(function WidgetPresets({
   //own props
   field,

   // modified dropdown props
   button,
   content, // 🔶 discarded

   // rest
   ...rest
}: WidgetPresetsProps) {
   const presets = field.config.presets
   const presetCount = presets?.length ?? 0
   if (presets == null) return null
   if (presetCount == 0) return null
   const title = `${presetCount} preset${presetCount > 1 ? 's' : ''}`
   return (
      <UI.Dropdown
         title={title}
         button={
            button ?? (
               <UI.Button
                  /* borderless */
                  description={title}
                  tooltipPlacement='top'
                  subtle
                  borderless
                  icon='mdiBookOutline'
                  // children={presetCount}
               />
            )
         }
         content={() => {
            return presets.map((preset) => (
               <UI.Dropdown.Item //
                  key={preset.label}
                  icon={preset.icon}
                  onClick={() => preset.apply(field)}
                  label={preset.label}
               />
            ))
         }}
         {...rest}
      />
   )
})
