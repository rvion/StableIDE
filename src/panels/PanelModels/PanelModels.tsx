import type { NO_PROPS } from '../../csuite/types/NO_PROPS'

import { Panel, type PanelHeader } from '../../router/Panel'
import { PanelModelsUI } from './PanelModelsUI'

export const PanelModels = new Panel({
   name: 'Models',
   widget: (): React.FC<NO_PROPS> => PanelModelsUI,
   header: (p): PanelHeader => ({ title: 'Models' }),
   def: (): NO_PROPS => ({}),
   category: 'models',
   icon: 'mdiGlobeModel',
})
