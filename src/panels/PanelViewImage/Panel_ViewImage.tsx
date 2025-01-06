import type { MediaImageL } from '../../models/MediaImage'

import { observer } from 'mobx-react-lite'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'

import { Button } from '../../csuite/button/Button'
import { SpacerUI } from '../../csuite/components/SpacerUI'
import { Frame } from '../../csuite/frame/Frame'
import { JsonViewUI } from '../../csuite/json/JsonViewUI'
import { PanelHeaderUI } from '../../csuite/panel/PanelHeaderUI'
import { RevealUI } from '../../csuite/reveal/RevealUI'
import { SelectUI } from '../../csuite/select/SelectUI'
import { formatSize } from '../../csuite/utils/formatSize'
import { Panel, type PanelHeader } from '../../router/Panel'
import { usePanel } from '../../router/usePanel'
import { assets } from '../../utils/assets/assets'
import { ImageDropdownUI } from '../ImageDropdownUI'

export const PanelViewImage = new Panel({
   name: 'Image',
   category: 'outputs',
   widget: (): React.FC<PanelViewImageProps> => PanelViewImageUI,
   header: (p): PanelHeader => ({ title: 'Image', icon: 'mdiCameraImage' }),
   def: (): PanelViewImageProps => ({}),
   icon: 'mdiCameraImage',
})

export const PanelLastImage = new Panel({
   name: 'LastImage',
   category: 'outputs',
   widget: (): React.FC<PanelViewImageProps> => PanelViewImageUI,
   header: (p): PanelHeader => ({ title: 'LastImage', icon: 'mdiImageSyncOutline' }),
   def: (): PanelViewImageProps => ({}),
   icon: 'mdiImageSyncOutline',
})

export type PanelViewImageProps = {
   className?: string
   imageID?: MediaImageID | 'latent'
}

export const PanelViewImageUI = observer(function PanelViewImage(p: PanelViewImageProps) {
   const img: Maybe<MediaImageL> = p.imageID //
      ? cushy.db.media_image.get(p.imageID)
      : cushy.db.media_image.last()
   const url = img?.url
   // 🛝 const background = st.galleryConf.value.galleryBgColor ?? undefined

   const shouldFilter = cushy.project.filterNSFW
   const safety =
      img?.url && shouldFilter //
         ? cushy.safetyChecker.isSafe(img?.url)
         : null

   return (
      <div
         //
         className={p.className}
         // 🛝 style={{ background }}
         tw='flex w-full flex-grow flex-col'
      >
         <ImageActionBarUI img={img} />
         {/* 🟢 test2 */}
         {shouldFilter && <pre>{JSON.stringify(safety?.value)}</pre>}
         <TransformWrapper centerZoomedOut centerOnInit>
            <TransformComponent
               wrapperStyle={{ height: '100%', width: '100%', display: 'flex' }}
               contentStyle={{ height: '100%', width: '100%' }}
            >
               {url ? (
                  <img //
                     style={{
                        filter: !cushy.project.filterNSFW
                           ? undefined
                           : safety?.value == null //
                             ? 'blur(50px)'
                             : safety.value.isSafe
                               ? undefined
                               : 'blur(50px)',
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                     }}
                     src={url}
                     alt='last generated image'
                  />
               ) : (
                  <div tw='relative flex h-full w-full'>
                     <div
                        style={{ fontSize: '3rem', textShadow: '0 0 5px #ffffff' }}
                        tw='absolute w-full animate-pulse self-center text-center text-xl font-bold text-black'
                     >
                        no image yet
                     </div>
                     <img //
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        src={assets.illustrations_image_home_transp_webp}
                        alt='last generated image'
                     />
                  </div>
               )}
            </TransformComponent>
         </TransformWrapper>
      </div>
   )
})

