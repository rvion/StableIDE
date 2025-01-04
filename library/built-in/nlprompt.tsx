import type { OpenRouter_ModelInfo } from '../../src/csuite/openrouter/OpenRouter_ModelInfo'

import { InputStringUI } from '../../src/csuite/input-string/InputStringUI'
import { LegacyFieldUI } from '../../src/panels/PanelPreferences/LegacyFieldUI'

const _defaultSystemPrompt = [
   `You are an assistant in charge of converting image prompt written in nataural language to sequence of danbooru tags, coma separated`,
   `Your answer must be arond 500 chars in length`,
   `Start with most important tags describing the prompt`,
   `ONLY answer with the prompt itself. DO NOT answer anything else. No Hello, no thanks, no signature, no nothing.`,
].join('\n')

app({
   ui: (b) =>
      b.fields({
         llmModels: b
            .llmModel()
            .list()
            .withConfig({
               uiui: (ui) =>
                  ui.set({
                     Body: () => (
                        <div>
                           {ui.field.defaultBody()}
                           <LegacyFieldUI label='OpenRouter API KEY'>
                              <InputStringUI
                                 icon='mdiKey'
                                 type='password'
                                 getValue={() => cushy.configFile.value.OPENROUTER_API_KEY ?? ''}
                                 setValue={(next) => cushy.configFile.update({ OPENROUTER_API_KEY: next })}
                              />
                           </LegacyFieldUI>
                        </div>
                     ),
                  }),
            }),
         customSystemMessage: b.group({
            startCollapsed: true,
            items: {
               system: b.string({
                  textarea: true,
                  default: _defaultSystemPrompt,
                  description:
                     'Try experimenting with the system prompt. You may get better results from different models depending on how specific the instructions are.',
               }),
            },
         }),
         topic: b.string({
            textarea: true,
            default: 'portrait of a sexy furry sheep princess',
            label: 'Prompt in Natural format',
         }),
         promptFromLlm2: b.textarea({ default: '' }),
      }),

   layout: (ui) => {
      ui.set('', { Decoration: null, Indent: null })
      ui.set(ui.field.PromptFromLlm2, { Header: UY.string.markdown })
   },
   run: async (sdk, conf) => {
      if (!sdk.LLM.isConfigured) {
         sdk.output_text(`Enter your api key in Config`)
         return
      }

      function formatResult(model: OpenRouter_ModelInfo, prompt: string): string {
         return `## ${model.name} (${model.top_provider.is_moderated ? '😇' : '😈'})\n\n${prompt}`
      }
      function outputLLMResult(model: OpenRouter_ModelInfo, prompt: string): string {
         const res = formatResult(model, prompt)
         sdk.output_text(res)
         return prompt
      }

      // ask LLM to generate
      const llmResults: string[] = await Promise.all(
         conf.llmModels.map((model) =>
            sdk.LLM.expandPrompt(conf.topic, model.id, conf.customSystemMessage.system) //
               .then((p) => outputLLMResult(model, p.prompt)),
         ),
      )
      const summaryTxt = conf.llmModels.map((model, ix) => formatResult(model, llmResults[ix]!)).join('\n\n')
      sdk.form.fields.promptFromLlm2.value = summaryTxt
      sdk.output_text(summaryTxt)
   },
})
