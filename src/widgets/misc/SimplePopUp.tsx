import { observer } from 'mobx-react-lite'
import { useLayoutEffect, useRef, useState } from 'react'

import { MenuDivider } from '../../csuite/dropdown/MenuDivider'
import { Frame } from '../../csuite/frame/Frame'

export const POPUP = observer(function POPUP___(p: { title?: string; children?: React.ReactNode }) {
   const divRef = useRef<HTMLDivElement | null>(null)

   // Really simple and just keep it on screen for now. Should
   const fixPlacement = (): void => {
      if (divRef.current) {
         const rect = divRef.current.getBoundingClientRect()
         const viewportWidth = window.innerWidth
         const viewportHeight = window.innerHeight

         let top = rect.top
         let left = rect.left
         const padding = 10

         if (rect.bottom > viewportHeight) {
            top = viewportHeight - rect.height - padding
         }
         if (rect.top < 0) {
            top = padding
         }

         if (rect.right > viewportWidth) {
            left = viewportWidth - rect.width - padding
         }
         if (rect.left < 0) {
            left = padding
         }

         setInitialPosition({ x: left, y: top })
      }
   }

   useLayoutEffect(() => {
      fixPlacement()
      window.document.addEventListener('resize', fixPlacement)
      return (): void => window.document.removeEventListener('resize', fixPlacement)
   }, [])

   const [initialPosition, setInitialPosition] = useState<{ x: number; y: number } | null>(null)

   if (!initialPosition) {
      setInitialPosition({ x: cushy.region.mouseX, y: cushy.region.mouseY })
   }

   if (!initialPosition) {
      return <div> POSITION FAILED SOMEHOW</div>
   }

   const theme = cushy.preferences.theme.value

   return (
      <Frame
         ref={divRef}
         base={theme.global.contrast}
         border={{ contrast: 0.1 }}
         roundness={theme.global.roundness}
         tw='absolute select-none'
         style={{
            //
            top: initialPosition.y,
            left: initialPosition.x,
         }}
         col
      >
         {p.title && (
            <>
               <Frame tw='!bg-transparent px-2' text={{ contrast: 0.5 }} line size={'input'} expand>
                  {p.title}
               </Frame>
               <MenuDivider />
            </>
         )}
         {p.children}
      </Frame>
   )
})
