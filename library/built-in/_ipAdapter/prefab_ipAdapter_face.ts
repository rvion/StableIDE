import type { Cnet_args } from '../_controlNet/prefab_cnet'
import type { OutputFor } from '../_prefabs/_prefabs'

import { ipAdapterDoc } from './_ipAdapterDoc'
import {
   ipAdapter_faceID_ClipModelList,
   ipAdapter_faceID_LoraList,
   ipAdapterModelList,
} from './_ipAdapterModelList'
import { ui_ipadapter_CLIPSelection, ui_subform_IPAdapter_common } from './_ipAdapterUtils'
import { ui_ipadapter_modelSelection } from './ui_ipadapter_modelSelection'

// 🅿️ IPAdapter FaceID ===================================================
export type UI_IPAdapterFaceID = X.XGroup<{
   reinforce: X.XOptional<
      X.XGroup<{
         strength: X.XNumber
         settings: X.XGroup<{
            extra: X.XList<X.XImage>
            crop: X.XBool
            startAtStepPercent: X.XNumber
            endAtStepPercent: X.XNumber
            weight_type: X.XEnum<'IPAdapter_plus.IPAdapterAdvanced.weight_type'>
            embedding_scaling: X.XEnum<'IPAdapter_plus.IPAdapterAdvanced.embeds_scaling'>
            noise: X.XNumber
            unfold_batch: X.XBool
         }>
         cnet_model_name: X.XEnum<'IPAdapter_plus.IPAdapterModelLoader.ipadapter_file'>
         help: X.XMarkdown
      }>
   >
   strength: X.XNumber
   settings: X.XGroup<{
      extra: X.XList<X.XImage>
      crop: X.XBool
      startAtStepPercent: X.XNumber
      endAtStepPercent: X.XNumber
      weight_type: X.XEnum<'IPAdapter_plus.IPAdapterAdvanced.weight_type'>
      embedding_scaling: X.XEnum<'IPAdapter_plus.IPAdapterAdvanced.embeds_scaling'>
      noise: X.XNumber
      unfold_batch: X.XBool
   }>
   help: X.XMarkdown
   models: X.XGroup<{
      lora: X.XEnum<'LoraLoader.lora_name'>
      cnet_model_name: X.XEnum<'IPAdapter_plus.IPAdapterModelLoader.ipadapter_file'>
      clip_name: X.XEnum<'CLIPVisionLoader.clip_name'>
   }>
   lora_strength: X.XNumber
}>

export function ui_IPAdapterFaceID(): UI_IPAdapterFaceID {
   const b = getCurrentForm()
   return b
      .group({
         label: 'FaceID IPAdapter',
         items: {
            help: b.markdown({ startCollapsed: true, markdown: ipAdapterDoc }),
            models: b.fields(
               {
                  ...ui_ipadapter_CLIPSelection(b),
                  ...ui_ipadapter_modelSelection(
                     b,
                     // @ts-ignore
                     'ip-adapter-faceid-plusv2_sd15.bin',
                     //'ip-adapter-plus-face_sd15.safetensors',
                     // 'ip-adapter-faceid-plus_sd15.bin',
                     ipAdapter_faceID_ClipModelList,
                  ),
                  lora: b.enum['LoraLoader.lora_name']({
                     // @ts-ignore
                     default: 'ip-adapter-faceid-plusv2_sd15_lora.safetensors',
                     label: 'Face ID Lora',
                     // recommandedModels: {
                     //     modelFolderPrefix: 'models/lora',
                     //     knownModel: ipAdapter_faceID_LoraList,
                     // },
                     tooltip: 'Select the same LORA as the model. So for ip-adapter-faceid-plus, select ip-adapter-faceid-plus_sd15_lora', // prettier-ignore
                  }).addRequirementOnComfyManagerModel(ipAdapter_faceID_LoraList),
               },
               { label: 'Select or Download Models' },
            ),

            lora_strength: b.float({ default: 0.5, min: 0, max: 2, step: 0.1 }),
            ...ui_subform_IPAdapter_common(b),
            reinforce: b
               .group({
                  startCollapsed: true,
                  label: 'Reinforce With Additional IPAdapter',
                  description:
                     'Enabling will apply an additional IPAdapter. This usually makes faces more accurate, but pulls along more features from the face image.',
                  items: {
                     help: b.markdown({
                        startCollapsed: true,
                        markdown: `Recommended to select a model with "face" in it but NOT "faceID". So ip-adapter-plus-face_sd15 for example.\nAlso keep the strength pretty low. Like 0.3 unless you want the image dominated by the face image style.`,
                     }),
                     ...ui_ipadapter_modelSelection(
                        b,
                        // @ts-ignore
                        'ip-adapter-plus-face_sd15.safetensors',
                        ipAdapterModelList,
                     ),
                     ...ui_subform_IPAdapter_common(b, 0.3),
                  },
               })
               .optional(),
         },
      })
      .addRequirements([{ type: 'customNodesByTitle', title: 'ComfyUI_IPAdapter_plus' }])
}

// 🅿️ IPAdapter FaceID RUN ===================================================
export const run_cnet_IPAdapterFaceID = (
   IPAdapter: OutputFor<typeof ui_IPAdapterFaceID>,
   cnet_args: Cnet_args,
   image: Comfy.Signal['IMAGE'],
): {
   ip_adapted_model: Comfy.Signal['MODEL']
} => {
   const run = getCurrentRun()
   const graph = run.nodes
   const ip = IPAdapter

   let ckpt = cnet_args.ckptPos
   ckpt = graph.LoraLoader({
      model: ckpt,
      clip: run.AUTO,
      strength_clip: ip.lora_strength,
      strength_model: ip.lora_strength,
      lora_name: ip.models.lora,
   })

   const ip_clip_name = graph.CLIPVisionLoader({ clip_name: ip.models.clip_name })
   const faceIDnode = graph['IPAdapter_plus.IPAdapterFaceID']({
      ipadapter: graph['IPAdapter_plus.IPAdapterModelLoader']({ ipadapter_file: ip.models.cnet_model_name }),
      clip_vision: ip_clip_name,
      insightface: (t) =>
         t['IPAdapter_plus.IPAdapterInsightFaceLoader']({
            provider: 'CPU',
            // 🔴        VVVVVV review that
            model_name: 'antelopev2',
         }),
      image: image,
      combine_embeds: 'average',
      model: ckpt,
      weight: ip.strength,
      weight_faceidv2: ip.strength,
      weight_type: ip.settings.weight_type,
      start_at: ip.settings.startAtStepPercent,
      end_at: ip.settings.endAtStepPercent,
      embeds_scaling: 'V only',
   })

   ckpt = faceIDnode._MODEL

   if (ip.reinforce) {
      const ip_model = graph['IPAdapter_plus.IPAdapterModelLoader']({
         ipadapter_file: ip.reinforce.cnet_model_name,
      })
      const ip_adapted_model = graph['IPAdapter_plus.IPAdapterAdvanced']({
         ipadapter: ip_model,
         image: image,
         model: ckpt,
         weight: ip.reinforce.strength,
         start_at: ip.reinforce.settings.startAtStepPercent,
         end_at: ip.reinforce.settings.endAtStepPercent,
         combine_embeds: 'average',
         weight_type: ip.reinforce.settings.weight_type,
         clip_vision: ip_clip_name,
         embeds_scaling: 'V only',
      })._MODEL
      ckpt = ip_adapted_model
   }

   return { ip_adapted_model: ckpt }
}
