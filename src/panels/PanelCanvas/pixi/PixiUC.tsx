import type { ForwardedRef } from 'react'

import { Application, extend } from '@pixi/react'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { Container, Text } from 'pixi.js'
import { forwardRef, Suspense, useRef } from 'react'

import { UnifiedCanvasCtx, useUnifiedCanvas } from '../states/UnifiedCanvasCtx'
import { useUCV2 } from '../stateV2/ucV2'
import { GridPixi } from './GridPixi'
import { PixiCursorDebugUI } from './PixiCursorDebug'
import { PixiLoadingText } from './PixiLoadingText'
import { PIXIUCLayers } from './PIXIUCLayers'
import { PIXIUCMasks } from './PIXIUCMasks'
import { PixiUCViewport } from './PixiUCViewport'
import { RectPixi } from './RectPixi'
import { PixiApplicationProvider } from './workaround/useApplication/PixiApplicationProvider'

extend({ Text, Container })
export const PixiUC = observer(function PixiUC(p: any): React.JSX.Element {
   const uc1 = useUnifiedCanvas()
   const uc2 = useUCV2()
   // const blurFilter = useMemo(() => new BlurFilter(2), [])
   // const bunnyUrl = 'https://pixijs.io/pixi-react/img/bunny.png'
   const ref = useRef(null)
   return (
      <div tw='flex-1' ref={ref}>
         <Application // stage root
            resizeTo={ref}
            onInit={(app) => {
               runInAction(() => {
                  uc1.app = app
               })
               // track mouse position
               // app.stage.interactive = true

               app.stage.on('mousemove', (e) => {
                  runInAction(() => {
                     const pos = e.data.global as { x: number; y: number }
                     uc1.cursor.xInScreen = pos.x
                     uc1.cursor.yInScreen = pos.y
                  })
               })
            }}
            // ref={ref2}
            // width={2000}
            // height={2000}
            // antialias
            // options={{ background: 0x1099bb }}
         >
            {/* <pixiText text={width.toString()} x={20} y={20} style={{ fill: 'red', fontSize: 12 }} /> */}
            {/* <pixiText text={height.toString()} x={20} y={40} style={{ fill: 'red', fontSize: 12 }} /> */}
            <UnifiedCanvasCtx.Provider value={uc1}>
               <PixiCursorDebugUI />
               <PixiApplicationProvider>
                  <PixiUCViewport>
                     <GridPixi // background grid
                        y={uc2.Frame.Y.value}
                        x={uc2.Frame.Y.value}
                        height={uc2.Frame.Width.value}
                        width={uc2.Frame.Width.value}
                     />
                     <RectPixi // final frame of the image
                        {...uc2.Frame.value}
                     />
                     <Suspense fallback={<PixiLoadingText />}>
                        <PIXIUCLayers uc2={uc2} />
                        <PIXIUCMasks uc2={uc2} />
                     </Suspense>
                     {/* all masks */}
                  </PixiUCViewport>
               </PixiApplicationProvider>
            </UnifiedCanvasCtx.Provider>
         </Application>
      </div>
   )
})
