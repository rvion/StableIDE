import type { NO_PROPS } from '../../csuite/types/NO_PROPS'

import { observer } from 'mobx-react-lite'

import { Button } from '../../csuite/button/Button'
import { SpacerUI } from '../../csuite/components/SpacerUI'
import { FormAsDropdownConfigUI } from '../../csuite/form/FormAsDropdownConfigUI'
import { PanelUI } from '../../csuite/panel/PanelUI'
import { PanelStepsConf } from './PanelStepsConf'
import { StepListUI } from './StepListUI'

export const PanelStepsUI = observer(function PanelStepsUI_(p: NO_PROPS) {
   return (
      <PanelUI>
         <PanelUI.Header>
            <Button icon='mdiStop' onClick={() => cushy.stopCurrentPrompt()}>
               stop
            </Button>
            <SpacerUI />
            <FormAsDropdownConfigUI form={PanelStepsConf} title='Panel Options' />
         </PanelUI.Header>
         <PanelUI.Content>
            <StepListUI />
         </PanelUI.Content>
      </PanelUI>
   )
})
