import type { Tint } from '../kolor/Tint'

import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo } from 'react'

import { Button } from '../button/Button'
import { Frame, type FrameProps } from '../frame/Frame'
import { run_theme_dropShadow } from '../frame/SimpleDropShadow'
import { run_tint } from '../kolor/prefab_Tint'
import { parseFloatNoRoundingErr } from '../utils/parseFloatNoRoundingErr'
import { window_addEventListener } from '../utils/window_addEventListenerAction'

const clamp = (x: number, min: number, max: number): number => Math.max(min, Math.min(max, x))

/* NOTE(bird_d): Having these here should be fine since only one slider should be dragging/active at a time? */
let startValue: number = 0
let dragged: boolean = false
let cumulativeOffset: number = 0
let lastShiftState: boolean = false
let lastControlState: boolean = false
let lastValue: number = 0
let activeSlider: HTMLDivElement | null = null
let cancelled: boolean = false

type InputNumberProps = {
   disabled?: boolean
   value?: Maybe<number>
   mode: 'int' | 'float'
   onValueChange: (next: number) => void
   onBlur?: () => void
   onFocus?: () => void
   step?: number
   min?: number
   max?: number
   softMin?: number
   softMax?: number
   text?: string
   suffix?: string
   debug?: string
   hideSlider?: boolean
   style?: React.CSSProperties
   placeholder?: string
   forceSnap?: boolean
   className?: string
   tooltip?: React.ReactNode
} & {
   // 💬 2024-09-30 rvion:
   // Temporarilly, let's just accept the two we use manually,
   // and improve that later.
   //
   //> & FrameProps 🔴 will hhave to take all those props properly into account if we want to add taht here
   roundness?: FrameProps['roundness']
   dropShadow?: FrameProps['dropShadow']
}

/** this class will be instanciated ONCE in every InputNumberUI, (local the the InputNumberUI) */
class InputNumberStableState {
   constructor(public props: InputNumberProps) {
      makeAutoObservable(this)
   }

   get value(): number {
      return this.props.value ?? clamp(1, this.props.min ?? -Infinity, this.props.max ?? Infinity)
   }

   get mode(): 'int' | 'float' {
      return this.props.mode
   }

   get step(): number {
      return this.props.step ?? (this.mode === 'int' ? 1 : 0.1)
   }

   get rounding(): number {
      return Math.ceil(-Math.log10(this.step * 0.01))
   }

   get forceSnap(): boolean {
      return this.props.forceSnap ?? false
   }

   get rangeMin(): number {
      return this.props.softMin ?? this.props.min ?? -Infinity
   }

   get rangeMax(): number {
      return this.props.softMax ?? this.props.max ?? Infinity
   }

   get numberSliderSpeed(): number {
      return cushy.preferences.interface.value.widget.valueSliderMultiplier
   }

   get isInteger(): boolean {
      return this.mode === 'int'
   }

   /* Used for making sure you can type whatever you want in to the value, but it gets validated when pressing Enter. */
   inputValue: string = this.value.toString()

   /* When editing the number <input> this will make it display inputValue instead of val.*/
   isEditing: boolean = false

   inputRef = React.createRef<HTMLInputElement>()

   syncValues = (
      //
      value: number | string,
      opts: { soft?: boolean; roundingModifier?: number; skipRounding?: boolean } = {},
   ): number | undefined => {
      const soft = opts.soft ?? false
      const roundingModifier = opts.roundingModifier ?? 1
      const skipRounding = opts.skipRounding ?? false
      let num =
         typeof value === 'string' //
            ? this.mode == 'int'
               ? parseInt(value, 10)
               : parseFloat(value)
            : value

      // Ensure is number
      if (isNaN(num) || typeof num != 'number') {
         console.log(`${JSON.stringify(value)} is not a number`)
         return startValue
      }

      // snap integer value ?? (🔴 probably wrong logic here; why only ints ?)
      if (this.forceSnap) {
         num =
            this.mode == 'int' //
               ? Math.round(num / this.step) * this.step
               : num
      }

      // Ensure value is integer if mode === 'int'
      if (this.mode === 'int') num = Math.round(num)

      // Ensure value in range
      if (soft && startValue <= this.rangeMax && startValue >= this.rangeMin) {
         num = clamp(num, this.rangeMin, this.rangeMax)
      } else {
         num = clamp(num, this.props.min ?? -Infinity, this.props.max ?? Infinity)
      }

      // ...
      if (!skipRounding) {
         const roundingPrecise = Math.ceil(-Math.log10(this.step * 0.01 * roundingModifier))
         num = parseFloatNoRoundingErr(num, roundingPrecise)
      }

      // console.log(`[onValueChange] (${reason}) p.debug = ${this.props.debug} | NEW = ${num}`)
      this.props.onValueChange(num)
      this.inputValue = num.toString()
   }

   increment = (): void => {
      startValue = this.value
      const num = this.value + (this.isInteger ? this.step : this.step * 0.1)
      this.syncValues(num, { soft: true })
   }

   decrement = (): void => {
      startValue = this.value
      const num = this.value - (this.isInteger ? this.step : this.step * 0.1)
      this.syncValues(num, { soft: true })
   }

