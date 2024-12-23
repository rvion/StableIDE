import type { Runtime } from '../../../src/CUSHY'
import type { OutputFor } from './_prefabs'

import { run_prompt } from './prefab_prompt'

export type UI_Sampler_Advanced = X.XGroup<{
   sampler_name: X.XEnum<'KSampler.sampler_name'>
   guidanceType: X.XChoice<{
      CFG: X.XNumber
      DualCFG: X.XGroup<{
         cfg: X.XNumber
         cfg_conds2_negative: X.XNumber
         dualCFGPositive2: X.XPrompt
      }>
      PerpNeg: X.XGroup<{
         cfg: X.XNumber
         negCfg: X.XNumber
      }>
   }>
   sigmasType: X.XChoice<{
      basic: X.XGroup<{
         denoise: X.XNumber
         steps: X.XNumber
         scheduler: X.XEnum<'KSampler.scheduler'>
      }>
      AlignYourStep: X.XGroup<{
         denoise: X.XNumber
         steps: X.XNumber
         modelType: X.XEnum<'AlignYourStepsScheduler.model_type'>
      }>
      karrasCustom: X.XGroup<{
         steps: X.XNumber
         sigma_max: X.XNumber
         sigma_min: X.XNumber
         rho: X.XNumber
      }>
      ExponentialCustom: X.XGroup<{
         steps: X.XNumber
         sigma_max: X.XNumber
         sigma_min: X.XNumber
      }>
      polyexponentialCustom: X.XGroup<{
         steps: X.XNumber
         sigma_max: X.XNumber
         sigma_min: X.XNumber
         rho: X.XNumber
      }>
      SDTurbo: X.XGroup<{
         steps: X.XNumber
         denoise: X.XNumber
      }>
      VPScheduler: X.XGroup<{
         steps: X.XNumber
         beta_d: X.XNumber
         beta_min: X.XNumber
         eps_s: X.XNumber
      }>
   }>
   seed: X.XSeed
   textEncoderType: X.XChoice<{
      CLIP: X.XGroup<{}>
      SDXL: X.XGroup<{}>
      SD3: X.XGroup<{}>
      FLUX: X.XGroup<{}>
   }>
}>

