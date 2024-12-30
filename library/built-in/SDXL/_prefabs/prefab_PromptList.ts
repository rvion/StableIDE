import { latentSizeChanel } from '../../_prefabs/prefab_latent_v3'
import {
   ui_regionalPrompting_v1,
   type UI_regionalPrompting_v1,
} from '../../_prefabs/prefab_regionalPrompting_v1'
import { samplePrompts } from '../../samplePrompts'

export type $PromptList = X.XGroup<{
   activeIndex: X.XNumber
   showEditor: X.XBool
   showOptions: X.XBool
   prompts: X.XList<
      X.XGroup<{
         enabled: X.XBool
         name: X.XString
         prompt: X.XPrompt
      }>
   >
   regionalPrompt: S.SOptional<UI_regionalPrompting_v1>
   artists: X.XSelectMany_<string>
}>

export function promptList(b: X.Builder, options?: { default?: string }): $PromptList {
   const tags = cushy.danbooru.tags
   const artists = tags.filter((t) => t.category === 1).map((t) => t.text)

   return b.fields(
      {
         activeIndex: b.int({ default: 0, hidden: true }),
         showEditor: b.bool({ default: true, hidden: true }),
         showOptions: b.bool({ default: true, hidden: true }),
         prompts: b
            .fields({
               enabled: b.bool({ default: true }),
               name: b.string({ default: '' }),
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
            })
            .list({ min: 1 }),
         regionalPrompt: ui_regionalPrompting_v1(b)
            // .withConfig({ uiui: { Head: false } })
            .subscribe(latentSizeChanel, (s, self) => {
               const area = self.fields.area
               self.fields.area.runInTransaction(() => {
                  area.width = s.w
                  area.height = s.h
               })
            })
            .optional(),
         artists: b.selectManyStrings(artists),
         // artistsV2: b.selectManyOptionIds(
         //     tags.filter((t) => t.category === 1).map((t) => ({ id: t.text, label: `${t.text} (${t.count})` })),
         // ),
      },
      { icon: 'mdiPlusBoxOutline' },
   )
}

// negative: b
//          .prompt({
//             icon: 'mdiMinusBoxOutline',
//             startCollapsed: true,
//             default: 'bad quality, blurry, low resolution, pixelated, noisy',
//             // box: { base: { hue: 0, chroma: 0.05 } },
//             presets: [
//                {
//                   icon: 'mdiCloseOctagon',
//                   label: 'simple negative',
//                   apply: (w) => w.setText(sampleNegative.simpleNegative),
//                },
//                {
//                   icon: 'mdiCloseOctagon',
//                   label: 'simple negative + nsfw',
//                   apply: (w) => w.setText(sampleNegative.simpleNegativeNsfw),
//                },
//             ],
//          })
//          .optional(true)
//          .list({ min: 1, icon: 'mdiMinusBoxOutline' }),
