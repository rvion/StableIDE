import type { IconName } from '../../csuite/icons/icons'

import { observer } from 'mobx-react-lite'

import { Frame } from '../../csuite/frame/Frame'
import { IkonOf } from '../../csuite/icons/iconHelpers'

export const ImageErrorDisplayUI = observer(function ImageErrorDisplayUI_(p: {
   className?: string
   icon: IconName
   size?: string
}) {
   const theme = cushy.preferences.theme.value

   return (
      <Frame
         className={p.className}
         tw='h-full w-full select-none flex-col items-center justify-center !border-dotted text-center'
         roundness={theme.global.roundness}
         border={{ lightness: 0.8, chroma: 0.1, hue: 0 }}
         base={{ chroma: 0.1, hue: 0 }}
         square
      >
         <Frame square icon='mdiFileAlert' iconSize='80%' />
         <Frame tw='absolute right-0 top-0 -translate-x-0.5 translate-y-0.5 opacity-80'>
            {p.icon && <IkonOf name={p.icon} />}
         </Frame>
      </Frame>
   )
})
