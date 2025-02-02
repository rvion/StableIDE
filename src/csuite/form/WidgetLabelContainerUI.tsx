import type { RevealPlacement } from '../reveal/RevealPlacement'
import type { CSSProperties } from 'react'

import { observer } from 'mobx-react-lite'

import { Frame } from '../../csuite/frame/Frame'

export type WidgetLabelContainerProps = {
   //
   justify: boolean
   className?: string
   children: React.ReactNode
   tooltip?: string
   tooltipPlacement?: RevealPlacement
}

export const WidgetLabelContainerUI = observer(function WidgetLabelContainerUI_(
   p: WidgetLabelContainerProps,
) {
   // const theme = cushy.preferences.theme.value
   return (
      <Frame
         // NOTE(bird_d): tooltips should be on the interact-able component, not the label
         // tooltip={p.tooltip}
         // tooltipPlacement={p.tooltipPlacement ?? 'topStart'}
         className={p.className}
         // hover={1}
         // expand
         tw={[
            'UI-WidgetLabelContainer', //
            'COLLAPSE-PASSTHROUGH',
            'flex items-center self-stretch',
            'flex-none shrink-0',
            // NOTE(bird_d): Does not need to have a background, breaks rounded corners on parent components
            '!bg-transparent',
         ]}
         style={p.justify ? justifiedStyle : undefined}
         // TODO(bird_d/ui/theme/text)
         // text={theme.textLabel}
      >
         {p.children}
      </Frame>
   )
})

const justifiedStyle: CSSProperties = {
   minWidth: '8rem', // 🔴 move to theme options
   // maxWidth: '20rem', // 🔴 move to theme options
   maxWidth: '15rem', // 🔴 move to theme options
   width: '35%', // 🔴 move to theme options
   justifyContent: 'flex-start',
}
