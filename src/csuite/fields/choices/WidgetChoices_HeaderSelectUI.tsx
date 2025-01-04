import type { SchemaDict } from '../../model/SchemaDict'
import type { Field_choices } from './FieldChoices'

import { observer } from 'mobx-react-lite'

import { csuiteConfig } from '../../config/configureCsuite'
import { SelectUI } from '../../select/SelectUI'
import { WidgetTooltipUI } from '../number/WidgetNumberUI'

export const WidgetChoices_HeaderSelectUI = observer(function WidgetChoices_HeaderSelectUI_<
   T extends SchemaDict,
>(p: { field: Field_choices<T> }) {
   const field = p.field
   type Entry = { key: string; label: string }
   const choices: Entry[] = field.choicesWithLabels
   const isActive = !p.field.canBeToggledWithinParent || !p.field.isInsideDisabledBranch

   return (
      <div
         tw='relative flex flex-1 flex-row gap-2'
         onMouseDown={(ev) => {
            ev.preventDefault()
            ev.stopPropagation()
         }}
      >
         <SelectUI<Entry>
            tw='flex-grow'
            key={`${isActive}`}
            placeholder={p.field.config.placeholder ?? csuiteConfig.i18n.ui.field.empty}
            value={() =>
               field.activeBranchNames.map((key) => ({
                  key,
                  label: choices.find((v) => v.key === key)?.label ?? key,
               }))
            }
            options={() => choices}
            getLabelText={(v) => v.label}
            // OptionLabelUI={(v) => (
            //     <div tw='flex flex-1 justify-between'>
            //         <div tw='flex-1'>{v.label}</div>
            //     </div>
            // )}
            equalityCheck={(a, b) => a.key === b.key}
            multiple={field.config.multi ?? false}
            closeOnPick={true}
            resetQueryOnPick={false}
            onOptionToggled={(v) => {
               // 🔴 DUBIOUS
               if (p.field.canBeToggledWithinParent) p.field.enableSelfWithinParent()
               field.toggleBranch(v.key)
               p.field.touch()
            }}
            tooltip={<WidgetTooltipUI field={field} />}
         />
      </div>
   )
})
