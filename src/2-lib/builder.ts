import * as rt from './runtime.ts'
// TYPES -------------------------------
type MODEL = rt.Signal<'MODEL'>
type INT = number
type FLOAT = number
type CONDITIONING = rt.Signal<'CONDITIONING'>
type LATENT = rt.Signal<'LATENT'>
type STRING = string
type CLIP = rt.Signal<'CLIP'>
type VAE = rt.Signal<'VAE'>
type IMAGE = rt.Signal<'IMAGE'>
type MASK = rt.Signal<'MASK'>
type CONTROL_NET = rt.Signal<'CONTROL_NET'>

// ENUMS -------------------------------
type enum_KSampler_sampler_name =
    | 'sample_euler'
    | 'sample_euler_ancestral'
    | 'sample_heun'
    | 'sample_dpm_2'
    | 'sample_dpm_2_ancestral'
    | 'sample_lms'
    | 'sample_dpm_fast'
    | 'sample_dpm_adaptive'
    | 'sample_dpmpp_2s_ancestral'
    | 'sample_dpmpp_sde'
    | 'sample_dpmpp_2m'
    | 'ddim'
    | 'uni_pc'
    | 'uni_pc_bh2'
type enum_KSampler_scheduler = 'karras' | 'normal' | 'simple' | 'ddim_uniform'
type enum_CheckpointLoader_config_name =
    | 'anything_v3.yaml'
    | 'v1-inference.yaml'
    | 'v1-inference_clip_skip_2.yaml'
    | 'v1-inference_clip_skip_2_fp16.yaml'
    | 'v1-inference_fp16.yaml'
    | 'v1-inpainting-inference.yaml'
    | 'v2-inference-v.yaml'
    | 'v2-inference-v_fp32.yaml'
    | 'v2-inference.yaml'
    | 'v2-inference_fp32.yaml'
    | 'v2-inpainting-inference.yaml'
type enum_CheckpointLoader_ckpt_name = 'AbyssOrangeMix2_hard.safetensors' | 'v1-5-pruned-emaonly.ckpt'
type enum_VAELoader_vae_name = 'vae-ft-mse-840000-ema-pruned.safetensors'
type enum_LatentUpscale_upscale_method = 'nearest-exact' | 'bilinear' | 'area'
type enum_LatentUpscale_crop = 'disabled' | 'center'
type enum_LoadImage_image = '4PGjFvX.png' | 'Fp2S_heacAErVip.webp' | 'example.png' | 'testcnet.jfif' | 'workflow.json'
type enum_LoadImageMask_channel = 'alpha' | 'red' | 'green' | 'blue'
type enum_KSamplerAdvanced_add_noise = 'enable' | 'disable'
type enum_KSamplerAdvanced_return_with_leftover_noise = 'disable' | 'enable'
type enum_LatentRotate_rotation = 'none' | '90 degrees' | '180 degrees' | '270 degrees'
type enum_LatentFlip_flip_method = 'x-axis: vertically' | 'y-axis: horizontally'
type enum_LoraLoader_lora_name = 'charturnerbetaLora_charturnbetalora.safetensors'
type enum_CLIPLoader_clip_name = never
type enum_ControlNetLoader_control_net_name = 'controlnetPreTrained_openposeV10.safetensors'

// NODES -------------------------------

// KSampler -------------------------------
export class KSampler extends rt.ComfyNode<KSampler_input> {
    static inputs = [
        { 'name': 'model', 'type': 'MODEL' },
        { 'name': 'seed', 'type': 'INT', 'opts': { 'default': 0, 'min': 0, 'max': 18446744073709552000 } },
        { 'name': 'steps', 'type': 'INT', 'opts': { 'default': 20, 'min': 1, 'max': 10000 } },
        { 'name': 'cfg', 'type': 'FLOAT', 'opts': { 'default': 8, 'min': 0, 'max': 100 } },
        { 'name': 'sampler_name', 'type': 'enum_KSampler_sampler_name' },
        { 'name': 'scheduler', 'type': 'enum_KSampler_scheduler' },
        { 'name': 'positive', 'type': 'CONDITIONING' },
        { 'name': 'negative', 'type': 'CONDITIONING' },
        { 'name': 'latent_image', 'type': 'LATENT' },
        { 'name': 'denoise', 'type': 'FLOAT', 'opts': { 'default': 1, 'min': 0, 'max': 1, 'step': 0.01 } },
    ]
    static outputs = [{ 'type': 'LATENT', 'name': 'LATENT' }]
    LATENT = new rt.Signal<'LATENT'>('LATENT')
}
export type KSampler_input = {
    model: MODEL
    seed: INT
    steps: INT
    cfg: FLOAT
    sampler_name: enum_KSampler_sampler_name
    scheduler: enum_KSampler_scheduler
    positive: CONDITIONING
    negative: CONDITIONING
    latent_image: LATENT
    denoise: FLOAT
}

