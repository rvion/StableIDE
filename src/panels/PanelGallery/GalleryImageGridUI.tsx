import type { MediaImageL } from '../../models/MediaImage'

import { observer } from 'mobx-react-lite'
import { FixedSizeGrid } from 'react-window'

import { useSizeOf } from '../../csuite/smooth-size/useSizeOf'
import { useGalleryConf } from './galleryConf'
import { GalleryImageCardUI } from './GalleryImageCardUI'
import { StepGroupUI } from './StepGroups'

export const GalleryImageGridUI = observer(function GalleryImageGridUI_(p: {
   /** when not specified, it will just open the default image menu */
   onClick?: (img: MediaImageL) => void
}) {
   const { ref: refFn, size } = useSizeOf()
   const conf = useGalleryConf()

   const ALLIMAGES = conf.imageToDisplay
   const total = ALLIMAGES.length

   const itemWidth = conf.value.gallerySize
   const itemHeight = conf.value.gallerySize
   const containerWidth = size.width ?? 100
   const containerHeight = size.height ?? 100
   const nbCols = Math.floor(containerWidth / itemWidth) || 1
   const nbRows = Math.ceil(total / nbCols)

   return (
      <div //
         ref={refFn}
         tw='flex-1'
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
            images={ALLIMAGES}
         />
      </div>
   )
})

export const GalleryGridUI = observer(function GalleryGridUI_(p: {
   containerHeight: number
   containerWidth: number
   nbCols: number
   nbRows: number
   itemWidth: number
   itemHeight: number
   enableStepGrouping: boolean
   images: MediaImageL[]
}) {
   const containerHeight = p.containerHeight
   const containerWidth = p.containerWidth
   const nbCols = p.nbCols
   const nbRows = p.nbRows
   const itemWidth = p.itemWidth
   const itemHeight = p.itemHeight

   return (
      <FixedSizeGrid
         height={containerHeight}
         width={containerWidth}
         columnCount={nbCols}
         rowCount={nbRows}
         columnWidth={itemWidth}
         rowHeight={itemHeight}
      >
         {({ columnIndex, rowIndex, style }) => {
            const index = rowIndex * nbCols + columnIndex

            if (p.enableStepGrouping) {
               return (
                  <StepGroupUI //
                     size={itemWidth}
                     style={style}
                     index={index}
                  />
               )
            }

            const img = p.images[index]
            if (img == null) return null

            return (
               <GalleryImageCardUI //
                  img={img}
                  size={itemWidth}
                  style={style}
               />
            )
         }}
      </FixedSizeGrid>
   )
})
