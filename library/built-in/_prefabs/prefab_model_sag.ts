export type UI_model_sag = X.XGroup<{
   include: X.XChoices<{
      base: X.XGroup<{}>
      hiRes: X.XGroup<{}>
   }>
   scale: X.XNumber
   blur_sigma: X.XNumber
}>

export const ui_model_sag = (form: X.Builder): UI_model_sag => {
   return form.fields(
      {
         include: form.choices(
            { base: form.fields({}), hiRes: form.fields({}) },
            {
               default: { base: true, hiRes: true },
               appearance: 'tab',
               tabPosition: 'start',
               border: false,
               collapsed: false,
               justifyLabel: true,
            },
         ),
         scale: form.float({ default: 0.5, step: 0.1, min: -2, max: 5 }),
         blur_sigma: form.float({ default: 2, step: 0.1, min: 0, max: 10 }),
      },
      {
         startCollapsed: true,
         description: 'Self Attention Guidance can improve image quality but runs slower',
         toSummary: ({ value: ui }): string => {
            return `${ui.include.base ? '🟢Base ' : ''}${ui.include.hiRes ? '🟢HiRes ' : ''}`
         },
      },
   )
}
