import type { Civitai } from './Civitai'
import type { CivitaiSearchResultItem } from './CivitaiTypes'

import { observer } from 'mobx-react-lite'

import { InputStringUI } from '../../csuite/input-string/InputStringUI'
import { CivitaiResultCardUI } from './CivitaiResultCardUI'
import { CivitaiResultFullUI } from './CivitaiResultFullUI'

export const CivitaiUI = observer(function CivitaiUI_(p: { className?: string; civitai: Civitai }) {
   const civitai = p.civitai
   return (
      <div tw='flex flex-col overflow-auto' className={p.className}>
         <div tw='flex flex-1 overflow-auto'>
            <div // LEFT-COLUMN (search + search results)
               tw='flex flex-col'
               style={{ borderRight: '1px solid #aaa' }}
            >
               <div // SEARCH
                  className='px-1'
               >
                  <InputStringUI
                     icon='mdiMagnify'
                     tw='csuite-basic-input w-full'
                     placeholder='rechercher'
                     getValue={() => civitai.query.value}
                     setValue={(next) => (civitai.query.value = next)}
                  />
               </div>
               <div //RESULS
                  tw='flex flex-initial flex-col overflow-auto'
               >
                  {civitai.results?.ui((x) =>
                     x.items.map((i: CivitaiSearchResultItem) => (
                        <CivitaiResultCardUI //
                           key={i.id}
                           civitai={civitai}
                           item={i}
                        />
                     )),
                  )}
               </div>
            </div>
            <div //DETAILS
            >
               {civitai.selectedResult && ( //
                  <CivitaiResultFullUI //
                     civitai={civitai}
                     item={civitai.selectedResult}
                  />
               )}
            </div>
         </div>
      </div>
   )
})
