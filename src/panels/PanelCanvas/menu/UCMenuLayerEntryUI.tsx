import type { Layer$ } from '../stateV2/Layer$'

import { observer } from 'mobx-react-lite'

import { ShellInputOnly } from '../../../csuite-cushy/shells/ShellInputOnly'
import { Button } from '../../../csuite/button/Button'
import { Frame } from '../../../csuite/frame/Frame'
import { UCMenuEntryContainerUI } from './UCMenuEntryContainerUI'

type UCMenuLayerEntryUIProps = {
   layer: Layer$['$Field']
   index: number
   active?: boolean
   children?: React.ReactNode
   body?: React.ReactNode
   onClick?: () => void
}

export const UCMenuLayerEntryUI = observer(function UCMenuLayerEntryUI_(p: UCMenuLayerEntryUIProps) {
   const inputHeight = cushy.preferences.interface.value.inputHeight
   const isVisible: boolean = p.layer.Visible.value
   const image = p.layer.Content.match({
      aiGeneration: (t) => t.fields.image.value_or_zero,
      image: (t) => t.value_or_zero,
   })

   // TEMP
   // Do not use interface.value.inputHeight in the future. Have a separate option for layer size?
   const SIZE = 2 // was:3
   const frameSize_ = `${inputHeight * SIZE + 0.5}rem`
   const imageSize_ = `${inputHeight * SIZE}rem`

   const HEADER = (
      <Frame
         onClick={p.onClick}
         tw={['flex gap-1']}
         // style={{ height: frameSize_ }}
         active={p.active}
         hover
      >
         <Frame
            base={{ contrast: -0.1 }}
            border={{ contrast: 0.2 }}
            tw='overflow-clip rounded-md'
            style={{ width: imageSize_, minWidth: imageSize_, maxWidth: imageSize_ }}
            // filter: 'drop-shadow(0px 1px 0px black)',
         >
            <img src={image?.url} />
            {/*
                // TODO add back
                <CachedResizedImage
                    draggable={false}
                    onDragStart={() => false}
                    onDrop={() => false}
                    src={image?.url}
                    size={128}
                /> */}
         </Frame>
         <div tw='flex w-full flex-col'>
            <p.layer.Name.UI Shell={ShellInputOnly} />
            {p.children}
         </div>

         <div tw={['flex flex-grow flex-col']} style={{ height: `${inputHeight}rem` }}>
            {/* <Button //
                  // base={{ hue: 250, chroma: 0.1, contrast: 0.5 }}
                  onClick={() => p.layer.Visible.toggle()}
                  icon='mdiBrush'
               /> */}

            {/* <SpacerUI /> */}
            <Button
               description='Delete'
               onClick={() => p.layer.disableSelfWithinParent()}
               icon={'mdiDeleteOutline'}
               borderless
               subtle
            />
            <Button
               description='visibility'
               onClick={() => p.layer.Visible.toggle()}
               icon={isVisible ? 'mdiEyeOutline' : 'mdiEyeClosed'}
               borderless
               subtle
            />
         </div>
      </Frame>
   )
   return (
      <UCMenuEntryContainerUI style={{ opacity: isVisible ? undefined : 0.3 }}>
         {/*  */}
         {HEADER}
         {p.body}
      </UCMenuEntryContainerUI>
   )
})