   mouseMoveListener = (e: MouseEvent): void => {
      // reset origin if change shift or control key while drag (to let already applied changes remain)
      if (dragged && (lastShiftState !== e.shiftKey || lastControlState !== e.ctrlKey)) {
         lastValue = this.value
         cumulativeOffset = 0
      }

      dragged = true
      cumulativeOffset += e.movementX

      const precision = (e.shiftKey ? 0.001 : 0.01) * this.step
      const offset = this.numberSliderSpeed * cumulativeOffset * precision

      const next = lastValue + offset
      // Parse value
      let num =
         typeof next === 'string' //
            ? this.mode == 'int'
               ? parseInt(next, 10)
               : parseFloatNoRoundingErr(next, this.rounding)
            : next

      // Snapping
      if (e.ctrlKey) {
         const inverval = e.shiftKey ? 0.1 * this.step : this.step
         num = Math.round(num / inverval) * inverval
      }

      lastShiftState = e.shiftKey
      lastControlState = e.ctrlKey

      this.syncValues(num, { soft: true, roundingModifier: e.shiftKey ? 0.01 : 1 })
   }

   cancelListener = (e: MouseEvent): void => {
      // Right click
      if (e.button == 2) {
         activeSlider = null
         document.exitPointerLock()
         e.preventDefault()
         e.stopPropagation()
      }
   }

   onPointerUpListener = (/* e: MouseEvent */): void => {
      if (activeSlider && !dragged) {
         this.inputRef.current?.focus()
      } else {
         activeSlider = null
      }

      // pointer
      window.removeEventListener('pointerup', this.onPointerUpListener, true)
      window.removeEventListener('pointerlockchange', this.onPointerLockChange, true)
      // mouse
      window.removeEventListener('mousemove', this.mouseMoveListener, true)
      window.removeEventListener('mousedown', this.cancelListener, true)
      // lock
      document.exitPointerLock()
   }

   onPointerLockChange = (e: Event): void => {
      const isPointerLocked = document.pointerLockElement === activeSlider

      if (!(activeSlider && isPointerLocked)) {
         window.removeEventListener('mousemove', this.mouseMoveListener, true)
         window.removeEventListener('mousedown', this.cancelListener, true)
         this.syncValues(startValue)
      }
   }
}

