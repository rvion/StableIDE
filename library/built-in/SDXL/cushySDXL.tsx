import { _cushySDXLLayout } from './_cushySDXLLayout'
import { _cushySDXLRun } from './_cushySDXLRun'
import { type $CushySDXLUI, _cushySDXLSchema } from './_cushySDXLSchema'

export type $CushySDXLUIField = $CushySDXLUI['$Field']

app<$CushySDXLUIField>({
   metadata: {
      name: 'Cushy SDXL',
      illustration: 'library/built-in/_illustrations/mc.jpg',
      description: 'An example app to play with various stable diffusion technologies. Feel free to contribute improvements to it.', // prettier-ignore
   },
   ui: _cushySDXLSchema,
   layout: _cushySDXLLayout(),
   run: _cushySDXLRun,
})

/* ------------ */
const noobAIUrls = {
   noobAI: 'https://noobai.com',
   noobAI2: 'https://noobai.com',
}

app<$CushySDXLUIField>({
   metadata: {
      name: 'NoobAI',
      illustration: 'library/built-in/noobai.webp',
      description: 'Laxhar Dream Lab SDXL NOOB', // prettier-ignore
      help: [
         //
         `[NoobXL](https://civitai.com/models/833294) is the upcoming amazing anime image generation model. based on [Illustrious-xl](https://civitai.com/models/795765/illustrious-xl), and continued trained by Laxhar Lab.`,
         `[Usage Guide](https://civitai.com/articles/8962/noobai-xl-quick-guide)`,
      ].join('\n'),
   },
   ui: _cushySDXLSchema,
   layout: _cushySDXLLayout(),
   run: _cushySDXLRun,
})
