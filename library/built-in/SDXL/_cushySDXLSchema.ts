// import { DanbooruTagCategory } from '../../../src/widgets/prompter/nodes/booru/BooruLoader'
import { ui_cnet, type UI_cnet } from '../_controlNet/prefab_cnet'
import { type $extra1, extra1 } from '../_extra/extra1'
import { type $extra2, extra2 } from '../_extra/extra2'
import { ui_IPAdapterV2, type UI_IPAdapterV2 } from '../_ipAdapter/prefab_ipAdapter_baseV2'
import { ui_IPAdapterFaceIDV2, type UI_IPAdapterFaceIDV2 } from '../_ipAdapter/prefab_ipAdapter_faceV2'
import { latentSizeChanel, ui_latent_v3, type UI_LatentV3 } from '../_prefabs/prefab_latent_v3'
import {
   ui_regionalPrompting_v1,
   type UI_regionalPrompting_v1,
} from '../_prefabs/prefab_regionalPrompting_v1'
import { ui_sampler_advanced, type UI_Sampler_Advanced } from '../_prefabs/prefab_sampler_advanced'
import { ui_customSave, type UI_customSave } from '../_prefabs/saveSmall'
import { sampleNegative, samplePrompts } from '../samplePrompts'
import { type $prefabModelSD15andSDXL, prefabModelSD15andSDXL } from '../SD15/_model_SD15_SDXL'

export type $CushySDXLUI = X.XGroup<{
   positive: X.XGroup<{
      activeIndex: X.Number
      showEditor: X.Bool
      showOptions: X.Bool
      prompts: X.XList<X.XOptional<X.XPrompt>>
      regionalPrompt: S.SOptional<UI_regionalPrompting_v1>
      artists: X.XSelectMany_<string>
      // artistsV2: X.XSelectMany_<string>
   }>
   negative: X.XList<X.XOptional<X.XPrompt>>
   model: $prefabModelSD15andSDXL
   latent: UI_LatentV3
   sampler: UI_Sampler_Advanced
   customSave: UI_customSave
   controlnets: UI_cnet
   ipAdapter: X.XOptional<UI_IPAdapterV2>
   faceID: X.XOptional<UI_IPAdapterFaceIDV2>
   extra: $extra1
   extra2: $extra2
}>

// type K = $CushySDXLUI['$Field']

export function _cushySDXLSchema(b: X.Builder): $CushySDXLUI {
   const tags = cushy.danbooru.tags
   const artists = tags.filter((t) => t.category === 1).map((t) => t.text)
   // console.log(`[🤠] tags`, tags)
   // console.log(`[🤠] artists`, artists)
   return b.fields({
      positive: b.fields(
         {
            activeIndex: b.int({ default: 0, hidden: true }),
            showEditor: b.bool({ default: true, hidden: true }),
            showOptions: b.bool({ default: true, hidden: true }),
            prompts: b
               .prompt({
                  icon: 'mdiPlusBoxOutline',
                  // background: { hue: 150, chroma: 0.05 },
                  default: samplePrompts.tree,
                  presets: [
                     //
                     { label: 'Portrait', icon: 'mdiFaceWoman', apply: (w) => w.setText('portrait, face') },
                     {
                        label: 'Landscape',
                        icon: 'mdiImageFilterHdr',
                        apply: (w) => w.setText('landscape, nature'),
                     },
                     { label: 'Tree', icon: 'mdiTree', apply: (w) => w.setText(samplePrompts.tree) },
                     { label: 'Abstract', icon: 'mdiShape', apply: (w) => w.setText('abstract, art') },
                  ],
               })
               .optional(true)
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
      ),
      negative: b
         .prompt({
            icon: 'mdiMinusBoxOutline',
            startCollapsed: true,
            default: 'bad quality, blurry, low resolution, pixelated, noisy',
            // box: { base: { hue: 0, chroma: 0.05 } },
            presets: [
               {
                  icon: 'mdiCloseOctagon',
                  label: 'simple negative',
                  apply: (w) => w.setText(sampleNegative.simpleNegative),
               },
               {
                  icon: 'mdiCloseOctagon',
                  label: 'simple negative + nsfw',
                  apply: (w) => w.setText(sampleNegative.simpleNegativeNsfw),
               },
            ],
         })
         .optional(true)
         .list({ min: 1, icon: 'mdiMinusBoxOutline' }),
      controlnets: ui_cnet(),
      model: prefabModelSD15andSDXL({
         // @ts-ignore
         ckpt_name: 'albedobaseXL_v21.safetensors',
      }).addRequirements({
         // just for Lorn
         type: 'modelInCivitai',
         civitaiModelId: '889818',
         // civitaiModelId: 'https://civitai.com/api/download/models/889818',
         // civitaiURL: 'https://civitai.com/models/795765/illustrious-xl',
         base: 'SDXL',
         optional: true,
      }),
      latent: ui_latent_v3({
         size: { default: { modelType: 'SDXL 1024' } },
      }),
      sampler: ui_sampler_advanced(),
      customSave: ui_customSave(),
      ipAdapter: ui_IPAdapterV2().optional(),
      faceID: ui_IPAdapterFaceIDV2().optional(),
      extra: extra1(),
      extra2: extra2(),
   })
}
