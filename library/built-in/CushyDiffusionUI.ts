import { ui_cnet, type UI_cnet } from './_controlNet/prefab_cnet'
import { ui_IPAdapterV2, type UI_IPAdapterV2 } from './_ipAdapter/prefab_ipAdapter_baseV2'
import { ui_IPAdapterFaceIDV2, type UI_IPAdapterFaceIDV2 } from './_ipAdapter/prefab_ipAdapter_faceV2'
import { ui_latent_v3, type UI_LatentV3 } from './_prefabs/prefab_latent_v3'
import { ui_model, type UI_Model } from './_prefabs/prefab_model'
import { ui_sampler_advanced, type UI_Sampler_Advanced } from './_prefabs/prefab_sampler_advanced'
import { ui_customSave, type UI_customSave } from './_prefabs/saveSmall'
import { sampleNegative, samplePrompts } from './samplePrompts'
import { extra, type UI_extra } from './UI_extra'

export type CushyDiffusionUI_ = X.XGroup<{
    positive: X.XPrompt
    negative: X.XPrompt
    model: UI_Model
    latent: UI_LatentV3
    sampler: UI_Sampler_Advanced
    customSave: X.XOptional<UI_customSave>
    controlnets: UI_cnet
    ipAdapter: X.XOptional<UI_IPAdapterV2>
    faceID: X.XOptional<UI_IPAdapterFaceIDV2>
    extra: UI_extra
}>

export function CushyDiffusionUI(ui: X.Builder): CushyDiffusionUI_ {
    return ui.fields({
        positive: ui.prompt({
            icon: 'mdiPlusBoxOutline',
            background: { hue: 150, chroma: 0.05 },
            default: samplePrompts.tree,
            presets: [
                //
                { label: 'Portrait', icon: 'mdiFaceWoman', apply: (w) => w.setText('portrait, face') },
                { label: 'Landscape', icon: 'mdiImageFilterHdr', apply: (w) => w.setText('landscape, nature') },
                { label: 'Tree', icon: 'mdiTree', apply: (w) => w.setText(samplePrompts.tree) },
                { label: 'Abstract', icon: 'mdiShape', apply: (w) => w.setText('abstract, art') },
            ],
        }),
        negative: ui.prompt({
            icon: 'mdiMinusBoxOutline',
            startCollapsed: true,
            default: 'bad quality, blurry, low resolution, pixelated, noisy',
            box: { base: { hue: 0, chroma: 0.05 } },
            presets: [
                { icon: 'mdiCloseOctagon', label: 'simple negative', apply: (w) => w.setText(sampleNegative.simpleNegative) },
                {
                    icon: 'mdiCloseOctagon',
                    label: 'simple negative + nsfw',
                    apply: (w) => w.setText(sampleNegative.simpleNegativeNsfw),
                },
            ],
        }),
        model: ui_model(),
        latent: ui_latent_v3(),
        sampler: ui_sampler_advanced(),
        customSave: ui_customSave().optional(true),
        controlnets: ui_cnet(),
        ipAdapter: ui_IPAdapterV2().optional(),
        faceID: ui_IPAdapterFaceIDV2().optional(),
        extra: extra(ui),
    })
}
