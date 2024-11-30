import type { BaseSchema } from '../../model/BaseSchema'
import type { Field_list } from './FieldList'
import type { ReactNode } from 'react'

import { action, runInAction } from 'mobx'
import { observer, useLocalObservable } from 'mobx-react-lite'

import { Button } from '../../button/Button'
import { SpacerUI } from '../../components/SpacerUI'
import { Frame } from '../../frame/Frame'
import { IkonOf } from '../../icons/iconHelpers'
import { InputNumberUI } from '../../input-number/InputNumberUI'
import { InputStringUI } from '../../input-string/InputStringUI'
import { ResizableFrame } from '../../resizableFrame/resizableFrameUI'
import { ListButtonAddUI } from './ListButtonAddUI'

export type BlenderListProps<T extends Field_list<any>> = {
   field: T
   renderItem: (item: T['items'][number], index: number) => ReactNode
}

export const BlenderListUI = observer(function BlenderListUI_<T extends Field_list<BaseSchema>>({
   field,
   renderItem,
}: BlenderListProps<T>) {
   const size = field.size
   const x = useLocalObservable(() => ({ selectedIx: 0 }))
   const selectedChild = field.items[x.selectedIx]

   const theme = cushy.theme.value
   return (
      <Frame tw='flex flex-col gap-2'>
         <Frame tw='flex flex-row gap-2 px-2'>
            <ResizableFrame
               tw='overflow-clip'
               footer={<BlenderListFooterFilterUI />}
               currentSize={size}
               onResize={(val) => {
                  field.size = val
               }}
               snap={16}
               showFooter={false}
            >
               <div tw='flex flex-col gap-0.5 p-1'>
                  {field.items.map((i, ix) => {
                     const selected = x.selectedIx === ix
                     return (
                        <Frame //
                           tw={[
                              //
                              'select-none overflow-clip',
                              '!box-content',
                           ]}
                           triggerOnPress={{
                              startingState: selected,
                              toggleGroup: 'blender-list-item-selected',
                           }}
                           // active={selected}
                           border={{ contrast: 0 }}
                           onClick={action(() => (x.selectedIx = ix))}
                           base={{ contrast: selected ? 0.1 : 0 }}
                           roundness={theme.inputRoundness}
                        >
                           {renderItem(i, ix)}
                        </Frame>
                     )
                  })}
               </div>
            </ResizableFrame>
            <div tw='flex flex-col gap-2'>
               {/* <ListButtonClearUI field={field} /> */}
               <Frame
                  //
                  tw='w-input'
                  align
                  col
                  border={theme.inputBorder}
                  dropShadow={theme.inputShadow}
                  roundness={theme.inputRoundness}
               >
                  <ListButtonAddUI field={field} />
                  <Button
                     disabled={selectedChild == null}
                     icon='mdiMinus'
                     onClick={() =>
                        runInAction(() => {
                           if (x.selectedIx > 0) x.selectedIx--
                           field.removeItemAt(x.selectedIx)
                        })
                     }
                  />
               </Frame>
               <Button icon='mdiChevronDown'></Button>
            </div>
         </Frame>
         {/* <Frame // TODO(bird_d/ui/logic): Need an inline collapsible "group" sort of thing here
            tw='h-input flex-grow items-center text-center'
            row
            base={{ contrast: 0.1 }}
         >
            <Button borderless subtle icon='mdiChevronDown' />
            <Frame>Prompt</Frame>
         </Frame> */}
         <div tw='flex flex-row gap-2 px-2'>
            <ResizableFrame
               header={
                  </* TODO(bird_d/ui/logic): Need to implement a way to toggle if the
                      * resizable frame should take up content or should use size.
                      * The buttons here should only need to be activated once for all items, not per item.
                      * */>
                     <SpacerUI />
                     <Button
                        borderless
                        square
                        subtle
                        icon={'mdiArrowExpandVertical'}
                        tooltip='Automatically resize to prompt'
                     />
                  </>
               }
            >
               <Frame tw='h-full' base={10}>
                  {selectedChild && <selectedChild.UI />}
               </Frame>
            </ResizableFrame>
         </div>
         <Frame
            /* TODO(bird_d/ui/logic): Need an inline collapsible "group" sort of thing here */
            tw='h-input flex-grow items-center text-center'
            row
            base={{ contrast: 0.1 }}
         >
            <Button borderless subtle icon='mdiChevronDown' />
            <Frame>Options</Frame>
         </Frame>
         <div tw='flex flex-col gap-2 px-2'>
            {x.selectedIx != 0 ? (
               <>
                  <Frame
                     align
                     border={theme.inputBorder}
                     dropShadow={theme.inputShadow}
                     roundness={theme.inputRoundness}
                  >
                     <Button //
                        active
                        expand
                        tooltip='Not implemented'
                     >
                        Concatenate
                     </Button>
                     <Button //
                        expand
                        tooltip='Not implemented'
                     >
                        Combine
                     </Button>
                     <Button //
                        expand
                        tooltip='Not implemented'
                     >
                        Average
                     </Button>
                  </Frame>
                  <InputNumberUI //
                     text='Strength'
                     hideSlider
                     mode='float'
                     onValueChange={() => {}}
                     value={1.0}
                     tooltip='Not implemented'
                  />
               </>
            ) : (
               <p tw='opacity-75'>
                  First Prompt is used as a base and cannot adjust strength/conditioning type
               </p>
            )}
         </div>
         {/* <div // Temporary, just to separate from old stuff
            tw='h-input'
         >
            WOW
         </div> */}
      </Frame>
   )
})

export const BlenderListFooterFilterUI = observer(function BlenderListFooterFilterUI_(p: {}) {
   const x = useLocalObservable(() => ({ filter: '' }))
   return (
      <div tw='flex w-full flex-grow flex-col p-1'>
         <InputStringUI //
            tw='flex-grow'
            icon='mdiFilter'
            clearable
            getValue={() => x.filter}
            setValue={(next) => (x.filter = next)}
         />
      </div>
   )
})
