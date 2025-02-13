import type { CompiledRenderProps } from '../../../csuite-cushy/presenters/RenderTypes'
import type { Field_optional } from './FieldOptional'

import { observer } from 'mobx-react-lite'

import { WidgetToggleUI } from '../../form/WidgetToggleUI'
import { renderFCOrNode } from '../../utils/renderFCOrNode'

export const ShellOptionalUI = observer(function ShellOptionalUI_(p: CompiledRenderProps<Field_optional>) {
   const field = p.field
   const extraClass = field.isDisabled ? 'pointer-events-none opacity-30 bg-[#00000005]' : undefined
   const child = field.child
   return (
      <child.UI //
         UpDownBtn={p.UpDownBtn}
         DeleteBtn={p.DeleteBtn}
         Toogle={<WidgetToggleUI field={child} />}
         Title={(x) => renderFCOrNode(p.Title, { field: field })}
         classNameAroundBodyAndHeader={extraClass}
      />
   )
})

export const ShellOptionalEnabledUI = observer(function ShellOptionalEnabledUI_(
   p: CompiledRenderProps<Field_optional>,
) {
   const field = p.field
   // const extraClass = field.isDisabled ? 'pointer-events-none opacity-30 bg-[#00000005]' : undefined
   const child = field.child
   return (
      <child.UI //
         UpDownBtn={p.UpDownBtn}
         DeleteBtn={p.DeleteBtn}
         // Toogle={<child.UIToggle />}
         // Title={(x) => renderFCOrNode(p.Title, { field: field })}
      />
   )
})
