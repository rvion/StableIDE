import type { CushyAppL } from '../../models/CushyApp'
import type { DraftL } from '../../models/Draft'

import { observer } from 'mobx-react-lite'

import { DraftIllustrationUI } from '../../cards/fancycard/DraftIllustration'
import { Button } from '../../csuite/button/Button'
import { Dropdown } from '../../csuite/dropdown/Dropdown'
import { MenuItem } from '../../csuite/dropdown/MenuItem'
import { Frame } from '../../csuite/frame/Frame'
import { InputStringUI } from '../../csuite/input-string/InputStringUI'
import { _formatAsRelativeDateTime } from '../../updater/_getRelativeTimeString'

/* TODO(bird_d): In the future it might be good to define a plethora of datablock types and just have a DataBlockTemplateUI and feed it the type/data for a consistent look throughout the program. */
export const DraftMenuDataBlockUI = observer(function DraftMenuDataBlockUI_(p: {
   //
   title: string
   draft: DraftL
   className?: string
}) {
   const theme = cushy.preferences.theme.value

   return (
      <Frame
         align
         line
         border={theme.global.border}
         roundness={theme.global.roundness}
         dropShadow={
            theme.global.shadow && {
               x: theme.global.shadow.x,
               y: theme.global.shadow.y,
               color: theme.global.shadow.color,
               blur: theme.global.shadow.blur,
               opacity: theme.global.shadow.opacity,
            }
         }
      >
         <Dropdown
            className={p.className}
            startIcon='mdiPencilBox'
            title={false}
            content={() => <DraftListUI app={p.draft.app} />}
            button={
               <Button
                  base={{ contrast: -0.077 }}
                  borderless
                  tw='!gap-0 !rounded-none !px-0.5'
                  icon='mdiPencilBox'
                  suffixIcon={'mdiChevronDown'}
               />
            }
         />
         <InputStringUI //
            getValue={() => p.draft.name}
            setValue={(val) => p.draft.update({ title: val })}
         />
      </Frame>
   )
})

const DraftListUI = observer(function DraftListUI_(p: { app: CushyAppL }) {
   return (
      <div>
         {p.app.lastExecutedDrafts.map(({ id, title, lastRunAt }) => {
            return (
               <MenuItem
                  key={id}
                  label={title ?? id}
                  iconJSX={<DraftIllustrationUI draft={cushy.db.draft.getOrThrow(id)} size='1.2rem' />}
                  onClick={() => {
                     const draft = cushy.db.draft.getOrThrow(id)
                     draft.openOrFocusTab()
                  }}
                  beforeShortcut={
                     <Frame text={{ contrast: 0.5 }} tw='ml-auto pl-6 text-xs '>
                        {_formatAsRelativeDateTime(lastRunAt)}
                     </Frame>
                  }
               />
            )
         })}
      </div>
   )
})
