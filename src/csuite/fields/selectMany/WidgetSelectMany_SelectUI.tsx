import type { SelectProps } from '../../select/SelectProps'
import type { SelectKey } from '../selectOne/SelectOneKey'
import type { SelectOption } from '../selectOne/SelectOption'
import type { Field_selectMany } from './FieldSelectMany'

import { observer } from 'mobx-react-lite'

import { InputBoolFlipButtonUI } from '../../checkbox/InputBoolFlipButtonUI'
import { SelectUI } from '../../select/SelectUI'
import { makeLabelFromPrimitiveValue } from '../../utils/makeLabelFromFieldName'

export const WidgetSelectMany_SelectUI = observer(function WidgetSelectMany_SelectUI_<
   //
   VALUE extends any,
   KEY extends SelectKey,
>(p: {
   field: Field_selectMany<VALUE, KEY>
   selectProps?: Partial<SelectProps<SelectOption<VALUE, KEY> | undefined>>
}) {
   const field = p.field
   type OPTION = SelectOption<VALUE, KEY> | undefined
   return (
      <div tw='flex w-full flex-1 gap-1'>
         <SelectUI<OPTION>
            hasErrors={p.field.mustDisplayErrors}
            multiple
            wrap={field.wrap}
            tw={[
               field.ownTypeSpecificProblems != null &&
                  field.ownTypeSpecificProblems.length > 0 &&
                  'rsx-field-error',
            ]}
            getLabelText={(t: OPTION): string => {
               if (t == null) return field.config.placeholder ?? '<null>'
               return t.label ?? makeLabelFromPrimitiveValue(t.id)
            }}
            OptionLabelUI={field.config.OptionLabelUI}
            getSearchQuery={() => field.query}
            setSearchQuery={(query) => (field.query = query)}
            disableLocalFiltering={field.config.disableLocalFiltering}
            options={() => field.options}
            createOption={field.config.createOption}
            value={() => field.selectedOptions}
            equalityCheck={(a, b) => a?.id === b?.id}
            onOptionToggled={(selectOption) => {
               // wehn selectOption is null, it means the field is no longer set
               // user picked the '--' value to reset the state to its unset state.
               if (selectOption == null) return field.unset()

               field.toggleId(selectOption.id)
               field.touch()
            }}
            onCleared={
               field.canBeToggledWithinParent &&
               // 🔴 ARE THOSE TRHE CONDITIONS BELOW CORRECT ?
               field.isEnabledWithinParent &&
               !field.config.readonly &&
               !field.parent?.config.readonly
                  ? (): void => {
                       field.disableSelfWithinParent()
                       field.touch()
                       p.selectProps?.onCleared?.()
                    }
                  : null
            }
            placeholder={field.config.placeholder}
            {...p.selectProps}
            revealProps={{
               ...p.selectProps?.revealProps,
               onHidden: (reason) => {
                  field.touch()
                  p.selectProps?.revealProps?.onHidden?.(reason)
               },
            }}
         />
         {field.config.wrapButton && (
            <InputBoolFlipButtonUI
               toggleGroup={field.id}
               description='Wrap items'
               tw='self-start'
               icon={p.field.wrap ? 'mdiWrapDisabled' : 'mdiWrap'}
               value={p.field.wrap}
               onValueChange={(next) => {
                  p.field.wrap = next
                  p.field.touch()
               }}
               onBlur={() => p.field.touch()}
            />
         )}
      </div>
   )
})
