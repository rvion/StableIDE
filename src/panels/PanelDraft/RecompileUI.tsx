import type { CushyAppL } from '../../models/CushyApp'

import { observer } from 'mobx-react-lite'

import { Button } from '../../csuite/button/Button'
import { MessageWarningUI } from '../../csuite/messages/MessageWarningUI'

export const RecompileUI = observer(function RecompileUI_({
   app,
   always,
   ...rest
}: {
   //
   app: CushyAppL
   always?: boolean
}) {
   const script = app.script
   const status = script.isOutOfDate
   if (!always && !status.needRecompile) return null
   return (
      <MessageWarningUI {...rest}>
         need recompile: {status.reason}
         <Button //
            onClick={() => app.file.extractScriptFromFileAndUpdateApps({ force: true })}
         >
            Recompile
         </Button>
      </MessageWarningUI>
   )
})
