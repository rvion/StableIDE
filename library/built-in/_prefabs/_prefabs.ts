/**
 * This file contains all the prefabs that are used in the default card.
 *
 * naming convention:
 *
 * - `ui`  functions are prefixed with `ui_`
 * - `run` functions are prefixed with `run_`
 *
 * make sure you only impot types from this file
 * 🟢 import type {...} from '...'
 * ❌ import {...} from '...'`
 * */

// this should be a default
export type OutputFor<UIFn extends (...args: any[]) => { $Value: any }> = ReturnType<UIFn>['$Value']

export type UI_HighResFix = X.XGroup<{
   upscaleMethod: X.XSelectOne_<'regular' | 'Neural 1.5' | 'Neural XL'>
   scaleFactor: X.XNumber
   steps: X.XNumber
   denoise: X.XNumber
   saveIntermediaryImage: X.XBool
   useMainSampler: X.XBool
}>

export function ui_highresfix(): UI_HighResFix {
   const form = getCurrentForm()
   return form.group({
      label: 'High Res Fix',
      icon: 'mdiArrowExpandAll',
      box: { base: { hue: 220, chroma: 0.1 } },
      items: {
         // NNLatentUpscale: form.bool({
         //     default: false,
         //     label: 'NN Latent Upscale?',
         // }),
         upscaleMethod: form
            .selectOneString(['regular', 'Neural 1.5', 'Neural XL'], {
               appearance: 'tab',
               description: 'regular upscale add more noise, depend your objective. for a second pass to refine stuff, I think adding noise is better', // prettier-ignore
            })
            .addRequirements([
               { type: 'customNodesByURI', uri: 'https://github.com/Ttl/ComfyUi_NNLatentUpscale' },
            ]),

         scaleFactor: form.float({ default: 1.5, min: 0.5, max: 8, step: 1 }),
         steps: form.int({ default: 15, min: 0, softMax: 100, step: 10 }),
         denoise: form.float({ min: 0, default: 0.6, max: 1, step: 0.1 }),
         saveIntermediaryImage: form.bool({ default: true }),
         useMainSampler: form.bool({ default: true }),
      },
   })
}

// ---------------------------------------------------------
export type UI_Themes = X.XList<
   X.XGroup<{
      text: X.XString
      theme: X.XList<X.XGroup<{ text: X.XString }>>
   }>
>
export const ui_themes = (form: X.Builder): UI_Themes =>
   form.list({
      element: () =>
         form.group({
            layout: 'H',
            items: {
               text: form.string({ label: 'Main', textarea: true }), //textarea: true
               theme: form.list({
                  element: () =>
                     form.group({
                        layout: 'V',
                        items: {
                           text: form.string({ label: 'Theme', textarea: true }), //textarea: true
                        },
                     }),
               }),
            },
         }),
   })

// --------------------------------------------------------
export const util_expandBrances = (str: string): string[] => {
   const matches = str.match(/{([^{}]+)}/)
   if (!matches) return [str]
   const parts = matches[1]!.split(',')
   const result: Set<string> = new Set()
   for (const part of parts) {
      const expanded = util_expandBrances(str.replace(matches[0], part))
      expanded.forEach((item) => result.add(item))
   }
   return Array.from(result)
}

export const ui_vaeName = (form: X.Builder): X.XOptional<X.XEnum<'VAELoader.vae_name'>> =>
   form.enumOpt['VAELoader.vae_name']({ label: 'VAE' })

export const ui_modelName = (form: X.Builder): X.XEnum<'CheckpointLoaderSimple.ckpt_name'> =>
   form.enum['CheckpointLoaderSimple.ckpt_name']({ label: 'Checkpoint' })

const resolutions: Resolutions[] = [
   '1024x1024',
   '896x1152',
   '832x1216',
   '768x1344',
   '640x1536',
   '1152x862',
   '1216x832',
   '1344x768',
   '1536x640',
]
type Resolutions =
   | '1024x1024'
   | '896x1152'
   | '832x1216'
   | '768x1344'
   | '640x1536'
   | '1152x862'
   | '1216x832'
   | '1344x768'
   | '1536x640'

export const ui_resolutionPicker = (form: X.Builder): X.XSelectOne_<Resolutions> =>
   form.selectOneString(resolutions, { label: 'Resolution', description: 'Width x Height' })

/** allow to easilly pick a shape */
export const ui_shapePickerBasic = (form: X.Builder): X.XSelectOne_<'round' | 'square'> => {
   return form.selectOneString(['round', 'square'], { label: 'Shape' })
}
