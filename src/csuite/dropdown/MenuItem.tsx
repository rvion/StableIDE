import type { CushyShortcut } from '../commands/CommandManager'
import type { IconName } from '../icons/icons'

import { observer } from 'mobx-react-lite'
import { type ReactNode, useState } from 'react'

import { ComboUI } from '../accelerators/ComboUI'
import { Frame } from '../frame/Frame'
import { Ikon, IkonOf } from '../icons/iconHelpers'
import { formatMenuLabel } from '../menu/formatMenuLabel'
import { MenuDivider } from './MenuDivider'
import { observerWC } from './observerWC'

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
}

export const MenuItem = observerWC(
   function DropdownItem_(
      // prettier-ignore
      {
         // behaviour
         onClick,

         // icon
         icon, iconClassName, iconJSX,
         loading,

         label, labelAcceleratorIx, disabled, children, active,
         localShortcut, globalShortcut, beforeShortcut, afterShortcut,
         stopPropagation,

         ...rest
      }: MenuItemProps,
   ) {
      // prettier-ignore

      const [isExecuting, setExecuting] = useState(false)
      const isDisabled: boolean | undefined =
         typeof disabled === 'function' //
            ? disabled()
            : disabled

      return (
         <Frame
            loading={loading ?? isExecuting}
            base={{
               contrast: active ? 0.1 : 0,
               chroma: active ? 0.1 : undefined,
            }}
            disabled={isDisabled}
            hover={15}
            onClick={async (ev) => {
               if (isDisabled) {
                  // Prevent closing pop-up on click if disabled
                  ev.preventDefault()
                  ev.stopPropagation()
                  return
               }

               if (stopPropagation) ev.stopPropagation()
               setExecuting(true)
               const res = await onClick?.(ev)
               setExecuting(false)
               return res
            }}
            style={{ lineHeight: '1.6rem' }}
            tw={[
               //
               '_MenuItem ',
               'flex cursor-pointer select-none items-center gap-2 whitespace-nowrap px-2 py-0.5',
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
   },
   {
      Divider: MenuDivider,
   },
)
