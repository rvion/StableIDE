import type { Field } from '../../../csuite/model/Field'

import { observer } from 'mobx-react-lite'

import { Frame } from '../../../csuite/frame/Frame'

export type WidgetCardProps = {
   hue?: number // (bird_d/legacy) ?
   field: Field
   children: any
   enablePadding?: boolean
}

// (bird_d): No longer do padding here because we want the widgets to lay themselves out and having a global padding will ruin this. For example say we want a subgroup with a different background contrast, it would also be padded and look bad.

/** Decoration that surrounds widget groups */
export const WidgetCardUI = observer(function WidgetCardUI_(p: WidgetCardProps) {
   const theme = cushy.preferences.theme.value
   const enablePadding = !p.field.isCollapsed
   return (
      <Frame
         // Clipping here fixes border's corners since child content goes outside of this component.
         tw='overflow-clip'
         border={theme.groups.border ?? { contrast: 0 }}
         base={theme.groups.contrast}
         roundness={theme.global.roundness}
         style={
            enablePadding
               ? {
                    //   paddingBottom: `${theme.groups.padding / 2}rem`,
                    //   paddingTop: `${theme.groups.padding / 2}rem`,
                 }
               : {}
         }
      >
         {p.children}
      </Frame>
   )
})
