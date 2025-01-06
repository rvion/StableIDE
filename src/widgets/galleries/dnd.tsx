import type { IconName } from '../../csuite/icons/icons'
import type { MediaImageL } from '../../models/MediaImage'
import type { STATE } from '../../state/state'

import { type CSSProperties } from 'react'
import {
   type ConnectDragPreview,
   type ConnectDragSource,
   type ConnectDropTarget,
   type DropTargetMonitor,
   useDrag,
   useDrop,
} from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'

import { createMediaImage_fromFileObject } from '../../models/createMediaImage_fromWebFile'
import { type ItemTypes, LegacyItemTypes } from './DnDItemTypes'

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
         type: LegacyItemTypes.Image,
         item: { image },
         collect: (monitor): { opacity: number } => {
            if (cushy.dndHandler.visible) {
               if (cushy.dndHandler.label === undefined || cushy.dndHandler.icon) {
                  cushy.dndHandler.setDragContent({ icon: 'mdiImage' })
               }
            }
            return { opacity: monitor.isDragging() ? 0.5 : 1 }
         },
      }),
      [image],
   )

export const useImageDragNew = (
   image: MediaImageL,
): [
   //
   { opacity: number },
   ConnectDragSource,
   ConnectDragPreview,
] =>
   useDrag(
      () => ({
         type: 'Image',
         item: image,
         collect: (monitor): { opacity: number } => {
            if (cushy.dndHandler.visible) {
               if (cushy.dndHandler.label === undefined || cushy.dndHandler.icon) {
                  cushy.dndHandler.setDragContent({ icon: 'mdiImage' })
               }
            }
            return { opacity: monitor.isDragging() ? 0.5 : 1 }
         },
      }),
      [image],
   )

type Drop1 = { image: MediaImageL }
type Drop2 = { files: (File & { path: AbsolutePath })[] }

// type DropItem = | {type: ItemTypes }

// export const useDropZoneWithMatch = <T extends { type: ItemTypes; data: any }>({
//    accept,

//    onDrop,
// }: {
//    accept: T['type'][]

//    onDrop: (
//       item: T,

//       match: (cases: { [K in T['type']]: (data: Extract<T, { type: K }>['data']) => void }) => void,
//    ) => void
// }): void => {
//    accept.forEach((type) => {
//       const simulatedItem = {
//          type,
//          data: type === ItemTypes.Image ? { url: } : 'example text',
//       } as T

//       const match = (cases: { [K in T['type']]: (data: Extract<T, { type: K }>['data']) => void }): void => {
//          if (type in cases) {
//             cases[type](simulatedItem.data)
//          } else {
//             throw new Error(`Unhandled type: ${type}`)
//          }
//       }

//       onDrop(simulatedItem, match)
//    })
// }
export const useImageDrop = (
   st: STATE,
   fn: (image: MediaImageL) => void,
): [CSSProperties, ConnectDropTarget] =>
   useDrop<Drop1 | Drop2, void, CSSProperties>(() => ({
      // 1. Accepts both custom Image and native files drops.
      accept: [
         //
         LegacyItemTypes.Image,
         NativeTypes.FILE,
      ],

      // 2. add golden border when hovering over
      collect(monitor): CSSProperties {
         const isExternal = monitor.getItemType() == NativeTypes.FILE
         if (isExternal) {
            cushy.dndHandler.visible = monitor.isOver()
         }

         cushy.dndHandler.setContent(
            monitor.isOver()
               ? {
                    icon: 'mdiImage',
                    label: isExternal ? 'Import and Drop Image' : 'Drop Image',
                    suffixIcon: 'mdiArrowDownRight',
                 }
               : {
                    icon: 'mdiImage',
                 },
         )
         return { opacity: monitor.isOver() ? '0.75' : undefined }
      },
      hover(item, monitor): void {},

      // 3. import as ImageL if needed
      drop(item: Drop1 | Drop2, monitor): void {
         cushy.dndHandler.visible = false

         if (monitor.getItemType() == LegacyItemTypes.Image) {
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

/** Used for the Draft panel to allow drag and dragging in to the panel's area, and having a pop-up menu with the available slots that can consume it. (Image Widgets/Fields) */
export const useImageSlotDrop = (dropAction: (image: MediaImageL) => void): [boolean, ConnectDropTarget] => {
   return useDrop<Drop1, void, boolean>(() => ({
      accept: [LegacyItemTypes.Image],
      collect(monitor): boolean {
         if (!monitor.isOver()) {
            cushy.dndHandler.setContent({})
         }
         return monitor.isOver({ shallow: true })
      },
      drop(item: Drop1, monitor): void {
         const image: MediaImageL = item.image

         if (monitor.isOver({ shallow: true })) {
            return dropAction(image)
         }
      },
      hover(item, monitor): void {
         if (monitor.isOver({ shallow: true })) {
            cushy.dndHandler.setContent({
               icon: 'mdiImage',
               label: 'Drop Image in to Slot',
               suffixIcon: 'mdiMenuOpen',
            })
         }
      },
   }))
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type NativeFileDropType = { files: (File & { path: AbsolutePath })[] }

type DropItem<T extends ItemTypes> = T extends 'Image'
   ? MediaImageL
   : T extends '__NATIVE_FILE__'
     ? NativeFileDropType
     : string

type DropCallback<T extends ItemTypes> = (
   match: (cases: {
      [K in T]: (data: DropItem<T>) => void
   }) => void,
) => void

export const useDropZone = <T extends ItemTypes>({
   accept,
   onDrop,
   onHover,
   config,
}: {
   accept: T[]
   onDrop: DropCallback<T>
   onHover?: (item: DropItem<T>, monitor: DropTargetMonitor<DropItem<T>>) => void
   config?: { shallow?: boolean }
}): [boolean, ConnectDropTarget] => {
   return useDrop<DropItem<T>, void, boolean>(() => ({
      accept,
      collect(monitor): boolean {
         if (!monitor.isOver()) {
            cushy.dndHandler.setContent({})
         }
         return monitor.isOver({ shallow: true })
      },
      drop(item: DropItem<T>, monitor): void {
         console.log('MONITOR: ', monitor.getItemType())
         console.log('item: ', item, monitor)
         if (monitor.isOver({ shallow: config?.shallow })) {
            onDrop((cases) => {
               const itemType = monitor.getItemType()
               if (!itemType) {
                  return
               }
               const handler = cases[itemType as T]
               // Pattern matching based on itemType
               if (handler) {
                  handler(item) // item is already narrowed here
               } else {
                  throw new Error(`Unhandled item type: ${itemType.toString()}`)
               }
            })
         }
      },
      hover(item, monitor): void {
         if (monitor.isOver({ shallow: config && config.shallow })) {
            if (onHover) {
               onHover(item, monitor)
            }
         }
      },
   }))
}

// export const useDropZoneImage = useDropZone()
