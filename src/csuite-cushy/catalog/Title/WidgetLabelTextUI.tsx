import type { Field } from '../../../csuite/model/Field'
import type { ReactNode } from 'react'

import { observer } from 'mobx-react-lite'

import { Frame } from '../../../csuite/frame/Frame'
import { makeLabelFromPrimitiveValue } from '../../../csuite/utils/makeLabelFromFieldName'

export type WidgetTitleProps = {
   field: Field
   as?: string
   className?: string
   children?: ReactNode
}

export const DefaultWidgetTitleUI = observer(function DefaultWidgetTitle(p: WidgetTitleProps) {
   const labelText = p.children ?? p.field.config.label ?? makeLabelFromPrimitiveValue(p.field.mountKey)
   // const Elem: 'div' = (p.as ?? 'div') as 'div'
   return (
      // Using Frame for the tooltips
      <Frame
         // TODO(bird_d/interface/option): Add option to toggle label text tooltips, until a more robust method that determines if the text is truncated comes along
         description={labelText.toString()}
         // (bird_d): I'm hoping this makes things more efficient since it was just a div before?
         noColorStuff
         tw={[
            'UI-WidgetLabel',
            'lh-widget minh-widget',
            'self-start',
            // NOTE(bird_d): Labels don't need a background it's just text, having a bg messes up the parent's rounded corners.
            '!bg-transparent',
            // 'overflow-hidden whitespace-nowrap',

            // 1. indicate we can click on the label
            'COLLAPSE-PASSTHROUGH',
            // p.field.isCollapsed || p.field.isCollapsible ? 'cursor-pointer COLLAPSE-PASSTHROUGH' : null,

            // 3. label wrappign strategy
            // 3.1  alt. 1: disable all wrapping
            // 'whitespace-nowrap',

            // 3.2. alt. 2:
            //  - limit to 2 lines, with ellipsis,
            //  - dense line height to force widget to remain within it's
            //  - original allocated height
            // 'line-clamp-2',

            // 3.3. alt. 3:
            // '[lineHeight:1.3rem] overflow-auto',

            // NOTE(bird_d): Removed this option, we should always truncate text as we don't want fields to move vertically, changing the size of a region horizontally should never effect the layout/position of fields. The user should be at the exact same field that they were at before they resized the area/region/window.
            'truncate',

            p.className,
         ]}
      >
         {p.field.isHidden && '🥷 '}
         {labelText}
      </Frame>
   )
})
