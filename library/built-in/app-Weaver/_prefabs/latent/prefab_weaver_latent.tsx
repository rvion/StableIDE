import type { IconName } from '../../../../../src/csuite/icons/icons'

import {
   run_LatentShapeGenerator,
   ui_LatentShapeGenerator,
   type UI_LatentShapeGenerator,
} from '../../../shapes/prefab_shapes'

export type $WeaverLatent = X.XGroup<{
   mode: X.XChoices<{
      empty: X.XGroup<{}>
      image: X.XGroup<{}>
      random: X.XGroup<{}>
   }>
   batchSize: X.XNumber
   image: X.XImage
   enableResize: X.XBool
   dimensions: X.XGroup<{
      width: X.XNumber
      height: X.XNumber
   }>
   location: X.XGroup<{
      x: X.XNumber
      y: X.XNumber
   }>
   scale: X.XGroup<{
      x: X.XNumber
      y: X.XNumber
   }>
}>

export function weaverLatent(b: X.Builder): $WeaverLatent {
   return b.fields(
      {
         mode: b.choice({
            empty: b.fields({}),
            image: b.fields({}),
            random: b.fields({}),
         }),
         batchSize: b.int({ label: 'batchSize', step: 1, default: 1, min: 1, max: 8 }),
         image: b.image(),
         enableResize: b.bool({ default: true }),
         dimensions: b.fields({
            width: b.int({ default: 768, step: 16 }),
            height: b.int({ default: 1024, step: 16 }),
         }),
         location: b.fields({
            x: b.int({ step: 16 }),
            y: b.int({ step: 16 }),
         }),
         scale: b.fields({
            x: b.float({ default: 1.0 }),
            y: b.float({ default: 1.0 }),
         }),
      },
      { icon: 'mdiStarThreePoints' },
   )
}

// x: X.XNumber
// y: X.XNumber
// width: X.XNumber
// height: X.XNumber

// export const run_latent_v3 = async (p: {
//    //
//    opts: ReturnType<typeof $WEAVER_Latent>['$Value']
//    vae: Comfy.Signal['VAE']
// }): Promise<{
//    latent: Comfy.Signal['LATENT']
//    width: number
//    height: number
// }> => {
//    // init stuff
//    const run = getCurrentRun()
//    const graph = run.nodes
//    const opts = p.opts

//    // misc calculatiosn
//    let width: number
//    let height: number
//    let latent: Comfy.Signal['LATENT']

//    // case 1. start form image
//    if (opts.image) {
//       const _img = run.loadImage(opts.image.image.id)
//       let image: Comfy.Signal['IMAGE'] = await _img.loadInWorkflow()
//       if (opts.image.resize) {
//          image = graph['was.Image Resize']({ image, ...opts.image.resize })
//          if (opts.image.resize.mode === 'rescale') {
//             width = _img.width * opts.image.resize.rescale_factor
//             height = _img.height * opts.image.resize.rescale_factor
//          } else {
//             width = opts.image.resize.resize_width
//             height = opts.image.resize.resize_height
//          }
//       } else {
//          width = _img.width
//          height = _img.height
//       }

//       latent = graph.VAEEncode({ pixels: image, vae: p.vae })

//       if (opts.image.batchSize > 1) {
//          latent = graph.RepeatLatentBatch({
//             samples: latent,
//             amount: opts.image.batchSize,
//          })
//       }
//    }

//    // case 2. start form empty latent
//    else if (opts.emptyLatent) {
//       width = opts.emptyLatent.size.width
//       height = opts.emptyLatent.size.height
//       latent = graph.EmptyLatentImage({
//          batch_size: opts.emptyLatent.batchSize ?? 1,
//          height: height,
//          width: width,
//       })
//    }

//    // case 3. start from random
//    else if (opts.random) {
//       const result = await run_LatentShapeGenerator(opts.random, p.vae)
//       latent = result.latent
//       width = result.width
//       height = result.height
//    }

//    // default ca
//    else {
//       throw new Error('no latent')
//    }

//    // return everything
//    return { latent, width, height }
// }

// mountROOT: form.linked((self) => self.consume(chan)!), //
// mountROOT2: form.linked(chan.getOrThrow), //
// mountA: form.linked((self) => self.consume(chan)!.fields.a),
// test: form.selectOne({
//     choices: (self) => {
//         // case 2: LOG (B+3) 🟢
//         const x = self.consume(chan)
//         const b = x?.fields.b.value ?? 0
//         return []
//     },
// }),