// CheckpointLoader -------------------------------
export class CheckpointLoader extends rt.ComfyNode<CheckpointLoader_input> {
    static inputs = [{ 'name': 'config_name', 'type': 'enum_CheckpointLoader_config_name' }, {
        'name': 'ckpt_name',
        'type': 'enum_CheckpointLoader_ckpt_name',
    }]
    static outputs = [{ 'type': 'MODEL', 'name': 'MODEL' }, { 'type': 'CLIP', 'name': 'CLIP' }, {
        'type': 'VAE',
        'name': 'VAE',
    }]
    MODEL = new rt.Signal<'MODEL'>('MODEL')
    CLIP = new rt.Signal<'CLIP'>('CLIP')
    VAE = new rt.Signal<'VAE'>('VAE')
}
export type CheckpointLoader_input = {
    config_name: enum_CheckpointLoader_config_name
    ckpt_name: enum_CheckpointLoader_ckpt_name
}

// CLIPTextEncode -------------------------------
export class CLIPTextEncode extends rt.ComfyNode<CLIPTextEncode_input> {
    static inputs = [{ 'name': 'text', 'type': 'STRING', 'opts': { 'multiline': true, 'dynamic_prompt': true } }, {
        'name': 'clip',
        'type': 'CLIP',
    }]
    static outputs = [{ 'type': 'CONDITIONING', 'name': 'CONDITIONING' }]
    CONDITIONING = new rt.Signal<'CONDITIONING'>('CONDITIONING')
}
export type CLIPTextEncode_input = {
    text: STRING
    clip: CLIP
}

// VAEDecode -------------------------------
export class VAEDecode extends rt.ComfyNode<VAEDecode_input> {
    static inputs = [{ 'name': 'samples', 'type': 'LATENT' }, { 'name': 'vae', 'type': 'VAE' }]
    static outputs = [{ 'type': 'IMAGE', 'name': 'IMAGE' }]
    IMAGE = new rt.Signal<'IMAGE'>('IMAGE')
}
export type VAEDecode_input = {
    samples: LATENT
    vae: VAE
}

// VAEEncode -------------------------------
export class VAEEncode extends rt.ComfyNode<VAEEncode_input> {
    static inputs = [{ 'name': 'pixels', 'type': 'IMAGE' }, { 'name': 'vae', 'type': 'VAE' }]
    static outputs = [{ 'type': 'LATENT', 'name': 'LATENT' }]
    LATENT = new rt.Signal<'LATENT'>('LATENT')
}
export type VAEEncode_input = {
    pixels: IMAGE
    vae: VAE
}

// VAEEncodeForInpaint -------------------------------
export class VAEEncodeForInpaint extends rt.ComfyNode<VAEEncodeForInpaint_input> {
    static inputs = [{ 'name': 'pixels', 'type': 'IMAGE' }, { 'name': 'vae', 'type': 'VAE' }, {
        'name': 'mask',
        'type': 'MASK',
    }]
    static outputs = [{ 'type': 'LATENT', 'name': 'LATENT' }]
    LATENT = new rt.Signal<'LATENT'>('LATENT')
}
export type VAEEncodeForInpaint_input = {
    pixels: IMAGE
    vae: VAE
    mask: MASK
}

// VAELoader -------------------------------
export class VAELoader extends rt.ComfyNode<VAELoader_input> {
    static inputs = [{ 'name': 'vae_name', 'type': 'enum_VAELoader_vae_name' }]
    static outputs = [{ 'type': 'VAE', 'name': 'VAE' }]
    VAE = new rt.Signal<'VAE'>('VAE')
}
export type VAELoader_input = {
    vae_name: enum_VAELoader_vae_name
}