// UI -----------------------------------------------------------
export function ui_sampler_advanced(p?: {
   denoise?: number
   steps?: number
   cfg?: number
   sampler_name?: Comfy.Slots['KSampler.sampler_name']
   scheduler?: Comfy.Slots['KSampler.scheduler']
   startCollapsed?: boolean
   sharedSampler?: boolean
}): UI_Sampler_Advanced {
   const form: X.Builder = getCurrentForm()
   return form.fields(
      {
         sampler_name: p?.sharedSampler
            ? // ⏸️ shared_samplerName()
              form.enum['KSampler.sampler_name']({
                 label: 'Sampler',
                 default: 'dpmpp_sde',
              })
            : form.enum['KSampler.sampler_name']({
                 label: 'Sampler',
                 default: p?.sampler_name ?? 'euler',
              }),
         guidanceType: form.choice(
            {
               CFG: form.float({
                  step: 1,
                  label: 'CFG',
                  min: 0,
                  max: 100,
                  softMax: 10,
                  default: p?.cfg ?? 6,
               }),
               DualCFG: form.fields({
                  cfg: form.float({
                     step: 1,
                     label: 'CFG',
                     min: 0,
                     max: 100,
                     softMax: 10,
                     default: p?.cfg ?? 6,
                  }),
                  cfg_conds2_negative: form.float({
                     step: 1,
                     label: 'CFG 2 Negative',
                     min: 0,
                     max: 100,
                     softMax: 10,
                     default: p?.cfg ?? 6,
                  }),
                  dualCFGPositive2: form.prompt({
                     default: ['highly detailed, masterpiece, best quality,'].join('\n'),
                     icon: 'mdiAlphabeticalVariant',
                     box: { base: { hue: 150, chroma: 0.05 } },
                  }),
               }),
               PerpNeg: form.fields({
                  cfg: form.float({
                     step: 1,
                     label: 'CFG',
                     min: 0,
                     max: 100,
                     softMax: 10,
                     default: p?.cfg ?? 6,
                  }),
                  negCfg: form.float({
                     step: 1,
                     label: 'Negative CFG',
                     min: 0,
                     max: 100,
                     softMax: 10,
                     default: p?.cfg ?? 6,
                  }),
               }),
            },
            { default: { CFG: true }, appearance: 'tab', collapsed: false },
         ),
         // cfg: form.float({ step: 1, label: 'CFG', min: 0, max: 100, softMax: 10, default: p?.cfg ?? 6 }),
         //denoise: form.float({ step: 0.1, min: 0, max: 1, default: p?.denoise ?? 1, label: 'Denoise' }),
         sigmasType: form.choice(
            {
               basic: form.fields({
                  denoise: form.float({
                     step: 0.1,
                     min: 0,
                     max: 1,
                     default: p?.denoise ?? 1,
                     label: 'Denoise',
                  }),
                  steps: form.int({
                     step: 20,
                     default: p?.steps ?? 20,
                     label: 'Steps',
                     min: 0,
                     softMax: 100,
                  }),
                  scheduler: form.enum['KSampler.scheduler']({
                     label: 'Scheduler',
                     default: p?.scheduler ?? 'karras',
                  }),
               }),
               AlignYourStep: form.fields({
                  denoise: form.float({
                     step: 0.1,
                     min: 0,
                     max: 1,
                     default: p?.denoise ?? 1,
                     label: 'Denoise',
                  }),
                  steps: form.int({ step: 1, default: p?.steps ?? 10, label: 'Steps', min: 0, softMax: 100 }),
                  modelType: form.enum['AlignYourStepsScheduler.model_type']({ default: 'SDXL' }),
               }),
               karrasCustom: form.auto.KarrasScheduler(),
               ExponentialCustom: form.auto.ExponentialScheduler(),
               polyexponentialCustom: form.auto.PolyexponentialScheduler(),
               SDTurbo: form.auto.SDTurboScheduler(),
               VPScheduler: form.auto.VPScheduler(),
            },
            { appearance: 'tab', collapsed: false },
         ),
         seed: form.seed({}),
         textEncoderType: form.choice(
            {
               CLIP: form.group({}),
               SDXL: form.group({}),
               SD3: form.group({}),
               FLUX: form.group({}),
            },
            { appearance: 'tab' },
         ),
         // steps: form.int({ step: 10, default: p?.steps ?? 20, label: 'Steps', min: 0, softMax: 100 }),
      },
      {
         toSummary: ({ value: ui }): string => {
            let sigmas: string = ''
            if (ui.sigmasType.basic) {
               sigmas = 'basic'
            } else if (ui.sigmasType.AlignYourStep) {
               sigmas = 'AYS'
            }
            if (ui.sigmasType.karrasCustom) {
               sigmas = 'karrasCustom'
            }
            if (ui.sigmasType.ExponentialCustom) {
               sigmas = 'exponentialCustom'
            }
            if (ui.sigmasType.polyexponentialCustom) {
               sigmas = 'polyexponentialCustom'
            }
            let guidance: string = ''
            let cfg: string = ''
            if (ui.guidanceType.CFG) {
               guidance = 'CFG'
               cfg = String(ui.guidanceType.CFG)
            } else if (ui.guidanceType.DualCFG) {
               guidance = 'Dual CFG'
               cfg =
                  String(ui.guidanceType.DualCFG.cfg) +
                  '/' +
                  String(ui.guidanceType.DualCFG.cfg_conds2_negative)
            }
            if (ui.guidanceType.PerpNeg) {
               guidance = 'PerpNeg'
               cfg = String(ui.guidanceType.PerpNeg.cfg + '/' + ui.guidanceType.PerpNeg.negCfg)
            }

            return `sigmas:${sigmas} guide:${guidance} cfg:${cfg} `
         },
         icon: 'mdiTimerSandComplete',
         // box: { base: { hue: 300, chroma: 0.1 } },
         label: 'Sampler',
         startCollapsed: p?.startCollapsed ?? false,
         presets: [
            {
               label: 'SD3',
               icon: 'mdiStar',
               apply: (w): void => {
                  w.value = {
                     guidanceType: { CFG: 4.5 },
                     sigmasType: { basic: { denoise: 1, steps: 28, scheduler: 'sgm_uniform' } },
                     sampler_name: 'dpmpp_2m',
                     seed: 42,
                     textEncoderType: { SD3: {} },
                  }
               },
            },
            {
               label: 'FLUX',
               icon: 'mdiStar',
               apply: (w): void => {
                  w.value = {
                     guidanceType: { CFG: 3.5 },
                     sigmasType: { basic: { denoise: 1, steps: 28, scheduler: 'simple' } },
                     sampler_name: 'euler',
                     seed: 42,
                     textEncoderType: { FLUX: {} },
                  }
               },
            },
         ],
      },
   )
}

