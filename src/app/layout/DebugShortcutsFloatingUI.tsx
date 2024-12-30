import { observer } from 'mobx-react-lite'

import { BadgeListUI } from '../../csuite/badge/BadgeListUI'
import { BadgeUI } from '../../csuite/badge/BadgeUI'
import { DebugControlsUI } from '../../csuite/debug/DebugControlsUI'
import { Frame, type FrameProps } from '../../csuite/frame/Frame'

/* TODO(bird_d): Add Interface options for positioning
   - Set position on screen
   - History amount
   - Command Matching History amount
*/

export const DebugShortcutsFloatingUI = observer(function DebugShortcutsFloating(p: FrameProps) {
   const theme = cushy.preferences.theme.value

   return (
      <Frame //
         tw='pointer-events-none absolute bottom-14 left-4 flex flex-col gap-2 p-2 opacity-80'
         roundness={theme.global.roundness}
         dropShadow={theme.global.shadow}
         {...p}
      >
         <DebugControlsUI />

         <Frame {...p}>
            <table
               tw={[
                  //
                  '[&_th]:text-left',
                  '[&_th]:px-2',
                  '[&_td]:px-2',
               ]}
            >
               <thead>
                  <tr>
                     <th>combo</th>
                     <th>matches</th>
                     <th>context</th>
                  </tr>
               </thead>
               <tbody>
                  {cushy.commands.lastTriggered.map(({ command, tokens, uid }, ix) => (
                     <tr key={uid}>
                        <td>
                           <BadgeListUI autoHue badges={tokens} />
                        </td>

                        <td>
                           <BadgeUI autoHue key={ix}>
                              {command.label}
                           </BadgeUI>
                        </td>
                        <td>
                           <BadgeUI autoHue key={ix} children={command.ctx.name} />
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Frame>
      </Frame>
   )
})
