import type { OutputFor } from '../_prefabs/_prefabs'

import { bang } from '../../../src/csuite/utils/bang'
import {
   run_cnet_IPAdapter,
   ui_subform_IPAdapter,
   type UI_subform_IPAdapter,
} from '../_ipAdapter/prefab_ipAdapter_base'
import {
   run_cnet_IPAdapterFaceID,
   ui_IPAdapterFaceID,
   type UI_IPAdapterFaceID,
} from '../_ipAdapter/prefab_ipAdapter_face'
import { run_mask, ui_mask, type UI_Mask } from '../_prefabs/prefab_mask'
import { run_cnet_canny, ui_subform_Canny, type UI_subform_Canny } from './prefab_cnet_canny'
import { run_cnet_Depth, ui_subform_Depth, type UI_subform_Depth } from './prefab_cnet_depth'
import { run_cnet_Lineart, ui_subform_Lineart, type UI_subform_Lineart } from './prefab_cnet_lineart'
import { run_cnet_Normal, ui_subform_Normal, type UI_subform_Normal } from './prefab_cnet_normal'
import { run_cnet_openPose, ui_subform_OpenPose, type UI_subform_OpenPose } from './prefab_cnet_openPose'
import { run_cnet_Scribble, ui_subform_Scribble, type UI_subform_Scribble } from './prefab_cnet_scribble'
import { run_cnet_Sketch, ui_subform_Sketch, type UI_subform_Sketch } from './prefab_cnet_sketch'
import { run_cnet_SoftEdge, ui_subform_SoftEdge, type UI_subform_SoftEdge } from './prefab_cnet_softEdge'
import { run_cnet_Tile, ui_subform_Tile, type UI_subform_Tile } from './prefab_cnet_tile'

// 🅿️ CNET UI -----------------------------------------------------------
export type UI_cnet = X.XLink<
   X.XBool,
   X.XList<
      X.XGroup<{
         image: X.XImage
         mask: UI_Mask
         resize: X.XBool
         applyDuringUpscale: X.Bool
         cnets: X.XChoices<{
            IPAdapter: UI_subform_IPAdapter
            FaceID: UI_IPAdapterFaceID
            Pose: UI_subform_OpenPose
            Canny: UI_subform_Canny
            Depth: UI_subform_Depth
            Normal: UI_subform_Normal
            Tile: UI_subform_Tile
            Scribble: UI_subform_Scribble
            Lineart: UI_subform_Lineart
            SoftEdge: UI_subform_SoftEdge
            Sketch: UI_subform_Sketch
         }>
      }>
   >
>

export function ui_cnet(): UI_cnet {
   const form: X.Builder = getCurrentForm()

   const applyDuringUpscale2 = form.bool({
      description: 'Use the controlnet conditioning for the upscale pass if enabled',
      label2: 'Apply during upscale',
      label: false,
      default: false,
   })

   const cnetList = form.with(applyDuringUpscale2, (applyDuringUpscale) =>
      form
         .list({
            label: 'ControlNets',
            icon: 'mdiCompass',
            // box: { base: { hue: 90, chroma: 0.1 } },
            description: `Instructional resources:\nhttps://github.com/lllyasviel/ControlNet\nhttps://stable-diffusion-art.com/controlnet/`,
            element: () =>
               form.group({
                  label: 'Controlnet Image',
                  items: {
                     image: form.image({}),
                     mask: ui_mask()
                        .addRequirements([
                           {
                              type: 'customNodesByNameInCushy',
                              nodeName: 'Advanced-ControlNet.ACN_AdvancedControlNetApply',
                           },
                        ])
                        .withConfig({ description: 'Applies controlnet only to the masked area.' }),
                     resize: form.bool({ default: true }),
                     applyDuringUpscale: applyDuringUpscale,
                     cnets: form.choices(
                        {
                           IPAdapter: ui_subform_IPAdapter(), // 🟢
                           FaceID: ui_IPAdapterFaceID(), //      🟢
                           Pose: ui_subform_OpenPose(), //       🟢
                           Canny: ui_subform_Canny(), //         🟢
                           Depth: ui_subform_Depth(), //         🟢
                           Normal: ui_subform_Normal(), //       🟢
                           Tile: ui_subform_Tile(), //           🟢
                           Scribble: ui_subform_Scribble(), //   🟢
                           Lineart: ui_subform_Lineart(), //     🟢
                           SoftEdge: ui_subform_SoftEdge(), //   🟢
                           Sketch: ui_subform_Sketch(), //       🟢
                        },
                        { label: false, border: false, appearance: 'tab', placeholder: 'ControlNets...' },
                     ),
                  },
               }),
         })
         .addRequirements([
            { type: 'customNodesByTitle', title: `ComfyUI's ControlNet Auxiliary Preprocessors` },
         ]),
   )
   return cnetList
   // return form.groupOpt({
   //     items: ({
   //         applyDuringUpscale: applyDuringUpscale.hidden(), // so value is accessible at runtime
   //         controlNetList: cnetList,
   //     }),
   // })
}

