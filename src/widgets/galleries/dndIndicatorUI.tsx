import type { IconName } from '../../csuite/icons/icons'

import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'

import { Frame } from '../../csuite/frame/Frame'

export class CushyDnDHandler {
   private _visible: boolean = false
   private _suffixIcon?: IconName = undefined
   private _icon?: IconName = undefined
   private _label?: string = undefined

   x: number = 0
   y: number = 0

   private _content?: () => JSX.Element

   constructor() {
      makeAutoObservable(this)
   }

   get visible(): boolean {
      return this._visible
   }

   set visible(value: boolean) {
      console.log('[FD] visible: ', value)
      this._visible = value

      if (!value) {
         this.clear()
         return
      }

      this.setup()
   }

   setup = (): void => {
      console.log('[FD] SETUP!!!!!')
      //   window.document.addEventListener('mousemove', this.onMouseMove, false)
      window.document.addEventListener('drag', this.onMouseMove, true)
   }

   clear = (): void => {
      this._suffixIcon = undefined
      this._icon = undefined
      this._label = undefined
      this._content = undefined
      //   window.document.removeEventListener('mousemove', this.onMouseMove, false)
      window.document.removeEventListener('drag', this.onMouseMove, true)
   }

   setContent({
      suffixIcon,
      icon,
      label,
      content,
   }: {
      suffixIcon?: IconName
      icon?: IconName
      label?: string
      /** Underneath the other parameters, display whatever you need to */
      content?: () => JSX.Element
   }): void {
      this._suffixIcon = suffixIcon
      this._icon = icon
      this._label = label
      this._content = content
   }

   get suffixIcon(): Maybe<IconName> {
      return this._suffixIcon
   }
   get icon(): Maybe<IconName> {
      return this._icon
   }
   get label(): Maybe<string> {
      return this._label
   }
   get content(): Maybe<() => JSX.Element> {
      return this._content
   }

   onMouseMove = (e: MouseEvent): void => {
      console.log('[FD] MOVING!!')
      this.updatePosition(e.clientX, e.clientY)
   }

   updatePosition(x: number, y: number): void {
      this.x = x
      this.y = y
   }
}

export const DnDDragIndicatorUI = observer(function DnDDragIndicateUI_() {
   const uist = cushy.dndHandler
   const theme = cushy.preferences.theme.value
   const widgetHeight = cushy.preferences.interface.value.inputHeight

   return (
      <div
         tw={[
            'absolute',
            'pointer-events-none  z-[1000000000000000] select-none',
            uist.visible ? 'block' : 'hidden',
         ]}
         style={{
            top: uist.y,
            left: uist.x,
         }}
      >
         <Frame
            tw={[
               // Need to allow the content to draw whatever, the title will always show there
               '!bg-transparent',
               //    '',
            ]}
            style={{
               willChange: 'transform',
               transform: `translate(-${widgetHeight / 1.8}rem, calc(-100% - 10px))`,
            }}
         >
            <Frame
               tw={['items-center justify-center', uist.label && 'px-2']}
               roundness={theme.global.roundness}
               border
               base={theme.global.contrast}
               line
               expand
               size='widget'
               icon={uist.icon}
               suffixIcon={uist.suffixIcon}
               square={uist.label == undefined}
            >
               {uist.label}
            </Frame>
            {/* <Frame tw='w-20 h-20'>TEST</Frame> */}
         </Frame>
      </div>
   )
})
