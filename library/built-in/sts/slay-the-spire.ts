/**
 * This is a CushyApp that allow anyone to generate a set of custom cards
 * For the slay-the-spire game
 */

import type { SelectOptionNoVal } from '../../../src/csuite/fields/selectOne/SelectOption'
import type { MediaImageL } from '../../../src/models/MediaImage'

import { bang } from '../../../src/csuite/utils/bang'
import {
   run_ipadapter_standalone,
   ui_ipadapter_standalone,
} from '../_ipAdapter/prefab_ipAdapter_base_standalone'
import { run_prompt } from '../_prefabs/prefab_prompt'
import { View_DeckOfCards } from '../_views/View_DeckOfCards'
import { evalModelSD15andSDXL, prefabModelSD15andSDXL } from '../SD15/_model_SD15_SDXL'
import { stsAssets } from './_stsAssets'
import { allCards } from './_stsCards'
import { drawCard } from './_stsDrawCard'
import { convertColors, convertKind, convertRarity } from './_stsHelpers'

const cardOptions: SelectOptionNoVal<string>[] = allCards.map((x) => {
   const color = convertColors(x.Color)
   const kind = convertKind(x.Type)
   const rarity = convertRarity(x.Rarity)
   const label = `${x.Name} ${color} ${kind} (${rarity})`
   return { id: x.ID ?? x.Name, label }
})

