import type { NO_PROPS } from '../../csuite/types/NO_PROPS'

import { Panel, type PanelHeader } from '../../router/Panel'
import { PanelPromptingUI } from './PanelPromptingUI'

export const PanelPrompting = new Panel({
   name: 'Prompting',
   widget: (): React.FC<NO_PROPS> => PanelPromptingUI,
   header: (p): PanelHeader => ({ title: 'Prompting' }),
   def: (): NO_PROPS => ({}),
   category: 'tools',
   about: 'this panels allow to list / search steps matching conditions',
   icon: 'mdiPen',
})