export const ImageActionBarUI = observer(function ImageActionBar(p: { img?: Maybe<MediaImageL> }) {
   const img = p.img
   const isStarred = Boolean(img?.data.star)
   const showTags = usePanel().usePersistentModel('showTags', (ui) =>
      ui.boolean({ display: 'button', label: 'tags', text: 'tags' }),
   )
   return (
      <div key={img?.id ?? 'no-img'}>
         <PanelHeaderUI>
            <Button // rating button
               square
               icon={isStarred ? 'mdiStarMinus' : 'mdiStar'}
               tooltip={isStarred ? 'Un-Favorite' : 'Favorite'}
               // active={isStarred}
               borderless
               subtle
               text={isStarred ? { hue: 80, chromaBlend: 30, contrast: 0.4 } : undefined}
               onClick={() => img?.update({ star: isStarred ? 0 : 1 })}
            />
            {img ? <ImageDropdownUI img={img} /> : null}
            <Button // Canvas Button
               onClick={() => img?.openInCanvasEditor()}
               disabled={img == null}
               icon='mdiVectorSquareEdit'
               borderless
               children='Canvas'
            />
            <Button // Paint Button
               icon='mdiBrush'
               disabled={img == null}
               borderless
               onClick={() => img?.openInImageEditor()}
            >
               Paint
            </Button>
            <showTags.UI rule={(f) => f.set('', { Shell: 'Inline' })} />
            <SpacerUI />
            {img && (
               <RevealUI
                  content={() => (
                     <div>
                        <div>Data</div>
                        <JsonViewUI value={img?.data}></JsonViewUI>
                        <div>meta</div>
                        <JsonViewUI value={img?.ComfyNodeMetadata ?? undefined}></JsonViewUI>
                        <div>node</div>
                        <JsonViewUI value={img?.ComfyNode ?? undefined}></JsonViewUI>
                     </div>
                  )}
               >
                  <Frame col tw='!leading-none' text={30} size={'xs'}>
                     <div tw='truncate'>{`${img.data.width ?? '?'} x ${img?.data.height ?? '?'}`}</div>
                     <div>{img.data.fileSize && `${formatSize(img.data.fileSize)}`}</div>
                  </Frame>
               </RevealUI>
            )}
            <Button // Delete button
               look='warning'
               tooltip='Delete Image'
               icon='mdiDeleteForever'
               iconSize='1.2rem'
               onClick={() => {
                  if (img == null) return
                  cushy.db.media_image.delete(img.id)
               }}
            />
         </PanelHeaderUI>
         <div>
            {img && showTags.value && (
               <SelectUI<string> //
                  startIcon='mdiTagEdit'
                  multiple
                  options={(q) =>
                     img.tags.includes(q) || !Boolean(q) //
                        ? img.tags
                        : [q, ...img.tags]
                  }
                  getLabelText={(o) => o}
                  value={() => img.tags}
                  onOptionToggled={(tag) => img?.toggleTag(tag)}
               />
            )}
            {/*
                <InputStringUI
                    icon='mdiTagEdit'
                    getValue={() => img?.data.tags ?? ''}
                    setValue={(next) => {
                        if (!img) return
                        img.tags = next
                    }}
                ></InputStringUI>
                <div>
                    <BadgeListUI
                        wrap={false}
                        badges={img?.data.tags?.split(',')}
                        onClick={(tag) => img?.removeTag(tag.toString())}
                    ></BadgeListUI>
                </div>
                 */}
            {/* Image Info Button */}

            {/* <Frame base={5} tw='h-5 mx-1' style={{ width: '1px' }}></Frame> */}
         </div>
      </div>
   )
})

// {/* <div tw='h-input border-l border-base-100 p-1 truncate'>{`${img.data.hash?.slice(0, 5)}...`}</div> */}
// {/* {img?.ComfyNodeMetadata?.tag && <div tw='badge badge-primary'>{img?.ComfyNodeMetadata?.tag}</div>} */}
// {/* {img?.tags.map((t) => (
// <div key={t} tw='italic'>
// #{t}
// </div>
// ))} */}
