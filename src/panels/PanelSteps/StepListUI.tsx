import { observer } from 'mobx-react-lite'

import { Frame } from '../../csuite/frame/Frame'
import { clamp } from '../../csuite/utils/clamp'
import { PanelStepsConf } from './PanelStepsConf'
import { StepCardUI } from './StepCardUI'

export const StepListUI = observer(function StepLists(p: {}) {
   const amount = clamp(Math.round(PanelStepsConf.value.maxItem), 1, 1000)
   const steps = cushy.db.step.getLastN(amount)
   return (
      <Frame
         base={{ contrast: -0.1 }}
         className='flex grow select-none flex-col gap-0.5'
         style={{ overflow: 'auto' }}
         onMouseDown={(e) => {
            if (e.button != 0) {
               return
            }

            cushy.focusedStepOutput = null
         }}
      >
         {/* {PanelStepsConf.render()} */}
         {steps.map((step, ix: number) => (
            <StepCardUI //
               contrast={ix % 2 === 0 ? 8 : undefined}
               key={step.id}
               step={step}
            />
         ))}
      </Frame>
   )
})
