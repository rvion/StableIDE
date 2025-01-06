import type { IconName } from '../../icons/icons'

import { observer } from 'mobx-react-lite'

import { Frame } from '../../frame/Frame'
import { ColorPickerUI } from '../../input-color/ColorPickerUI'
import { getLCHFromStringAsString } from '../../kolor/getLCHFromStringAsString'
import { Kolor } from '../../kolor/Kolor'
import { RevealUI } from '../../reveal/RevealUI'
import { knownOKLCHHues } from '../../tinyCSS/knownHues'

export const InputColorUI = observer(function InputColorUI_(p: {
   getValue: () => string
   setValue: (value: string) => void
   noColorStuff?: boolean
   className?: string
   icon?: IconName
   clearable?: boolean
   style?: React.CSSProperties
}) {
   const value = p.getValue?.() ?? ''
   const isDirty = false // isBuffered && temporaryValue != null && temporaryValue !== value

   const theme = cushy.preferences.theme.value
   const interfacePref = cushy.preferences.interface.value

   const visualHelper = (
      <Frame //
         tw='UI-Color absolute left-0 flex h-full w-full items-center whitespace-nowrap pl-2 font-mono text-[0.6rem]'
         base={value ? value : undefined}
         text={{ contrast: 1 }}
      >
         {interfacePref.widget.color.showText && getLCHFromStringAsString(value)}
      </Frame>
   )

   return (
      <RevealUI
         placement='above-no-min-no-max-size'
         content={() => {
            const color = Kolor.fromString(p.getValue())

            return (
               <div tw='p-2'>
                  <ColorPickerUI
                     color={color}
                     onColorChange={(value: string) => {
                        const next = `${value}`
                        p.setValue(next)
                     }}
                  />
               </div>
            )
         }}
      >
         <Frame
            noColorStuff={p.noColorStuff}
            className={p.className}
            style={p.style}
            base={theme.global.contrast}
            text={{ contrast: 1, chromaBlend: 1 }}
            hover={3}
            // dropShadow={dropShadow}
            roundness={theme.global.roundness}
            role='textbox'
            border={
               isDirty //
                  ? { contrast: 0.3, hue: knownOKLCHHues.warning, chroma: 0.2 }
                  : theme.global.border
            }
            tw={[
               //
               'w-full',
               p.icon && !p.clearable ? 'pr-1' : 'px-0',
               'UI-InputString h-input relative flex items-center overflow-clip text-sm',
            ]}
         >
            {visualHelper}
         </Frame>
      </RevealUI>
   )
})
