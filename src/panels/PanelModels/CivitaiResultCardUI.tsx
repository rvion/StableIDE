import type { Civitai } from './Civitai'
import type { CivitaiModelVersion, CivitaiSearchResultItem } from './CivitaiTypes'

import { observer } from 'mobx-react-lite'

import { BadgeListUI } from '../../csuite/badge/BadgeListUI'
import { BadgeUI } from '../../csuite/badge/BadgeUI'
import { Frame } from '../../csuite/frame/Frame'

export const CivitaiResultCardUI = observer(function CivitaiResultCardUI_(p: {
   //
   civitai: Civitai
   item: CivitaiSearchResultItem
}) {
   const item = p.item
   const v0: Maybe<CivitaiModelVersion> = item.modelVersions[0]
   const v0Imgs = v0?.images
   const img0 = v0Imgs?.[0]
   const active = p.civitai.selectedResult === item
   return (
      <Frame
         active={active}
         border={10}
         hover
         // look={active ? 'primary' : undefined}
         base={active ? 10 : 0}
         onClick={() => (p.civitai.selectedResult = item)}
         tw={['w-80', 'cursor-pointer']}
      >
         <div tw={['flex gap-0.5']}>
            {img0 && (
               <img
                  //
                  style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                  tw='flex-none'
                  key={img0.url}
                  src={img0.url}
               />
            )}
            <div>
               <div tw='font-bold'>{item.name}</div>
               <div tw='flex items-center gap-1'>
                  <div tw='text-sm opacity-50'>{item.modelVersions.length} version</div>
                  <div tw='flex-1'></div>
                  <BadgeUI autoHue={item.type}>{item.type}</BadgeUI>
                  {item.nsfw ? <BadgeUI hue={0}>nsfw</BadgeUI> : null}
               </div>
               <BadgeListUI autoHue badges={item.tags} />
            </div>
         </div>
         <div //
            tw='line-clamp-3 text-sm'
            dangerouslySetInnerHTML={{ __html: item.description }}
         ></div>
      </Frame>
   )
})
