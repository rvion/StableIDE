import type { CSSProperties } from 'react'

import { observer } from 'mobx-react-lite'

import { Frame } from '../../csuite/frame/Frame'
import { hashStringToNumber } from '../../csuite/hashUtils/hash'
import { MediaImageL } from '../../models/MediaImage'
import { useGalleryConf } from './galleryConf'
import { GalleryImageCardUI } from './GalleryImageCardUI'

const styles = {
   start: {
      layout: {
         paddingRight: '0px',
      },
      decoration: {
         borderTopRightRadius: '0px',
         borderBottomRightRadius: '0px',
         borderRightWidth: '0px',

         // Re-aligns the image vertically
         paddingRight: '4px',
      },
   },
   inbetween: {
      layout: {
         paddingLeft: '0px',
         paddingRight: '0px',
      },
      decoration: {
         borderRadius: '0px',
         borderLeftWidth: '0px',
         borderRightWidth: '0px',
      },
   },
   end: {
      layout: {
         paddingLeft: '0px',
      },
      decoration: {
         borderLeftColor: 'transparent',
         borderTopLeftRadius: '0px',
         borderBottomLeftRadius: '0px',
         borderLeftWidth: '0px',

         // Re-aligns the image vertically
         paddingLeft: '4px',
      },
   },
   single: {
      layout: {},
      decoration: {},
   },
   warning: {
      layout: {
         // padding: '4px',
      },
      decoration: {
         borderStyle: 'dashed',
         // border: '1px dashed red',
      },
   },
} as const satisfies Record<string, { layout: CSSProperties; decoration: CSSProperties }>

/** Returns a CSS style based on the images, probably a convoluted way of doing this */
function computeStyles(
   pImg?: MediaImageL,
   cImg?: MediaImageL,
   nImg?: MediaImageL,
): { layout: CSSProperties; decoration: CSSProperties } {
   if (!cImg) {
      // No current image, wtf??
      return styles['warning']
   }

   if (!pImg) {
      // If no previous or next image, then we only have the one image in a group
      // if (!nImg || !cImg.step) {
      //    return styles['single']
      // }

      // No next image, no previous image, so only current image needs to be decorated
      if (!nImg || !nImg.step || !cImg.step) {
         return styles['single']
      }

      // No previous image, so start
      return styles['start']
   }

   if (!cImg.step || cImg.step.outputs.filter((output) => output instanceof MediaImageL).length <= 1) {
      // Not part of a group.
      return styles['single']
   }

   if (!nImg || !nImg.step) {
      // No previous group or next group
      if (!pImg.step) {
         return styles['single']
      }

      // No next image or step to group, so just end
      return styles['end']
   }

   if (nImg.step.id != cImg.step.id) {
      if (!pImg.step || pImg.step.id != cImg.step.id) {
         // Current image is not a part of the last or next group
         return styles['single']
      }

      // Current image is not part of the next image's group
      return styles['end']
   }

   if (nImg.step.id == cImg.step.id) {
      if (!pImg.step || pImg.step.id != cImg.step.id) {
         // If the previous image is not part of the same group, then start a new one
         return styles['start']
      }

      // The next image is part of the group, and we have a previous image that is also part of the group, so make sure to place inbetween the group
      return styles['inbetween']
   }

   // Should not happen?
   return styles['warning']
}

export const StepGroupUI = observer(function StepGroupUI_(p: {
   index: number
   // grouper: StepGrouper
   style: CSSProperties
   size: number
}) {
   const conf = useGalleryConf()
   const ALLIMAGES = conf.imageToDisplay

   const theme = cushy.preferences.theme.value

   const img = ALLIMAGES[p.index]
   if (img == undefined) {
      return (
         // TODO(bird_d/ui/error)
         <div tw='flex items-center justify-center text-center' style={p.style}>
            No Image
         </div>
      )
   }

   const pImg = ALLIMAGES[p.index - 1]
   const nImg = ALLIMAGES[p.index + 1]

   const { layout, decoration } = computeStyles(pImg, img, nImg)

   // Inefficient, could be cached/re-used somehow
   const hue = hashStringToNumber(img.step ? img.step.id : '0')

   return (
      <div
         tw='flex flex-1 items-center justify-center'
         style={{
            padding: '4px',
            ...p.style,
            ...layout,
         }}
         onMouseEnter={img.onMouseEnter}
         onMouseLeave={img.onMouseLeave}
      >
         <Frame
            // Step Decoration
            tw='flex h-full w-full flex-1 items-center justify-center overflow-clip !object-contain'
            border={{
               contrast: 0.2,
               chromaBlend: 10,
            }}
            base={{
               // contrast: 0.1,
               // chromaBlend: 2.5,
               chromaBlend: img.step ? 2.5 : 0,
               hue: hue,
               // hue: 180,
               // hue: p.grouper.currentHue,
            }}
            style={{
               borderRadius: `${theme.global.roundness}px`,
               borderWidth: img.step ? '1px' : '2px',
               ...decoration,
               borderStyle: img.step ? 'solid' : 'dotted',
            }}
         >
            <GalleryImageCardUI img={img} size={p.size - p.size * 0.1} />
         </Frame>
      </div>
   )
})
