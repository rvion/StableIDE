import type { CivitaiModelVersion, CivitaiSearchResultItem } from './CivitaiTypes'

import { observer, useLocalObservable } from 'mobx-react-lite'

import { BadgeUI } from '../../csuite/badge/BadgeUI'
import { Button } from '../../csuite/button/Button'
import { JsonViewUI } from '../../csuite/json/JsonViewUI'
import { RevealUI } from '../../csuite/reveal/RevealUI'
import { CivitaiDownloadableFileUI } from './CivitaiDownloadableFileUI'

export const CivitaiResultVersionUI = observer(function CivitaiResultVersionUI_(p: {
   //
   entry: CivitaiSearchResultItem
   version: CivitaiModelVersion
}) {
   const version = p.version
   const uist = useLocalObservable(() => ({
      ix: 0,
      get image() {
         return version.images[this.ix]
      },
   }))
   const img = uist.image
   const imgUrl = img?.url // ?? noImage
   const size1 = `${cushy.civitaiConf.fields.imgSize1.value}px`
   const size2 = `${cushy.civitaiConf.fields.imgSize2.value}px`

   return (
      <div tw='flex flex-col gap-1'>
         <div key={version.id} tw='flex gap-1'>
            <img
               //
               loading='lazy'
               style={{ width: size1, height: size1, objectFit: 'contain' }}
               src={imgUrl}
            />
            <div tw='flex flex-1 flex-col'>
               <div // key infos
                  tw='flex gap-2'
               >
                  <BadgeUI>version={version.name}</BadgeUI>
                  <BadgeUI>baseModel={version.baseModel}</BadgeUI>
                  <RevealUI tw='ml-auto' content={() => <JsonViewUI value={p.version} />}>
                     <Button>Show version json</Button>
                  </RevealUI>
               </div>
               <div tw='flex flex-col gap-1'>
                  {version.description && (
                     <div tw='text-sm' dangerouslySetInnerHTML={{ __html: version.description }}></div>
                  )}
                  {/* {modelVersion.downloadUrl} */}
                  <div // trigger words infos
                     tw='flex-gap flex items-center'
                  >
                     Trigger words:
                     <div tw='text-sm'>
                        {version.trainedWords.map((w) => (
                           <div tw='kbd'>{w}</div>
                        ))}
                     </div>
                  </div>
                  {/* <h3>Files</h3> */}
                  {version.files.map((file, ix) => (
                     <CivitaiDownloadableFileUI //
                        entry={p.entry}
                        version={version}
                        key={ix}
                        file={file}
                     />
                  ))}
               </div>
            </div>
            {/* {v.trainedWords && <div tw='text-sm'>{v.trainedWords}</div>} */}
         </div>
         <div tw='flex flex-row flex-wrap gap-1'>
            {version.images.map((img, ix) => (
               <img
                  //
                  onMouseEnter={() => (uist.ix = ix)}
                  loading='lazy'
                  style={{ width: size2, height: size2, objectFit: 'contain' }}
                  key={img.url}
                  src={img.url}
               />
            ))}
         </div>
      </div>
   )
})