// CTX -----------------------------------------------------------
export type Ctx_sampler_advanced = {
   ckpt: Comfy.Signal['MODEL']
   clip: Comfy.Signal['CLIP']
   latent: Comfy.Signal['LATENT']
   positive: string | Comfy.Signal['CONDITIONING']
   negative: string | Comfy.Signal['CONDITIONING']
   width?: number
   height?: number
   preview?: boolean
   cfg?: number //for flux
   vae: Comfy.Signal['VAE']
}

export const encodeText = (
   run: Runtime,
   clip: Comfy.Signal['CLIP'],
   text: string,
   encodingType: 'SDXL' | 'CLIP' | 'FLUX' | 'SD3',
   cfg?: number,
   width?: number,
   height?: number,
): Comfy.Signal['CONDITIONING'] => {
   const graph = run.nodes
   if (encodingType == 'FLUX' && !cfg) {
      cfg = 3.5 //default cfg in case not passed
   }
   const condition =
      encodingType == 'SDXL'
         ? graph.CLIPTextEncodeSDXL({
              clip: clip,
              text_g: text,
              text_l: text,
              width: width ?? 1024,
              height: height ?? 1024,
              target_width: width ?? 1024,
              target_height: height ?? 1024,
           })
         : encodingType == 'FLUX'
           ? graph.CLIPTextEncodeFlux({
                clip: clip,
                clip_l: text,
                t5xxl: text,
                guidance: cfg,
             })
           : graph.CLIPTextEncode({
                clip: clip,
                text: text,
             })

   return condition
}
// RUN -----------------------------------------------------------
export const run_sampler_advanced = (
   run: Runtime,
   ui: OutputFor<typeof ui_sampler_advanced>,
   ctx: Ctx_sampler_advanced,
   blankLatent?: boolean,
): { output: Comfy.Signal['LATENT']; denoised_output: Comfy.Signal['LATENT'] } => {
   const graph = run.nodes
   const ckpt = ctx.ckpt
   const posCondition2string = ui.guidanceType.DualCFG
      ? run_prompt({ prompt: ui.guidanceType.DualCFG.dualCFGPositive2, printWildcards: true })
      : undefined
   // flow.output_text(`run_sampler with seed : ${opts.seed}`)
   let posCondition: Comfy.Signal['CONDITIONING']
   let negCondition: Comfy.Signal['CONDITIONING']
   let posCondition2: Comfy.Signal['CONDITIONING'] | undefined
   if (
      (ui.textEncoderType.CLIP || ui.textEncoderType.SD3) &&
      typeof ctx.positive === 'string' &&
      typeof ctx.negative === 'string'
   ) {
      posCondition = encodeText(run, ctx.clip, ctx.positive, 'CLIP', ctx.width, ctx.height)
      negCondition = encodeText(run, ctx.clip, ctx.negative, 'CLIP', ctx.width, ctx.height)
      if (posCondition2string)
         posCondition2 = encodeText(
            run,
            ctx.clip,
            posCondition2string.promptIncludingBreaks,
            'CLIP',
            ctx.width,
            ctx.height,
         )
      //special negative condition for SD3
      if (ui.textEncoderType.SD3) {
         negCondition = graph.ConditioningCombine({
            conditioning_1: graph.ConditioningSetTimestepRange({
               conditioning: graph.ConditioningZeroOut({ conditioning: negCondition }),
               start: 0.1,
               end: 1.0,
            }),
            conditioning_2: graph.ConditioningSetTimestepRange({
               conditioning: negCondition,
               start: 0,
               end: 0.1,
            }),
         })
         if (posCondition2string) console.log('ERROR: Dual CFG not tested or st up for flux')
      }
   } else if (
      ui.textEncoderType.SDXL &&
      typeof ctx.positive === 'string' &&
      typeof ctx.negative === 'string'
   ) {
      posCondition = encodeText(run, ctx.clip, ctx.positive, 'SDXL', ctx.width, ctx.height)
      negCondition = encodeText(run, ctx.clip, ctx.negative, 'SDXL', ctx.width, ctx.height)
      if (posCondition2string)
         posCondition2 = encodeText(
            run,
            ctx.clip,
            posCondition2string.promptIncludingBreaks,
            'SDXL',
            ctx.width,
            ctx.height,
         )
   } else if (
      ui.textEncoderType.FLUX &&
      typeof ctx.positive === 'string' &&
      typeof ctx.negative === 'string'
   ) {
      posCondition = encodeText(run, ctx.clip, ctx.positive, 'FLUX', ctx.width, ctx.height)
      negCondition = encodeText(run, ctx.clip, ctx.negative, 'FLUX', ctx.width, ctx.height)
      if (posCondition2string) console.log('ERROR: Dual CFG not tested or st up for flux')
   } else {
      posCondition = ctx.positive as Comfy.Signal['CONDITIONING']
      negCondition = ctx.negative as Comfy.Signal['CONDITIONING']
   }

   const noise = graph.RandomNoise({ noise_seed: ui.seed }).outputs.NOISE
   let guider: Comfy.Signal['GUIDER']
   if (ui.guidanceType.DualCFG) {
      if (!posCondition2) throw new Error('Second conditioning not defined')
      guider = graph.DualCFGGuider({
         model: ckpt,
         cond1: posCondition,
         cond2: posCondition2,
         negative: negCondition,
         cfg_conds: ui.guidanceType.DualCFG.cfg,
         cfg_cond2_negative: ui.guidanceType.DualCFG.cfg_conds2_negative,
      })
   } else if (ui.guidanceType.PerpNeg)
      guider = graph.PerpNegGuider({
         model: ckpt,
         positive: posCondition,
         negative: negCondition,
         empty_conditioning: graph.CLIPTextEncode({ clip: ctx.clip, text: '' }),
         cfg: ui.guidanceType.PerpNeg.cfg,
         neg_scale: ui.guidanceType.PerpNeg.negCfg,
      })
   else if (ui.guidanceType.CFG)
      if (ui.textEncoderType.FLUX) {
         guider = graph.BasicGuider({
            model: ckpt,
            conditioning: posCondition,
            //atm there isn't really a way to encode negative conditioning on flux that I'm aware of
         })
      } else {
         guider = graph.CFGGuider({
            model: ckpt,
            positive: posCondition,
            negative: negCondition,
            cfg: ui.guidanceType.CFG,
         })
      }
   else throw new Error('❌ Guider type not known')

   let sigmas: Comfy.Signal['SIGMAS']
   if (ui.sigmasType.basic) {
      sigmas = graph.BasicScheduler({
         scheduler: ui.sigmasType.basic.scheduler,
         steps: ui.sigmasType.basic.steps,
         denoise: blankLatent ? 1 : ui.sigmasType.basic.denoise,
         model: ckpt,
      })
   } else if (ui.sigmasType.AlignYourStep) {
      sigmas = graph.AlignYourStepsScheduler({
         model_type: ui.sigmasType.AlignYourStep.modelType,
         denoise: blankLatent ? 1 : ui.sigmasType.AlignYourStep.denoise,
         steps: ui.sigmasType.AlignYourStep.steps,
      })
   } else if (ui.sigmasType.karrasCustom) {
      sigmas = graph.KarrasScheduler(ui.sigmasType.karrasCustom)
   } else if (ui.sigmasType.ExponentialCustom) {
      sigmas = graph.ExponentialScheduler(ui.sigmasType.ExponentialCustom)
   } else if (ui.sigmasType.polyexponentialCustom) {
      sigmas = graph.PolyexponentialScheduler(ui.sigmasType.polyexponentialCustom)
   } else if (ui.sigmasType.VPScheduler) {
      sigmas = graph.VPScheduler(ui.sigmasType.VPScheduler)
   } else if (ui.sigmasType.SDTurbo) {
      sigmas = graph.SDTurboScheduler({ model: ckpt, ...ui.sigmasType.SDTurbo })
   } else {
      throw new Error('❌ Sigmas type not known')
   }

   const SamplerCustom = graph.SamplerCustomAdvanced({
      noise: noise,
      guider: guider,
      sampler: graph.KSamplerSelect({ sampler_name: ui.sampler_name }),
      sigmas: sigmas,
      latent_image: ctx.latent,
   })

   return {
      output: SamplerCustom.outputs.output,
      denoised_output: SamplerCustom.outputs.denoised_output,
   }
}
