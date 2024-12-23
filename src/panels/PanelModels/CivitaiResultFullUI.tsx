import type { Civitai } from './Civitai'
import type { CivitaiModelVersion, CivitaiSearchResultItem } from './CivitaiTypes'

import { observer, useLocalObservable } from 'mobx-react-lite'
import { useEffect } from 'react'

import { BadgeListUI } from '../../csuite/badge/BadgeListUI'
import { Button } from '../../csuite/button/Button'
import { ToggleButtonUI } from '../../csuite/checkbox/InputBoolToggleButtonUI'
import { JsonViewUI } from '../../csuite/json/JsonViewUI'
import { RevealUI } from '../../csuite/reveal/RevealUI'
import { CivitaiResultVersionUI } from './CivitaiResultVersionUI'

export const CivitaiResultFullUI = observer(function CivitaiResultFullUI_(p: {
   //
   civitai: Civitai
   item: CivitaiSearchResultItem
}) {
   const item: CivitaiSearchResultItem = p.item
   const selected = useLocalObservable(() => ({
      version: item.modelVersions[0] as Maybe<CivitaiModelVersion>,
      //
   }))
   useEffect(() => {
      selected.version = item.modelVersions[0]
   }, [item.modelVersions[0]])

   return (
      <div tw='flex flex-col gap-1 p-2'>
         <div tw='flex items-baseline gap-1'>
            <div tw='text-2xl font-bold'>{item.name}</div>
            <div tw='italic opacity-50'>#{item.id}</div>
            <div tw='badge badge-lg bg-yellow-600 text-black'>{item.type}</div>
            {item.nsfw ? <div tw='badge badge-lg badge-error'>nsfw</div> : null}
            <div tw='flex-1'></div>
            <RevealUI content={() => <JsonViewUI value={item} />}>
               <Button>Show full json</Button>
            </RevealUI>
         </div>

         <BadgeListUI autoHue badges={item.tags} />

         <div // top description
            tw='line-clamp-3 text-sm'
            dangerouslySetInnerHTML={{ __html: item.description }}
         />

         <div // list of all versions
            tw='flex flex-wrap gap-0.5'
         >
            {item.modelVersions.map((version: CivitaiModelVersion) => (
               <ToggleButtonUI
                  toggleGroup='civitai-versions'
                  value={selected.version === version}
                  key={version.id}
                  onValueChange={() => (selected.version = version)}
               >
                  <img
                     tw='pointer-events-none'
                     style={{ width: '3rem', height: '3rem', objectFit: 'contain' }}
                     src={version.images[0]?.url}
                  />
                  <span>{version.name}</span>
               </ToggleButtonUI>
            ))}
         </div>

         <div //selected version
            tw='flex flex-col gap-1'
         >
            {selected.version && (
               <CivitaiResultVersionUI //
                  key={selected.version.id}
                  entry={item}
                  version={selected.version}
               />
            )}
         </div>
      </div>
   )
})
