import type { Field_selectOne, SelectOption } from './FieldSelectOne'

import { observer } from 'mobx-react-lite'

import { BadgeUI } from '../../badge/BadgeUI'
import { RevealUI } from '../../reveal/RevealUI'
import { hashStringToNumber } from 'src/cushy-forms/src/csuite/hashUtils/hash'

export const WidgetSelectOne_CellUI = observer(function WidgetSelectOne_TabUI_<VALUE>(p: {
    field: Field_selectOne<VALUE>
    opts?: { reveal?: boolean }
}) {
    const val = p.field.selectedOption

    if (val == null) return p.field.config.placeholder ?? ''
    const hue = val.hue ?? hashStringToNumber(val.id)

    if (p.opts?.reveal)
        return (
            <RevealUI content={() => val.label ?? val.id} trigger={'hover'} placement='right' tw='gap-1'>
                <BadgeUI icon={val.icon} hue={hue}>
                    {val.id[0]}
                </BadgeUI>
            </RevealUI>
        )

    return (
        <BadgeUI icon={val.icon} hue={hue} tw='gap-1'>
            {val.label ?? val.id}
        </BadgeUI>
    )
})
