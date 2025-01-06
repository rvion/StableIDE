import type { MenuInstance } from './MenuInstance'

import { observer } from 'mobx-react-lite'
import * as React from 'react'
import { type MouseEvent } from 'react'

import { activityManager } from '../activity/ActivityManager'
import { MenuItem } from '../dropdown/MenuItem'
import { IkonOf } from '../icons/iconHelpers'
import { isBoundCommand } from '../introspect/_isBoundCommand'
import { isCommand } from '../introspect/_isCommand'
import { isMenu } from '../introspect/_isMenu'
import { isWidget } from '../model/$FieldSym'
import { PieMenuItem } from '../pie_menu/PieMenuItem'
import { RevealUI } from '../reveal/RevealUI'
import { renderFCOrNode } from '../utils/renderFCOrNode'
import { SimpleMenuAction } from './SimpleMenuAction'
import { SimpleMenuModal } from './SimpleMenuModal'

// -----------------------
export type MenuUIProps = {
   menu: MenuInstance
   startX: number
   startY: number
} & React.HTMLAttributes<HTMLDivElement>

// Used to keep things more consistent compared to positioning entries around a circle based on amount of entries
function positionFromIndex(index: number, distance: number): { x: number; y: number } {
   switch (index) {
      case 0:
         return { x: -1 * distance, y: 0 }
      case 1:
         return { x: 1 * distance, y: 0 }
      case 2:
         return { x: 0, y: 1.33 * distance }
      case 3:
         return { x: 0, y: -1.33 * distance }
      case 4:
         return { x: -0.77 * distance, y: -0.77 * distance }
      case 5:
         return { x: 0.77 * distance, y: -0.77 * distance }
      case 6:
         return { x: -0.77 * distance, y: 0.77 * distance }
      case 7:
         return { x: 0.77 * distance, y: 0.77 * distance }
   }
   return { x: 0, y: 0 }
}

export const MenuPieUI = observer(function MenuPieUI_({
   // own props
   menu,

   // top-level 'div' patches
   tabIndex,
   autoFocus,
   onKeyDown,

   startX,
   startY,

   // rest (so custom JSX magic can work)
   ...rest
}: MenuUIProps) {
   const [selected, setSelected] = React.useState<number>(-1)
   const position = { x: startX, y: startY }

   console.log('[FD] :', position)

   return (
      <div
         tabIndex={tabIndex ?? -1}
         autoFocus={autoFocus ?? true}
         tw='absolute left-0 top-0 h-full w-full'
         // TODO: this should be handled by the menu activity instead.
         onKeyDown={(ev) => {
            // call the original onKeyDown
            onKeyDown?.(ev)

            // handle the shortcut key
            const key = ev.key
            for (const entry of menu.entriesWithKb) {
               if (entry.char === key) {
                  if (entry.entry instanceof SimpleMenuAction) entry.entry.opts.onClick?.()
                  // if (entry.entry instanceof SimpleMenuEntryPopup) entry.entry.onPick()
                  else if (isBoundCommand(entry.entry)) void entry.entry.execute()
                  else if (isCommand(entry.entry)) void entry.entry.execute()
                  menu.onStop()
                  ev.stopPropagation()
                  ev.preventDefault()
                  return
               }
            }
         }}
         {...rest}
         onMouseMove={(ev) => {
            const step = 360 / menu.entriesWithKb.length
            const dx = ev.screenX - startX
            const dy = ev.screenY - startY

            const angle = (Math.atan2(dy, dx) * (180 / Math.PI) + 180) % 360 // Normalize to 0-360 degrees

            const index = (Math.floor((angle + step / 2) / step) + 2) % menu.entriesWithKb.length
            console.log('[FD] - ', angle, index)
         }}
      >
         <div // Pivot
            tw='absolute'
            style={{ top: startY, left: startX }}
         >
            {menu.entriesWithKb.map(({ entry: entry, char, charIx }, ix) => {
               const { x, y } = positionFromIndex(ix, 100)

               const style = {
                  transform: `translate(${x}px, ${y}px)`,
               }

               // TODO(bird_d): Make sure to implement div for 2/3/4/etc.
               // 1. simple menu action
               if (entry instanceof SimpleMenuAction) {
                  return (
                     <div //
                        tw='pointer-events-none absolute select-none'
                        style={style}
                     >
                        <PieMenuItem //
                           tw={[
                              //
                              '_SimpleMenuAction absolute',
                              x >= 0 ? '' : 'right-0',
                           ]}
                           key={ix}
                           localShortcut={`${ix}`}
                           label={entry.opts.label}
                           style={{
                              transform: 'translate(0, -50%)',
                           }}
                           // children={formatMenuLabel(charIx, entry.opts.label)}
                           icon={entry.opts.icon}
                           onClick={async () => {
                              await entry.opts.onClick?.()
                              menu.onStop()
                           }}
                        />
                     </div>
                  )
               }
               // 2. simple menu modal
               if (entry instanceof SimpleMenuModal) {
                  return (
                     <PieMenuItem //
                        tw='_SimpleMenuModal min-w-60 select-none pointer-events-none'
                        style={style}
                        key={ix}
                        icon={entry.p.icon}
                        localShortcut={char}
                        label={entry.p.label}
                        onClick={(event?: MouseEvent) => {
                           activityManager.start({
                              event,
                              placement: 'auto',
                              shell: 'popup-lg',
                              UI: (p) => (
                                 <entry.p.UI //
                                    close={() => p.stop()}
                                    submit={entry.p.submit}
                                    submitLabel={entry.p.submitLabel}
                                 />
                              ),
                           })
                        }}
                     />
                  )
               }
               // 3. commands and bound commands
               if (isBoundCommand(entry) || isCommand(entry)) {
                  return (
                     <PieMenuItem
                        tw='pointer-events-none min-w-60 select-none'
                        style={style}
                        key={ix}
                        label={entry.label}
                        labelAcceleratorIx={charIx}
                        globalShortcut={isCommand(entry) ? entry.firstCombo : char}
                        icon={entry.icon}
                        onClick={() => {
                           void entry.execute()
                           menu.onStop()
                        }}
                     />
                  )
               }

               // bound menu
               else if (isMenu(entry)) {
                  const label = entry.title
                  // return (
                  //    <RevealUI //
                  //       key={ix}
                  //       trigger='hover'
                  //       hideTriggers={{}}
                  //       tw='!block min-w-60'
                  //       placement='rightStart'
                  //       content={() => <MenuPieUI menu={entry.init(menu.allocatedKeys)} />}
                  //    >
                  //       <MenuItem //
                  //          disabled={entry.def.disabled}
                  //          localShortcut={char}
                  //          icon={entry.icon}
                  //          afterShortcut={<IkonOf name='mdiMenuRight' />}
                  //          label={label}
                  //          labelAcceleratorIx={charIx}
                  //       />
                  //    </RevealUI>
                  // )
                  return <>NESTED PIES ARE NOT SUPPORTED</>
               }
               //
               else if (isWidget(entry)) {
                  return <div key={ix}>{entry.UI()}</div>
               }

               return <div key={ix}>{renderFCOrNode(entry, {})}</div>
               // plain jsx
               // else if (React.isValidElement(entry)) {
               //     return entry
               // }

               // // custom element
               // else {
               //     return <React.Fragment key={ix}>{createElement(entry)}</React.Fragment>
               //     // return entry as any as React.ReactNode
               // }
            })}
         </div>
      </div>
   )
})
