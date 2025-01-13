import type { IconName } from '../../../../../src/csuite/icons/icons'
import type { $WeaverPromptList } from './WeaverPrompting'

import { observer } from 'mobx-react-lite'

import { POPUP } from '../../../../../src/widgets/misc/SimplePopUp'
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

   const [isDropZoneHovered, dropRef] = UY.DropZone({
      config: { shallow: true },
      Image: {
         onDrop: (item, monitor) => {
            const workflow = item.workflow
            if (!workflow) {
               return
            }

            const textArray: { name: string; text: string }[] = []
            workflow.nodes.forEach((node, index) => {
               if (node.inputs) {
                  Array.from(node.$schema.inputs).forEach((item) => {
                     if (item.typeName == 'STRING') {
                        textArray.push({
                           name: item.slotName,
                           text: node.inputs[item.nameInComfy],
                        })
                     }
                  })
               }
            })

            if (textArray.length > 0) {
               cushy.activityManager.start({
                  stopOnBackdropClick: true,
                  UI: (p) => (
                     <UY.Misc.PopUp title='Add prompt from Image'>
                        {textArray.map((item) => {
                           return (
                              <UY.Misc.Frame
                                 tw='max-w-[500px] !border-none line-clamp-1 p-1 px-2'
                                 hover
                                 onClick={() => {
                                    const prompt = prompts.fields.prompts.addItem()
                                    if (!prompt) {
                                       console.warn('Unable to add prompt')
                                       return
                                    }
                                    prompt.fields.prompt.text = item.text

                                    p.stop()
                                 }}
                                 //TODO(bird_d/ui/tooltip): Uncomment when tooltips are fixed
                                 // tooltip={
                                 //    <div tw='!w-[500px]'>
                                 //       <p>{item.name}</p>
                                 //       ------------------
                                 //       <p tw='whitespace-break-spaces'>{item.text}</p>
                                 //    </div>
                                 // }
                              >
                                 <p tw='flex flex-row gap-1'>
                                    <p tw='line-clamp-3 w-full'>{item.text}</p>
                                    <p tw='opacity-50'>{item.name}</p>
                                 </p>
                              </UY.Misc.Frame>
                           )
                        })}
                     </UY.Misc.PopUp>
                  ),
               })
            }
         },
         onHover: (item, monitor) => {
            cushy.dndHandler.setContent({
               icon: 'mdiImage',
               label: 'Insert Prompt from image',
               suffixIcon: 'mdiPencilPlus',
            })
         },
      },
   })

   return (
      <StackCardUI
         isDnDHovered={isDropZoneHovered}
         key={index}
         field={p.datafield}
         stackField={p.stackField}
         stackIndex={index}
         icon={p.field.icon ?? undefined}
      >
         <div ref={dropRef} tw='py-1'>
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
                                 // base={{ hue: 0, chromaBlend: 10 }}
                                 text={{ contrast: 0.5, hue: 90, chromaBlend: 10 }}
                                 icon='mdiAlert'
                                 size='input'
                                 square
                                 tooltip='This entry will have no effect because the prompt is empty'
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
