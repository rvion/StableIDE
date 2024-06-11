import type { BaseSelectEntry } from '../selectOne/WidgetSelectOne'
import type { Widget_selectMany } from './WidgetSelectMany'

import { observer } from 'mobx-react-lite'

import { SelectUI } from '../../../csuite/select/SelectUI'

export const WidgetSelectMany_SelectUI = observer(function WidgetSelectMany_SelectUI_<T extends BaseSelectEntry>(p: {
    widget: Widget_selectMany<T>
}) {
    const widget = p.widget
    return (
        <div tw='flex-1'>
            <SelectUI<T>
                multiple
                tw={[widget.baseErrors && 'rsx-field-error']}
                getLabelText={(t) => t.label ?? t.id}
                getLabelUI={widget.config.getLabelUI}
                getSearchQuery={() => widget.serial.query ?? ''}
                setSearchQuery={(query) => (widget.serial.query = query)}
                disableLocalFiltering={widget.config.disableLocalFiltering}
                options={() => widget.choices}
                value={() => widget.serial.values}
                equalityCheck={(a, b) => a.id === b.id}
                onChange={(selectOption) => widget.toggleItem(selectOption)}
            />
            {widget.baseErrors && (
                <div tw='text-red-500 flex items-center gap-1'>
                    <span className='material-symbols-outlined'>error</span>
                    {widget.baseErrors}
                </div>
            )}
        </div>
    )
})