app({
   metadata: {
      name: 'slay-the-spire art-pack generator',
      description: 'SlayTheSpire (STS) art-pack generator',
   },
   ui: (b) =>
      b.fields({
         model: prefabModelSD15andSDXL(),
         ipadapter: ui_ipadapter_standalone().optional(),
         // positive: ui.string({ default: 'masterpiece, tree' }),
         seed: b.seed({}),
         mode: b.selectOneString(['xl', '1.5']),
         secondPass: b.bool(),
         //
         rarity: b.selectOneString(['uncommon', 'common', 'rare']).optional(),
         colors: b.selectOneString(['red', 'green', 'gray']).optional(),
         kind: b.selectOneString(['attack', 'power', 'skill']).optional(),
         cards: b.selectManyOptionIds(cardOptions, { appearance: 'select' }),
         llmModel: b.llmModel({ default: 'openai/gpt-4' }),
         max: b.int({ default: 3, min: 1, max: 100 }),
         promptPrefix: b.prompt(),
         promptSuffix: b.prompt(),
         character: b.prompt({ default: 'an elf-robot, with blue hairs' }),

         negative: b.prompt({ default: 'bad quality, blurry, low resolution, pixelated, noisy' }),
      }),
   run: async (run, ui) => {
      const W = 500
      const H = 380
      const workflow = run.workflow
      const graph = workflow.builder
      // eslint-disable-next-line prefer-const
      let { ckpt, clip, vae } = evalModelSD15andSDXL(ui.model)
      if (ui.ipadapter) ckpt = (await run_ipadapter_standalone(ui.ipadapter, ckpt)).ip_adapted_model
      const isXL = ui.mode === 'xl'
      const height = isXL ? H * 3 : H
      const width = isXL ? W * 3 : W
      const negativeText = ui.negative.compile({ onLora: () => {} }).promptIncludingBreaks
      const charX = run_prompt({ prompt: ui.character, ckpt })

      // list of stuff to run once the generation is done
      const AFTERGENERATION: (() => Promise<MediaImageL>)[] = []

      const store = run.Store.getOrCreate<Record<string, string>>({
         key: 'card-descriptions-7',
         scope: 'global',
         makeDefaultValue: () => ({}),
      })

      let startingSeed = ui.seed
      for (const x of allCards) {
         if (AFTERGENERATION.length >= ui.max) break
         // if cards are manually specified, only use those
         if (ui.cards.length > 0) {
            const match = ui.cards.includes(x.ID ?? x.Name)
            if (!match) continue
         }

         const color = convertColors(x.Color)
         const kind = convertKind(x.Type)
         const rarity = convertRarity(x.Rarity)
         const uid = `${x.ID ?? x.Name}-${color}-${kind}-${rarity}`

         console.log(`[🤠] `, color, kind, rarity)
         if (ui.rarity && ui.rarity !== rarity) continue
         if (ui.colors && ui.colors !== color) continue
         if (ui.kind && ui.kind !== kind) continue

         // ----------------------------

         const storedPrompts = store.get()
         const simplifiedDescription = x.Text.replaceAll(/[0-9[\]#]/g, '')
         const llmRequest = [
            `I need to illustrate my ${kind} skills`,
            `The name of the skill is ${x.Name}. and does read like that: "{${simplifiedDescription}}".`,
            `The illustration must illustrate the effect of the skill.`,
            `for context, the player is a ${charX.promptIncludingBreaks}. but the image must focus on the skill, not the character`,
            `The prompt must be less than 400 letters`,
         ].join('\n')
         const llmCacheKey = run.hash(ui.llmModel.id + llmRequest)
         let prompt: string = storedPrompts[llmCacheKey] ?? ''
         if (prompt === '') {
            const res = await run.LLM.expandPrompt(
               llmRequest,
               ui.llmModel.id,
               run.LLM.simpleSystemPromptNaturalLanguage,
            )
            prompt = res.prompt
            store.update({ json: { ...storedPrompts, [llmCacheKey]: prompt } })
         }
         const prefix = ui.promptPrefix
            ? run_prompt({ prompt: ui.promptPrefix, ckpt, clip }).promptIncludingBreaks
            : ''
         const suffix = ui.promptSuffix
            ? run_prompt({ prompt: ui.promptSuffix, ckpt, clip }).promptIncludingBreaks
            : ''
         prompt = prefix ? `${prefix}, (${x.Name} skill:1.1),  ${prompt}` : prompt
         prompt = suffix ? `${prompt}, ${suffix}` : prompt
         run.output_Markdown(
            [
               `# request:\n\n\`\`\`\n${llmRequest}\n\`\`\`\n`,
               `# prompt:\n\n\`\`\`\n${prompt}\n\`\`\`\n`,
            ].join('\n'),
         )
         const positiveCond = graph.CLIPTextEncode({ clip, text: prompt })
         const negativeCond = graph.CLIPTextEncode({ clip, text: negativeText })
         const seed = startingSeed++
         let latent: Comfy.Signal['LATENT'] = graph.EmptyLatentImage({ height, width })
         latent = graph.KSampler({
            seed,
            latent_image: latent,
            cfg: 8,
            model: charX.ckpt,
            sampler_name: 'euler_ancestral',
            scheduler: 'karras',
            positive: positiveCond,
            negative: negativeCond,
         })
         if (ui.secondPass) {
            if (!isXL) latent = graph.LatentUpscale({ samples: latent, crop: 'disabled', upscale_method: 'nearest-exact', height: H*2, width: W*2, }) // prettier-ignore
            latent = graph.KSampler({
                    seed, latent_image: latent, denoise: 0.58, steps: 10, model: charX.ckpt, sampler_name: 'ddim', scheduler: 'ddim_uniform',
                    positive: positiveCond,
                    negative: negativeCond,
                }) // prettier-ignore
         }

         // post processing
         let image: Comfy.Signal['IMAGE'] = graph.VAEDecode({ samples: latent, vae })
         if (ui.secondPass || isXL) image = graph['was.Image Resize']({ image: image, rescale_factor: 0.33, mode: 'rescale', resampling: 'lanczos', supersample: 'false', }) // prettier-ignore
         const maskL = await run.Images.createFromURL(bang(stsAssets[`mask-${kind}`]))
         const maskImg = await maskL.loadInWorkflow() //.loadInWorkflowAsMask('alpha')
         // image = graph.ImageCrop({ image, x: 0, y: 0, width: 500, height: 380 })
         image = graph.JoinImageWithAlpha({ alpha: maskImg, image: image })
         // image = graph.Prune_By_Mask({ image, mask: maskImg })
         graph.PreviewImage({ images: image }).storeAs(uid)
         // ----------------------------

         AFTERGENERATION.push(async (): Promise<MediaImageL> => {
            const illustration = run.Store.getImageStore(uid).imageOrCrash
            const finalCard = await drawCard({
               color,
               kind,
               rarity,
               cost: x.Cost,
               name: x.Name,
               text: x.Text, // 'deal 5 damage deal 5 damage deal 5 damage deal 5 damage deal 5 damage deal 5 damage deal 5 damage deal 5 damage deal 5 damage deal 5 damage deal 5 damage deal 5 damage ',
               illustration,
            })
            finalCard.addTag('sts-card', 'card', color, kind, rarity)
            return finalCard
         })
      }
      await workflow.sendPromptAndWaitUntilDone()
      const cards = await Promise.all(AFTERGENERATION.map((x) => x()))
      const cardIds = cards.map((image) => image.id)
      run.output_custom({ view: View_DeckOfCards, params: { images: cardIds } })
   },
})