// RUN -----------------------------------------------------------
export type Cnet_args = {
   positive: Comfy.Signal['CONDITIONING']
   negative: Comfy.Signal['CONDITIONING']
   width: number
   height: number
   ckptPos: Comfy.Signal['MODEL']
}

export type Cnet_return = {
   cnet_positive: Comfy.Signal['CONDITIONING']
   cnet_negative: Comfy.Signal['CONDITIONING']
   post_cnet_positive: Comfy.Signal['CONDITIONING']
   post_cnet_negative: Comfy.Signal['CONDITIONING']
   ckpt_return: Comfy.Signal['MODEL']
}

export async function run_cnet(
   //
   opts: OutputFor<typeof ui_cnet>,
   ctx: Cnet_args,
): Promise<Cnet_return> {
   const run = getCurrentRun()
   const cnetList = opts // opts?.controlNetList
   const args: Cnet_args = { ...ctx }

   if (cnetList) {
      for (const cnetImage of cnetList) {
         let image: Comfy.Signal['IMAGE'] = (await run.loadImageAnswer(cnetImage.image))._IMAGE
         const mask: Comfy.Signal['MASK'] | null = await run_mask(cnetImage.mask)
         const { width, height } = ctx
         const resolution = Math.min(width, height)

         // TODO: make configurable
         if (cnetImage.resize) {
            const scaledCnetNode = run.nodes.ImageScale({
               image,
               width,
               height,
               upscale_method: 'lanczos',
               crop: 'center',
            })
            image = scaledCnetNode._IMAGE
         }

         const { IPAdapter, FaceID, Canny, Depth, Normal, Lineart, Pose, Scribble, SoftEdge, Tile, Sketch } =
            cnetImage.cnets
         // IPAdapter ===========================================================
         if (IPAdapter) {
            const ip_adapter_result = run_cnet_IPAdapter(IPAdapter, ctx, image)
            args.ckptPos = ip_adapter_result.ip_adapted_model
         }
         // IPAdapter ===========================================================
         if (FaceID) {
            const ip_adapter_result = run_cnet_IPAdapterFaceID(FaceID, ctx, image)
            args.ckptPos = ip_adapter_result.ip_adapted_model
         }
         // CANNY ===========================================================
         if (Canny) {
            const y = run_cnet_canny(Canny, image, resolution)
            const startAt = Canny.advanced.startAtStepPercent
            const endAt = Canny.advanced.endAtStepPercent
            _apply_cnet(args, Canny.strength, startAt, endAt, y.image, y.cnet_name, mask)
         }
         // POSE ===========================================================
         if (Pose) {
            const y = run_cnet_openPose(Pose, image, resolution)
            const startAt = Pose.advanced.startAtStepPercent
            const endAt = Pose.advanced.endAtStepPercent
            _apply_cnet(args, Pose.strength, startAt, endAt, y.image, y.cnet_name, mask)
         }
         // DEPTH ===========================================================
         if (Depth) {
            const y = run_cnet_Depth(Depth, image, resolution)
            const startAt = Depth.advanced.startAtStepPercent
            const endAt = Depth.advanced.endAtStepPercent
            _apply_cnet(args, Depth.strength, startAt, endAt, y.image, y.cnet_name, mask)
         }
         // Normal ===========================================================
         if (Normal) {
            const y = run_cnet_Normal(Normal, image, resolution)
            const startAt = Normal.advanced.startAtStepPercent
            const endAt = Normal.advanced.endAtStepPercent
            _apply_cnet(args, Normal.strength, startAt, endAt, y.image, y.cnet_name, mask)
         }
         // Tile ===========================================================
         if (Tile) {
            const y = run_cnet_Tile(Tile, image, resolution)
            const startAt = Tile.advanced.startAtStepPercent
            const endAt = Tile.advanced.endAtStepPercent
            _apply_cnet(args, Tile.strength, startAt, endAt, y.image, y.cnet_name, mask)
         }
         // Scribble ===========================================================
         if (Scribble) {
            const y = run_cnet_Scribble(Scribble, image, resolution)
            const startAt = Scribble.advanced.startAtStepPercent
            const endAt = Scribble.advanced.endAtStepPercent
            _apply_cnet(args, Scribble.strength, startAt, endAt, y.image, y.cnet_name, mask)
         }
         // Lineart ===========================================================
         if (Lineart) {
            const y = run_cnet_Lineart(Lineart, image, resolution)
            const startAt = Lineart.advanced.startAtStepPercent
            const endAt = Lineart.advanced.endAtStepPercent
            _apply_cnet(args, Lineart.strength, startAt, endAt, y.image, y.cnet_name, mask)
         }
         // SoftEdge ===========================================================
         if (SoftEdge) {
            const y = run_cnet_SoftEdge(SoftEdge, image, resolution)
            const startAt = SoftEdge.advanced.startAtStepPercent
            const endAt = SoftEdge.advanced.endAtStepPercent
            _apply_cnet(args, SoftEdge.strength, startAt, endAt, y.image, y.cnet_name, mask)
         }
         // Sketch ===========================================================
         if (Sketch) {
            const y = run_cnet_Sketch(Sketch, image)
            const startAt = Sketch.advanced.startAtStepPercent
            const endAt = Sketch.advanced.endAtStepPercent
            _apply_cnet(args, Sketch.strength, startAt, endAt, y.image, y.cnet_name, mask)
         }
         // MLSD ===========================================================
         // Reference (do we need this? it is basically ipadapter) ===========================================================
         // Segmentation ===========================================================
         // Shuffle ===========================================================
         // Color Grid ===========================================================
         // Inpainting ===========================================================
      }
   }

   return {
      // transformed ckpt
      ckpt_return: args.ckptPos,

      // transformed conditionnings
      cnet_positive: args.positive,
      cnet_negative: args.negative,

      // forward either the original or the transformed conditioning
      post_cnet_positive: opts?.[0]?.applyDuringUpscale //
         ? args.positive
         : ctx.positive, // generally upscales are cleaner if not controlled
      post_cnet_negative: opts?.[0]?.applyDuringUpscale //
         ? args.negative
         : ctx.negative,
   }
}

