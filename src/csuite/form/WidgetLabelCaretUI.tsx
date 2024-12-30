import type { Field } from '../model/Field'

import { observer } from 'mobx-react-lite'

import { Frame } from '../frame/Frame'
import { WidgetLabelCaretPlaceholderUI } from './WidgetLabelCaretPlaceholderUI'

export const LabelCaretWidth: '1rem' = '1rem'

export type WidgetLabelCaretProps = {
   className?: string
   /** @default true */
   placeholder?: boolean
   field: Field
}

export const WidgetLabelCaretUI = observer(function WidgetLabelCaretUI_(p: WidgetLabelCaretProps) {
   const preferences = cushy.preferences

   // (bird_d): This is always true in cushy, does not have an option.
   // if (!preferences.interface.value.widgetshowExpandCarets) return null
   if (p.field.parent == null) return null
   if (!p.field.isCollapsed && !p.field.isCollapsible) {
      const showPlaceholder = p.placeholder ?? true
      // 🔴
      if (showPlaceholder) return <WidgetLabelCaretPlaceholderUI className={p.className} />
      return null
   }
   return (
      <WidgetLabelCaretAlwaysUI //
         tw='text-sm'
         className={p.className}
         isCollapsed={p.field.isCollapsed}
      />
   )
})

const WidgetLabelCaretAlwaysUI = observer(function WidgetLabelCaretAlways_({
   isCollapsed,
   className,
}: {
   className?: string
   isCollapsed: boolean
}) {
   // 🔴 TODO:caret

   return (
      <Frame
         className={className}
         tw={[
            //
            'UI-WidgetLabelCaret minh-widget self-start',
            'COLLAPSE-PASSTHROUGH shrink-0',
            'px-0.5',
         ]}
         // TODO(bird_d/variables/negative): isCollapsed should be isExpanded. We should try to always use a "positive" version of an action.
         icon={isCollapsed ? 'mdiChevronRight' : 'mdiChevronDown'}
         square
      />
   )
})
