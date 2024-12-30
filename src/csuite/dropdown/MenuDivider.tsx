import type { ReactNode } from 'react'

import { observer } from 'mobx-react-lite'

import { Frame } from '../frame/Frame'

export const MenuDivider = observer(function Divider_(p: { children?: ReactNode }) {
   return (
      <div className='!h-widget relative mx-2 grid text-sm'>
         <Frame base={{ contrast: 0.1 }} tw='absolute z-0 h-0.5 w-full [top:50%]'></Frame>
         {p.children ? (
            <Frame //
               line
               border
               tw='z-1 !h-widget relative justify-self-center px-2'
               roundness={cushy.preferences.theme.value.global.roundness}
            >
               {p.children}
            </Frame>
         ) : (
            // Weird hacky stuff to get the proper sizing when not using a label, idk why the !h-widget isn't working for the container div.
            <p tw='!h-widget opacity-0'>🌶️</p>
         )}
      </div>
   )
})
