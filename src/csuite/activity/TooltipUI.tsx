import { observer } from 'mobx-react-lite'
import { useRef } from 'react'

import { computePlacement } from '../../csuite/reveal/RevealPlacement'
import { Frame } from '../frame/Frame'
import { tooltipStuff } from '../frame/tooltip'
import { useDelay } from './useDelay'

export const TooltipUI = observer(function TooltipUI_(p: {}) {
   const shellRef = useRef<HTMLDivElement>(null)
   const preferences = cushy.preferences
   const conf = preferences.interface.value.tooltipDelay
   const theme = preferences.theme.value

   const tooltip = tooltipStuff.deepest
   const isDelayed = useDelay(conf, [tooltip, conf])

   if (isDelayed && conf != null) return null
   if (tooltip == null) return null
   const domRect = tooltip.ref.getBoundingClientRect()
   const pos = computePlacement(
      tooltip.placement ?? 'bottom',
      domRect,
      shellRef.current?.getBoundingClientRect() ?? null,
   )
   const txt = tooltip.text

   return (
      <div style={pos} tw='absolute left-0 top-0 whitespace-pre rounded [z-index:999999999]' ref={shellRef}>
         <Frame
            // (bird_d): (THEME-TODO) Theming here should be separated from the input stuff since tooltips aren't really inputs, but okay for now. Opacity is annoying because it blends with the stuff behind it, making tooltips harder to read. If you don't want them to block the stuff under it, simply move off the thing displaying the tooltip. This is also why you don't want them to be shown instantly the majority of the time, since that will annoyingly block everything.
            base={theme.base}
            roundness={theme.global.roundness}
            border={theme.global.border}
            shadow
            dropShadow={{ y: 3, blur: 3, opacity: 0.33 }}
            tw='p-2'
         >
            <div>{txt}</div>
         </Frame>
      </div>
   )
})
