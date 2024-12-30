import { observer } from 'mobx-react-lite'

import { Button } from '../../csuite/button/Button'
import { ToggleButtonUI } from '../../csuite/checkbox/InputBoolToggleButtonUI'
import { Frame, type FrameProps } from '../../csuite/frame/Frame'
import { IkonOf } from '../../csuite/icons/iconHelpers'
import { DebugShortcutsFloatingUI } from './DebugShortcutsFloatingUI'

export const FooterBarUI = observer(function FooterBarUI_(p: FrameProps) {
   const theme = cushy.preferences.theme.value
   return (
      <Frame
         border={0}
         base={cushy.preferences.theme.value.appbar ?? { contrast: -0.077 }}
         tw='line-clamp-1 flex items-center truncate px-1 py-1'
         {...p}
      >
         <ToggleButtonUI
            tw='mr-2'
            tooltip='Show Command Visualizer'
            onValueChange={(next) => (cushy.showCommandHistory = next)}
            value={cushy.showCommandHistory}
            icon='mdiKeyboard'
            toggleGroup='footer-conf'
         />

         <div tw='flex-1' />
         {/* {tooltipStuff.deepest && <div>{tooltipStuff.deepest.text}</div>} */}
         {cushy.showCommandHistory && <DebugShortcutsFloatingUI />}
         <Frame // Git/Version info
            align
            line
            base={theme.global.contrast}
            border={theme.global.border}
            roundness={theme.global.roundness}
         >
            <Button line tw='!px-0'>
               <Frame
                  //
                  tw='pl-1'
                  line
                  base={
                     cushy.updater.behindCount != 0 || cushy.updater.aheadCount != 0
                        ? { contrast: 0.2, chromaBlend: 25 }
                        : undefined
                  }
                  // roundness={theme.global.roundness}
               >
                  <Frame
                     square
                     tw='relative h-full w-full flex-1 '
                     icon={cushy.updater.hasUpdateAvailable ? 'mdiSourceBranchSync' : 'mdiSourceBranch'}
                  >
                     {cushy.updater.hasUpdateAvailable && (
                        <Frame
                           tw='absolute bottom-0.5 right-0.5 h-1.5 w-1.5'
                           roundness={'100%'}
                           // border={theme.global.border}
                           dropShadow={theme.global.shadow}
                           base={{ contrast: 0.5, chromaBlend: 100, hue: 180 }}
                        />
                     )}
                  </Frame>
                  {(cushy.updater.behindCount != 0 || cushy.updater.aheadCount != 0) && (
                     <Frame line tw='flex-1 !gap-0'>
                        {cushy.updater.behindCount}
                        <IkonOf name='mdiArrowDownThick' />
                        {cushy.updater.aheadCount}
                        <IkonOf name='mdiArrowUpThick' />
                     </Frame>
                  )}
               </Frame>
               <div>
                  {cushy.updater.activeRemoteName}/{cushy.updater.activeBranchName}
               </div>
               <div tw='pr-1 opacity-70'>{cushy.updater.activeCommitText}</div>
            </Button>
         </Frame>
      </Frame>
   )
})
