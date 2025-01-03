import type { Menu } from '../menu/Menu'
import type { Field } from '../model/Field'

import { observer } from 'mobx-react-lite'

import { Button } from '../../csuite/button/Button'
import { RevealUI } from '../../csuite/reveal/RevealUI'
import { useProvenance } from '../provenance/Provenance'
import { fieldActionMenu } from './fieldActionMenu'

export type WidgetMenuProps = {
   className?: string | null
   field: Field
}

export const WidgetMenuUI = observer(function WidgetMenu(p: WidgetMenuProps) {
   const field = p.field
   const provenance = useProvenance()
   const menu: Menu = fieldActionMenu.useBind({ field, provenance })
   return (
      <RevealUI //
         className={p.className ?? undefined}
         content={() => <menu.UI />}
      >
         <Button //
            description='Open field menu'
            tabIndex={-1}
            borderless
            subtle
            icon='mdiDotsVertical'
            look='ghost'
            size='widget'
            // square
            tw='!px-0'
         />
      </RevealUI>
   )
})
