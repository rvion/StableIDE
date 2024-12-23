import type { OutputFor } from './_prefabs'

import { run_prompt } from './prefab_prompt'

type PromptLisT$ = X.XGroup<{
   joinType: X.XChoices<{
      concat: X.XGroup<{}>
      combine: X.XGroup<{}>
      average: X.XGroup<{
         strength: X.XNumber
      }>
   }>
   promptList: X.XList<
      X.XGroup<{
         prompt: X.XPrompt
         mask: X.XImage
         invert: X.XBool
         mode: X.XEnum<'LoadImageMask.channel'>
         blur: X.XNumber
      }>
   >
}>

export const ui_promptList = (): PromptLisT$ => {
   const form = getCurrentForm()
   return form.fields(
      {
         joinType: form.choice(
            {
               concat: form.fields({}),
               combine: form.fields({}),
               average: form.fields({ strength: form.float({ default: 1 }) }),
            },
            { appearance: 'tab', startCollapsed: true },
         ),
         promptList: form.list({
            element: form.fields(
               {
                  prompt: form.prompt(),
                  mask: form.image({}),
                  invert: form.bool({}),
                  mode: form.enum['LoadImageMask.channel']({}),
                  blur: form.float({ default: 6, min: 0, max: 2048, softMax: 24, step: 1 }),
               },
               {
                  toSummary: ({ value: ui }): string => {
                     return `${ui.prompt}`
                  },
               },
            ),
         }),
      },
      {
         toSummary: ({ value: ui }): string => {
            return `(${ui.promptList.length})${ui.joinType}`
         },
      },
   )
}

export const run_promptList = async (p: {
   opts: OutputFor<typeof ui_promptList>
   conditioning: Comfy.Signal['CONDITIONING']
   width?: number
   height?: number
   encoderTypeSDXL?: boolean
   promptPreface?: string
   promptSuffix?: string
}): Promise<{
   conditioning: Comfy.Signal['CONDITIONING']
}> => {
   const run = getCurrentRun()
   const graph = run.nodes
   let newConditioning = p.conditioning

   for (const item of p.opts.promptList) {
      const promptReturn = run_prompt({
         prompt: item.prompt,
         clip: run.AUTO,
         ckpt: run.AUTO,
         printWildcards: true,
      })
      const promptText = p.promptPreface + promptReturn.promptIncludingBreaks + p.promptSuffix
      const promptEncode = p.encoderTypeSDXL
         ? run.nodes.CLIPTextEncodeSDXL({
              clip: run.AUTO,
              text_g: promptText,
              text_l: promptText,
              width: p.width ?? 1024,
              height: p.height ?? 1024,
              target_height: p.width ?? 1024,
              target_width: p.height ?? 1024,
           })
         : graph.CLIPTextEncode({
              clip: run.AUTO,
              text: promptText,
           })

      if (p.opts.joinType.average) {
         newConditioning = run.nodes.ConditioningAverage({
            conditioning_from: newConditioning,
            conditioning_to: promptEncode._CONDITIONING,
            conditioning_to_strength: p.opts.joinType.average?.strength,
         })
      } else if (p.opts.joinType.combine) {
         newConditioning = run.nodes.ConditioningCombine({
            conditioning_1: promptEncode._CONDITIONING,
            conditioning_2: newConditioning,
         })
      } else {
         newConditioning = run.nodes.ConditioningConcat({
            conditioning_from: newConditioning,
            conditioning_to: promptEncode._CONDITIONING,
         })
      }
   }

   return { conditioning: newConditioning }
}
