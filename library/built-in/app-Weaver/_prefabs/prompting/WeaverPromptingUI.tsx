import type { IconName } from '../../../../../src/csuite/icons/icons'
import type { $WeaverPromptList } from './WeaverPrompting'

import { observer } from 'mobx-react-lite'

import { StackCardUI, type StackData } from '../prefab_Stack'

export const StackPromptingUI = observer(function StackPromptingUI_(p: {
   field: $WeaverPromptList['$Field']
   datafield: StackData['$Field']
   stackField: X.XList<StackData>['$Field']
   stackIndex: number
}) {
   const activePrompt = p.field.Prompts.items[p.field.ActiveIndex.value]
   const index = p.stackIndex
   const prompts = p.field
   const theme = cushy.preferences.theme.value
   return (
      <StackCardUI
         key={index}
         field={p.datafield}
         stackField={p.stackField}
         stackIndex={index}
         icon={p.field.icon ?? undefined}
      >
         <div tw='py-1'>
            <UY.list.BlenderLike<typeof prompts.fields.prompts> //
               activeIndex={prompts.value.activeIndex}
               field={prompts.fields.prompts}
               renderItem={(item, index) => {
                  const conditioningIcon: IconName = index == 0 ? 'mdiArrowDown' : 'mdiFormatListGroupPlus'
                  const hasPrompt = item.fields.prompt.text != ''
                  const active = prompts.value.activeIndex == index
                  const positive = item.value.positive
                  return (
                     <UY.Misc.Frame
                        roundness={theme.global.roundness}
                        tw={['flex items-center overflow-clip', !hasPrompt && 'opacity-50']}
                        hover
                        key={item.id}
                        onMouseDown={() => (prompts.ActiveIndex.value = index)}
                        base={positive ? {} : { chroma: 0.1, hue: 0 }}
                        border={positive ? {} : active ? { contrast: 0.1, chromaBlend: 10, hue: 0 } : {}}
                        style={{
                           borderStyle: positive ? 'solid' : 'dashed',
                        }}
                     >
                        <UY.boolean.default
                           tw='!border-none !bg-transparent'
                           square
                           display={'button'}
                           toggleGroup='h8024gt024gh24gbu024gb0'
                           // TODO(bird_d/ui/theme/fix): contrast here needs to be take from text, but the run_tint stuff can't be used in apps
                           //    text={{ contrast: 0.5, hue: 90 }}
                           icon={positive ? 'mdiPlus' : 'mdiMinus'}
                           value={positive}
                           onValueChange={() => {
                              item.value.positive = !positive
                           }}
                           onMouseDown={(ev) => {
                              ev.stopPropagation()
                              ev.preventDefault()
                           }}
                        />
                        <span
                           tw={[
                              'line-clamp-1 w-full flex-grow px-1',
                              !item.fields.enabled.value && hasPrompt && 'opacity-50',
                           ]}
                        >
                           {item.fields.name.value == ''
                              ? hasPrompt
                                 ? item.fields.prompt.text
                                 : 'Empty Prompt'
                              : item.fields.name.value}
                        </span>
                        <div tw='flex-none'>
                           <UY.IkonOf name={conditioningIcon} />
                        </div>
                        <div tw='w-2' />
                        <div tw='flex-none'>
                           {hasPrompt ? (
                              <UY.Misc.Checkbox
                                 square
                                 // disabled={!hasPrompt}
                                 toggleGroup='prompt'
                                 value={item.fields.enabled.value}
                                 onValueChange={(v) => (item.fields.enabled.value = v)}
                                 tooltip={'Whether or not the prompt effects the generation'}
                              />
                           ) : (
                              <UY.Misc.Frame
                                 icon='mdiAlert'
                                 size='input'
                                 square
                                 tooltip='This will have no effect because prompt is empty'
                              />
                           )}
                        </div>
                     </UY.Misc.Frame>
                  )
               }}
            />
         </div>

         <UY.Misc.Button
            hover
            tw='w-full !content-start !items-center !justify-start !border-none !bg-transparent py-[15px] pl-3.5 text-center'
            icon={p.field.fields.showEditor.value ? 'mdiChevronDown' : 'mdiChevronRight'}
            onMouseDown={(e) => {
               if (e.button != 0) {
                  return
               }
               p.field.fields.showEditor.toggle()
            }}
         >
            Editor
         </UY.Misc.Button>

         {p.field.fields.showEditor.value && (
            <UY.Misc.Frame tw='gap-2 ' col>
               {activePrompt ? (
                  <>
                     <UY.string.input field={activePrompt.fields.name} />

                     <UY.boolean.default
                        toggleGroup='y802w34ty80we4th80er0erh8008'
                        value={activePrompt.value.enabled}
                        onValueChange={(v) => (activePrompt.value.enabled = v)}
                        widgetLabel='Prompt Enabled'
                        text='Prompt Enabled'
                        // Tooltip needs to be gathered from the field
                        tooltip='Whether or not the prompt effects the generation'
                        // display='button'
                        expand
                     />
                     <UY.Misc.ResizableFrame tw='!bg-transparent'>
                        <UY.group.Default tw='flex-1' field={activePrompt} />
                     </UY.Misc.ResizableFrame>
                  </>
               ) : (
                  <>No prompt</>
               )}
            </UY.Misc.Frame>
         )}
      </StackCardUI>
   )
})
