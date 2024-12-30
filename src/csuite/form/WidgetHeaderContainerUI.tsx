import type { Field } from '../model/Field'

import { observer } from 'mobx-react-lite'

import { ErrorBoundaryUI } from '../errors/ErrorBoundaryUI'
import { Frame, type FrameProps } from '../frame/Frame'

export type WidgetHeaderContainerProps = {
   field: Field
} & FrameProps

export const WidgetHeaderContainerUI = observer(function WidgetHeaderContainerUI_({
   // own
   field,

   // modified
   triggerOnPress,
   onClick,

   // rest
   ...rest
}: WidgetHeaderContainerProps) {
   const isCollapsed = field.isCollapsed
   return (
      <ErrorBoundaryUI>
         <Frame
            tw={[
               'COLLAPSE-PASSTHROUGH',
               'flex min-w-0 flex-1 select-none gap-0.5',

               // 💬 2024-10-10 rvion:
               // 'h-widget',
               // 'UI-WidgetHeaderContainer',

               // 💬 2024-06-03 rvion, changing 'items-center' to 'items-start'
               // as well as adding some `h-input` class to <WidgetLabelContainerUI />
               'items-center',
            ]}
            // hover={2} // 🚂 we prefer to not have this hover
            triggerOnPress={triggerOnPress ?? { startingState: isCollapsed, toggleGroup: 'collapse' }}
            onClick={
               onClick ??
               ((ev): void => {
                  if (ev.button != 0 || !field.isCollapsible) return
                  const target = ev.target as HTMLElement
                  if (!target.classList.contains('COLLAPSE-PASSTHROUGH')) return
                  field.setCollapsed(!isCollapsed)
               })
            }
            {...rest}
         />
      </ErrorBoundaryUI>
   )
})
