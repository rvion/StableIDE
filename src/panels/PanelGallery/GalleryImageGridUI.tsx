import type { MediaImageL } from '../../models/MediaImage'

import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { FixedSizeGrid } from 'react-window'

import { useSizeOf } from '../../csuite/smooth-size/useSizeOf'
import { ImageUIDumb } from '../../widgets/galleries/ImageUI'
import { useGalleryConf } from './galleryConf'
import { GalleryImageCardUI, galleryLoadingQueue } from './GalleryImageCardUI'
import { StepGroupUI } from './StepGroups'

export const GalleryImageGridUI = observer(function GalleryImageGridUI_(p: {
   /** when not specified, it will just open the default image menu */
   onClick?: (img: MediaImageL) => void
}) {
   const { ref: refFn, size } = useSizeOf()
   const conf = useGalleryConf()

   // const ALLIMAGES = conf.imageToDisplay
   const total = cushy.db._getCount('media_image')

   const itemWidth = conf.value.gallerySize
   const itemHeight = conf.value.gallerySize
   const containerWidth = size.width ?? 128
   const containerHeight = size.height ?? 128
   const nbCols = Math.floor(containerWidth / itemWidth) || 1
   const nbRows = Math.ceil(total / nbCols)

   return (
      <div //
         ref={refFn}
         tw='flex-1 select-none overflow-auto'
         // applying filter on the whole gallery is way faster than doing it on every individual images
         style={conf.value.onlyShowBlurryThumbnails ? { filter: 'blur(10px)' } : undefined}
      >
         <GalleryGridUI
            containerHeight={containerHeight}
            containerWidth={containerWidth}
            nbCols={nbCols}
            nbRows={nbRows}
            itemWidth={itemWidth}
            itemHeight={itemHeight}
            enableStepGrouping={conf.value.enableStepGrouping}
            total={total}
            // images={ALLIMAGES}
         />
      </div>
   )
})

const GalleryGridUI = observer(function GalleryGridUI_(p: {
   containerHeight: number
   containerWidth: number
   nbCols: number
   nbRows: number
   itemWidth: number
   itemHeight: number
   enableStepGrouping: boolean
   total: number
   // images: MediaImageL[]
}) {
   const containerHeight = p.containerHeight
   const containerWidth = p.containerWidth
   const nbCols = p.nbCols
   const nbRows = p.nbRows
   const itemWidth = p.itemWidth
   const itemHeight = p.itemHeight

   // One DB call for images we can currently see
   // const images

   // return <></>
   // return (
   //    <div tw='flex h-full w-full flex-wrap overflow-auto gap-0'>
   //       {p.images.map((image) => {
   //          return <ImageUIDumb style={{ width: p.itemWidth, height: p.itemHeight }} img={image} />
   //       })}
   //    </div>
   // )

   return (
      <FixedSizeGrid
         height={containerHeight}
         width={containerWidth}
         columnCount={nbCols}
         rowCount={nbRows}
         columnWidth={itemWidth}
         rowHeight={itemHeight}
         onItemsRendered={({
            overscanColumnStartIndex,
            overscanColumnStopIndex,
            overscanRowStartIndex,
            overscanRowStopIndex,
         }: {
            overscanColumnStartIndex: number
            overscanColumnStopIndex: number
            overscanRowStartIndex: number
            overscanRowStopIndex: number
         }) => {
            galleryLoadingQueue.startRange = p.total - overscanRowStopIndex * nbCols + overscanColumnStopIndex
            galleryLoadingQueue.endRange = p.total - overscanRowStartIndex * nbCols + overscanColumnStartIndex

            // galleryLoadingQueue.startRange = p.total - overscanRowStartIndex * nbCols + overscanColumnStartIndex
            // galleryLoadingQueue.endRange = p.total - overscanRowStopIndex * nbCols + overscanColumnStopIndex
            // console.log(
            //    '[FD] WOW: ',
            //    overscanColumnStartIndex,
            //    overscanColumnStopIndex,
            //    overscanRowStartIndex,
            //    overscanRowStopIndex,
            //    galleryLoadingQueue.startRange,
            //    galleryLoadingQueue.endRange,
            // )
            return
         }}
         onScroll={(e) => {
            galleryLoadingQueue.sortJobs()
         }}
      >
         {({ columnIndex, rowIndex, style }) => {
            const index = p.total - rowIndex * nbCols + columnIndex

            if (p.enableStepGrouping) {
               return (
                  <StepGroupUI //
                     key={index}
                     size={itemWidth}
                     style={style}
                     index={index}
                     decoration={{
                        wrapLeft: columnIndex == 0,
                        wrapRight: nbCols - 1 == columnIndex,
                     }}
                  />
               )
            }

            // const isVisible =
            // if (isVisible) {

            // }

            // const img = cushy.db.media_image.selectOne((x) => {
            //    return x.offset(p.total - index)
            // })

            // if (img) {
            //    console.log('[FD] Found item:', img)
            // } else {
            //    console.log('[FD] No item found with the specified index.')
            // }

            // const img = p.images[index]
            // if (img == null) return null

            // return <></>
            return (
               <GalleryImageCardUI //
                  key={index}
                  // onMouseEnter={img.onMouseEnter}
                  // onMouseLeave={img.onMouseLeave}
                  // img={img}
                  index={index}
                  size={itemWidth}
                  style={style}
               />
            )
         }}
      </FixedSizeGrid>
   )
})
