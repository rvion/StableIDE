import type { StepL } from '../../models/Step'
import type { CSSProperties } from 'react'

import { observer } from 'mobx-react-lite'

import { Status } from '../../back/Status'
import { statusUI } from '../../back/statusUI'
import { AppIllustrationUI } from '../../cards/fancycard/AppIllustrationUI'
import { DraftIllustrationUI } from '../../cards/fancycard/DraftIllustration'
import { BadgeUI } from '../../csuite/badge/BadgeUI'
import { Button } from '../../csuite/button/Button'
import { SpacerUI } from '../../csuite/components/SpacerUI'
import { _formatPreviewDate } from '../../csuite/formatters/_formatPreviewDate'
import { Frame } from '../../csuite/frame/Frame'
import { OutputPreviewUI } from '../../outputs/OutputUI'
import { PanelStepsConf } from './PanelStepsConf'

export const StepCardUI = observer(function StepOutputsV1HeaderUI_(p: {
   // Data ---------------------
   step: StepL

   // Style --------------------
   className?: string
   style?: CSSProperties

   // Slots --------------------
   showTitle?: boolean /**         default: true */
   showApp?: boolean /**           default: true */
   showDraft?: boolean /**         default: true */
   showStatus?: boolean /**        default: true */
   showOutputs?: boolean /**       default: true */
   showExecutionTime?: boolean /** default: true */
   showDate?: boolean /**          default: true */

   // Sizes --------------------
   appSize?: number
   outputSize?: number

   contrast?: number
}) {
   const conf = PanelStepsConf
   const step = p.step
   const isSelected = cushy.focusedStepL === step
   const appSize = conf.value.appSize ? `${conf.value.appSize}rem` : '2rem'
   // const outputSize = conf.value.outputSize ? `${conf.value.outputSize}rem` : '2rem'

   const showTitle = p.showTitle ?? conf.value.show.title
   const showApp = p.showApp ?? conf.value.show.app
   const showDraft = p.showDraft ?? conf.value.show.draft
   const showStatus = p.showStatus ?? conf.value.show.status
   const showOutputs = p.showOutputs ?? conf.value.show.outputs
   const showExecutionTime = p.showExecutionTime ?? conf.value.show.executionTime
   const showDate = p.showDate ?? conf.value.show.date

   const STYLE = { height: appSize, width: appSize }
   const STYLE2 = { height: appSize }
   return (
      <Frame
         base={p.contrast}
         tw={['relative flex cursor-pointer flex-wrap py-0.5', p.className]}
         // onClick={() => cushy.layout.open('Output', { stepID: step.id })}
         style={p.style}
      >
         {showTitle && (
            <div style={STYLE2} tw='flex items-center justify-center'>
               {step.name}
            </div>
         )}
         {showApp && (
            <div
               tw={['cursor-pointer', isSelected ? 'border-primary border-2' : '']}
               style={{ width: appSize, height: appSize, flexShrink: 0 }}
            >
               {step.app ? (
                  <AppIllustrationUI tw='hover:opacity-100' size={appSize} app={step.app} />
               ) : (
                  <div style={STYLE}>❓</div>
               )}
            </div>
         )}
         {/* 4. DRAFT --------------------------------------------------------------- */}
         {showDraft &&
            (step.draft ? (
               <DraftIllustrationUI draft={step.draft} size={appSize} />
            ) : (
               <div style={STYLE}>❓</div>
            ))}
         {/* 6. OUTPUTS --------------------------------------------------------------- */}
         {showOutputs && (
            <div tw='flex px-2'>
               {step?.outputs?.map((output, ix) => (
                  <OutputPreviewUI //
                     key={ix}
                     step={step}
                     size={appSize}
                     output={output}
                  />
               ))}
            </div>
         )}
         <SpacerUI />
         {step?.finalStatus === Status.Running && (
            <Button //
               icon='mdiStop'
               look='error'
               onClick={() => {
                  step.abort()
                  cushy.stopCurrentPrompt()
               }}
            />
         )}
         {showDate && (
            <div style={STYLE2} tw='flex items-center justify-center opacity-80'>
               {_formatPreviewDate(new Date(step.createdAt))}
            </div>
         )}
         {showStatus && (
            <div style={STYLE} tw='flex items-center justify-center'>
               {statusUI(p.step.finalStatus)}
            </div>
         )}
      </Frame>
   )
})
