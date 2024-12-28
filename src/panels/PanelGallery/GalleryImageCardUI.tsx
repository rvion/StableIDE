import type { MediaImageL } from '../../models/MediaImage'
import type { CSSProperties } from 'react'

import { observer } from 'mobx-react-lite'

import { Frame } from '../../csuite/frame/Frame'
import { ImageUIDumb } from '../../widgets/galleries/ImageUI'

export const GalleryImageCardUI = observer(function GalleryImageCardUI_(p: {
   img: MediaImageL
   style?: CSSProperties
   //    favorited: boolean
   size: number
}) {
   const theme = cushy.preferences.theme.value

   return (
      <div // Layouting
         tw='flex items-center justify-center p-1'
         style={p.style}
         onMouseEnter={p.img.onMouseEnter}
         onMouseLeave={p.img.onMouseLeave}
      >
         <Frame // Decoration
            tw='overflow-clip'
            hover
            // TODO(bird_d): Should have a separate hovered for the panel state?
            // Currently, this will make it get highlighted whenever the image is hovered ANYWHERE.
            // Which will make the gallery flash when hovering over the image in the Step Panel.
            hovered={() => cushy.hovered == p.img}
            base={{ contrast: -0.1, chromaBlend: 0.333 }}
            // border={p.favorited ? { contrast: 0.3, chromaBlend: 5, hue: 90 } : { contrast: 0.15 }}
            border={{ contrast: 0.15 }}
            roundness={theme.global.roundness}
            dropShadow={theme.global.shadow}
            style={{
               // 16% of size for consistent "padding", Should maybe be an interface/panel option
               width: p.size - p.size * 0.05,
               height: p.size - p.size * 0.05,
               // borderStyle: isFavorited ? 'dashed' : 'solid',
            }}
         >
            <ImageUIDumb img={p.img} />
         </Frame>
      </div>
   )
})
