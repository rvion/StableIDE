import type { StepOutput } from '../types/StepOutput'

import { observer } from 'mobx-react-lite'

import { Frame } from '../csuite/frame/Frame'
import { exhaust } from '../csuite/utils/exhaust'
import { ComfyPromptL } from '../models/ComfyPrompt'
import { ComfyWorkflowL } from '../models/ComfyWorkflow'
import { Media3dDisplacementL } from '../models/Media3dDisplacement'
import { MediaCustomL } from '../models/MediaCustom'
import { MediaImageL } from '../models/MediaImage'
import { MediaSplatL } from '../models/MediaSplat'
import { MediaTextL } from '../models/MediaText'
import { MediaVideoL } from '../models/MediaVideo'
import { RuntimeErrorL } from '../models/RuntimeError'
import { StepL } from '../models/Step'
import { OutputDisplacementPreviewUI, OutputDisplacementUI } from './3d-displacement/OutputDisplacement'
import { Output3dScenePreviewUI, Output3dSceneUI2 } from './3d-scene/Output3dScene'
import { OutputPreviewWrapperUI } from './_OutputPreviewWrapperUI'
import { OutputImagePreviewUI, OutputImageUI } from './OutputImageUI'
import { OutputPromptPreviewUI, OutputPromptUI } from './OutputPromptUI'
import { OutputRuntimeErrorPreviewUI, OutputRuntimeErrorUI } from './OutputRuntimeErrorUI'
import { OutputSplatPreviewUI, OutputSplatUI } from './OutputSplat'
import { OutputTextPreviewUI, OutputTextUI } from './OutputTextUI'
import { OutputVideoPreviewUI, OutputVideoUI } from './OutputVideo'
import { OutputWorkflowPreviewUI, OutputWorkflowUI } from './OutputWorkflowUI'

// PREVIEW -----------------------------------------------------------------------------
export const OutputPreviewUI = observer(function StepOutputUI_(p: {
   //
   step?: Maybe<StepL>
   output: StepOutput
   size?: string
}) {
   return (
      <OutputPreviewWrapperUI output={p.output} size={p.size}>
         <OutputPreview_ContentUI step={p.step} output={p.output} />
      </OutputPreviewWrapperUI>
   )
})

// prettier-ignore
function getOutput(step: Maybe<StepL>, output: StepOutput): JSX.Element | undefined {
   if (output instanceof MediaTextL)            return <OutputTextPreviewUI         step={step} output={output} />
   if (output instanceof MediaImageL)           return <OutputImagePreviewUI        step={step} output={output} />
   if (output instanceof MediaVideoL)           return <OutputVideoPreviewUI        step={step} output={output} />
   if (output instanceof MediaSplatL)           return <OutputSplatPreviewUI        step={step} output={output} />
   if (output instanceof Media3dDisplacementL)  return <OutputDisplacementPreviewUI step={step} output={output} />
   if (output instanceof ComfyPromptL)          return <OutputPromptPreviewUI       step={step} output={output} />
   if (output instanceof ComfyWorkflowL)        return <OutputWorkflowPreviewUI     step={step} output={output} />
   if (output instanceof StepL)                 return <>🔴 StepL not yet supported</>
   if (output instanceof MediaCustomL)          return <Output3dScenePreviewUI      step={step} output={output} />
   if (output instanceof RuntimeErrorL)         return <OutputRuntimeErrorPreviewUI step={step} output={output} />

   exhaust(output)
   console.log(`[🔴]`,output)
   return <Frame square icon='mdiAlert' iconSize='80%' description={`❌ unhandled message of type ${(output as any).constructor.name}`}  />
   }

export const OutputPreview_ContentUI = observer(function OutputPreview_ContentUI_(p: {
   step?: Maybe<StepL>
   output: StepOutput
}) {
   const theme = cushy.preferences.theme.value

   const step = p.step

   if (!step) {
      return (
         <Frame
            tw='h-full'
            square
            // border={}
            roundness={theme.global.roundness}
            dropShadow={theme.global.shadow}
            description='Step was null'
            icon={'mdiAlert'}
            iconSize='80%'
         />
      )
   }

   let isActive = false
   if (cushy.focusedStepOutput) {
      if (cushy.focusedStepOutput.id == p.output.id) {
         isActive = true
      }
   }

   return (
      <Frame //
         tw='flex h-full overflow-clip'
         square
         border={
            isActive
               ? { contrast: 0.4, chromaBlend: 100, hueShift: 0 }
               : { contrast: 0.2, chromaBlend: 0, hueShift: 0 }
         }
         roundness={theme.global.roundness}
         dropShadow={theme.global.shadow}
         // onClick={() => cushy.layout.open('Output', { stepID: step.id })}
      >
         {getOutput(p.step, p.output)}
      </Frame>
   )
})

// FULL -----------------------------------------------------------------------------
// prettier-ignore
export const OutputUI = observer(function StepOutputUI_(p: { step?: Maybe<StepL>; output: StepOutput }) {
    const output = p.output

    if (output instanceof MediaTextL)            return <OutputTextUI                step={p.step} output={output} />
    if (output instanceof MediaImageL)           return <OutputImageUI               step={p.step} output={output} />
    if (output instanceof MediaVideoL)           return <OutputVideoUI               step={p.step} output={output} />
    if (output instanceof MediaSplatL)           return <OutputSplatUI               step={p.step} output={output} />
    if (output instanceof Media3dDisplacementL)  return <OutputDisplacementUI        step={p.step} output={output} />

    if (output instanceof ComfyPromptL)          return <OutputPromptUI              step={p.step} output={output} />
    if (output instanceof ComfyWorkflowL)        return <OutputWorkflowUI            step={p.step} output={output} />
    if (output instanceof StepL)                 return <>🔴</>
    if (output instanceof MediaCustomL)          return <Output3dSceneUI2            step={p.step} output={output} />

    if (output instanceof RuntimeErrorL)         return <OutputRuntimeErrorUI        step={p.step} output={output} />

    exhaust(output)
    console.log(`[🔴]`,output)
    return <div className='border'>❌ unhandled message of type `{(output as any).type}`</div>
})
