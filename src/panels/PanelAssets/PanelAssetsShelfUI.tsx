import type { PanelAssetsState } from './PanelAssets'

import { observer } from 'mobx-react-lite'

import { useCSuite } from '../../csuite/ctx/useCSuite'
import { Frame } from '../../csuite/frame/Frame'
import { BasicShelfUI } from '../../csuite/shelf/ShelfUI'

export const PanelAssetsShelfUI = observer(function PanelAssetsShelfUI_(p: { st: PanelAssetsState }) {
   const activeLora = p.st.props.active > -1 && cushy.schema.getLoras()[p.st.props.active]
   const theme = cushy.preferences.theme.value

   return (
      <BasicShelfUI //
         base={{ contrast: 0.055 }}
         tw='flex'
         anchor='right'
      >
         <div tw='flex w-full select-none flex-col gap-1.5 p-1.5'>
            Lora DB info and editable data should be here
            {activeLora ? (
               <Frame // Kind of useless since the path isn't a full one, but need something here to display for now
                  tw='line-clamp-1 flex w-full select-none truncate whitespace-nowrap p-1'
                  icon='mdiFileDocument'
                  line
                  description={`Filepath\n${activeLora}`}
                  roundness={theme.global.roundness}
               >
                  {activeLora}
               </Frame>
            ) : (
               <Frame line icon='mdiInformationBox'>
                  No active item
               </Frame>
            )}
         </div>
      </BasicShelfUI>
   )
})
