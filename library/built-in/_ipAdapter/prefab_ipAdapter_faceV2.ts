import type { OutputFor } from '../_prefabs/_prefabs'

import { ipAdapterDoc } from './_ipAdapterDoc'
import { ui_ipadapter_advancedSettings, type UI_ipadapter_advancedSettings } from './prefab_ipAdapter_baseV2'

// ======================================================================================================
// 🅿️ IPAdapter Basic
export type UI_IPAdapterFaceIDV2 = X.XGroup<{
   baseImage: UI_FaceIDImageInput
   settings: X.XGroup<{
      weight: X.XNumber
      weight_faceidv2: X.XNumber
      models: X.XGroup<{
         type: X.XEnum<'IPAdapter_plus.IPAdapterUnifiedLoaderFaceID.preset'>
      }>
      extra: X.XList<UI_FaceIDImageInput>
      advancedSettings: X.XGroup<{
         extraIPAdapter: X.XOptional<UI_extraIpAdapter>
         startAtStepPercent: X.XNumber
         endAtStepPercent: X.XNumber
         lora_strength: X.XNumber
         embedding_combination: X.XEnum<'Impact-Pack.ImpactIPAdapterApplySEGS.combine_embeds'>
         weight_type: X.XEnum<'IPAdapter_plus.IPAdapterAdvanced.weight_type'>
         embedding_scaling: X.XEnum<'IPAdapter_plus.IPAdapterAdvanced.embeds_scaling'>
         noise: X.XNumber
         unfold_batch: X.XBool
         adapterAttentionMask: X.XOptional<X.XImage>
      }>
   }>
   help: X.XMarkdown
}>

export function ui_IPAdapterFaceIDV2(): UI_IPAdapterFaceIDV2 {
   const form = getCurrentForm()
   return (
      form
         .fields(
            {
               baseImage: ui_FaceIDImageInput(form),
               settings: form.fields(
                  {
                     weight: form.float({ default: 0.8, min: -1, max: 3, step: 0.1 }),
                     weight_faceidv2: form.float({ default: 0.8, min: -1, max: 3, step: 0.1 }),
                     models: form.fields(
                        {
                           type: form.enum['IPAdapter_plus.IPAdapterUnifiedLoaderFaceID.preset']({
                              default: 'FACEID PLUS V2',
                           }),
                        },
                        { startCollapsed: true, toSummary: ({ value: ui }): string => `model:${ui.type}` },
                     ),
                     extra: form.list({
                        label: 'Extra Images',
                        element: ui_FaceIDImageInput(form),
                     }),
                     advancedSettings: form.fields(
                        {
                           extraIPAdapter: ui_extraIpAdapter(form).optional(),
                           startAtStepPercent: form.float({ default: 0, min: 0, max: 1, step: 0.1 }),
                           endAtStepPercent: form.float({ default: 1, min: 0, max: 1, step: 0.05 }),
                           lora_strength: form.float({ default: 0.6, min: 0, max: 1, step: 0.1 }),
                           embedding_combination: form.enum[
                              'IPAdapter_plus.IPAdapterAdvanced.combine_embeds'
                           ]({
                              default: 'average',
                           }),
                           weight_type: form.enum['IPAdapter_plus.IPAdapterAdvanced.weight_type']({
                              default: 'linear',
                           }),

                           embedding_scaling: form.enum['IPAdapter_plus.IPAdapterAdvanced.embeds_scaling']({
                              default: 'V only',
                           }),
                           noise: form.float({ default: 0, min: 0, max: 1, step: 0.1 }),
                           unfold_batch: form.bool({ default: false }),
                           adapterAttentionMask: form
                              .image({
                                 label: 'Attention Mask',
                                 tooltip:
                                    'This defines the region of the generated image the IPAdapter will apply to',
                              })
                              .optional(),
                        },
                        {
                           toSummary: ({ value: ui }): string => {
                              return `${ui.weight_type} | combo:${ui.embedding_combination} | from:${
                                 ui.startAtStepPercent
                              }=>${ui.endAtStepPercent} | reinforced:${ui.extraIPAdapter ? 'yes' : 'no'}`
                           },
                        },
                     ),
                  },
                  {
                     label: 'IP Adapter Settings',
                     startCollapsed: true,
                     toSummary: ({ value: ui }): string => {
                        return `extra images:${ui.extra.length} | weight:${ui.weight} | weightV2:${ui.weight_faceidv2} | model:${ui.models.type}|`
                     },
                  },
               ),
               help: form.markdown({ startCollapsed: true, markdown: ipAdapterDoc }),
            },
            {
               label: 'FaceID',
               icon: 'mdiStarFace',
               box: { base: { hue: 50, chroma: 0.1 } },
               toSummary: ({ value: ui }): string => {
                  return `images:${1 + ui.settings.extra.length} | weight:${ui.settings.weight} | weightV2:${
                     ui.settings.weight_faceidv2
                  } | model:${ui.settings.models.type}`
               },
            },
         )
         .addRequirements([{ type: 'customNodesByTitle', title: 'ComfyUI_IPAdapter_plus' }])
         // https://github.com/cubiq/ComfyUI_IPAdapter_plus
         .addRequirementOnComfyManagerModel([
            'ip-adapter_sd15_light_v11.bin',
            // 'ip-adapter_sd15_light.safetensors [DEPRECATED]',
            // -----
            'ip-adapter_sd15_vit-G.safetensors',
            'ip-adapter_sd15.safetensors',
            // -----
            'ip-adapter_sdxl_vit-h.safetensors',
            'ip-adapter_sdxl.safetensors',
            // -----
            'ip-adapter-faceid_sd15_lora.safetensors',
            'ip-adapter-faceid_sd15.bin',
            // -----
            'ip-adapter-faceid_sdxl_lora.safetensors',
            'ip-adapter-faceid_sdxl.bin',
            // -----
            // 'ip-adapter-faceid-plus_sd15_lora.safetensors [DEPRECATED]',
            // 'ip-adapter-faceid-plus_sd15.bin [DEPRECATED]',
            // -----
            'ip-adapter-faceid-plusv2_sd15_lora.safetensors',
            'ip-adapter-faceid-plusv2_sd15.bin',
            // -----
            'ip-adapter-faceid-plusv2_sdxl_lora.safetensors',
            'ip-adapter-faceid-plusv2_sdxl.bin',
            // -----
            'ip-adapter-faceid-portrait_sdxl_unnorm.bin',
            'ip-adapter-faceid-portrait_sdxl.bin',
            // 'ip-adapter-faceid-portrait_sd15.bin [DEPRECATED]',
         ])
   )
}

