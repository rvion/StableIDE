import type { Tint } from '../kolor/Tint'
import type { ReactNode } from 'react'

import { observer } from 'mobx-react-lite'

import { Frame } from '../frame/Frame'

export const BasicShelf_GroupUI: React.FC<{ align?: boolean; children?: ReactNode } & Tint> = observer(
   function BasicShelf_Group({ align, children, ...tint }) {
      const theme = cushy.preferences.theme.value

      return (
         <Frame
            col
            base={tint}
            border={theme.global.border}
            roundness={theme.global.roundness}
            dropShadow={theme.global.shadow}
            align={align ?? true}
         >
            {children}
         </Frame>
      )
   },
)