// EmptyLatentImage -------------------------------
export class EmptyLatentImage extends rt.ComfyNode<EmptyLatentImage_input> {
    static inputs = [
        { 'name': 'width', 'type': 'INT', 'opts': { 'default': 512, 'min': 64, 'max': 4096, 'step': 64 } },
        { 'name': 'height', 'type': 'INT', 'opts': { 'default': 512, 'min': 64, 'max': 4096, 'step': 64 } },
        { 'name': 'batch_size', 'type': 'INT', 'opts': { 'default': 1, 'min': 1, 'max': 64 } },
    ]
    static outputs = [{ 'type': 'LATENT', 'name': 'LATENT' }]
    LATENT = new rt.Signal<'LATENT'>('LATENT')
}
export type EmptyLatentImage_input = {
    width: INT
    height: INT
    batch_size: INT
}

// LatentUpscale -------------------------------
export class LatentUpscale extends rt.ComfyNode<LatentUpscale_input> {
    static inputs = [
        { 'name': 'samples', 'type': 'LATENT' },
        { 'name': 'upscale_method', 'type': 'enum_LatentUpscale_upscale_method' },
        { 'name': 'width', 'type': 'INT', 'opts': { 'default': 512, 'min': 64, 'max': 4096, 'step': 64 } },
        { 'name': 'height', 'type': 'INT', 'opts': { 'default': 512, 'min': 64, 'max': 4096, 'step': 64 } },
        { 'name': 'crop', 'type': 'enum_LatentUpscale_crop' },
    ]
    static outputs = [{ 'type': 'LATENT', 'name': 'LATENT' }]
    LATENT = new rt.Signal<'LATENT'>('LATENT')
}
export type LatentUpscale_input = {
    samples: LATENT
    upscale_method: enum_LatentUpscale_upscale_method
    width: INT
    height: INT
    crop: enum_LatentUpscale_crop
}

// SaveImage -------------------------------
export class SaveImage extends rt.ComfyNode<SaveImage_input> {
    static inputs = [{ 'name': 'images', 'type': 'IMAGE' }, {
        'name': 'filename_prefix',
        'type': 'STRING',
        'opts': { 'default': 'ComfyUI' },
    }]
    static outputs = []
}
export type SaveImage_input = {
    images: IMAGE
    filename_prefix: STRING
}

// LoadImage -------------------------------
export class LoadImage extends rt.ComfyNode<LoadImage_input> {
    static inputs = [{ 'name': 'image', 'type': 'enum_LoadImage_image' }]
    static outputs = [{ 'type': 'IMAGE', 'name': 'IMAGE' }]
    IMAGE = new rt.Signal<'IMAGE'>('IMAGE')
}
export type LoadImage_input = {
    image: enum_LoadImage_image
}

// LoadImageMask -------------------------------
export class LoadImageMask extends rt.ComfyNode<LoadImageMask_input> {
    static inputs = [{ 'name': 'image', 'type': 'enum_LoadImage_image' }, {
        'name': 'channel',
        'type': 'enum_LoadImageMask_channel',
    }]
    static outputs = [{ 'type': 'MASK', 'name': 'MASK' }]
    MASK = new rt.Signal<'MASK'>('MASK')
}
export type LoadImageMask_input = {
    image: enum_LoadImage_image
    channel: enum_LoadImageMask_channel
}

// ImageScale -------------------------------
export class ImageScale extends rt.ComfyNode<ImageScale_input> {
    static inputs = [
        { 'name': 'image', 'type': 'IMAGE' },
        { 'name': 'upscale_method', 'type': 'enum_LatentUpscale_upscale_method' },
        { 'name': 'width', 'type': 'INT', 'opts': { 'default': 512, 'min': 1, 'max': 4096, 'step': 1 } },
        { 'name': 'height', 'type': 'INT', 'opts': { 'default': 512, 'min': 1, 'max': 4096, 'step': 1 } },
        { 'name': 'crop', 'type': 'enum_LatentUpscale_crop' },
    ]
    static outputs = [{ 'type': 'IMAGE', 'name': 'IMAGE' }]
    IMAGE = new rt.Signal<'IMAGE'>('IMAGE')
}
export type ImageScale_input = {
    image: IMAGE
    upscale_method: enum_LatentUpscale_upscale_method
    width: INT
    height: INT
    crop: enum_LatentUpscale_crop
}

