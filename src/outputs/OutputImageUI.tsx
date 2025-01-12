import type { MediaImageL } from '../models/MediaImage'
import type { StepL } from '../models/Step'

import { observer } from 'mobx-react-lite'

import { Frame } from '../csuite/frame/Frame'
import { PanelViewImageUI } from '../panels/PanelViewImage/Panel_ViewImage'
import { ImageUI, ImageUIDumb } from '../widgets/galleries/ImageUI'

export const OutputImagePreviewUI = observer(function OutputImagePreviewUI_(p: {
   //
   step?: Maybe<StepL>
   output: MediaImageL
}) {
   return (
      <Frame tooltip={`Image Output`} tw='h-full w-full'>
         <ImageUIDumb //
            img={p.output}
         />
      </Frame>
   )
})

export const OutputImageUI = observer(function OutputImageUI_(p: {
   step?: Maybe<StepL>
   output: MediaImageL
}) {
   return <PanelViewImageUI imageID={p.output.id} />
})
