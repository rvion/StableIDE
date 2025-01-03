import { observer } from 'mobx-react-lite'

import { Button } from '../../csuite/button/Button'
import { FrameWithCSuiteOverride } from '../../csuite/ctx/CSuiteOverride'
import { Frame } from '../../csuite/frame/Frame'
import { sizeManual } from '../../csuite/types/RsuiteTypes'

export const PlaygroundSizeUI = observer(function PlaygroundSizeUI_(p: {}) {
   return (
      <div>
         <Frame border base={{ hueShift: 10, contrast: 0.1, chroma: 0.05 }}>
            <h3>Manual (lg)</h3>
            {sizeManual.map((size) => (
               <Frame description={size} tw='my-1' line /* V1 */>
                  <Frame tw='w-12'>{size}</Frame>
                  <Button size={size}>button</Button>
                  <Frame size={size} children={'text in a frame'} />
                  {/* <Button size={size}>This is cool</Button> */}
               </Frame>
            ))}
         </Frame>

         <Frame border base={{ hueShift: 50, contrast: 0.1, chroma: 0.05 }}>
            <h3>Via context</h3>
            <FrameWithCSuiteOverride config={{ inputHeight: 5 }}>
               <Frame line>
                  <Button>button</Button>
                  <Frame hover children={'text in a frame'} />
               </Frame>
            </FrameWithCSuiteOverride>
         </Frame>
      </div>
   )
})