// ImageInvert -------------------------------
export class ImageInvert extends rt.ComfyNode<ImageInvert_input> {
    static inputs = [{ 'name': 'image', 'type': 'IMAGE' }]
    static outputs = [{ 'type': 'IMAGE', 'name': 'IMAGE' }]
    IMAGE = new rt.Signal<'IMAGE'>('IMAGE')
}
export type ImageInvert_input = {
    image: IMAGE
}

// ConditioningCombine -------------------------------
export class ConditioningCombine extends rt.ComfyNode<ConditioningCombine_input> {
    static inputs = [{ 'name': 'conditioning_1', 'type': 'CONDITIONING' }, {
        'name': 'conditioning_2',
        'type': 'CONDITIONING',
    }]
    static outputs = [{ 'type': 'CONDITIONING', 'name': 'CONDITIONING' }]
    CONDITIONING = new rt.Signal<'CONDITIONING'>('CONDITIONING')
}
export type ConditioningCombine_input = {
    conditioning_1: CONDITIONING
    conditioning_2: CONDITIONING
}

// ConditioningSetArea -------------------------------
export class ConditioningSetArea extends rt.ComfyNode<ConditioningSetArea_input> {
    static inputs = [
        { 'name': 'conditioning', 'type': 'CONDITIONING' },
        { 'name': 'width', 'type': 'INT', 'opts': { 'default': 64, 'min': 64, 'max': 4096, 'step': 64 } },
        { 'name': 'height', 'type': 'INT', 'opts': { 'default': 64, 'min': 64, 'max': 4096, 'step': 64 } },
        { 'name': 'x', 'type': 'INT', 'opts': { 'default': 0, 'min': 0, 'max': 4096, 'step': 64 } },
        { 'name': 'y', 'type': 'INT', 'opts': { 'default': 0, 'min': 0, 'max': 4096, 'step': 64 } },
        { 'name': 'strength', 'type': 'FLOAT', 'opts': { 'default': 1, 'min': 0, 'max': 10, 'step': 0.01 } },
    ]
    static outputs = [{ 'type': 'CONDITIONING', 'name': 'CONDITIONING' }]
    CONDITIONING = new rt.Signal<'CONDITIONING'>('CONDITIONING')
}
export type ConditioningSetArea_input = {
    conditioning: CONDITIONING
    width: INT
    height: INT
    x: INT
    y: INT
    strength: FLOAT
}

// KSamplerAdvanced -------------------------------
export class KSamplerAdvanced extends rt.ComfyNode<KSamplerAdvanced_input> {
    static inputs = [
        { 'name': 'model', 'type': 'MODEL' },
        { 'name': 'add_noise', 'type': 'enum_KSamplerAdvanced_add_noise' },
        { 'name': 'noise_seed', 'type': 'INT', 'opts': { 'default': 0, 'min': 0, 'max': 18446744073709552000 } },
        { 'name': 'steps', 'type': 'INT', 'opts': { 'default': 20, 'min': 1, 'max': 10000 } },
        { 'name': 'cfg', 'type': 'FLOAT', 'opts': { 'default': 8, 'min': 0, 'max': 100 } },
        { 'name': 'sampler_name', 'type': 'enum_KSampler_sampler_name' },
        { 'name': 'scheduler', 'type': 'enum_KSampler_scheduler' },
        { 'name': 'positive', 'type': 'CONDITIONING' },
        { 'name': 'negative', 'type': 'CONDITIONING' },
        { 'name': 'latent_image', 'type': 'LATENT' },
        { 'name': 'start_at_step', 'type': 'INT', 'opts': { 'default': 0, 'min': 0, 'max': 10000 } },
        { 'name': 'end_at_step', 'type': 'INT', 'opts': { 'default': 10000, 'min': 0, 'max': 10000 } },
        { 'name': 'return_with_leftover_noise', 'type': 'enum_KSamplerAdvanced_return_with_leftover_noise' },
    ]
    static outputs = [{ 'type': 'LATENT', 'name': 'LATENT' }]
    LATENT = new rt.Signal<'LATENT'>('LATENT')
}
export type KSamplerAdvanced_input = {
    model: MODEL
    add_noise: enum_KSamplerAdvanced_add_noise
    noise_seed: INT
    steps: INT
    cfg: FLOAT
    sampler_name: enum_KSampler_sampler_name
    scheduler: enum_KSampler_scheduler
    positive: CONDITIONING
    negative: CONDITIONING
    latent_image: LATENT
    start_at_step: INT
    end_at_step: INT
    return_with_leftover_noise: enum_KSamplerAdvanced_return_with_leftover_noise
}

