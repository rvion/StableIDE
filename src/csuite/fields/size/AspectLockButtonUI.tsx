import type { Field_size } from './FieldSize'

import { observer } from 'mobx-react-lite'

import { Button } from '../../button/Button'
import { useCSuite } from '../../ctx/useCSuite'
import { Dropdown } from '../../dropdown/Dropdown'
import { Frame } from '../../frame/Frame'
import { WigetSizeXUI } from './WigetSizeXUI'

export const AspectLockButtonUI = observer(function AspectLockButtonUI_(p: { sizeHelper: Field_size }) {
   const uist = p.sizeHelper
   const theme = cushy.preferences.theme.value

   return (
      <Frame
         border={theme.global.border}
         roundness={theme.global.roundness}
         dropShadow={theme.global.shadow}
         align
         col
      >
         {/* <ToggleButtonUI // Aspect Lock button
                   toggleGroup='aspect-ratio-lock'
                   square
                   // size='input'
                   value={uist.isAspectRatioLocked}
                   icon={uist.isAspectRatioLocked ? 'mdiLink' : 'mdiLinkOff'}
                   onValueChange={(ev) => {
                       uist.isAspectRatioLocked = !uist.isAspectRatioLocked
                       if (!uist.isAspectRatioLocked) return
                       // Need to snap value if linked
                       if (uist.wasHeightAdjustedLast) uist.setHeight(uist.height)
                       else uist.setWidth(uist.width)
                   }}
               /> */}
         <Button
            tooltip='Lock aspect ratio'
            square
            size='input'
            base={{ contrast: uist.isAspectRatioLocked ? 0.2 : 0.0 }}
            tw='flex flex-1 !gap-0 !rounded-none !px-0.5'
            // tw='!gap-0 !px-0.5 !rounded-none'
            active={uist.isAspectRatioLocked}
            suffixIcon={uist.isAspectRatioLocked ? 'mdiLink' : 'mdiLinkOff'}
            onClick={(ev) => {
               uist.isAspectRatioLocked = !uist.isAspectRatioLocked
               if (!uist.isAspectRatioLocked) return
               // Need to snap value if linked
               if (uist.wasHeightAdjustedLast) uist.setHeight(uist.height)
               else uist.setWidth(uist.width)
            }}
         />
         <Dropdown
            title={false}
            content={() => <WigetSizeXUI size={p.sizeHelper} />}
            button={
               <Button
                  square
                  size='input'
                  base={theme.global.contrast}
                  tw='flex flex-1 !gap-0 !rounded-none !px-0.5'
                  suffixIcon={'mdiChevronDown'}
               />
            }
         />
      </Frame>
   )
})
