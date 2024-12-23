import type { Runtime } from '../../../src/runtime/Runtime'
import type { OutputFor } from './_prefabs'

// UI -----------------------------------------------------------
export type UI_Sampler = X.XGroup<{
   denoise: X.XNumber
   steps: X.XNumber
   cfg: X.XNumber
   seed: X.XSeed
   sampler_name: X.XEnum<'KSampler.sampler_name'>
   scheduler: X.XEnum<'KSampler.scheduler'>
}>

type UiSampleProps = {
   denoise?: number
   steps?: number
   cfg?: number
   sampler_name?: Comfy.Slots['KSampler.sampler_name']
   scheduler?: Comfy.Slots['KSampler.scheduler']
   startCollapsed?: boolean
}
export function ui_sampler(p?: UiSampleProps): UI_Sampler {
   const form: X.Builder = getCurrentForm()
   return form.fields(
      {
         denoise: form.float({ step: 0.1, min: 0, max: 1, default: p?.denoise ?? 1, label: 'Denoise' }),
         steps: form.int({ step: 10, default: p?.steps ?? 20, label: 'Steps', min: 0, softMax: 100 }),
         cfg: form.float({ step: 1, label: 'CFG', min: 0, max: 100, softMax: 10, default: p?.cfg ?? 7 }),
         seed: form.seed({}),
         sampler_name: form.enum['KSampler.sampler_name']({
            label: 'Sampler',
            default: p?.sampler_name ?? 'euler',
         }),
         scheduler: form.enum['KSampler.scheduler']({
            label: 'Scheduler',
            default: p?.scheduler ?? 'karras',
         }),
      },
      {
         icon: 'mdiTimerSandComplete',
         // box: { base: { hue: 120, chroma: 0.03 } },
         toSummary: ({ value: ui }): string => {
            return `denoise:${ui.denoise} steps:${ui.steps} cfg:${ui.cfg} sampler:${ui.sampler_name}/${ui.scheduler}`
         },
         startCollapsed: p?.startCollapsed ?? false,
         presets: [
            { label: 'default', apply: (w) => w.setPartialValue({ denoise: 1, steps: 20, cfg: 7 }) },
            { label: 'low changes', apply: (w) => w.setPartialValue({ denoise: 0.6, steps: 20, cfg: 5 }) },
         ],
         // actions: edit definition > current file
      },
   )
}

// CTX -----------------------------------------------------------
export type Ctx_sampler = {
   ckpt: Comfy.Signal['MODEL']
   clip: Comfy.Signal['CLIP']
   latent: Comfy.Signal['LATENT']
   positive: string | Comfy.Signal['CONDITIONING']
   negative: string | Comfy.Signal['CONDITIONING']
   preview?: boolean
   vae: Comfy.Signal['VAE']
}

// RUN -----------------------------------------------------------
export const run_sampler = (
   //
   run: Runtime,
   opts: OutputFor<typeof ui_sampler>,
   ctx: Ctx_sampler,
): { latent: Comfy.Node['KSampler'] } => {
   const graph = run.nodes
   // flow.output_text(`run_sampler with seed : ${opts.seed}`)
   const latent = graph.KSampler({
      model: ctx.ckpt,
      seed: opts.seed,
      latent_image: ctx.latent,
      cfg: opts.cfg,
      steps: opts.steps,
      sampler_name: opts.sampler_name,
      scheduler: opts.scheduler,
      denoise: opts.denoise,
      positive:
         typeof ctx.positive === 'string' //
            ? graph.CLIPTextEncode({ clip: ctx.clip, text: ctx.positive })
            : ctx.positive,
      negative:
         typeof ctx.negative === 'string' //
            ? graph.CLIPTextEncode({ clip: ctx.clip, text: ctx.negative })
            : ctx.negative,
   })
   // const image = graph.VAEDecode({
   //     vae: ctx.vae,
   //     samples: latent,
   // })
   if (ctx.preview)
      graph.PreviewImage({
         images: graph.VAEDecode({
            vae: ctx.vae,
            samples: latent,
         }),
      })
   return { latent }
}