// SetLatentNoiseMask -------------------------------
export class SetLatentNoiseMask extends rt.ComfyNode<SetLatentNoiseMask_input> {
    static inputs = [{ 'name': 'samples', 'type': 'LATENT' }, { 'name': 'mask', 'type': 'MASK' }]
    static outputs = [{ 'type': 'LATENT', 'name': 'LATENT' }]
    LATENT = new rt.Signal<'LATENT'>('LATENT')
}
export type SetLatentNoiseMask_input = {
    samples: LATENT
    mask: MASK
}

// LatentComposite -------------------------------
export class LatentComposite extends rt.ComfyNode<LatentComposite_input> {
    static inputs = [
        { 'name': 'samples_to', 'type': 'LATENT' },
        { 'name': 'samples_from', 'type': 'LATENT' },
        { 'name': 'x', 'type': 'INT', 'opts': { 'default': 0, 'min': 0, 'max': 4096, 'step': 8 } },
        { 'name': 'y', 'type': 'INT', 'opts': { 'default': 0, 'min': 0, 'max': 4096, 'step': 8 } },
        { 'name': 'feather', 'type': 'INT', 'opts': { 'default': 0, 'min': 0, 'max': 4096, 'step': 8 } },
    ]
    static outputs = [{ 'type': 'LATENT', 'name': 'LATENT' }]
    LATENT = new rt.Signal<'LATENT'>('LATENT')
}
export type LatentComposite_input = {
    samples_to: LATENT
    samples_from: LATENT
    x: INT
    y: INT
    feather: INT
}

// LatentRotate -------------------------------
export class LatentRotate extends rt.ComfyNode<LatentRotate_input> {
    static inputs = [{ 'name': 'samples', 'type': 'LATENT' }, {
        'name': 'rotation',
        'type': 'enum_LatentRotate_rotation',
    }]
    static outputs = [{ 'type': 'LATENT', 'name': 'LATENT' }]
    LATENT = new rt.Signal<'LATENT'>('LATENT')
}
export type LatentRotate_input = {
    samples: LATENT
    rotation: enum_LatentRotate_rotation
}

// LatentFlip -------------------------------
export class LatentFlip extends rt.ComfyNode<LatentFlip_input> {
    static inputs = [{ 'name': 'samples', 'type': 'LATENT' }, {
        'name': 'flip_method',
        'type': 'enum_LatentFlip_flip_method',
    }]
    static outputs = [{ 'type': 'LATENT', 'name': 'LATENT' }]
    LATENT = new rt.Signal<'LATENT'>('LATENT')
}
export type LatentFlip_input = {
    samples: LATENT
    flip_method: enum_LatentFlip_flip_method
}

// LatentCrop -------------------------------
export class LatentCrop extends rt.ComfyNode<LatentCrop_input> {
    static inputs = [
        { 'name': 'samples', 'type': 'LATENT' },
        { 'name': 'width', 'type': 'INT', 'opts': { 'default': 512, 'min': 64, 'max': 4096, 'step': 64 } },
        { 'name': 'height', 'type': 'INT', 'opts': { 'default': 512, 'min': 64, 'max': 4096, 'step': 64 } },
        { 'name': 'x', 'type': 'INT', 'opts': { 'default': 0, 'min': 0, 'max': 4096, 'step': 8 } },
        { 'name': 'y', 'type': 'INT', 'opts': { 'default': 0, 'min': 0, 'max': 4096, 'step': 8 } },
    ]
    static outputs = [{ 'type': 'LATENT', 'name': 'LATENT' }]
    LATENT = new rt.Signal<'LATENT'>('LATENT')
}
export type LatentCrop_input = {
    samples: LATENT
    width: INT
    height: INT
    x: INT
    y: INT
}

