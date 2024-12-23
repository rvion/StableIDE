import {
   run_model_kohyaDeepShrink,
   ui_model_kohyaDeepShrink,
   type UI_model_kohyaDeepShrink,
} from './prefab_model_kohyaDeepShrink'
import { ui_model_pag, type UI_model_pag } from './prefab_model_pag'
import { ui_model_sag, type UI_model_sag } from './prefab_model_sag'

export type $schemaModelExtras = X.XChoices<{
   checkpointConfig: X.XEnum<'CheckpointLoader.config_name'>
   rescaleCFG: X.XNumber
   vae: X.XEnum<'VAELoader.vae_name'>
   clipSkip: X.XNumber
   freeU: X.XEmpty
   freeUv2: X.XEmpty
   vpred: X.XGroup<{ zsnr: X.XBool }>
   epred: X.XGroup<{ zsnr: X.XBool }>
   sampling: X.XGroup<{
      sampling: X.XEnum<'ModelSamplingDiscrete.sampling'>
      zsnr: X.XBool
   }>
   pag: UI_model_pag
   sag: UI_model_sag
   KohyaDeepShrink: UI_model_kohyaDeepShrink
   civitai_ckpt_air: X.XString
}>

export const schemaModelExtras = (
   p: {
      defaultVAE?: Comfy.Slots['VAELoader.vae_name']
      vaeActiveByDefault?: boolean
      // default?: $schemaModelExtras['$Value']
   } = {},
): $schemaModelExtras => {
   const b = getCurrentForm()
   return b
      .choices(
         {
            checkpointConfig: b.enum['CheckpointLoader.config_name']({ label: 'Config' }),
            rescaleCFG: b.float({ min: 0, max: 2, softMax: 1, default: 0.75 }),
            vae: b.enum['VAELoader.vae_name']({ default: p.defaultVAE }),
            clipSkip: b.int({ label: 'Clip Skip', default: 1, min: 1, max: 5 }),
            freeU: b.empty({ label: 'freeU ' }),
            freeUv2: b.empty({ label: 'freeU (v2)' }),
            vpred: b.fields({ zsnr: b.bool() }),
            epred: b.fields({ zsnr: b.bool() }),
            sampling: b.auto.ModelSamplingDiscrete(),
            pag: ui_model_pag(b),
            sag: ui_model_sag(b),
            KohyaDeepShrink: ui_model_kohyaDeepShrink(b),
            civitai_ckpt_air: b
               .string({
                  tooltip: 'Civitai checkpoint Air, as found on the civitai Website. It should look like this: 43331@176425', // prettier-ignore
                  label: 'Civitai Ref',
                  placeHolder: 'e.g. 43331@176425',
               })
               .addRequirements([
                  {
                     type: 'customNodesByNameInCushy',
                     nodeName: 'civitai_comfy_nodes.CivitAI_Checkpoint_Loader',
                  },
               ]),
         },
         {
            border: false,
            default: p.vaeActiveByDefault ? 'vae' : {},
            // label: false,
            // appearance: 'tab',
         },
      )
      .addCheck((f) => {
         console.log(
            `[🦇] check is properly executing`,
            f.isBranchEnabled('vpred'),
            f.isBranchEnabled('sampling'),
         )
         if (f.isBranchEnabled('vpred') && f.isBranchEnabled('sampling')) {
            return 'You can only use one of Vpred or Sampling, not both; vpred is just a shortcut for sampling with vpred mode enabled.'
         }
      })
}

// ------------
type XX1 = { vae: Comfy.Signal['VAE'] | undefined; clip: Comfy.Signal['CLIP']; ckpt: Comfy.Signal['MODEL'] }
type XX2 = { vae: Comfy.Signal['VAE']; clip: Comfy.Signal['CLIP']; ckpt: Comfy.Signal['MODEL'] }

export function evalModelExtras_part1(
   //
   extra: $schemaModelExtras['$Value'],
   { vae, clip, ckpt }: XX1,
): XX2 {
   const graph = getCurrentRun().nodes

   if (extra.sampling) {
      ckpt = graph.ModelSamplingDiscrete({
         model: ckpt,
         zsnr: extra.sampling.zsnr,
         sampling: extra.sampling.sampling,
      })
   } else if (extra.vpred) {
      ckpt = graph.ModelSamplingDiscrete({
         model: ckpt,
         zsnr: extra.vpred.zsnr,
         sampling: 'v_prediction',
      })
   }
   if (extra.epred) {
      ckpt = graph.ModelSamplingDiscrete({
         model: ckpt,
         zsnr: extra.epred.zsnr,
         sampling: 'eps',
      })
   }

   if (extra.vae) vae = graph.VAELoader({ vae_name: extra.vae })
   if (vae === undefined) {
      throw new Error('No VAE loaded')
   }

   // 3. OPTIONAL CLIP SKIP
   if (extra.clipSkip) clip = graph.CLIPSetLastLayer({ clip, stop_at_clip_layer: -Math.abs(extra.clipSkip) })

   // 4. Optional FreeU
   if (extra.freeUv2) ckpt = graph.FreeU_V2({ model: ckpt })
   else if (extra.freeU) ckpt = graph.FreeU({ model: ckpt })

   /* Rescale CFG */
   if (extra.rescaleCFG) {
      ckpt = graph.RescaleCFG({ model: ckpt, multiplier: extra.rescaleCFG })
   }
   return { vae, clip, ckpt }
}

export const evalModelExtras_part2 = (
   extra: $schemaModelExtras['$Value'],
   ckpt: Comfy.Signal['MODEL'],
   forHiRes?: boolean,
   kohyaScale?: number,
): Comfy.Signal['MODEL'] => {
   const run = getCurrentRun()
   const graph = run.nodes
   // 5. Optional SAG - Self Attention Guidance
   if (extra.sag && ((!forHiRes && extra.sag.include.base) || (forHiRes && extra.sag.include.hiRes))) {
      ckpt = graph.SelfAttentionGuidance({
         scale: extra.sag.scale,
         blur_sigma: extra.sag.blur_sigma,
         model: ckpt,
      })
   }

   // 6. Optional PAG - Perturbed Attention Guidance
   if (extra.pag && ((!forHiRes && extra.pag.include.base) || (forHiRes && extra.pag.include.hiRes))) {
      ckpt = graph['sd-perturbed-attention.PerturbedAttention']({
         scale: extra.pag.scale,
         model: ckpt,
         adaptive_scale: extra.pag.adaptiveScale,
      })
   }

   // 7. Kohya Deepshrink
   if (extra.KohyaDeepShrink) {
      ckpt = run_model_kohyaDeepShrink(extra.KohyaDeepShrink, ckpt, forHiRes, kohyaScale)
   }
   return ckpt
}
