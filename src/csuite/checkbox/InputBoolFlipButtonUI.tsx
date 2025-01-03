import type { BoolButtonProps } from './InputBoolUI'

import { observer } from 'mobx-react-lite'

import { Frame } from '../frame/Frame'

export const InputBoolFlipButtonUI = observer(function InputBoolFlipButtonUI_(p: BoolButtonProps) {
   const isActive = p.value ?? false
   const label = p.text
   const mode = p.mode ?? false // 'checkbox'
   return (
      <Frame //Container (Makes it so we follow Fitt's law and neatly contains everything)
         style={p.style}
         className={p.className}
         disabled={p.disabled}
         description={p.description}
         tooltipPlacement={p.tooltipPlacement}
         hover
         triggerOnPress={{ startingState: isActive, toggleGroup: p.toggleGroup }}
         expand={p.expand}
         tw={['flex cursor-pointer !select-none flex-row']}
         onClick={(ev) => {
            if (!p.onValueChange) return
            ev.stopPropagation()
            ev.preventDefault()
            p.onValueChange(!isActive)
         }}
      >
         <Frame // Checkbox
            size='input'
            square
            icon={p.icon ?? (isActive ? 'mdiCheckBold' : null)}
            tw={['!select-none', mode === 'radio' ? 'rounded-full' : 'rounded-sm']}
            iconSize={p.iconSize ?? 'var(--input-icon-height)'}
            hover
            {...p.box}
         />
         {p.children ?? (label ? <div tw='ml-1'>{label}</div> : null)}
      </Frame>
   )
})
