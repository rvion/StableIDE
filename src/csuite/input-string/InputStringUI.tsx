import type { Field_string_config } from '../fields/string/FieldString'
import type { IconName } from '../icons/icons'
import type { CSSSizeString } from './CSSSizeString'
import type { CSSProperties, ReactElement, ReactNode } from 'react'

import { observer } from 'mobx-react-lite'
import { useState } from 'react'

import { Button } from '../button/Button'
import { extractConfigValue } from '../errors/extractConfig'
import { Frame, type FrameProps } from '../frame/Frame'
import { IkonOf } from '../icons/iconHelpers'
import { ColorPickerUI } from '../input-color/ColorPickerUI'
import { getLCHFromStringAsString } from '../kolor/getLCHFromStringAsString'
import { Kolor } from '../kolor/Kolor'
import { RevealUI } from '../reveal/RevealUI'
import { knownOKLCHHues } from '../tinyCSS/knownHues'

type ClassLike = string | { [cls: string]: any } | null | undefined | boolean

export type InputStringProps = {
   /** when true => 'mdiText' */
   icon?: IconName // | boolean | null | undefined

   /** When there is text it will show a button at the end that when clicked will remove the text */
   clearable?: boolean

   disabled?: boolean

   /** when true, input will match the size of its content */
   autoResize?: boolean
   /** only taken into account when autoResize is true */
   autoResizeMaxWidth?: CSSSizeString

   // get / set value
   getValue: () => string
   setValue: (value: string) => void

   // get / set buffered value
   buffered?: Maybe<{
      getTemporaryValue: () => string | null
      setTemporaryValue: (value: string | null) => void
   }>

   /** default to text */
   type?: Field_string_config['inputType']

   /** text pattern */
   pattern?: Field_string_config['pattern']

   autoFocus?: boolean

   /** input placeholder */
   placeholder?: string

   // slots ---------------------
   slotBeforeInput?: ReactNode

   // styling -------------------
   // styling > frame:

   /** className added on the Frame enclosing the input */
   className?: string
   /** style added on the frame enclosing the input */
   style?: CSSProperties

   // styling > input
   /** className added on the input itself */
   inputClassName?: string
   /** style added on the input itself */
   inputStyle?: CSSProperties

   onBlur?: (ev: React.FocusEvent<HTMLInputElement, Element>) => void
   onFocus?: (ev: React.FocusEvent<HTMLInputElement, Element>) => void
   onKeyDown?: (ev: React.KeyboardEvent<HTMLInputElement>) => void
   noColorStuff?: boolean
   ref?: React.Ref<HTMLInputElement>
} & {
   // 💬 2024-09-30 rvion:
   // Temporarilly, let's just accept the two we use manually,
   // and improve that later.
   //
   //> & FrameProps 🔴 will hhave to take all those props properly into account if we want to add taht here
   roundness?: FrameProps['roundness']
   dropShadow?: FrameProps['dropShadow']
}
export const InputStringUI = observer(function WidgetStringUI_(p: InputStringProps) {
   // getValue is mandatory, but it may avoid crash to be permissive about it's absense
   // let's rely on typescript to catch this
   const ref = p.ref
   const value = p.getValue?.() ?? ''

   const isBuffered = Boolean(p.buffered)
   const temporaryValue = p.buffered?.getTemporaryValue?.()
   const isDirty = isBuffered && temporaryValue != null && temporaryValue !== value
   const autoResize = p.autoResize
   const inputClassNameWhenAutosize = autoResize
      ? 'absolute top-0 left-0 right-0 opacity-10 focus:opacity-100 z-50'
      : null
   const [reveal, setReveal] = useState(false)
   let inputTailwind: string | ClassLike[] | undefined
   let visualHelper: ReactElement<any, any> | undefined

   const theme = cushy.preferences.theme.value
   const interfacePref = cushy.preferences.interface.value

   switch (p.type) {
      case 'color':
         inputTailwind = 'w-full h-full !bg-transparent opacity-0 !p-0'
         visualHelper = (
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
                     p.icon && !p.clearable ? 'pr-1' : 'px-0',
                     'UI-InputString h-input relative flex items-center overflow-clip text-sm',
                  ]}
               >
                  {visualHelper}
               </Frame>
            </RevealUI>
         )
         break
      default:
         inputTailwind = 'w-full h-full !outline-none bg-transparent px-2'
         break
   }
   const input = (
      <input
         ref={ref}
         size={autoResize ? 1 : undefined}
         className={p.inputClassName}
         style={{ fontSize: `${theme.global.text.size}pt`, ...p.inputStyle }}
         tw={[inputClassNameWhenAutosize, inputTailwind]}
         type={reveal ? 'text' : p.type}
         pattern={extractConfigValue(p.pattern)?.toString()}
         placeholder={p.placeholder}
         autoFocus={p.autoFocus}
         disabled={p.disabled}
         value={p.buffered ? (temporaryValue ?? value) : value}
         onChange={(ev) => {
            if (p.buffered) p.buffered.setTemporaryValue(ev.target.value)
            else p.setValue(ev.currentTarget.value)
         }}
         /* Prevents drag n drop of selected text, so selecting is easier. */
         onDragStart={(ev) => ev.preventDefault()}
         onFocus={(ev) => {
            p.buffered?.setTemporaryValue(p.getValue() ?? '')
            // ev.currentTarget.select()
            p.onFocus?.(ev)
         }}
         onBlur={(ev) => {
            // need to be deferenced here because of how it's called in
            // the onKeyDown handler a few lines below
            const tempValue = p.buffered?.getTemporaryValue?.()
            if (tempValue != null) p.setValue(tempValue)
            p.onBlur?.(ev)
         }}
         onKeyDown={(ev) => {
            // 🔴 Prevents users from submitting the form when pressing enter (required by monoloco)
            // ⏸️ if (ev.key === 'Enter') {
            // ⏸️    ev.currentTarget.blur()
            // ⏸️ } else
            if (ev.key === 'Escape') {
               if (!p.buffered && temporaryValue) p.setValue(temporaryValue)
               p.buffered?.setTemporaryValue(null)
               ev.currentTarget.blur()
            }
            p.onKeyDown?.(ev)
         }}
      />
   )
   const dropShadow = p.dropShadow ?? theme.global.shadow
   return (
      <Frame
         noColorStuff={p.noColorStuff}
         className={p.className}
         style={p.style}
         base={theme.global.contrast}
         text={{ contrast: 1, chromaBlend: 1 }}
         hover={3}
         dropShadow={dropShadow}
         roundness={theme.global.roundness}
         role='textbox'
         border={
            isDirty //
               ? { contrast: 0.3, hue: knownOKLCHHues.warning, chroma: 0.2 }
               : theme.global.border
         }
         tw={[
            //
            p.icon && !p.clearable ? 'pr-1' : 'px-0',
            'UI-InputString h-input relative flex items-center overflow-clip text-sm',
         ]}
         onMouseDown={(ev) => {
            if (ev.button == 1) {
               const textInput = ev.currentTarget.querySelector('input[type="text"') as HTMLInputElement
               textInput.focus()
            }
         }}
      >
         {visualHelper}
         {p.icon != null && (
            <IkonOf //
               tw='mx-1 flex-none'
               size='1.2rem'
               name={typeof p.icon === 'string' ? p.icon : 'mdiText'}
            />
         )}
         {p.slotBeforeInput}
         {autoResize ? (
            <div className='minh-input relative'>
               {input}
               <span
                  style={{ maxWidth: p.autoResizeMaxWidth }}
                  tw='minh-input lh-input select-none whitespace-nowrap whitespace-pre px-1'
               >
                  {p.getValue() ? p.getValue() : <span tw='opacity-30'>{p.placeholder || ' '}</span>}
               </span>
            </div>
         ) : (
            input
         )}
         {p.type === 'password' && (
            <Button
               subtle
               borderless
               icon={reveal ? 'mdiEyeOff' : 'mdiEye'}
               onClick={() => setReveal(!reveal)}
               tw='mx-1 cursor-pointer'
               square
            />
         )}
         {value != '' && p.clearable && (
            <Button //
               roundness={0}
               subtle
               borderless
               icon={'_clear'}
               onClick={() => p.setValue('')}
            />
         )}
      </Frame>
   )
})

// 1-a 2-a
// 1-b 2-a

// behaviours
// 1. updateValueOn:
//      - a keystroke
//      - b enter
// 2. onEscape or tab or click away:
//      - a revert to last committed value
//      - b do nothing
