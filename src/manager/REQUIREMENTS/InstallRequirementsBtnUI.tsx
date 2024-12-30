import type { Requirements } from './Requirements'

import { observer } from 'mobx-react-lite'

import { Button } from '../../csuite/button/Button'
import { run_tint } from '../../csuite/kolor/prefab_Tint'
import { RevealUI } from '../../csuite/reveal/RevealUI'
import { Panel_InstallRequirementsUI } from './Panel_InstallRequirementsUI'

export const InstallRequirementsBtnUI = observer(function InstallRequirementsBtnUI_(p: {
   active: boolean
   label?: string
   requirements: Requirements[]
}) {
   if (p.requirements.length == 0) return null
   const rr = p.requirements
   const actionRequired = p.active && !cushy.mainHost.matchRequirements(rr)
   return (
      <RevealUI
         content={() => (
            <div tw='[max-width:500px]'>
               <Panel_InstallRequirementsUI requirements={rr} />
            </div>
         )}
      >
         <Button //
            // TODO(bird_d): @rvion Example of how subtle should work imo. (or ghost, pick one but not the other. There's value to having a background for some hover-able things that matches the background of the parent and brightens on hover. Like how subtle works now.)
            tw='!border-none !bg-transparent hover:brightness-125'
            icon='mdiPuzzleOutline'
            /** 💬(bird_d/ui/theme/system): We should have a wrapper around the base theme state, like Csuite was, but more extensive.
             *    We need to be able to call a specific value, then use the state to determine whether it passes either
             *       the widget's theme or the global.
             *    - It should map on to the state's paths closely.
             *    - Actually can't we do get/setters in the form system? Probably don't even need this actually.
             */
            text={run_tint(cushy.preferences.theme.value.global.text.base)}
            size='widget'
            // subtle
            look={actionRequired ? 'error' : undefined}
         >
            {p.label}
         </Button>
      </RevealUI>
   )
})
