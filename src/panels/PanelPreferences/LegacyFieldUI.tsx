import { observer } from 'mobx-react-lite'

import { WidgetLabelContainerUI } from '../../csuite/form/WidgetLabelContainerUI'

export const LegacyFieldUI = observer(function LegacyFieldUI_(p: {
   required?: boolean
   label?: string
   help?: string
   className?: string
   children: React.ReactNode
}) {
   return (
      <div className={p.className} tw='flex items-center gap-2'>
         <WidgetLabelContainerUI justify>
            <label tw='whitespace-nowrap'>{p.label}</label>
         </WidgetLabelContainerUI>
         {p.children}
         {p.required && <div tw='join-item'>Required</div>}
      </div>
   )
})
