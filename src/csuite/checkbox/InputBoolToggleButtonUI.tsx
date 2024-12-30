import type { BoolButtonProps } from './InputBoolUI'

import { observer } from 'mobx-react-lite'

// import { twMerge } from 'tailwind-merge'
import { Button } from '../button/Button'
import { useCSuite } from '../ctx/useCSuite'
import { run_theme_dropShadow } from '../frame/SimpleDropShadow'
import { run_tint } from '../kolor/prefab_Tint'
import { CheckboxAndRadioIcon } from './_InputBoolToggleButtonBoxUI'

// 🔴 2024-07-31: domi: this should actually look like a button?
// => then let's use a Button propably
// => or only have one component with some props?
export const ToggleButtonUI = observer(function ToggleButtonUI_(
   p: BoolButtonProps & {
      preventDefault?: boolean
      showToggleButtonBox?: boolean
      /** emulate beeing hovered, passed down to frame as-is */
      hovered?: (reallyHovered: boolean) => boolean | undefined
      iconSize?: string
   },
) {
   const isActive = p.value ?? false
   // const chroma = getInputBoolChroma(isActive)
   // const border = p.border ?? 10
   const theme = cushy.preferences.theme.value
   const dropShadow = p.dropShadow ?? theme.global.shadow
   const activeColor = run_tint(theme.global.active)
   return (
      <Button
         tw={
            /* twMerge */ [
               'minh-input cursor-pointer select-none px-1',
               p.showToggleButtonBox ? undefined : 'justify-center',
               p.className,
            ]
         }
         onKeyDown={(ev) => {
            if (ev.key === 'Enter') {
               p.onValueChange?.(!isActive)
               ev.preventDefault()
            } else if (ev.key === ' ') {
               p.onValueChange?.(!isActive)
               ev.preventDefault()
            }
         }}
         subtle={!isActive}
         tabIndex={0}
         className={p.className}
         triggerOnPress={{ startingState: isActive, toggleGroup: p.toggleGroup }}
         tooltip={p.tooltip}
         tooltipPlacement={p.tooltipPlacement}
         // look={isActive ? 'primary' : undefined} // 🔴🦀 temp solution to visually broken active options
         base={isActive ? activeColor : {}} // 🔴🦀 temp solution to visually broken active options
         border={theme.global.border}
         disabled={p.disabled}
         dropShadow={p.look == 'subtle' ? undefined : dropShadow}
         roundness={theme.global.roundness}
         expand={p.expand}
         style={{
            textShadow: run_theme_dropShadow(theme.global.text.shadow),
            ...p.style,
         }}
         size={p.size}
         hovered={p.hovered}
         icon={p.icon}
         onClick={(ev) => {
            // wasEnabled = !isActive
            if (p.disabled) return
            ev.stopPropagation()
            p.onValueChange?.(!isActive)
            if (p.preventDefault) ev.preventDefault()
         }}
         role='checkbox'
         aria-disabled={p.disabled}
         aria-checked={isActive}
         {...p.box}
         iconSize={p.iconSize}
         // hoverable={!p.disabled}
         // boxShadow={
         //     !Boolean(border) //
         //         ? undefined
         //         : { inset: true, y: -3, blur: 5, spread: 0, color: 5 }
         // }
      >
         {(p.showToggleButtonBox ?? cushy.preferences.interface.value.widget.showToggleButtonBox) &&
            p.mode != null && <CheckboxAndRadioIcon disabled isActive={isActive} mode={p.mode} />}
         {/* 2024-06-07 rvion: make sure long label remain legible even on low width
                - I removed the "line-clamp-1" from the paragraph below
                - I replaced the "h-input" by "minh-input" in the Frame above
            */}
         {p.children ?? (p.text && <p tw='w-full text-center'>{p.text}</p>)}
      </Button>
   )
})
