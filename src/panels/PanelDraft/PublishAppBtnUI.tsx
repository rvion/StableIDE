import type { CushyAppL } from '../../models/CushyApp'

import { observer } from 'mobx-react-lite'

import { Button, type ButtonProps } from '../../csuite/button/Button'

export const PublishAppBtnUI = observer(function PublishAppBtnUI_({
   // own props
   app,

   // frame props customized
   disabled,
   loading,
   icon,
   square,
   description: tooltip,
   onClick,

   // rest
   ...rest
}: {
   app: CushyAppL
} & ButtonProps) {
   return (
      <Button
         tw='ml-auto'
         disabled={disabled ?? !app.canBePublishedByUser}
         loading={loading ?? app.isPublishing}
         icon={icon ?? 'mdiPublish'}
         square={square ?? true}
         description={tooltip ?? 'Publish app to the Cushy App Store'}
         onClick={async (ev) => {
            // ensure is connected
            if (!cushy.auth.isConnected) {
               const confirm = window.confirm(
                  'You need to log in to publish apps. Do you want to log in now?',
               )
               if (!confirm) return
               await cushy.auth.startLoginFlowWithGithub()
               return
            }

            // double intent verification
            const confirm = window.confirm('Are you sure you want to publish this app?')
            if (!confirm) return

            // publish
            await app.publish()

            // custom extra onClick if provided
            await onClick?.(ev)
         }}
      />
   )
})
