import type { MediaImageL } from '../../models/MediaImage'
import type { CSSProperties } from 'react'

import { observer } from 'mobx-react-lite'
import { FixedSizeGrid } from 'react-window'

import { Frame } from '../../csuite/frame/Frame'
import { hashStringToNumber } from '../../csuite/hashUtils/hash'
import { useSizeOf } from '../../csuite/smooth-size/useSizeOf'
import { ImageUI } from '../../widgets/galleries/ImageUI'
import { useGalleryConf } from './galleryConf'

function handleStepDecoration(): CSSProperties {
   return {}
}

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

   let currentStepID: StepID | undefined
   let currentStepContainer = []
   let stepContainerState: 'start' | 'end' | 'inbetween' = 'start'
   let currentStepHue = 0

   // return <></>
   return (
      <div //
         ref={refFn}
         tw='flex-1'
         // applying filter on the whole gallery is way faster than doing it on every individual images
         style={conf.value.onlyShowBlurryThumbnails ? { filter: 'blur(10px)' } : undefined}
      >
         {conf.Virtualized.value ? (
            // alt 1. virtualized grid
            <FixedSizeGrid
               height={containerHeight}
               width={containerWidth}
               columnCount={nbCols}
               rowCount={nbRows}
               columnWidth={itemWidth}
               rowHeight={itemHeight}
            >
               {({ columnIndex, rowIndex, style }) => {
                  const img = ALLIMAGES[rowIndex * nbCols + columnIndex]
                  if (img == null) return null
                  const borderWidth = '1px'

                  // Initializes the starting decoration for a step here.
                  let decorationStyle: CSSProperties = {
                     // borderColor: 'gold',
                     borderRightColor: 'transparent',
                     borderTopLeftRadius: '5px',
                     borderBottomLeftRadius: '5px',
                     paddingLeft: '4px',
                  }
                  // Used because I was too lazy to clean up in to a function that returns when needed
                  let applied = false

                  if (img.step) {
                     if (currentStepID != img.step.id) {
                        currentStepContainer = []
                        currentStepID = img.step.id
                        stepContainerState = 'start'
                        currentStepHue += 60
                        applied = true
                     }

                     const nextImg = ALLIMAGES[rowIndex * nbCols + columnIndex + 1]
                     if (nextImg == null || nextImg.step == null) {
                        if (!applied && stepContainerState == 'start') {
                           applied = true
                           decorationStyle = {
                              // borderColor: 'black',
                              borderRadius: '5px',
                           }
                        }
                        if (!applied && stepContainerState == 'inbetween') {
                           applied = true
                           decorationStyle = {
                              // borderColor: 'purple',
                              borderTopRightRadius: '5px',
                              borderBottomRightRadius: '5px',
                           }
                        }
                        stepContainerState = 'end'
                        return null
                     }

                     if (currentStepID != nextImg.step.id) {
                        stepContainerState = 'end'
                        if (!applied) {
                           applied = true
                           decorationStyle = {
                              // borderColor: 'pink',
                              borderLeftColor: 'transparent',
                              borderTopRightRadius: '5px',
                              borderBottomRightRadius: '5px',
                              paddingRight: '4px',
                           }
                        }
                     } else {
                        stepContainerState = 'inbetween'
                        if (!applied) {
                           applied = true
                           decorationStyle = {
                              borderLeftColor: 'transparent',
                              borderRightColor: 'transparent',
                              paddingLeft: '2px',
                              paddingRight: '2px',

                              // borderLeftWidth: '0px'
                              // borderColor: 'green',
                              // borderTopRightRadius: '5px',
                              // borderBottomRightRadius: '5px',
                           }
                        }
                     }
                  }

                  return (
                     <Frame
                        // Step Decoration
                        tw='flex items-center justify-center'
                        border={{
                           contrast: 0.1,
                           chromaBlend: 5,
                        }}
                        base={{
                           contrast: 0.1,
                           chromaBlend: 3,
                           hue: currentStepHue % 360,
                        }}
                        style={{
                           borderWidth,
                           ...style,
                           ...decorationStyle,
                        }}
                     >
                        <ImageUI //
                           onClick={p.onClick}
                           size={itemWidth}
                           img={img}
                        />
                     </Frame>
                  )
               }}
            </FixedSizeGrid>
         ) : (
            // alt 2. a simple flex wrap
            <div tw='flex flex-wrap'>
               {ALLIMAGES.map((i) => {
                  if (i.step) {
                     if (currentStepID != i.step.id) {
                        currentStepContainer = []
                        currentStepID = i.step.id
                     }
                     currentStepContainer.push(i.id)
                  }
                  return (
                     <ImageUI //
                        key={i.id}
                        onClick={p.onClick}
                        size={itemWidth}
                        img={i}
                     />
                  )
               })}
            </div>
         )}
      </div>
   )
})
