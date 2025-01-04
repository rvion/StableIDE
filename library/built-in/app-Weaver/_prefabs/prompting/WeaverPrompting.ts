import { samplePrompts } from '../../../samplePrompts'

export type $WeaverPromptRegion = X.XGroup<{
   enabled: X.XBool
   x: X.XNumber
   y: X.XNumber
   width: X.XNumber
   height: X.XNumber
   scale: X.XGroup<{
      x: X.XNumber
      y: X.XNumber
   }>
   lock: X.XBool
}>

function weaverPromptRegion(b: X.Builder, options?: {}): $WeaverPromptRegion {
   return b.fields({
      enabled: b.bool({ default: true }),
      x: b.number({ default: 0 }),
      y: b.number({ default: 0 }),
      width: b.number({ default: 512 }),
      height: b.number({ default: 512 }),
      scale: b.fields({
         //
         x: b.number({ default: 1, step: 0.1 }),
         y: b.number({ default: 1, step: 0.1 }),
      }),
      lock: b.bool(),
   })
}

export type $WeaverPromptRegionList = X.XGroup<{}>

// export type $WeaverPromptConditioning = X.SelectOne_<'' | 'test'>

export type $WeaverPrompt = X.XGroup<{
   enabled: X.XBool
   name: X.XString
   prompt: X.XPrompt
   positive: X.XBool
   regions: X.XList<$WeaverPromptRegion>
}>

export function weaverPrompt(b: X.Builder, options?: { default?: string }): $WeaverPrompt {
   return b.fields(
      //
      {
         enabled: b.bool({ default: true, hidden: true }),
         name: b.string({ default: '', hidden: true }),
         positive: b.bool({
            default: true,
            hidden: true,
            description: 'When true, the prompt will apply positively',
         }),
         prompt: b.prompt({
            icon: 'mdiPlusBoxOutline',
            // background: { hue: 150, chroma: 0.05 },
            default: options?.default ?? '',
            presets: [
               //
               {
                  label: 'Portrait',
                  icon: 'mdiFaceWoman',
                  apply: (w) => w.setText('portrait, face'),
               },
               {
                  label: 'Landscape',
                  icon: 'mdiImageFilterHdr',
                  apply: (w) => w.setText('landscape, nature'),
               },
               { label: 'Tree', icon: 'mdiTree', apply: (w) => w.setText(samplePrompts.tree) },
               { label: 'Abstract', icon: 'mdiShape', apply: (w) => w.setText('abstract, art') },
            ],
         }),
         regions: weaverPromptRegion(b).list({ hidden: true }),
      },
   )
}

export type $WeaverPromptList = X.XGroup<{
   activeIndex: X.XNumber
   showEditor: X.XBool
   showOptions: X.XBool
   prompts: X.XList<$WeaverPrompt>
}>

export function promptList(b: X.Builder, options?: { default?: string }): $WeaverPromptList {
   const tags = cushy.danbooru.tags
   // const artists = tags.filter((t) => t.category === 1).map((t) => t.text)

   return b.fields(
      {
         activeIndex: b.int({ default: 0, hidden: true }),
         showEditor: b.bool({ default: true, hidden: true }),
         showOptions: b.bool({ default: true, hidden: true }),
         prompts: weaverPrompt(b) //
            .list({ min: 1 }),
         // regionalPrompt: ui_regionalPrompting_v1(b)
         //    // .withConfig({ uiui: { Head: false } })
         //    .subscribe(latentSizeChanel, (s, self) => {
         //       const area = self.fields.area
         //       self.fields.area.runInTransaction(() => {
         //          area.width = s.w
         //          area.height = s.h
         //       })
         //    })
         //    .optional(),
         // artists: b.selectManyStrings(artists),
         // artistsV2: b.selectManyOptionIds(
         //     tags.filter((t) => t.category === 1).map((t) => ({ id: t.text, label: `${t.text} (${t.count})` })),
         // ),
      },
      { icon: 'mdiTextBoxPlus' },
   )
}
