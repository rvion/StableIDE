// import { DanbooruTagCategory } from '../../../src/widgets/prompter/nodes/booru/BooruLoader'
import { ui_cnet, type UI_cnet } from '../_controlNet/prefab_cnet'
import { type $extra1, extra1 } from '../_extra/extra1'
import { type $extra2, extra2 } from '../_extra/extra2'
import { ui_IPAdapterV2, type UI_IPAdapterV2 } from '../_ipAdapter/prefab_ipAdapter_baseV2'
import { ui_IPAdapterFaceIDV2, type UI_IPAdapterFaceIDV2 } from '../_ipAdapter/prefab_ipAdapter_faceV2'
import { ui_latent_v3, type UI_LatentV3 } from '../_prefabs/prefab_latent_v3'
import { ui_sampler_advanced, type UI_Sampler_Advanced } from '../_prefabs/prefab_sampler_advanced'
import { ui_customSave, type UI_customSave } from '../_prefabs/saveSmall'
import { sampleNegative, samplePrompts } from '../samplePrompts'
import { type $prefabModelSD15andSDXL, prefabModelSD15andSDXL } from '../SD15/_model_SD15_SDXL'
import { type $PromptList, promptList } from './_prefabs/prefab_PromptList'

export type $CushyWeaverUI = X.XGroup<{
   conditioning: $PromptList
   // negative: $PromptList
   model: $prefabModelSD15andSDXL
   latent: UI_LatentV3
   sampler: UI_Sampler_Advanced
   // customSave: UI_customSave
   // controlnets: UI_cnet
   // ipAdapter: X.XOptional<UI_IPAdapterV2>
   // faceID: X.XOptional<UI_IPAdapterFaceIDV2>
   // extra: $extra1
   // extra2: $extra2
}>

// type K = $CushySDXLUI['$Field']

export function _cushyWeaverSchema(b: X.Builder): $CushyWeaverUI {
   // console.log(`[🤠] tags`, tags)
   // console.log(`[🤠] artists`, artists)
   return b.fields({
      conditioning: promptList(b, { default: samplePrompts.tree }),
      // negative: promptList(b, { default: 'bad quality, blurry, low resolution, pixelated, noisy' }),

      // controlnets: ui_cnet(),
      model: prefabModelSD15andSDXL({
         // @ts-ignore
         // ckpt_name: 'albedobaseXL_v21.safetensors',
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
      // customSave: ui_customSave(),
      // ipAdapter: ui_IPAdapterV2().optional(),
      // faceID: ui_IPAdapterFaceIDV2().optional(),
      // extra: extra1(),
      // extra2: extra2(),
   })
}
