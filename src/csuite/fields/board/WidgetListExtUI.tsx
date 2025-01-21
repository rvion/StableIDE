import type { BaseSchema } from '../../model/BaseSchema'
import type { Field_board } from './Field_board'

import { observer } from 'mobx-react-lite'

// import { WidgetSizeX_LineUI, WigetSizeXUI } from '../size/WidgetSizeUI'
import { WidgetListExt_KonvaBoardUI } from './WidgetListExt_KonvaBoardUI'
import { WidgetListExt_TimelineUI } from './WidgetListExt_TimelineUI'
import { WidgetListExt_ValuesUI } from './WidgetListExt_ValuesUI'

// import { WidgetListExt_ValuesUI } from './WidgetListExt_ValuesUI'

export function WidgetListExtUI__Regional(p: { field: Field_board<any> }): React.JSX.Element {
   return (
      <WidgetListExtUI //
         field={p.field}
         mode='regional'
      />
   )
}

export function WidgetListExtUI__Timeline(p: { field: Field_board<any> }): React.JSX.Element {
   return (
      <WidgetListExtUI //
         field={p.field}
         mode='timeline'
      />
   )
}

export const WidgetListExtUI = observer(function WidgetListExtUI_<T extends BaseSchema>(p: {
   //
   field: Field_board<T>
   mode: 'timeline' | 'regional'
}) {
   const listExt = p.field
   const { area } = listExt.fields
   return (
      <div className='_WidgetListExtUI' tw='w-full flex-grow'>
         {/* <ListControlsUI widget={widget} /> */}
         {/* <WidgetSizeX_LineUI size={area} bounds={listExt} /> */}
         {/* <WigetSizeXUI size={area} bounds={listExt} /> */}
         {/* <WigetSizeXUI sizeHelper={widget.sizeHelper} bounds={widget.config} /> */}
         {p.mode === 'timeline' ? ( //
            <WidgetListExt_TimelineUI field={listExt} />
         ) : (
            <WidgetListExt_KonvaBoardUI field={listExt} />
         )}
         {/* {p.widget.value.items.map((e) => (
                <div tw='whitespace-pre-wrap w-96'>{JSON.stringify(e)}</div>
            ))} */}
         <WidgetListExt_ValuesUI field={listExt} />
         {/* <pre>{readableStringify(listExt.Items.items[0]!.Shape.serial, 1)}</pre> */}
      </div>
   )
})
