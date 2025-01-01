import {
   type $schemaModelExtras,
   evalModelExtras_part1,
   schemaModelExtras,
} from '../_prefabs/prefab_model_extras'

export type $prefabModelSD15andSDXL = X.XGroup<{
   ckpt_name: X.XEnum<'CheckpointLoaderSimple.ckpt_name'>
   extra: $schemaModelExtras
}>

export const prefabModelSD15andSDXL = (
   p: {
      ckpt_name?: Comfy.Slots['CheckpointLoaderSimple.ckpt_name']
      extra?: $schemaModelExtras['$Value']
   } = {},
): $prefabModelSD15andSDXL => {
   const b = getCurrentForm()
   // console.log('A', cushy)
   // console.log('B', cushy?.comfyAddons)
   // console.log('C', cushy?.comfyAddons?.getKnownCheckpoints)

   const ckpts = cushy.comfyAddons.getKnownCheckpoints()
   return b.fields(
      {
         ckpt_name: b.enum['CheckpointLoaderSimple.ckpt_name']({
            label: 'Checkpoint',
            // default: p.ckpt_name ?? 'revAnimated_v122.safetensors', 🔴
            default: p.ckpt_name ?? ckpts[0]?.filename,
         }).addRequirements(ckpts.map((x) => ({ type: 'modelCustom', infos: x }))),
         extra: schemaModelExtras(),
      },
      {
         icon: 'mdiTurbine',
         toSummary: ({ value: ui }): string => {
            let out: string = ui.ckpt_name
            if (ui.extra.freeU) out += ' + FreeU'
            if (ui.extra.freeUv2) out += ' + FreeUv2'
            if (ui.extra.vae) out += ' + VAE'
            if (ui.extra.clipSkip) out += ` + ClipSkip(${ui.extra.clipSkip})`
            if (ui.extra.pag) out += ` + PAG(${ui.extra.pag.scale})`
            if (ui.extra.sag) out += ` + SAG(${ui.extra.sag.scale}/${ui.extra.sag.blur_sigma})`
            // 2024-05-30 rvion:
            // | changed the summary when Kohya DeepShrink is enabled.
            // | Was causing some error (not able to convert ui.extra.KohyaDeepShrink to string)
            // | automatically
            if (ui.extra.KohyaDeepShrink) out += ` + Shrink(...)` // ${ui.extra.KohyaDeepShrink}
            return out
         },
      },
   )
}

export function evalModelSD15andSDXL(doc: $prefabModelSD15andSDXL['$Value']): {
   ckpt: Comfy.Signal['MODEL']
   vae: Comfy.Signal['VAE']
   clip: Comfy.Signal['CLIP']
} {
   const run = getCurrentRun()
   const graph = run.nodes
   let ckpt: Comfy.Signal['MODEL']
   let clip: Comfy.Signal['CLIP']
   let vae: Comfy.Signal['VAE'] | undefined = undefined

   // SD15/SD2 Specific Part ------------------------
   if (doc.extra.checkpointConfig) {
      const ckptLoader = graph.CheckpointLoader({
         ckpt_name: doc.ckpt_name,
         config_name: doc.extra.checkpointConfig,
      })
      ckpt = ckptLoader._MODEL
      clip = ckptLoader._CLIP
      vae = ckptLoader._VAE
   } else if (doc.extra.civitai_ckpt_air) {
      const ckptLoader = graph['civitai_comfy_nodes.CivitAI_Checkpoint_Loader']({
         ckpt_name: doc.ckpt_name,
         ckpt_air: doc.extra.civitai_ckpt_air,
         download_path: 'models/checkpoints',
      })
      ckpt = ckptLoader._MODEL
      clip = ckptLoader._CLIP
      vae = ckptLoader._VAE
   } else {
      const ckptLoader = graph.CheckpointLoaderSimple({ ckpt_name: doc.ckpt_name })
      ckpt = ckptLoader._MODEL
      clip = ckptLoader._CLIP
      vae = ckptLoader._VAE
   }

   return evalModelExtras_part1(doc.extra, { vae, clip, ckpt })
}
