import type { DisplaySlotFn } from '../../../src/csuite-cushy/presenters/RenderTypes'
import type { $CushyWeaverUI } from './_WeaverSchema'

import { StackLatentUI } from './_prefabs/latent/WeaverLatentUI'
import { type $WeaverPromptList } from './_prefabs/prompting/WeaverPrompting'
import { StackPromptingUI } from './_prefabs/prompting/WeaverPromptingUI'

export function _cushyWeaverLayout(): Maybe<DisplaySlotFn<$CushyWeaverUI['$Field']>> {
   return (ui) => {
      ui.set({
         Shell: (uiui) => {
            const d = uiui.field
            return (
               <div tw='flex flex-1 flex-grow flex-col gap-1 overflow-auto'>
                  <UY.Misc.Frame row line align>
                     <UY.Misc.Button
                        icon='mdiPlus'
                        expand
                        base={{ contrast: 0.1 }}
                        onClick={(ev) => {
                           const con = uiui.field.Stack.addItem({
                              value: {
                                 name: `Prompting ${
                                    d.Stack.items.filter((f) => {
                                       return f.value.data?.prompting
                                    }).length
                                 }`,
                                 data: {},
                              },
                           })?.Data.child.enableBranch('prompting')
                           if (!con) {
                              return
                           }
                           const prompt = con.fields.prompts.first
                           if (!prompt) {
                              return
                           }

                           prompt.value.prompt.text = 'masterpiece'
                        }}
                        row
                     >
                        Prompting
                     </UY.Misc.Button>
                     <UY.Misc.Button
                        icon='mdiPlus'
                        expand
                        base={{ contrast: 0.1 }}
                        onClick={(ev) => {
                           const latent = uiui.field.Stack.addItem({
                              value: {
                                 name: `Latent ${
                                    d.Stack.items.filter((f) => {
                                       return f.value.data?.prompting
                                    }).length
                                 }`,
                                 data: {},
                              },
                           })?.Data.child.enableBranch('latent')
                           if (!latent) {
                              return
                           }
                        }}
                        row
                     >
                        Latent
                     </UY.Misc.Button>
                  </UY.Misc.Frame>
                  <div tw='flex flex-col gap-1'>
                     {d.Stack.items.map((field, index) => {
                        return field.Data.child.matchExhaustive({
                           prompting: (value: $WeaverPromptList['$Field']) => {
                              return (
                                 <StackPromptingUI
                                    //
                                    stackField={d.Stack}
                                    field={value}
                                    stackIndex={index}
                                    datafield={field}
                                 />
                              )
                           },
                           latent: (value) => {
                              return (
                                 <StackLatentUI
                                    dataField={field}
                                    stackField={d.Stack}
                                    field={value}
                                    stackIndex={index}
                                 />
                              )
                           },
                        })
                     })}
                  </div>
               </div>
            )
         },
      })
   }
}
