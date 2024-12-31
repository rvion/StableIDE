import type { Field_image } from '../../csuite/fields/image/FieldImage'
import type { DraftL } from '../../models/Draft'
import type { MediaImageL } from '../../models/MediaImage'

import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'

import { Button } from '../../csuite/button/Button'
import { MenuDivider } from '../../csuite/dropdown/MenuDivider'
import { isFieldImage } from '../../csuite/fields/WidgetUI.DI'

function formatFieldPath(text: string): string {
   const builder = []

   const t = text.split('$.').join().split('.')
   builder.push(t.pop())
   builder.push(t.pop())

   return builder.join('>')
}

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

   let lastParent = ''

   return (
      <div tw='flex flex-col' {...rest}>
         {imageFields.map((imgField, i) => {
            let addDivider = false

            const parentPath = imgField.path.split('.')
            while (parentPath.length > 3) {
               parentPath.pop()
            }

            const topParent = draft.form?.getFieldAt(parentPath.join('.'))

            console.log('[FD]: FEF: ', topParent)

            if (lastParent != topParent?.config.label) {
               lastParent = topParent?.config.label
               if (i != 0) {
                  addDivider = true
               }
            }

            return (
               <>
                  {addDivider && <MenuDivider />}
                  <div key={i}>
                     <Button
                        borderless
                        icon={(!i || addDivider) && topParent ? topParent.config.icon : 'mdiChevronRight'}
                        expand
                        subtle
                        // TODO(bird_d/ui/tooltips) : Really fucking annoying until tooltips are fixed
                        // tooltip={imgField.config.tooltip ?? '' + '\n' + imgField.path}
                        // tw='flex-1 w-full'
                        onClick={() => {
                           imgField.value = image
                           // cushy.showConfettiAndBringFun()
                           stop()
                        }}
                     >
                        {(!i || addDivider) && topParent ? `${topParent.config.label}: ` : ''}
                        {formatFieldPath(imgField.path)}
                        <span tw='ml-5 flex-1 text-right opacity-50'>{imgField.labelText}</span>
                     </Button>
                  </div>
               </>
            )
         })}
      </div>
   )
})
