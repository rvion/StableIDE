import type { StackData } from './_prefabs/prefab_Stack'

import { weaverLatent } from './_prefabs/latent/prefab_weaver_latent'
import { promptList } from './_prefabs/prompting/WeaverPrompting'

export type $CushyWeaverUI = X.XGroup<{
   stack: X.XList<StackData>
   // model: $prefabModelSD15andSDXL
   // sampler: UI_Sampler_Advanced
   // customSave: UI_customSave
   // controlnets: UI_cnet
   // ipAdapter: X.XOptional<UI_IPAdapterV2>
   // faceID: X.XOptional<UI_IPAdapterFaceIDV2>
   // extra: $extra1
   // extra2: $extra2
}>

export function _cushyWeaverSchema(b: X.Builder): $CushyWeaverUI {
   return b.fields({
      stack: b
         .fields({
            name: b.string(),
            data: b
               .choice({
                  prompting: promptList(b),
                  latent: weaverLatent(b),
               })
               .optional(),
         })
         .list(),

      // controlnets: ui_cnet(),
      // model: prefabModelSD15andSDXL({
      //    // @ts-ignore
      //    // ckpt_name: 'albedobaseXL_v21.safetensors',
      // }).addRequirements({
      //    // just for Lorn
      //    type: 'modelInCivitai',
      //    civitaiModelId: '889818',
      //    // civitaiModelId: 'https://civitai.com/api/download/models/889818',
      //    // civitaiURL: 'https://civitai.com/models/795765/illustrious-xl',
      //    base: 'SDXL',
      //    optional: true,
      // }),
      // latent: ui_latent_v3({
      //    size: { default: { modelType: 'SDXL 1024' } },
      // }),
      // sampler: ui_sampler_advanced(),
      // customSave: ui_customSave(),
      // ipAdapter: ui_IPAdapterV2().optional(),
      // faceID: ui_IPAdapterFaceIDV2().optional(),
      // extra: extra1(),
      // extra2: extra2(),
   })
}
