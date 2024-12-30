import type { Field_image } from '../../csuite/fields/image/FieldImage'
import type { DraftL } from '../../models/Draft'
import type { MediaImageL } from '../../models/MediaImage'

import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'

import { Button } from '../../csuite/button/Button'
import { isFieldImage } from '../../csuite/fields/WidgetUI.DI'

export const DraftImageSlotPickerUI = observer(function DraftImageSlotPickerUI_({
   // own
   draft,
   image,
   stop,

   ...rest
}: {
   draft: DraftL
   image: MediaImageL
   stop: () => void
}) {
   const imageFields = useMemo(() => {
      const allImageFields: Field_image[] = []
      draft.form?.traverseAllDepthFirst((f) => {
         if (isFieldImage(f)) allImageFields.push(f)
      })
      return allImageFields
   }, [])
   return (
      <div {...rest}>
         {imageFields.map((imgField, i) => (
            <div key={i}>
               <Button
                  onClick={() => {
                     imgField.value = image
                     cushy.showConfettiAndBringFun()
                     stop()
                  }}
               >
                  {imgField.path}: {imgField.labelText}
               </Button>
            </div>
         ))}
      </div>
   )
})
