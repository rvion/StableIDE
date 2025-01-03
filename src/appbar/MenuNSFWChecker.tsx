import { observer } from 'mobx-react-lite'

import { Button } from '../csuite/button/Button'
import { MessageInfoUI } from '../csuite/messages/MessageInfoUI'
import { MessageWarningUI } from '../csuite/messages/MessageWarningUI'

export const MenuNSFWCheckerUI = observer(function MenuNSFWCheckerUI_(p: {}) {
   const pj = cushy.project
   return (
      <Button //
         description={pj.filterNSFW ? 'NSFW Filter Enabled' : 'NSFW Filter Disabled'}
         borderless
         subtle
         square
         onClick={() => (pj.filterNSFW = !pj.filterNSFW)}
      >
         {pj.filterNSFW ? '😇' : '😈'}
      </Button>
   )
})

export const NSFWToggleUI = observer(function NSFWToggleUI_(p: {}) {
   const val: boolean = cushy.project.filterNSFW
   return (
      <div tw='p-2'>
         {val ? (
            <MessageInfoUI>
               <div tw='flex gap-1 whitespace-nowrap'>
                  NSFW filter is currently
                  <b>ON</b>
               </div>
            </MessageInfoUI>
         ) : (
            <MessageWarningUI>
               <div tw='flex gap-1 whitespace-nowrap'>
                  NSFW filter is currently
                  <b>OFF</b>
               </div>
            </MessageWarningUI>
         )}
      </div>
   )
})