// ======================================================================================================
export type UI_FaceIDImageInput = X.XGroup<{
   image: X.XImage
   advanced: X.XGroup<{
      sharpening: X.XNumber
      crop_position: X.XEnum<'IPAdapter_plus.PrepImageForClipVision.crop_position'>
   }>
}>
export function ui_FaceIDImageInput(form: X.Builder): UI_FaceIDImageInput {
   return form.fields(
      {
         image: form.image({ label: 'Image' }),
         advanced: form.fields(
            {
               sharpening: form.float({ default: 0, min: 0, max: 1, step: 0.1 }),
               crop_position: form.enum['IPAdapter_plus.PrepImageForClipVision.crop_position']({
                  default: 'top',
               }),
            },
            {
               startCollapsed: true,
               label: 'Image Settings',
               toSummary: ({ value: ui }): string => {
                  return `sharpening:${ui.sharpening} | crop_position:${ui.crop_position}`
               },
            },
         ),
         // crop: form.bool({ default: true }),
      },
      {
         toSummary: ({ value: ui }): string => {
            return `sharpening:${ui.advanced.sharpening} | crop_position:${ui.advanced.crop_position}`
         },
      },
   )
}

// ======================================================================================================
export type UI_extraIpAdapter = X.XGroup<{
   weight: X.XNumber
   embedding_combination: X.XEnum<'IPAdapter_plus.IPAdapterAdvanced.combine_embeds'>
   ipAdapterSettings: UI_ipadapter_advancedSettings
}>
function ui_extraIpAdapter(form: X.Builder): UI_extraIpAdapter {
   return form.fields(
      {
         weight: form.float({ default: 0.4, min: -1, max: 3, step: 0.1 }),
         embedding_combination: form.enum['IPAdapter_plus.IPAdapterAdvanced.combine_embeds']({ default: 'average' }), // prettier-ignore
         ipAdapterSettings: ui_ipadapter_advancedSettings(form, 0.25, 1, 'ease in'),
      },
      {
         toSummary: ({ value: ui }): string => {
            return `weight:${ui.weight} | ${ui.ipAdapterSettings.weight_type} | combo:${ui.embedding_combination} | from:${ui.ipAdapterSettings.startAtStepPercent}=>${ui.ipAdapterSettings.endAtStepPercent}`
         },
      },
   )
}

