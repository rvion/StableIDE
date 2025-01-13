import type { ExplanationAboutWhatIsBeeingDragged } from './dndIndicatorUI'

import {
   type ConnectDragPreview,
   type ConnectDragSource,
   type ConnectDropTarget,
   type DragSourceMonitor,
   type DropTargetMonitor,
   useDrag,
   useDrop,
} from 'react-dnd'

import { objectKeys } from '../../csuite/utils/getEntries.utils'
import { MediaImageL } from '../../models/MediaImage'

//  .---------------------------------------
// / bird_d's awesome dnd system:
// | - make it easy to drag and drop stuff.
// | - abstractions on top of react-dnd
// | - hooked deeply in cushy so
// |   * everything you drag has a standard look (visual indicator explain what you are dragging)
// \   * every-place where you can drop it is made explicit + you get explanation on what is going ot happen when you hover those drop-zones
//  .--------------------------------------

//#region CORE TYPES ------------------------------------------------------------------------------------------------------------------------
export type DraggableItemTypes = {
   Image: MediaImageL
   Text: string
   File: NativeFileDropType
}

//#region BOILERPLATE ------------------------------------------------------------------------------------------------------------------------
export type NativeFileDropType = { files: (File & { path: AbsolutePath })[] }
export type DraggableItem = DraggableItemTypes[keyof DraggableItemTypes]
export type DraggableItemName = keyof DraggableItemTypes
// eslint-disable-next-line react-refresh/only-export-components
const ItemTypeNames: { [key in DraggableItemName]: string } = {
   Image: 'Image',
   Text: 'Text',
   File: '__NATIVE_FILE__',
}
const validDraggableItemTypeNames = objectKeys(ItemTypeNames)
export function extractDnDAcceptList<T extends DropItemCallback>(conf: T): DraggableItemName[] {
   const keys = objectKeys(conf)
   return keys.filter((key) => validDraggableItemTypeNames.includes(key as any)) as DraggableItemName[]
}
export function extractDnDDragType(item: DraggableItem): DraggableItemName {
   if (item instanceof MediaImageL) return 'Image'
   if (typeof item === 'string') return 'Text'
   if (item instanceof File) return 'File'
   return 'File'
}
export function extractDragContentFromItem(item: DraggableItem): ExplanationAboutWhatIsBeeingDragged {
   if (item instanceof MediaImageL) return { icon: 'mdiImage', label: item.relPath.split('/').pop() }
   if (typeof item === 'string') return { icon: 'mdiText', label: item }
   if (item instanceof File) return { icon: 'mdiFile', label: item.name }
   return { icon: 'mdiFile' }
}

//#region DRAG --------------------------------------------------------------------------------------------------------------------------------
export function useDragItem<T extends DraggableItem, U extends any>(
   item: T,
   onDrag?: (monitor: DragSourceMonitor<T, unknown>) => void,
): [{ opacity: number }, ConnectDragSource, ConnectDragPreview] {
   const itemType = extractDnDDragType(item)
   return useDrag(
      () => ({
         type: itemType,
         item: item,
         collect: (monitor: DragSourceMonitor<T, unknown>): { opacity: number } => {
            // not 100% sure we need that in our high-level cushy dnd api
            onDrag?.(monitor)
            if (cushy.dndHandler.visible) {
               if (cushy.dndHandler.label === undefined || cushy.dndHandler.icon) {
                  const infos = extractDragContentFromItem(item)
                  cushy.dndHandler.setDragContent(infos)
               }
            }
            return { opacity: monitor.isDragging() ? 0.5 : 1 }
         },
      }),
      [item],
   )
}

//#region DROP --------------------------------------------------------------------------------------------------------------------------------
export type DropZoneProps = DropItemCallback & { config?: { shallow?: boolean } }
export type DropItemCallback = {
   [Key in DraggableItemName]?: {
      /** TODO this is important to specify; it allows cushy to always explain what is going to happen on drop when hovering a drop-zone  */
      onDropHelp?: string | React.FC<{ item: DraggableItemTypes[Key] }>
      onDrop: (item: DraggableItemTypes[Key], monitor: DropTargetMonitor<DraggableItemTypes[Key]>) => void
      /** help text (markdown) explaining what will happen if you drop the stuff you're dragging here */
      onHover?: (item: DraggableItemTypes[Key], monitor: DropTargetMonitor<DraggableItemTypes[Key]>) => void
   }
}
export function useDropZone({ config, ...rest }: DropZoneProps): [boolean, ConnectDropTarget] {
   return useDrop<DraggableItem, void, boolean>(() => ({
      accept: extractDnDAcceptList(rest),
      collect(monitor): boolean {
         if (!monitor.isOver()) {
            cushy.dndHandler.setContent({})
         }
         return monitor.isOver({ shallow: true })
      },
      drop(item: DraggableItem, monitor): void {
         console.log('MONITOR: ', monitor.getItemType())
         console.log('item: ', item, monitor)
         // if (monitor.isOver({ shallow: config && config.shallow ?? false })) {
         if (monitor.isOver({ shallow: config?.shallow })) {
            _processEvent(item, monitor, rest, 'drop')
         }
      },
      hover(item, monitor): void {
         if (monitor.isOver({ shallow: config && config.shallow })) {
            _processEvent(item, monitor, rest, 'hover')
         }
      },
   }))
}
/** this may evolve a bit soon */
function _processEvent(
   item: DraggableItem,
   monitor: DropTargetMonitor<DraggableItem, void>,
   handlers: {
      [key: string]: {
         onDrop: (item: any, monitor: DropTargetMonitor<any>) => void
         onHover?: (item: any, monitor: DropTargetMonitor<any>) => void
      }
   },
   eventType: 'hover' | 'drop',
): void {
   // ensure we have a valid item type
   const itemType = monitor.getItemType() as DraggableItemName
   if (!itemType) return

   // ensue we know how to handle that item
   const handlerDict = handlers[itemType]
   if (handlerDict == null) throw new Error(`Unhandled item type: ${itemType.toString()}`)

   if (eventType === 'drop') {
      const handler = handlerDict.onDrop
      // drop is required
      if (handler == null) throw new Error('drop handler mandatory but not provided for type ...')
      handler(item, monitor)
   } else if (eventType === 'hover') {
      const handler = handlerDict.onHover
      // hover is not required
      if (handler == null) return
      handler(item, monitor)
   }
}
