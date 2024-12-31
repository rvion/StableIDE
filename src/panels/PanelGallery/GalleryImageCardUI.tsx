import type { MediaImageL } from '../../models/MediaImage'

import { observer } from 'mobx-react-lite'
import { type CSSProperties, useEffect, useState } from 'react'

import { Frame } from '../../csuite/frame/Frame'
import { IkonOf } from '../../csuite/icons/iconHelpers'
import { ImageUIDumb } from '../../widgets/galleries/ImageUI'

class GalleryQueue {
   private jobQueue: { job: () => Promise<void>; index: number }[] = [] // Queue to hold jobs
   private activeJobs: number = 0 // Current number of active jobs
   private readonly maxJobs: number = 10 // Max number of concurrent jobs
   private knownIndexes: Set<number> = new Set<number>()
   private delay: number = 50

   public startRange: number = 0
   public endRange: number = 0

   public cachedImages: { [key: number]: HTMLImageElement[] } = []

   get jobCount(): number {
      return this.jobQueue.length
   }

   // constructor() {
   //    window.document.addEventListener('resize', this.clear, true)
   // }
   sortJobs(): void {
      this.jobQueue.sort((a, b) => {
         // const middle = this.startRange + (this.endRange - this.startRange) * 0.5

         // const distanceA = Math.abs(a.index - middle)
         // const distanceB = Math.abs(b.index - middle)

         // if (distanceA === distanceB) {
         //    return 0 // If distances are equal, maintain original order
         // }
         // return distanceA - distanceB
         return b.index - a.index
      })
   }

   clear(): void {
      this.activeJobs = 0
      this.jobQueue.length = 0
   }

   // Add a new job to the queue
   enqueueJob(job: () => Promise<void>, index: number): void {
      // Add the job to the queue
      if (this.knownIndexes.has(index)) {
         return
      }

      this.knownIndexes.add(index)
      this.jobQueue.push({ job, index })

      // Start processing jobs if space is available
      this.processQueue()
   }

   // Process jobs from the queue
   private async processQueue(): Promise<void> {
      let cancelled = false
      // If there are fewer than max jobs running, process the next one
      if (this.activeJobs < this.maxJobs && this.jobQueue.length > 0) {
         const next = this.jobQueue.shift() // Get the next job from the queue
         if (next) {
            this.activeJobs++
            try {
               this.knownIndexes.delete(next.index)

               // No longer in view, "cancel" the job
               if (next.index > this.startRange && next.index < this.endRange) {
                  // Wait for the job to finish
                  await next.job()
               } else {
                  console.log('[FD] Job was out of range')
                  cancelled = true
               }
            } catch (error) {
               console.error('Error executing job:', error)
            } finally {
               setTimeout(
                  () => {
                     // Decrement active jobs and process the next job
                     this.activeJobs--
                     this.processQueue() // Start the next job if there is space
                  },
                  cancelled ? 0 : this.delay,
               )
            }
         }
      }
   }
}

export const galleryLoadingQueue = new GalleryQueue()

export const GalleryImageCardUI = observer(function GalleryImageCardUI_(p: {
   // img: MediaImageL
   style?: CSSProperties
   //    favorited: boolean
   size: number
   onMouseEnter?: React.MouseEventHandler<HTMLDivElement>
   onMouseLeave?: React.MouseEventHandler<HTMLDivElement>
   index: number
}) {
   const theme = cushy.preferences.theme.value
   const desiredSize = p.size - p.size * 0.05

   // State to hold the img
   const [img, setImg] = useState<MediaImageL | null | false>(null)
   const [src, setSrc] = useState<string | null>(null)
   const [qPosition, setQueuePosition] = useState<number>(0)
   const [imgDiv, setImgDiv] = useState<HTMLImageElement | null>(null)

   // Async function to fetch the image
   useEffect(() => {
      if (!imgDiv) {
         const fetchImage = async (): Promise<void> => {
            try {
               const fetchedImg = cushy.db.media_image.selectOne((x) => x.offset(p.index))
               // setImg(fetchedImg ?? null)
               // setSrc(fetchedImg ? fetchedImg.urlForSize(desiredSize) : '')
               const aaa = document.createElement('img')
               aaa.src = fetchedImg ? fetchedImg.urlForSize(desiredSize) : ''
               // setImg(fetchedImg ?? false)
               setImgDiv(aaa)
            } catch (error) {
               console.error('Error fetching image:', error)
            }
         }

         galleryLoadingQueue.enqueueJob(fetchImage, p.index)
         setQueuePosition(galleryLoadingQueue.jobCount)

         // fetchImage()
      }
   }, [imgDiv]) // Dependency on p.index to re-fetch when index changes

   // if (!src) {
   if (!imgDiv) {
      // if (!img) {
      // return <></>
      return (
         <Frame tw=' !p-1 flex justify-center items-center' style={p.style}>
            {qPosition}
            <IkonOf name='mdiDatabaseArrowDown' />
         </Frame>
      )
   }

   return <img tw='object-contain' style={p.style} loading='lazy' src={imgDiv.src}></img>

   // return <ImageUIDumb style={p.style} img={img} desiredSize={desiredSize} />

   return (
      <div // Layouting
         tw='flex items-center justify-center p-1'
         style={p.style}
         onMouseEnter={p.onMouseEnter}
         onMouseLeave={p.onMouseLeave}
      >
         <Frame // Decoration
            tw='overflow-clip'
            hover
            // TODO(bird_d): Should have a separate hovered for the panel state?
            // Currently, this will make it get highlighted whenever the image is hovered ANYWHERE.
            // Which will make the gallery flash when hovering over the image in the Step Panel.
            hovered={() => cushy.hovered == img}
            base={{ contrast: -0.05, chromaBlend: 0.5 }}
            // border={p.favorited ? { contrast: 0.3, chromaBlend: 5, hue: 90 } : { contrast: 0.15 }}
            border={{ contrast: 0.15 }}
            roundness={theme.global.roundness}
            dropShadow={theme.global.shadow}
            style={{
               // 16% of size for consistent "padding", Should maybe be an interface/panel option
               width: desiredSize,
               height: desiredSize,
               // borderStyle: isFavorited ? 'dashed' : 'solid',
            }}
         >
            <ImageUIDumb img={img} desiredSize={desiredSize} />
         </Frame>
      </div>
   )
})
