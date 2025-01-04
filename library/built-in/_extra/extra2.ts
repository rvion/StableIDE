import { output_demo_summary } from '../_prefabs/prefab_markdown'
import {
   run_addFancyWatermarkToAllImage,
   run_watermark_v1,
   ui_watermark_v1,
   type UI_watermark_v1,
} from '../_prefabs/prefab_watermark'
import { CustomView3dCan } from '../_views/View_3d_TinCan'
import { CustomViewSpriteSheet } from '../_views/View_Spritesheets'

export type $extra2 = X.XChoices<{
   gaussianSplat: X.XEmpty
   summary: X.XEmpty
   displayAsBeerCan: X.XEmpty
   displayAsSpriteSheet: X.XEmpty
   watermark: UI_watermark_v1
   fancyWatermark: X.XEmpty
   makeAVideo: X.XEmpty
}>

export function extra2(): $extra2 {
   const b = getCurrentForm()
   return b.choices(
      {
         gaussianSplat: b.empty({ icon: 'mdiDotsHexagon' }),
         summary: b.empty({ icon: 'mdiLanguageMarkdown', description: 'outputs a markdown summary about the execution and outputs' }), // prettier-ignore
         displayAsBeerCan: b.empty({ icon: 'mdiBeerOutline' }),
         displayAsSpriteSheet: b.empty({ icon: 'mdiMovie' }),
         watermark: ui_watermark_v1(),
         fancyWatermark: b.empty({ icon: 'mdiWatermark' }),
         makeAVideo: b.empty({ icon: 'mdiMessageVideo', description: 'generate a video from all the generated images in that step ' }), // prettier-ignore
      },
      { /* appearance: 'tab', */ icon: 'mdiAlien' },
   )
}

export async function eval_extra2(p: $extra2['$Value']): Promise<void> {
   const run = getCurrentRun()

   if (p?.gaussianSplat) run.output_GaussianSplat({ url: '' })
   if (p?.summary) output_demo_summary(run)
   if (p.displayAsBeerCan) run.output_custom({ view: CustomView3dCan, params: { imageID: run.lastImage?.id } }); // prettier-ignore
   if (p.displayAsSpriteSheet) run.output_custom({ view: CustomViewSpriteSheet, params: { imageID: run.lastImage?.id } }); // prettier-ignore
   if (p.watermark) await run_watermark_v1(p.watermark, run.lastImage)
   if (p.fancyWatermark) await run_addFancyWatermarkToAllImage()
   if (p?.makeAVideo) await run.Videos.output_video_ffmpegGeneratedImagesTogether(undefined, 2)
}