export const InputNumberUI = observer(function InputNumberUI_(p: InputNumberProps) {
   // create stable state, that we can programmatically mutate witout caring about stale references
   const uist = useMemo(() => new InputNumberStableState(p), [])

   // ensure new properties that could change during lifetime of the component stays up-to-date in the stable state.
   runInAction(() => Object.assign(uist.props, p))

   // ensure any unmounting of this component will properly clean-up
   useEffect(() => uist.onPointerUpListener, [])

   // to minimize diff with previous code
   const val = uist.value
   const step = uist.step
   const rounding = uist.rounding
   const isEditing = uist.isEditing
   const theme = cushy.preferences.theme.value

   const dropShadow = uist.props.dropShadow ?? theme.global.shadow
   return (
      <Frame /* Root */
         style={p.style}
         base={theme.global.contrast}
         border={theme.global.border}
         hover={{ contrast: 0.03 }}
         className={p.className}
         // unsure about the amount of code we had to use for that prop
         dropShadow={dropShadow ? dropShadow : undefined}
         roundness={p.roundness ?? theme.global.roundness}
         disabled={p.disabled}
         tooltip={p.tooltip}
         tw={[
            'UI-InputNumber',
            'h-input relative',
            'input-number-ui',
            'min-w-24 flex-1 cursor-ew-resize select-none overflow-clip',
         ]}
         onWheel={(ev) => {
            /* NOTE: This could probably divide by the length? But I'm not sure how to get the distance of 1 scroll tick.
             * Increment/Decrement using scroll direction. */
            if (ev.ctrlKey) {
               let num = uist.isInteger ? step * -Math.sign(ev.deltaY) : step * -Math.sign(ev.deltaY) * 0.1
               num = val + num
               num = uist.isInteger ? Math.round(num) : parseFloatNoRoundingErr(num, rounding)
               num = clamp(num, p.min ?? -Infinity, p.max ?? Infinity)
               uist.syncValues(num, undefined)
               ev.preventDefault()
               ev.stopPropagation()
            }
         }}
      >
         {p.hideSlider ?? (
            <Frame /* Slider display */
               className='inui-foreground'
               base={run_tint(theme.global.active)}
               tw={['h-input absolute left-0 z-10']}
               style={{ width: `${((val - uist.rangeMin) / (uist.rangeMax - uist.rangeMin)) * 100}%` }}
            />
         )}

         <div tw='z-20 flex h-full items-center'>
            <Button /* Left Button */
               // className='control'
               borderless
               tw='z-20 h-full items-center !rounded-none opacity-0'
               tabIndex={-1}
               onClick={uist.decrement}
               icon='mdiChevronLeft'
               square
               size='inside'
            />
            <div /* Text Container */
               tw={[
                  //
                  'th-text',
                  `z-20 flex h-full flex-grow truncate px-1 text-sm`,
                  'items-center',
                  // 'items-center justify-center',
               ]}
               onMouseDown={(ev) => {
                  if (isEditing || ev.button != 0) return

                  /* Begin slider drag */
                  activeSlider = ev.currentTarget
                  lastValue = startValue = val
                  cumulativeOffset = 0
                  dragged = false

                  window_addEventListener('mousemove', uist.mouseMoveListener, true)
                  window_addEventListener('pointerup', uist.onPointerUpListener, true)
                  window_addEventListener('pointerlockchange', uist.onPointerLockChange, true)
                  window_addEventListener('mousedown', uist.cancelListener, true)

                  /* Fix for low-sensitivity devices, it will get raw input from the mouse instead of the processed input.
                   *  NOTE: This does not work on Linux right now, but when it does get added for Linux, this code should not need to be changed.
                   */
                  // @ts-ignore 🔴 untyped for me for now; TODO: will have to investigate why
                  activeSlider?.requestPointerLock({ unadjustedMovement: true }).catch((error) => {
                     console.log(
                        '[InputNumberUI] Obtaining raw mouse input is not supported on this platform. Using processed mouse input, you may need to adjust the number input drag multiplier.',
                     )
                     activeSlider?.requestPointerLock()
                  })
               }}
            >
               <input //
                  type='text'
                  draggable='false'
                  ref={uist.inputRef}
                  onDragStart={(ev) => ev.preventDefault()} // Prevents drag n drop of selected text, so selecting is easier.
                  tw={[
                     /* `absolute opacity-0` is a bit of a hack around not being able to figure out why the input kept taking up so much width.
                      * Can't use `hidden` here because it messes up focusing. */
                     !isEditing && 'pointer-events-none absolute cursor-not-allowed opacity-0',
                     !isEditing && p.text ? 'text-right' : 'text-center',
                  ]}
                  value={isEditing ? uist.inputValue : val}
                  placeholder={p.placeholder}
                  style={{
                     fontFamily: 'monospace',
                     fontSize: `${theme.global.text.size}pt`,
                     zIndex: 2,
                     background: 'transparent',
                     MozWindowDragging: 'no-drag',
                  }}
                  min={p.min}
                  max={p.max}
                  step={step}
                  onChange={(ev) => {
                     uist.inputValue = ev?.target.value
                  }}
                  onFocus={(ev) => {
                     const textInput = ev.currentTarget
                     activeSlider = textInput.parentElement as HTMLDivElement
                     textInput.select()
                     startValue = val
                     runInAction(() => {
                        uist.inputValue = val.toString()
                        uist.isEditing = true
                     })
                     p.onFocus?.()
                  }}
                  onBlur={(ev) => {
                     uist.isEditing = false
                     const next = ev.currentTarget.value
                     activeSlider = null
                     if (cancelled) {
                        cancelled = false
                        uist.syncValues(startValue, undefined)
                        p.onBlur?.()
                        return
                     }
                     uist.syncValues(ev.currentTarget.value, { skipRounding: true })
                     p.onBlur?.()
                  }}
                  onKeyDown={(ev) => {
                     if (ev.key === 'Enter') {
                        ev.currentTarget.blur()
                     } else if (ev.key === 'Escape') {
                        cancelled = true
                        ev.currentTarget.blur()
                     }

                     /* Since we removed tabbing to buttons, we want up and down to increment/decrement.
                      * I don't think people actually use up and down to maneuver to the beginning/end of a single line, more likely using home/end so this should be fine. */
                     if (uist.isEditing) {
                        if (ev.key === 'ArrowUp') {
                           uist.increment()
                           ev.preventDefault()
                        } else if (ev.key === 'ArrowDown') {
                           uist.decrement()
                           ev.preventDefault()
                        } else {
                           // 💬 2024-03-11 rvion: we just stop propagation here,
                           // | just in case parents (e.g. unified canvas) have
                           // | dedicated shortcuts for single letter or singler digit key
                           ev.stopPropagation()
                        }
                     }
                  }}
               />
               {!isEditing && (
                  <>
                     {p.text && (
                        <div /* Inner Label Text - Not shown while editing */
                           tw={[
                              'z-10 w-full flex-grow truncate border-0 border-transparent pr-1 text-left outline-0',
                           ]}
                           style={{ fontSize: `${theme.global.text.size}pt` }}
                        >
                           {p.text}
                        </div>
                     )}
                     {/* I couldn't make the input not take up a ton of space so I'm just using this when we're not editing now. */}
                     <div style={{ fontFamily: 'monospace', fontSize: `${theme.global.text.size}pt` }}>
                        {p.value}
                     </div>
                     {!isEditing && p.suffix ? <div tw='pl-0.5'>{p.suffix}</div> : <></>}
                  </>
               )}
            </div>

            <Button /* Right Button */
               // className='control'
               borderless
               tw='z-20 h-full items-center !rounded-none opacity-0'
               tabIndex={-1}
               onClick={uist.increment}
               icon='mdiChevronRight'
               square
               size='inside'
            />
         </div>
      </Frame>
   )
})
