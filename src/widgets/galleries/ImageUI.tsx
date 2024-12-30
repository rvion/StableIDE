import type { MediaImageL } from '../../models/MediaImage'

import { existsSync, type PathLike } from 'fs'
import { observer } from 'mobx-react-lite'

import { RevealUI } from '../../csuite/reveal/RevealUI'
import { ImageDropdownMenuUI } from '../../panels/ImageDropdownUI'
import { useImageDrag } from './dnd'
import { ImageErrorDisplayUI } from './ImageErrorDisplayUI'

export const ImageUI = observer(function ImageUI_({
   size,
   img,
   onClick,
   className,
   style,
   // blurred,
   ...rest
}: {
   size: number /* px */
   img: MediaImageL | MediaImageID
   onClick?: (img: MediaImageL) => void
   className?: string
   // blurred?: boolean
   style?: React.CSSProperties
}) {
   const image = typeof img === 'string' ? cushy.db.media_image.get(img) : img
   const ImageWidth = `${size}px`

   if (image == null) {
      return <div style={{ width: ImageWidth, height: ImageWidth }}>❌</div>
   }

   const [{ opacity }, dragRef] = useImageDrag(image! /* 🔴 */)
   const IMG = (
      <img
         className={className}
         tw='bg-contain bg-center bg-no-repeat object-contain'
         // src={image.url}
         src={image.urlForSize(size)}
         onMouseEnter={image.onMouseEnter}
         onMouseLeave={image.onMouseLeave}
         onClick={onClick ? (): void => void onClick(image) : image.onClick}
         onAuxClick={(ev) => {
            if (ev.button === 1) return image.onMiddleClick()
            if (ev.button === 2) return image.onRightClick()
         }}
         ref={dragRef}
         style={{
            // not really necessary; let's just keep the bare minimum to make things faster
            // backgroundImage: `url(${image.thumbhashURL})`,
            width: ImageWidth,
            height: ImageWidth,
            // filter: blurred ? 'blur(10px)' : undefined,
            opacity,
            ...style,
         }}
         {...rest}
      />
   )

   if (image.existsLocally && !existsSync(image?.absPath as PathLike))
      return (
         <ImageErrorDisplayUI //
            icon={'mdiFolder'}
         />
      )

   return (
      <RevealUI //
         trigger='rightClick'
         relativeTo='mouse'
         tw='shrink-0'
         content={() => <ImageDropdownMenuUI img={image} />}
         children={IMG}
      />
   )
})

export const ImageUIDumb = observer(function ImageUIDumb_({
   className,
   img,
   ...rest
}: {
   img: MediaImageL | MediaImageID
   className?: string
}) {
   const image = typeof img === 'string' ? cushy.db.media_image.get(img) : img
   const [{ opacity }, dragRef, dragPreview] = useImageDrag(image! /* 🔴 */)

   if (!image) {
      return (
         <ImageErrorDisplayUI //
            icon={'mdiImageRemoveOutline'}
         />
      )
   }

   if (image.existsLocally && !existsSync(image?.absPath as PathLike)) {
      return (
         <ImageErrorDisplayUI //
            icon={'mdiFolder'}
         />
      )
   }

   return (
      <RevealUI //
         trigger='rightClick'
         relativeTo='mouse'
         tw='shrink-0'
         content={() => <ImageDropdownMenuUI img={image} />}
         children={
            <>
               <div tw='absolute opacity-0' ref={dragPreview}>
                  a
               </div>
               <img
                  className={className}
                  tw='h-full w-full bg-contain bg-center bg-no-repeat object-contain'
                  style={{ opacity: opacity }}
                  src={image.url}
                  onAuxClick={(ev) => {
                     if (ev.button === 1) return image.onMiddleClick()
                     if (ev.button === 2) return image.onRightClick()
                  }}
                  ref={dragRef}
               />
            </>
         }
      />
   )
})