// LoraLoader -------------------------------
export class LoraLoader extends rt.ComfyNode<LoraLoader_input> {
    static inputs = [
        { 'name': 'model', 'type': 'MODEL' },
        { 'name': 'clip', 'type': 'CLIP' },
        { 'name': 'lora_name', 'type': 'enum_LoraLoader_lora_name' },
        { 'name': 'strength_model', 'type': 'FLOAT', 'opts': { 'default': 1, 'min': 0, 'max': 10, 'step': 0.01 } },
        { 'name': 'strength_clip', 'type': 'FLOAT', 'opts': { 'default': 1, 'min': 0, 'max': 10, 'step': 0.01 } },
    ]
    static outputs = [{ 'type': 'MODEL', 'name': 'MODEL' }, { 'type': 'CLIP', 'name': 'CLIP' }]
    MODEL = new rt.Signal<'MODEL'>('MODEL')
    CLIP = new rt.Signal<'CLIP'>('CLIP')
}
export type LoraLoader_input = {
    model: MODEL
    clip: CLIP
    lora_name: enum_LoraLoader_lora_name
    strength_model: FLOAT
    strength_clip: FLOAT
}

// CLIPLoader -------------------------------
export class CLIPLoader extends rt.ComfyNode<CLIPLoader_input> {
    static inputs = [{ 'name': 'clip_name', 'type': 'enum_CLIPLoader_clip_name' }, {
        'name': 'stop_at_clip_layer',
        'type': 'INT',
        'opts': { 'default': -1, 'min': -24, 'max': -1, 'step': 1 },
    }]
    static outputs = [{ 'type': 'CLIP', 'name': 'CLIP' }]
    CLIP = new rt.Signal<'CLIP'>('CLIP')
}
export type CLIPLoader_input = {
    clip_name: enum_CLIPLoader_clip_name
    stop_at_clip_layer: INT
}

// ControlNetApply -------------------------------
export class ControlNetApply extends rt.ComfyNode<ControlNetApply_input> {
    static inputs = [
        { 'name': 'conditioning', 'type': 'CONDITIONING' },
        { 'name': 'control_net', 'type': 'CONTROL_NET' },
        { 'name': 'image', 'type': 'IMAGE' },
        { 'name': 'strength', 'type': 'FLOAT', 'opts': { 'default': 1, 'min': 0, 'max': 10, 'step': 0.01 } },
    ]
    static outputs = [{ 'type': 'CONDITIONING', 'name': 'CONDITIONING' }]
    CONDITIONING = new rt.Signal<'CONDITIONING'>('CONDITIONING')
}
export type ControlNetApply_input = {
    conditioning: CONDITIONING
    control_net: CONTROL_NET
    image: IMAGE
    strength: FLOAT
}

// ControlNetLoader -------------------------------
export class ControlNetLoader extends rt.ComfyNode<ControlNetLoader_input> {
    static inputs = [{ 'name': 'control_net_name', 'type': 'enum_ControlNetLoader_control_net_name' }]
    static outputs = [{ 'type': 'CONTROL_NET', 'name': 'CONTROL_NET' }]
    CONTROL_NET = new rt.Signal<'CONTROL_NET'>('CONTROL_NET')
}
export type ControlNetLoader_input = {
    control_net_name: enum_ControlNetLoader_control_net_name
}

// DiffControlNetLoader -------------------------------
export class DiffControlNetLoader extends rt.ComfyNode<DiffControlNetLoader_input> {
    static inputs = [{ 'name': 'model', 'type': 'MODEL' }, {
        'name': 'control_net_name',
        'type': 'enum_ControlNetLoader_control_net_name',
    }]
    static outputs = [{ 'type': 'CONTROL_NET', 'name': 'CONTROL_NET' }]
    CONTROL_NET = new rt.Signal<'CONTROL_NET'>('CONTROL_NET')
}
export type DiffControlNetLoader_input = {
    model: MODEL
    control_net_name: enum_ControlNetLoader_control_net_name
}

// T2IAdapterLoader -------------------------------
export class T2IAdapterLoader extends rt.ComfyNode<T2IAdapterLoader_input> {
    static inputs = [{ 'name': 't2i_adapter_name', 'type': 'enum_CLIPLoader_clip_name' }]
    static outputs = [{ 'type': 'CONTROL_NET', 'name': 'CONTROL_NET' }]
    CONTROL_NET = new rt.Signal<'CONTROL_NET'>('CONTROL_NET')
}
export type T2IAdapterLoader_input = {
    t2i_adapter_name: enum_CLIPLoader_clip_name
}

