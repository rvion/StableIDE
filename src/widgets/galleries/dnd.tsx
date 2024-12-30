import type { MediaImageL } from '../../models/MediaImage'
import type { STATE } from '../../state/state'

import { type CSSProperties } from 'react'
import {
   type ConnectDragPreview,
   type ConnectDragSource,
   type ConnectDropTarget,
   useDrag,
   useDrop,
} from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'

import { createMediaImage_fromFileObject } from '../../models/createMediaImage_fromWebFile'
import { ItemTypes } from './DnDItemTypes'

export const useImageDrag = (
   image: MediaImageL,
): [
   //
   { opacity: number },
   ConnectDragSource,
   ConnectDragPreview,
] =>
   useDrag(
      () => ({
         type: ItemTypes.Image,
         item: { image },
         collect: (monitor): { opacity: number } => {
            cushy.dndHandler.visible = monitor.isDragging()
            if (cushy.dndHandler.visible) {
               if (cushy.dndHandler.label === undefined) {
                  cushy.dndHandler.setContent({ icon: 'mdiImage' })
               }
            }
            return { opacity: monitor.isDragging() ? 0.5 : 1 }
         },
      }),
      [image],
   )

type Drop1 = { image: MediaImageL }
type Drop2 = { files: (File & { path: AbsolutePath })[] }

export const useImageDrop = (
   st: STATE,
   fn: (image: MediaImageL) => void,
): [CSSProperties, ConnectDropTarget] =>
   useDrop<Drop1 | Drop2, void, CSSProperties>(() => ({
      // 1. Accepts both custom Image and native files drops.
      accept: [
         //
         ItemTypes.Image,
         NativeTypes.FILE,
      ],

      // 2. add golden border when hovering over
      collect(monitor): CSSProperties {
         cushy.dndHandler.setContent(
            monitor.isOver()
               ? {
                    icon: 'mdiImage',
                    label: 'Set Image',
                    suffixIcon: 'mdiArrowDownRight',
                 }
               : {
                    icon: 'mdiImage',
                 },
         )
         return { opacity: monitor.isOver() ? '0.5' : undefined }
      },
      hover(item, monitor): void {
         const sourceOffset = monitor.getSourceClientOffset()
         const mouseOffset = monitor.getClientOffset()
         if (!mouseOffset) {
            return
         }
         cushy.dndHandler.updatePosition(mouseOffset.x, mouseOffset.y)
         return
      },

      // 3. import as ImageL if needed
      drop(item: Drop1 | Drop2, monitor): void {
         cushy.dndHandler.visible = false
         cushy.dndHandler.setContent({
            icon: 'mdiImage',
            label: 'Drop in Slot',
         })

         if (monitor.getItemType() == ItemTypes.Image) {
            const image: MediaImageL = (item as Drop1).image
            return fn(image)
         }
         if (monitor.getItemType() === NativeTypes.FILE) {
            // Handle file drop
            // const item = monitor.getItem() as any as Drop2
            // debugger
            const files = (item as Drop2).files
            const imageFile = Array.from(files).find((file) => file.type.startsWith('image/'))
            console.log('[🗳️] drop box: image path is', imageFile?.path ?? '❌')
            if (imageFile) {
               console.log(`[🌠] importing native file...`)
               void createMediaImage_fromFileObject(imageFile).then(fn)
            } else {
               console.log('Dropped non-image file')
               return
            }
         }

         throw new Error('Unknown drop type')
      },
   }))

export const useImageSlotDrop = (
   st: STATE,
   fn: (image: MediaImageL) => void,
): [CSSProperties, ConnectDropTarget] => {
   return useDrop<Drop1, void, CSSProperties>(() => ({
      accept: [ItemTypes.Image],
      collect(monitor): CSSProperties {
         return { outline: monitor.isOver() ? '1px solid gold' : undefined }
      },
      drop(item: Drop1, monitor): void {
         const image: MediaImageL = item.image
         return fn(image)
      },
   }))
}
