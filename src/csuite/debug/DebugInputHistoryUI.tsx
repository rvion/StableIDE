import { observer } from 'mobx-react-lite'

import { commandManager } from '../commands/CommandManager'
import { Frame } from '../frame/Frame'

export const DebugInputHistoryUI = observer(function DebugInputHistoryUI_(p: {}) {
   return (
      <Frame tw='flex gap-0.5'>
         {commandManager.inputHistory.slice(-3).map((text, _) => {
            return (
               <Frame //
                  tw='px-2'
                  roundness={cushy.preferences.theme.value.global.roundness}
                  base={{ contrast: -0.075 }}
               >
                  {text}
               </Frame>
            )
         })}
      </Frame>
   )
})