// VAEDecodeTiled -------------------------------
export class VAEDecodeTiled extends rt.ComfyNode<VAEDecodeTiled_input> {
    static inputs = [{ 'name': 'samples', 'type': 'LATENT' }, { 'name': 'vae', 'type': 'VAE' }]
    static outputs = [{ 'type': 'IMAGE', 'name': 'IMAGE' }]
    IMAGE = new rt.Signal<'IMAGE'>('IMAGE')
}
export type VAEDecodeTiled_input = {
    samples: LATENT
    vae: VAE
}

// INDEX -------------------------------
export const nodes = {
    KSampler,
    CheckpointLoader,
    CLIPTextEncode,
    VAEDecode,
    VAEEncode,
    VAEEncodeForInpaint,
    VAELoader,
    EmptyLatentImage,
    LatentUpscale,
    SaveImage,
    LoadImage,
    LoadImageMask,
    ImageScale,
    ImageInvert,
    ConditioningCombine,
    ConditioningSetArea,
    KSamplerAdvanced,
    SetLatentNoiseMask,
    LatentComposite,
    LatentRotate,
    LatentFlip,
    LatentCrop,
    LoraLoader,
    CLIPLoader,
    ControlNetApply,
    ControlNetLoader,
    DiffControlNetLoader,
    T2IAdapterLoader,
    VAEDecodeTiled,
}
export type NodeType = keyof typeof nodes

// Entrypoint --------------------------
export class Comfy extends rt.ComfyBase {
    KSampler = (args: KSampler_input) => new KSampler(this, args)
    CheckpointLoader = (args: CheckpointLoader_input) => new CheckpointLoader(this, args)
    CLIPTextEncode = (args: CLIPTextEncode_input) => new CLIPTextEncode(this, args)
    VAEDecode = (args: VAEDecode_input) => new VAEDecode(this, args)
    VAEEncode = (args: VAEEncode_input) => new VAEEncode(this, args)
    VAEEncodeForInpaint = (args: VAEEncodeForInpaint_input) => new VAEEncodeForInpaint(this, args)
    VAELoader = (args: VAELoader_input) => new VAELoader(this, args)
    EmptyLatentImage = (args: EmptyLatentImage_input) => new EmptyLatentImage(this, args)
    LatentUpscale = (args: LatentUpscale_input) => new LatentUpscale(this, args)
    SaveImage = (args: SaveImage_input) => new SaveImage(this, args)
    LoadImage = (args: LoadImage_input) => new LoadImage(this, args)
    LoadImageMask = (args: LoadImageMask_input) => new LoadImageMask(this, args)
    ImageScale = (args: ImageScale_input) => new ImageScale(this, args)
    ImageInvert = (args: ImageInvert_input) => new ImageInvert(this, args)
    ConditioningCombine = (args: ConditioningCombine_input) => new ConditioningCombine(this, args)
    ConditioningSetArea = (args: ConditioningSetArea_input) => new ConditioningSetArea(this, args)
    KSamplerAdvanced = (args: KSamplerAdvanced_input) => new KSamplerAdvanced(this, args)
    SetLatentNoiseMask = (args: SetLatentNoiseMask_input) => new SetLatentNoiseMask(this, args)
    LatentComposite = (args: LatentComposite_input) => new LatentComposite(this, args)
    LatentRotate = (args: LatentRotate_input) => new LatentRotate(this, args)
    LatentFlip = (args: LatentFlip_input) => new LatentFlip(this, args)
    LatentCrop = (args: LatentCrop_input) => new LatentCrop(this, args)
    LoraLoader = (args: LoraLoader_input) => new LoraLoader(this, args)
    CLIPLoader = (args: CLIPLoader_input) => new CLIPLoader(this, args)
    ControlNetApply = (args: ControlNetApply_input) => new ControlNetApply(this, args)
    ControlNetLoader = (args: ControlNetLoader_input) => new ControlNetLoader(this, args)
    DiffControlNetLoader = (args: DiffControlNetLoader_input) => new DiffControlNetLoader(this, args)
    T2IAdapterLoader = (args: T2IAdapterLoader_input) => new T2IAdapterLoader(this, args)
    VAEDecodeTiled = (args: VAEDecodeTiled_input) => new VAEDecodeTiled(this, args)
}
