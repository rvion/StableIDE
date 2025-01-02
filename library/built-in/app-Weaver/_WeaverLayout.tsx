import type { DisplaySlotFn } from '../../../src/csuite-cushy/presenters/RenderTypes'
import type { Field_list } from '../../../src/csuite/fields/list/FieldList'
import type { IconName } from '../../../src/csuite/icons/icons'
import type { Field } from '../../../src/csuite/model/Field'
import type { $PromptList } from './_prefabs/prefab_PromptList'
import type { $CushyWeaverUI, StackData, StackType } from './_WeaverSchema'

import { observer } from 'mobx-react-lite'

export const StackCardUI = observer(function StackCardUI_(p: {
   field: StackData['$Field']
   stackField: X.XList<StackData>['$Field']
   stackIndex: number
   icon?: IconName
   children?: React.ReactNode
}) {
   const theme = cushy.preferences.theme.value

   const data = p.stackField
   return (
      <UY.Misc.Frame
         tw='overflow-clip'
         base={{ contrast: 0.1 }}
         border={theme.groups.border}
         roundness={theme.global.roundness}
      >
         <UY.Misc.Frame tw='select-none !gap-2 px-2 py-1' line>
            <UY.Misc.Button
               tw='!border-none !bg-transparent'
               subtle
               square
               size='input'
               borderless
               icon={p.field.isCollapsed ? 'mdiChevronRight' : 'mdiChevronDown'}
               onClick={() => {
                  p.field.toggleCollapsed()
               }}
            />
            <UY.Misc.Frame square size='input' icon={p.icon} />
            <UY.Misc.Frame
               //
               align
               border
               expand
               line
               row
               dropShadow={theme.global.shadow}
               roundness={theme.global.roundness}
            >
               <UY.string.input field={p.field.Name} />
               <UY.boolean.default
                  display='button'
                  square
                  size={'input'}
                  toggleGroup='stackEnable'
                  // active={p.field.Data.active}
                  value={p.field.Data.active}
                  onValueChange={(value) => {
                     p.field.Data.setActive(value)
                  }}
                  icon={p.field.Data.active ? 'mdiCheckboxBlankCircle' : 'mdiCheckboxBlankCircleOutline'}
               />
            </UY.Misc.Frame>
            <UY.Misc.Button
               tw='!border-none !bg-transparent'
               subtle
               square
               size='input'
               icon={'mdiClose'}
               onClick={() => {
                  p.stackField.removeItemAt(p.stackIndex)
               }}
            />
         </UY.Misc.Frame>
         {!p.field.isCollapsed && p.children}
      </UY.Misc.Frame>
   )
})

export const StackConditioningUI = observer(function StackConditioningUI_(p: {
   field: $PromptList['$Field']
   datafield: StackData['$Field']
   stackField: X.XList<StackData>['$Field']
   stackIndex: number
}) {
   const activePrompt = p.field.Prompts.items[p.field.ActiveIndex.value]
   const index = p.stackIndex
   const prompts = p.field
   return (
      <StackCardUI
         key={index}
         field={p.datafield}
         stackField={p.stackField}
         stackIndex={index}
         icon={p.datafield.icon ?? undefined}
      >
         <div tw='py-1'>
            <UY.list.BlenderLike<typeof prompts.fields.prompts> //
               activeIndex={prompts.value.activeIndex}
               field={prompts.fields.prompts}
               renderItem={(item, index) => {
                  const conditioningIcon: IconName = index == 0 ? 'mdiArrowDown' : 'mdiFormatListGroupPlus'
                  const hasPrompt = item.fields.prompt.text != ''
                  return (
                     <UY.Misc.Frame
                        tw={['flex items-center', !hasPrompt && 'opacity-50']}
                        hover
                        key={item.id}
                        onMouseDown={() => (prompts.ActiveIndex.value = index)}
                     >
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

export function _cushyWeaverLayout(): Maybe<DisplaySlotFn<$CushyWeaverUI['$Field']>> {
   return (ui) => {
      ui.set({
         Shell: (uiui) => {
            const d = uiui.field
            return (
               <div tw='flex flex-1 flex-grow flex-col gap-1 overflow-auto'>
                  <UY.Misc.Button
                     icon='mdiPlus'
                     expand
                     base={{ contrast: 0.1 }}
                     onClick={(ev) => {
                        //
                        // uiui.field.Stack.removeAllItems()
                        const con = uiui.field.Stack.addItem({
                           value: {
                              name: `Conditioning ${
                                 d.Stack.items.filter((f) => {
                                    return f.value.data?.conditioning
                                 }).length
                              }`,
                              data: {},
                           },
                        })?.Data.child.enableBranch('conditioning')
                        if (!con) {
                           return
                        }
                        const prompt = con.fields.prompts.first
                        if (!prompt) {
                           return
                        }

                        prompt.value.prompt.text = 'masterpiece'

                        // uiui.field.Stack.addItem({ value: { data: promptList(ui) } })
                     }}
                     row
                  />
                  <div tw='flex flex-col gap-1'>
                     {d.Stack.items.map((field, index) => {
                        return field.Data.child.matchExhaustive({
                           conditioning: (value: $PromptList['$Field']) => {
                              const activePrompt = value.Prompts.items[value.value.activeIndex]
                              return (
                                 <StackConditioningUI
                                    //
                                    stackField={d.Stack}
                                    field={value}
                                    stackIndex={index}
                                    datafield={field}
                                 />
                              )
                           },
                           latent: (v) => {
                              return <>latent</>
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
