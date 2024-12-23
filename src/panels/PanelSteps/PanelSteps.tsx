import type { NO_PROPS } from '../../csuite/types/NO_PROPS'

import { Panel, type PanelHeader } from '../../router/Panel'
import { PanelStepsUI } from './PanelStepsUI'

export const PanelSteps = new Panel({
   name: 'Steps',
   widget: (): React.FC<NO_PROPS> => PanelStepsUI,
   header: (p): PanelHeader => ({ title: 'Steps' }),
   def: (): NO_PROPS => ({}),
   category: 'outputs',
   about: 'this panels allow to list / search steps matching conditions',
   icon: 'mdiStepForward',
})
