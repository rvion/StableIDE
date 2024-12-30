import '../../ALL_CMDS'

import { action } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'

import { AppBarUI } from '../../appbar/AppBarUI'
import { ActivityStackUI } from '../../csuite/activity/ActivityStackUI'
import { TooltipUI } from '../../csuite/activity/TooltipUI'
import { defaultTextTint } from '../../csuite/box/CurrentStyleCtx'
import { commandManager } from '../../csuite/commands/CommandManager'
import { CSuiteProvider } from '../../csuite/ctx/CSuiteProvider'
import { computeColors } from '../../csuite/frame/FrameColors'
import { run_theme_dropShadow } from '../../csuite/frame/SimpleDropShadow'
import { Kolor } from '../../csuite/kolor/Kolor'
import { useRegionMonitor } from '../../csuite/regions/RegionMonitor'
import { Trigger } from '../../csuite/trigger/Trigger'
import { window_addEventListener } from '../../csuite/utils/window_addEventListenerAction'
import { GlobalSearchUI } from '../../utils/electron/globalSearchUI'
import { FavBarUI } from './FavBarUI'
import { FooterBarUI } from './FooterBarUI'
import { ProjectUI } from './ProjectUI'

export const CushyUI = observer(function CushyUI_() {
   const appRef = useRef<HTMLDivElement>(null)
   useRegionMonitor()
   useEffect(() => {
      const current = appRef.current
      if (current == null) return
      const handleKeyDown = action((event: KeyboardEvent): void => {
         const x: Trigger = commandManager.processKeyDownEvent(event as any)

         if (x === Trigger.Success) {
            event.preventDefault()
            event.stopPropagation()
            return
         }

         // no idea if this safety case is needed
         if (document.activeElement == null) {
            event.preventDefault()
            event.stopPropagation()
            current?.focus()
         }

         // prevent accidental tab closing when pressing ctrl+w one too-many times
         if (
            x === Trigger.UNMATCHED && //
            event.key === 'w' &&
            (event.ctrlKey || event.metaKey)
         ) {
            event.preventDefault()
            event.stopPropagation()
         }
      })
      window_addEventListener('keydown', handleKeyDown)
      if (document.activeElement === document.body) current.focus()
      return (): void => window.removeEventListener('keydown', handleKeyDown)
   }, [appRef.current, cushy])

   const appBarColor = cushy.preferences.theme.value.appbar ?? cushy.preferences.theme.value.base
   const appBarBase = Kolor.fromString(appBarColor)
   const inactiveTabColors = computeColors(
      {
         base: appBarBase,
         dir: appBarBase.lightness > 0.5 ? -1 : 1,
         text: defaultTextTint,
      },
      { base: { contrast: 0.1 } },
   )

   const appBarComputed = computeColors(
      {
         base: appBarBase,
         dir: appBarBase.lightness > 0.5 ? -1 : 1,
         text: defaultTextTint,
      },
      { base: { contrast: -0.077 } },
   )

   const theme = cushy.preferences.theme.value
   const textShadow = theme.global.text.shadow
   return (
      <CSuiteProvider config={cushy.csuite}>
         <div
            id='CushyStudio'
            style={{
               // @ts-ignore
               '--appbar': appBarComputed.variables.background,
               '--foobar1': inactiveTabColors.variables.color,
               '--foobar2': inactiveTabColors.variables.background,
               '--theme-roundness': `${theme.global.roundness}px`,
               '--theme-roundness-padding': `${theme.global.roundness}px`,
               // TODO(bird_d/ui/theme): Make able to be relative instead of just manual
               'text-shadow': run_theme_dropShadow(textShadow),
               // '--theme-roundness-padding': `${cushy.preferences.theme.value.global.roundness > 10 ? cushy.preferences.theme.value.global.roundness - 10 : 0}px`,
               // TODO(bird_d): This feels hacky, probably okay for now? A lot of the csuite stuff I'm assuming needs to not use cushy.preferences.theme.value
               fontSize: `${theme.global.text.size}pt`,
            }}
            tabIndex={-1}
            // ❌ onClick={(ev) => {
            // ❌     // if a click has bubbled outwards up to the body, then we want to close various things
            // ❌     // such as contet menus, tooltips, Revals, etc.
            // ❌     runInAction(() => {
            // ❌         RevealState.shared.current?.close()
            // ❌         RevealState.shared.current = null
            // ❌     })
            // ❌ }}
            ref={appRef}
            tw={[
               'col h-full grow overflow-clip',
               // topic=WZ2sEOGiLy
               cushy.preferences.interface.value.useDefaultCursorEverywhere && 'useDefaultCursorEverywhere',
            ]}
         >
            <div // Global Popup/Reveal/Tooltip container always be on screen with overflow-clip added.
               id='tooltip-root'
               tw='pointer-events-none absolute inset-0 h-full w-full overflow-clip'
            >
               <TooltipUI />
               <ActivityStackUI />
            </div>
            <GlobalSearchUI /* Ctrl or Cmd + F: does not work natively on electron; implemented here */ />
            <AppBarUI />
            <div className='flex flex-1 flex-row overflow-auto text-clip'>
               <FavBarUI />
               <ProjectUI />
            </div>
            <FooterBarUI />
         </div>
      </CSuiteProvider>
   )
})
