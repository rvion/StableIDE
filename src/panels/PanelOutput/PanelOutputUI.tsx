import { observer } from 'mobx-react-lite'

import { OutputUI } from '../../outputs/OutputUI'
import { PanelStepsConf } from '../PanelSteps/PanelStepsConf'
import { LatentIfLastUI } from './LatentIfLastUI'

export type PanelOutputProps = {
   stepID?: Maybe<StepID>
}

export const PanelOutputUI = observer(function PanelStepUI_(p: PanelOutputProps) {
   const step =
      p.stepID == null //
         ? cushy.db.step.last()
         : cushy.db.step.get(p.stepID)
   if (step == null) return null
   const out1 =
      cushy.hovered ?? //
      cushy.focusedStepOutput ??
      step.lastMediaOutput ??
      cushy.db.media_image.last()
   // const out2 = step.comfy_workflows.findLast((i) => i.createdAt)
   return (
      <div
         tw={[
            //
            'flex flex-col',
            'h-full w-full flex-grow',
            // 'overflow-clip', // Make sure scrollbar doesn't encompass entire panel, only where it makes sense.
         ]}
      >
         {/* {PanelStepsConf.renderAsConfigBtn()} */}
         {/* STEP HEADER ====================================================================== */}
         {/* <PanelHeaderUI>
               {PanelOutputConf.renderAsConfigBtn({ title: 'Output' })}
               <div>
                  {step.name} {p.stepID == null ? '(latest)' : null}
               </div>
               <SpacerUI />
               <div tw='opacity-50'>{_formatPreviewDate(new Date(step.createdAt))}</div>
            </PanelHeaderUI>

            <div // STEP OUTPUTS ======================================================================
               tw={'flex max-h-[50%] flex-shrink-0 overflow-auto p-0.5'}
            >
               {PanelStepsConf.renderAsConfigBtn()}
               {step?.finalStatus === Status.Running && (
                  <Button look='error' onClick={() => st.stopCurrentPrompt()}>
                     STOP
                  </Button>
               )}
               {step && (
                  <StepCardUI //
                     showTitle={false}
                     showDate={false}
                     step={step}
                  />
               )}
            </div> */}
         {/* alt 1. hovered or focused output */}
         <div tw={['flex flex-grow overflow-auto']}>
            {/*  */}
            {out1 && <OutputUI output={out1} />}
         </div>
         {/* alt 2. last output created */}
         {/* <div tw={['absolute bottom-0 z-30']}>{out2 && <OutputUI output={out2} />}</div> */}
         <LatentIfLastUI />
      </div>
   )
})
