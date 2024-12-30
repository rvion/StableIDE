import type { IconName } from '../../csuite/icons/icons'

import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'

import { Frame } from '../../csuite/frame/Frame'

export type DnDHandlerContent = {
   suffixIcon?: IconName
   icon?: IconName
   label?: string
   content?: () => JSX.Element
}

export class CushyDnDHandler {
   private _visible: boolean = false

   // Content
   private _suffixIcon?: IconName = undefined
   private _icon?: IconName = undefined
   private _label?: string = undefined
   private _content?: () => JSX.Element

   /** Fallback content, set via setStartContent */
   private _startContent: DnDHandlerContent = {
      suffixIcon: undefined,
      label: undefined,
      content: undefined,
   }

   x: number = 0
   y: number = 0

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

   onDragEnd = (e: MouseEvent): void => {
      this.visible = false
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

   /** Call this when starting a drag to have the indicator have a fallback when the normal content is cleared */
   setDragContent({
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
      this._startContent.suffixIcon = suffixIcon
      this._startContent.icon = icon
      this._startContent.label = label
      this._startContent.content = content
   }

   get suffixIcon(): Maybe<IconName> {
      return this._suffixIcon ?? this._startContent.suffixIcon
   }
   get icon(): Maybe<IconName> {
      return this._icon ?? this._startContent.icon
   }
   get label(): Maybe<string> {
      return this._label ?? this._startContent.label
   }
   get content(): Maybe<() => JSX.Element> {
      return this._content ?? this._startContent.content
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
   const widgetHeight = cushy.preferences.interface.value.widgetHeight

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
