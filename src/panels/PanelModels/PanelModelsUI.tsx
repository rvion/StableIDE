import type { NO_PROPS } from '../../csuite/types/NO_PROPS'

import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'

import { SpacerUI } from '../../csuite/components/SpacerUI'
import { PanelHeaderUI } from '../../csuite/panel/PanelHeaderUI'
import { assets } from '../../utils/assets/assets'
import { SectionTitleUI } from '../../widgets/workspace/SectionTitle'
import { Civitai } from './Civitai'
import { CivitaiUI } from './CivitaiUI'

export const PanelModelsUI = observer(function PanelModelsUI_(p: NO_PROPS) {
   const civitai = useMemo(() => new Civitai(), [])
   return (
      <div className='flex size-full flex-col gap-2'>
         <PanelHeaderUI>
            <SectionTitleUI
               label={
                  <div tw='flex gap-1'>
                     <img tw='h-input' src={assets.CivitaiLogo_png} alt='Civitai logo' />
                     CIVITAI
                  </div>
               }
               className='block'
            />
            <SpacerUI />
            {cushy.civitaiConf.renderAsConfigBtn({ title: 'CIVITAI Options' })}
         </PanelHeaderUI>
         <CivitaiUI //
            tw='flex-1'
            civitai={civitai}
         />
      </div>
   )
})
