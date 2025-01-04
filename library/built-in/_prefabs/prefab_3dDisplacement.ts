import type { MediaImageL } from '../../../src/models/MediaImage'
import type { OutputFor } from './_prefabs'

import { exhaust } from '../../../src/csuite/utils/exhaust'

export type UI_3dDisplacement = X.XGroup<{
   normal: X.XSelectOne_<'MiDaS' | 'BAE' | 'None'>
   depth: X.XChoice<{
      MiDaS: X.XEmpty
      Zoe: X.XEmpty
      LeReS: X.XEmpty
      Marigold: ReturnType<X.Builder['auto']['Marigold.MarigoldDepthEstimation']>
   }>
}>

export function ui_3dDisplacement(): UI_3dDisplacement {
   const form = getCurrentForm()
   return form
      .group({
         icon: 'mdiRotate3d',
         label: '3D Displacement',
         items: {
            normal: form.selectOneString(['MiDaS', 'BAE', 'None'], {
               description: 'no Normal map may be better, bad model yields bumpy stuff',
               default: 'None',
            }),
            depth: form.choice(
               {
                  MiDaS: form.empty(),
                  Zoe: form.empty(),
                  LeReS: form.empty(),
                  Marigold: form.auto['Marigold.MarigoldDepthEstimation'](),
               },
               { default: 'Marigold', appearance: 'tab' },
            ),
         },
      })
      .addRequirements([
         //
         { type: 'customNodesByNameInCushy', nodeName: 'controlnet_aux.Zoe-DepthMapPreprocessor' },
         { type: 'customNodesByNameInCushy', nodeName: 'Marigold.MarigoldDepthEstimation' },
      ])
}

/** to output a 3d displacement map, once images are all ready */
export function run_Dispacement2(startImg: string | MediaImageL): void {
   const run = getCurrentRun()
   run.output_3dImage({ image: startImg, depth: 'depth', normal: 'normal' })
}

/** to add subgraph that will produce a depth and normal map */
export function run_Dispacement1(
   //
   show3d: OutputFor<typeof ui_3dDisplacement>,
   finalImage: Comfy.Signal['IMAGE'],
): void {
   const run = getCurrentRun()
   const graph = run.nodes
   run.add_previewImage(finalImage).storeAs('base')
   const depth = ((): Comfy.Signal['IMAGE'] => {
      if (show3d.depth.MiDaS) return graph['controlnet_aux.MiDaS-DepthMapPreprocessor']({ image: finalImage })
      if (show3d.depth.Zoe) return graph['controlnet_aux.Zoe-DepthMapPreprocessor']({ image: finalImage })
      if (show3d.depth.LeReS) return graph['controlnet_aux.LeReS-DepthMapPreprocessor']({ image: finalImage })
      if (show3d.depth.Marigold) return graph['Marigold.MarigoldDepthEstimation']({ image: finalImage })
      throw new Error('❌ show3d activated, but no depth option choosen')
   })()
   run.add_previewImage(depth).storeAs('depth')

   const normal = (():
      | Comfy.Node['controlnet_aux.MiDaS-NormalMapPreprocessor']
      | Comfy.Node['controlnet_aux.BAE-NormalMapPreprocessor']
      | Comfy.Node['EmptyImage'] => {
      if (show3d.normal === 'MiDaS')
         return graph['controlnet_aux.MiDaS-NormalMapPreprocessor']({ image: finalImage })
      if (show3d.normal === 'BAE')
         return graph['controlnet_aux.BAE-NormalMapPreprocessor']({ image: finalImage })
      if (show3d.normal === 'None') return graph.EmptyImage({ color: 0x7f7fff, height: 512, width: 512 })
      return exhaust(show3d.normal)
   })()
   run.add_previewImage(normal).storeAs('normal')
}