const _apply_cnet = (
   args: Cnet_args,
   //
   strength: number,
   startPct: number,
   endPct: number,
   image: Comfy.Signal['IMAGE'],
   cnet_name: Comfy.Slots['ControlNetLoader.control_net_name'],
   mask: Comfy.Signal['MASK'] | null,
): void => {
   const run = getCurrentRun()
   const graph = run.nodes
   const cnet_node = mask
      ? // @ts-expect-error
        graph.ACN_AdvancedControlNetApply({
           strength: strength ?? 1,
           positive: args.positive,
           negative: args.negative,
           image: /* 🔴 */ bang(image),
           control_net: graph.DiffControlNetLoader({
              model: run.AUTO,
              control_net_name: /* 🔴 */ bang(cnet_name),
           }),
           start_percent: startPct,
           end_percent: endPct,
           mask_optional: mask ?? undefined,
        })
      : graph.ControlNetApplyAdvanced({
           strength: strength ?? 1,
           positive: args.positive,
           negative: args.negative,
           image: /* 🔴 */ bang(image),
           control_net: graph.DiffControlNetLoader({
              model: run.AUTO,
              control_net_name: /* 🔴 */ bang(cnet_name),
           }),
           start_percent: startPct,
           end_percent: endPct,
        })
   args.positive = cnet_node.outputs.positive
   args.negative = cnet_node.outputs.negative
}