// ======================================================================================================
// 🅿️ FaceID RUN
export const run_FaceIDV2 = async (
   ui: OutputFor<typeof ui_IPAdapterFaceIDV2>,
   ckpt: Comfy.Signal['MODEL'],
   // cnet_args: Cnet_argsV2,
   previousIPAdapter?: Comfy.Signal['IPADAPTER'] | undefined,
): Promise<{
   ip_adapted_model: Comfy.Signal['MODEL']
   ip_adapter: Comfy.Signal['IPADAPTER'] | undefined
}> => {
   const run = getCurrentRun()
   const graph = run.nodes
   if (!ui) {
      return { ip_adapted_model: ckpt, ip_adapter: previousIPAdapter }
   }

   let ip_adapter: Comfy.Signal['IPADAPTER']
   let ip_adapter_out: Comfy.Signal['IPADAPTER']
   let ckpt_pos: Comfy.Signal['MODEL'] = ckpt

   const ip_adapter_loader = graph['IPAdapter_plus.IPAdapterUnifiedLoaderFaceID']({
      model: ckpt,
      ipadapter: previousIPAdapter,
      preset: ui.settings.models.type,
      lora_strength: ui.settings.advancedSettings.lora_strength,
      provider: 'CPU',
   })
   ip_adapter = ip_adapter_loader._IPADAPTER
   ckpt_pos = ip_adapter_loader._MODEL

   let image: Comfy.Signal['IMAGE'] = await run.loadImageAnswer(ui.baseImage.image)
   image = graph['IPAdapter_plus.PrepImageForClipVision']({
      image,
      crop_position: 'center',
      sharpening: 0,
      interpolation: 'LANCZOS',
   })
   const preview = graph.PreviewImage({ images: image })

   let adapterAttentionMask: Comfy.Signal['MASK'] | undefined
   if (ui.settings.advancedSettings.adapterAttentionMask) {
      const maskLoad = await run.loadImageAnswer(ui.settings.advancedSettings.adapterAttentionMask)
      const maskClipped = graph['IPAdapter_plus.PrepImageForClipVision']({
         image: maskLoad,
         crop_position: 'center',
         sharpening: 0,
         interpolation: 'LANCZOS',
      })
      adapterAttentionMask = graph['ImageToMask']({ image: maskClipped._IMAGE, channel: 'red' })
   }

   for (const ex of ui.settings.extra) {
      const extra = await run.loadImageAnswer(ex.image)
      const image2 = graph['IPAdapter_plus.PrepImageForClipVision']({
         image: extra._IMAGE,
         crop_position: 'center',
         sharpening: 0,
         interpolation: 'LANCZOS',
      })
      image = graph.ImageBatch({
         image1: image,
         image2: image2,
      })
      const preview = graph.PreviewImage({ images: image2 })
   }

   const faceID = graph['IPAdapter_plus.IPAdapterFaceID']({
      model: ckpt_pos,
      ipadapter: ip_adapter,
      image,
      weight: ui.settings.weight,
      weight_faceidv2: ui.settings.weight_faceidv2,
      weight_type: ui.settings.advancedSettings.weight_type,
      combine_embeds: ui.settings.advancedSettings.embedding_combination,
      start_at: ui.settings.advancedSettings.startAtStepPercent,
      end_at: ui.settings.advancedSettings.endAtStepPercent,
      embeds_scaling: ui.settings.advancedSettings.embedding_scaling,
   })
   let ip_adapted_model = faceID._MODEL

   if (ui.settings.advancedSettings.extraIPAdapter) {
      const extraIP = graph['IPAdapter_plus.IPAdapterAdvanced']({
         model: ip_adapted_model,
         ipadapter: ip_adapter,
         image,
         weight: ui.settings.advancedSettings.extraIPAdapter.weight,
         weight_type: ui.settings.advancedSettings.extraIPAdapter.ipAdapterSettings.weight_type,
         combine_embeds: ui.settings.advancedSettings.extraIPAdapter.embedding_combination,
         start_at: ui.settings.advancedSettings.extraIPAdapter.ipAdapterSettings.startAtStepPercent,
         end_at: ui.settings.advancedSettings.extraIPAdapter.ipAdapterSettings.endAtStepPercent,
         embeds_scaling: ui.settings.advancedSettings.extraIPAdapter.ipAdapterSettings.embedding_scaling,
      })
   }

   return { ip_adapted_model, ip_adapter }
}
