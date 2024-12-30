import type { CushyShortcut } from '../commands/CommandManager'
import type { IconName } from '../icons/icons'

import { observer } from 'mobx-react-lite'
import { type ReactNode, useState } from 'react'

import { ComboUI } from '../accelerators/ComboUI'
import { useCSuite } from '../ctx/useCSuite'
import { Frame } from '../frame/Frame'
import { Ikon, IkonOf } from '../icons/iconHelpers'
import { formatMenuLabel } from '../menu/formatMenuLabel'

// import { MenuDivider } from './MenuDivider'

export type MenuItemProps = {
   // behaviour
   onClick?: (ev?: React.MouseEvent<HTMLElement, MouseEvent>) => unknown

   // icon
   icon?: Maybe<IconName>
   iconJSX?: ReactNode // if specified, will be used instead of icon
   iconClassName?: Maybe<string>

   disabled?: boolean | (() => boolean)
   active?: boolean
   className?: string
   children?: ReactNode
   label: string
   /** index of the char that need to be emphasis to hint we can press that key to quickly click the entry */
   labelAcceleratorIx?: number
   loading?: boolean
   /** right before the (menu shortcust) */
   localShortcut?: CushyShortcut
   globalShortcut?: CushyShortcut
   // slots
   beforeShortcut?: ReactNode
   afterShortcut?: ReactNode
   stopPropagation?: boolean

   // tooltips
   tooltip?: string

   style?: React.CSSProperties
}

export const _PieMenuItem = observer(function _PieMenuItem_(p: MenuItemProps) {
   // prettier-ignore
   const {
        // behaviour
        onClick,

        // icon
        icon, iconClassName, iconJSX,

        label, labelAcceleratorIx, disabled, children, active,
        localShortcut, globalShortcut, beforeShortcut, afterShortcut,
        stopPropagation,
        ...rest
    } = p

   const [isExecuting, setExecuting] = useState(false)
   const isDisabled: boolean | undefined =
      typeof disabled === 'function' //
         ? disabled()
         : disabled

   const theme = cushy.preferences.theme.value

   return (
      <Frame
         loading={p.loading ?? isExecuting}
         text={{ contrast: isDisabled ? 0.5 : 1 }}
         base={{
            contrast: active ? 0.1 : 0,
            chroma: active ? 0.1 : undefined,
         }}
         dropShadow={theme.global.shadow}
         roundness={theme.global.roundness}
         border={theme.global.border}
         // hover={{ contrast: 0.15, chroma: 0.2, hueShift: 180 }}
         hover={15}
         onClick={async (ev) => {
            // ev.preventDefault()
            if (stopPropagation) ev.stopPropagation()
            setExecuting(true)
            const res = await p.onClick?.(ev)
            setExecuting(false)
            return res
         }}
         style={p.style}
         tw={[
            //
            '_MenuItem ',
            'flex cursor-pointer items-center gap-2 whitespace-nowrap p-2',
            // Grid this so we have a consistent icon width and every label lines up
            'grid grid-cols-[18px_1fr]',
         ]}
         {...rest}
      >
         {iconJSX ??
            (icon ? ( //
               <IkonOf name={icon /* ?? '_' */} className={iconClassName ?? undefined} />
            ) : (
               <Ikon._ />
            ))}
         {/* <div tw='flex h-full items-center'>{icon}</div> */}
         {/* {icon} */}
         <div tw='flex flex-1 items-center'>
            {children ?? (labelAcceleratorIx != null ? formatMenuLabel(labelAcceleratorIx, label) : label)}
            {/* {children} */}
            {beforeShortcut}
            {localShortcut ? (
               <div tw='ml-auto pl-2 text-xs italic'>
                  {localShortcut && <ComboUI combo={localShortcut} />}
               </div>
            ) : null}
            {globalShortcut ? (
               <div tw='ml-auto pl-2 text-xs italic'>
                  {globalShortcut && <ComboUI combo={globalShortcut} />}
               </div>
            ) : null}
            {afterShortcut}
         </div>
      </Frame>
   )
})

export const PieMenuItem = Object.assign(_PieMenuItem, {
   // name: 'BasicShelfUI',
   //    Divider: MenuDivider,
})
