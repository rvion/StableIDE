import type { MenuInstance } from './MenuInstance'

import { observer } from 'mobx-react-lite'
import { useId } from 'react'

import { Frame } from '../frame/Frame'
import { isBoundCommand } from '../introspect/_isBoundCommand'
import { isCommand } from '../introspect/_isCommand'
import { isMenu } from '../introspect/_isMenu'
import { isWidget } from '../model/$FieldSym'
import { RevealUI } from '../reveal/RevealUI'
import { renderFCOrNode } from '../utils/renderFCOrNode'
import { formatMenuLabel } from './formatMenuLabel'
import { MenuUI, type MenuUIProps } from './MenuUI'
import { SimpleMenuAction } from './SimpleMenuAction'
import { SimpleMenuModal } from './SimpleMenuModal'

export const MenuBarUI = observer(function MenuBar({
   // own props
   menu,

   // rest (so custom JSX magic can work)
   ...rest
}: MenuUIProps) {
   const uid = useId()
   const ENTRIES = menu.entriesWithKb.map((menuEntryWithKey, ix) => {
      const { entry: entry, charIx } = menuEntryWithKey
      // 1. simple menu action
      if (entry instanceof SimpleMenuAction) {
         return <div key={ix}>❌ TODO</div>
         // return (
         //     <MenuItem //
         //         tw='_SimpleMenuAction min-w-60'
         //         key={ix}
         //         localShortcut={char}
         //         label={formatLabel(charIx, entry.opts.label)}
         //         icon={entry.opts.icon}
         //         onClick={() => {
         //             entry.opts.onPick()
         //             menu.onStop()
         //         }}
         //     />
         // )
      }
      // 2. simple menu modal
      if (entry instanceof SimpleMenuModal) {
         return <div key={ix}>❌ TODO</div>
         // return (
         //     <MenuItem //
         //         tw='_SimpleMenuModal min-w-60'
         //         key={ix}
         //         icon={entry.p.icon}
         //         localShortcut={char}
         //         label={entry.p.label}
         //         onClick={(event: MouseEvent) => {
         //             activityManager.start({
         //                 event,
         //                 placement: 'auto',
         //                 shell: 'popup-lg',
         //                 UI: (p) => (
         //                     <entry.p.UI //
         //                         close={() => p.stop()}
         //                         submit={entry.p.submit}
         //                         submitLabel={entry.p.submitLabel}
         //                     />
         //                 ),
         //             })
         //         }}
         //     />
         // )
      }
      // 3. commands and bound commands
      if (isBoundCommand(entry) || isCommand(entry)) {
         return <div key={ix}>❌ TODO</div>
         // return (
         //     <MenuItem
         //         tw='min-w-60'
         //         key={ix}
         //         label={formatLabel(charIx, entry.label)}
         //         globalShortcut={isCommand(entry) ? entry.firstCombo : char}
         //         icon={entry.icon}
         //         onClick={() => {
         //             void entry.execute()
         //             menu.onStop()
         //         }}
         //     />
         // )
      }

      // bound menu
      else if (isMenu(entry)) {
         const label = entry.title
         const menuInstance: MenuInstance = menu.stableInit(entry) // entry.init(menu.allocatedKeys)
         return (
            <RevealUI //
               tw='inline-flex select-none'
               key={entry.id}
               ref={menuInstance.revealRef}
               trigger='menubarItem'
               showDelay={0}
               debugName={label}
               revealGroup={uid}
               hasBackdrop={false}
               showBackdrop={false}
               placement='bottomStart'
               content={() => <MenuUI menu={menuInstance} />}
               onAnchorKeyDown={(ev) => menu.processKey(ev)}
               onRevealed={(reveal) => {
                  menuInstance.menuUIRef.onMount((z) => z.focus())
                  //    menuInstance.menuUIRef.onMount((z) => {
                  //    // console.log(`[🤠] A`, document.activeElement)
                  //    // console.log(`[🤠] B`, shell)
                  //    z.focus()
                  //    // console.log(`[🤠] C `, document.activeElement)
                  //    setTimeout(() => {
                  //       console.log(`[🤠] D `, document.activeElement)
                  //    }, 100)
                  // })
               }}
            >
               <Frame //
                  tw='px-1'
                  tabIndex={0}
                  line
                  icon={entry.icon}
                  hover
                  roundness={cushy.preferences.theme.value.global.roundness}
               >
                  {formatMenuLabel(charIx, label)}
               </Frame>
               {/* <MenuItem //
                    key={ix}
                    localShortcut={char}
                    icon={entry.icon}
                    afterShortcut={<IkonOf name='mdiMenuRight' />}
                    label={formatLabel(charIx, label)}
                /> */}
            </RevealUI>
         )
      }
      //
      else if (isWidget(entry)) {
         return entry.UI()
      }

      return renderFCOrNode(entry, {})
   })
   return (
      <div tw='flex w-fit gap-1' {...rest}>
         {ENTRIES}
      </div>
   )
})
