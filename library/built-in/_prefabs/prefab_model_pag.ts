export type UI_model_pag = X.XGroup<{
   include: X.XChoices<{
      base: X.XGroup<{}>
      hiRes: X.XGroup<{}>
   }>
   scale: X.XNumber
   adaptiveScale: X.XNumber
}>

export const ui_model_pag = (form: X.Builder): UI_model_pag => {
   return form
      .fields(
         {
            include: form.choices(
               { base: form.fields({}), hiRes: form.fields({}) },
               {
                  default: 'base',
                  appearance: 'tab',
                  tabPosition: 'start',
                  border: false,
                  collapsed: false,
                  justifyLabel: true,
               },
            ),
            scale: form.float({
               default: 3,
               min: 0,
               softMax: 6,
               max: 100,
               step: 0.1,
               tooltip:
                  'PAG scale, has some resemblance to CFG scale - higher values can both increase structural coherence of the image and oversaturate/fry it entirely. Note: Default for standard models is 3, but that fries lightning and turbo models, so lower it accordingly. Try 0.9 ish for turbo.',
            }),
            adaptiveScale: form.float({
               default: 0,
               min: 0,
               max: 1,
               step: 0.1,
               tooltip:
                  'PAG dampening factor, it penalizes PAG during late denoising stages, resulting in overall speedup: 0.0 means no penalty and 1.0 completely removes PAG.',
            }),
         },
         {
            startCollapsed: true,
            tooltip: 'Perturbed Attention Guidance - can improve attention at the cost of performance',
            toSummary: ({ value: ui }): string => {
               return `scale:${ui.include.base ? 'Base ' : ''}${ui.include.hiRes ? 'HiRes ' : ''} scale:${ui.scale} dampening:${ui.adaptiveScale}`
            },
         },
      )
      .addRequirements([
         {
            type: 'customNodesByNameInCushy',
            nodeName: 'sd-perturbed-attention.PerturbedAttention',
         },
      ])
}
