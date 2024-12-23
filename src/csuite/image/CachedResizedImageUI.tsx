import type { ImgHTMLAttributes } from 'react'

import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import sharp from 'sharp'

import { ImageErrorDisplayUI } from '../../widgets/galleries/ImageErrorDisplayUI'

/* XXX: Should only be temporary until a better system is made. */

/** Caches a resized version of an image, only updates if the size value has changed
 *
 * Example:
 *
 * ```
 *  <div><CachedResizedImage filePath={"/path/to/file"} size={48} /></div>
 * ```
 */

export const CachedResizedImage = observer(function CachedResizedImage_({
   // own --------------------------------------------------------------
   /** unrelated to the underlying image element */
   size,

   // modified ---------------------------------------------------------
   // will be replaced by the resized version
   src,
   /** make it lazy by default */
   loading = 'lazy',

   // standard ---------------------------------------------------------
   ...rest
}: { size: number } & ImgHTMLAttributes<HTMLImageElement>) {
   const [lastSize, setLastSize] = useState<number>(-1)
   const [cached, setCached] = useState<string>('')

   if (lastSize != size) {
      const image = sharp(src).resize(size, size, { fit: 'inside' })
      image
         .ensureAlpha()
         .png()
         .toBuffer((err, buffer, info) => {
            if (err) {
               console.error(err)
               return <ImageErrorDisplayUI icon='mdiCached' />
            }

            setCached(`data:image/png;base64,${buffer.toString('base64')}`)
         })
      setLastSize(size)
   }

   return (
      <img // using a native image without any wrapper
         src={cached}
         loading={loading}
         {...rest}
      />
   )
})
