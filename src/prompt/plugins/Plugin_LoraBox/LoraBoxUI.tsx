import type { Prompt_Lora, Prompt_WeightedExpression } from '../../grammar/grammar.practical'
import type { WidgetPromptUISt } from '../../WidgetPromptUISt'

import { observer } from 'mobx-react-lite'

import { openExternal } from '../../../app/layout/openExternal'
import { MessageErrorUI } from '../../../csuite'
import { Button } from '../../../csuite/button/Button'
import { MenuDivider } from '../../../csuite/dropdown/MenuDivider'
import { Frame } from '../../../csuite/frame/Frame'
import { InputNumberUI } from '../../../csuite/input-number/InputNumberUI'
import { InputStringUI } from '../../../csuite/input-string/InputStringUI'
import { SelectUI } from '../../../csuite/select/SelectUI'

export const LoraBoxUI = observer(function LoraBoxUI_(p: {
   //
   uist: WidgetPromptUISt
   loraASTNode: Prompt_Lora
   weightedASTNode: Maybe<Prompt_WeightedExpression>
   onDelete: () => void
}) {
   const node = p.loraASTNode
   const loraName = node.name
   if (loraName == null) return <MessageErrorUI>error parsing lora</MessageErrorUI>
   const loraMetadata = cushy.configFile.value?.loraPrompts?.[loraName]
   const associatedText = loraMetadata?.text ?? ''
   const associatedUrl = loraMetadata?.url ?? ''
   const weighted = p.weightedASTNode
   const theme = cushy.preferences.theme.value

   // const numbers = def.ref.node.getChildren('Number')
   return (
      <Frame base={5} tw='rounded p-2'>
         <Frame //Join Lora selection and Delete Button
            align
            expand
            border={theme.global.border}
            dropShadow={theme.global.shadow}
            roundness={theme.global.roundness}
         >
            <SelectUI<string>
               value={() => loraName}
               options={() => cushy.schema.getLoras()}
               onOptionToggled={(val) => {
                  node.nameNode?.setText(val)
                  // p.uist.editorView?.dispatch({
                  //     changes: {
                  //         from: node.from,
                  //         to: node.to,
                  //         insert: val.indexOf(' ') > -1 ? `@"${val}"` : `@${val}`,
                  //     },
                  // })
               }}
               getLabelText={(t): string => t}
               OptionLabelUI={(v) => <div>{v}</div>}
            />
            <Button //
               tw='WIDGET-FIELD join-item w-8'
               size='xs'
               icon='mdiDeleteForever'
               onClick={p.onDelete}
            />
         </Frame>
         {/* {node.name}
                   <div tw='flex-0 flex-grow'></div>
                   <Button //
                       size='xs'
                       icon='mdiDeleteForever'
                       onClick={p.onDelete}
                       tw='h-full'
                   /> */}
         <MenuDivider />
         {/* {node.name} */}
         <div tw='flex w-full flex-grow flex-col items-center gap-1'>
            <div tw='flex w-full flex-grow flex-row gap-1'>
               <InputNumberUI
                  value={node.strength_model ?? 1}
                  mode='float'
                  step={0.1}
                  min={-2}
                  max={2}
                  hideSlider
                  text='Model Strength'
                  onValueChange={(v) => {
                     const num1 = node.getChild('Number', 0)
                     if (num1) num1.setNumber(v)
                     else {
                        if (node.nameEndsAt == null) return
                        p.uist.editorView?.dispatch({
                           changes: {
                              from: node.nameEndsAt,
                              to: node.nameEndsAt,
                              insert: `[${v.toString()}]`,
                           },
                        })
                     }
                  }}
               />
               <InputNumberUI
                  value={node.strength_clip ?? 1}
                  mode='float'
                  step={0.1}
                  min={-2}
                  max={2}
                  hideSlider
                  text='Clip Strength'
                  onValueChange={(v) => {
                     const num2 = node.getChild('Number', 1)
                     if (num2) num2.setNumber(v)
                     else {
                        const num1 = node.getChild('Number', 0)
                        if (num1 == null) return
                        p.uist.editorView?.dispatch({
                           changes: {
                              from: num1.to,
                              to: num1.to,
                              insert: `,${v.toString()}`,
                           },
                        })
                     }
                  }}
               />
            </div>
            <Frame //
               tw='w-full'
               align
               expand
               border={theme.global.border}
               dropShadow={theme.global.shadow}
               roundness={theme.global.roundness}
            >
               <InputStringUI
                  //
                  tw='flex-grow px-2'
                  type='text'
                  getValue={() => associatedText}
                  placeholder='Trigger Words'
                  setValue={(val) => {
                     cushy.configFile.update((prev) => {
                        // ensure prev.loraPrompts
                        if (!prev.loraPrompts) prev.loraPrompts = {}
                        const lp = prev.loraPrompts
                        // ensure entry for lora name
                        let entry = lp[loraName]
                        if (!entry) entry = lp[loraName] = { text: '' }
                        entry.text = val
                     })
                  }}
               />
               <InputNumberUI //
                  tooltip='Trigger word(s) strength'
                  value={weighted?.weight ?? 1.0}
                  mode='float'
                  step={0.1}
                  min={-2}
                  max={2}
                  hideSlider
                  text='Strength'
                  onValueChange={(v) => {
                     if (weighted) weighted.weight = v
                     else node.wrapWithWeighted(v)
                  }}
               />
            </Frame>
            <Frame
               //
               tw='w-full'
               align
               expand
               border={theme.global.border}
               dropShadow={theme.global.shadow}
               roundness={theme.global.roundness}
            >
               <InputStringUI // TODO(bird_d): Get this from the lora metadata itself?
                  type='text'
                  tw='w-full'
                  placeholder='Associated URL....'
                  getValue={() => associatedUrl}
                  setValue={(val) => {
                     cushy.configFile.update((prev) => {
                        // ensure prev.loraPrompts
                        if (!prev.loraPrompts) prev.loraPrompts = {}
                        const lp = prev.loraPrompts
                        // ensure entry for lora name
                        let entry = lp[loraName]
                        if (!entry) entry = lp[loraName] = { url: '' }
                        entry.url = val
                     })
                  }}
               />
               <Button
                  //
                  description='Open associated URL in external browser'
                  icon='mdiOpenInNew'
                  onClick={() => openExternal(associatedUrl)}
               />
            </Frame>
         </div>
      </Frame>
   )
})
