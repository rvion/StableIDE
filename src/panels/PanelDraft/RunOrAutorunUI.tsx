import type { IconName } from '../../csuite/icons/icons'
import type { DraftL } from '../../models/Draft'

import { observer } from 'mobx-react-lite'

import { Button } from '../../csuite/button/Button'
import { InputNumberUI } from '../../csuite/input-number/InputNumberUI'
import { RevealUI } from '../../csuite/reveal/RevealUI'

export const RunOrAutorunUI = observer(function RunOrAutorunUI_(p: { className?: string; draft: DraftL }) {
   const draft = p.draft
   const icon: IconName = draft.shouldAutoStart ? 'mdiPause' : 'mdiPlay'
   return (
      <div tw='flex h-full' className={p.className}>
         <RevealUI
            content={() => (
               <div tw='p-2'>
                  <div>ms to wait after a change</div>
                  <InputNumberUI
                     //
                     mode='int'
                     value={draft.st.project.data.autostartDelay}
                     onValueChange={(value) => draft.st.project.update({ autostartDelay: value })}
                     className='csuite-basic-input'
                     placeholder='ms'
                     softMax={5000}
                     hideSlider
                     step={250}
                     min={0}
                  />
                  <div>max ms to wait before running anyway</div>
                  <InputNumberUI
                     //
                     mode='int'
                     value={draft.st.project.data.autostartMaxDelay}
                     onValueChange={(val) => {
                        draft.st.project.update({ autostartMaxDelay: val })
                     }}
                     className='csuite-basic-input'
                     placeholder='ms'
                     softMax={50_000}
                     hideSlider
                     step={250}
                     min={0}
                  />
               </div>
            )}
         >
            <Button tw='!gap-0 !px-0.5' icon='mdiTimer' suffixIcon={'mdiChevronDown'} />
         </RevealUI>
         <Button
            // tw='h-input'
            look='success'
            description='Run the current draft. (create a step)'
            // size='xs'
            expand
            className='self-start'
            icon={icon}
            onClick={() => {
               draft.st.layout.open('Output', {}, { where: 'right' })
               draft.setAutostart(false)
               draft.start({})
            }}
         >
            Run
         </Button>
         <Button // TODO(bird_d): Need a button that can be tied to an command, and will pull the relevant info from it. Like a label for the- label, and a description for the tooltip.
            icon='mdiAnimationPlay'
            description='Auto-start (restart when idle if change happened)'
            look='success'
            // size='xs'
            // tw='h-input'
            square
            loading={draft.shouldAutoStart}
            active={draft.shouldAutoStart}
            onClick={() => draft.setAutostart(!draft.shouldAutoStart)}
         />
      </div>
   )
})
