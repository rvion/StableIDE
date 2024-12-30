import type { Field_size } from './FieldSize'

import { observer } from 'mobx-react-lite'

import { useCSuite } from '../../ctx/useCSuite'
import { Frame } from '../../frame/Frame'
import { InputNumberUI } from '../../input-number/InputNumberUI'
import { AspectLockButtonUI } from './AspectLockButtonUI'
import { AspectRatioSquareUI } from './AspectRatioSquareUI'

export const WidgetSizeX_LineUI = observer(function WidgetSize_LineUI_(p: {
   size: Field_size
   bounds?: { min?: number; max?: number; step?: number }
}) {
   const uist = p.size

   // const ratio = uist.width / uist.height
   // const ratioIcon = ratio == 1.0 ? 'mdiApproximatelyEqual' : ratio > 1.0 ? 'mdiCropLandscape' : 'mdiCropPortrait'

   const theme = cushy.preferences.theme.value

   return (
      <div className='full flex flex-1 gap-1'>
         <Frame //Joined container
            border={theme.global.border}
            roundness={theme.global.roundness}
            align
            col
            expand
         >
            <InputNumberUI
               //
               min={p.bounds?.min ?? 128}
               max={p.bounds?.max ?? 4096}
               step={p.bounds?.step ?? 32}
               mode='int'
               value={uist.width}
               hideSlider
               onValueChange={(next) => {
                  uist.setWidth(next)
                  uist.touch()
               }}
               forceSnap={true}
               text='Width'
               suffix='px'
               onBlur={() => uist.touch()}
            />
            <InputNumberUI
               //
               min={p.bounds?.min ?? 128}
               max={p.bounds?.max ?? 4096}
               step={p.bounds?.step ?? 32}
               hideSlider
               mode='int'
               value={uist.height}
               onValueChange={(next) => {
                  uist.setHeight(next)
                  uist.touch()
               }}
               forceSnap={true}
               text='Height'
               suffix='px'
               onBlur={() => uist.touch()}
            />
            {/* <Button onClick={uist.flip} icon={ratioIcon} style={{ border: 'none', borderRadius: '0px' }} /> */}
            {/* <div tw='h-full' style={{ width: '1px' }} /> */}
            {/* <div tw='h-full' style={{ width: '1px' }} /> */}
         </Frame>
         <AspectRatioSquareUI sizeHelper={uist} />
         <AspectLockButtonUI sizeHelper={uist} />
      </div>
   )
})
