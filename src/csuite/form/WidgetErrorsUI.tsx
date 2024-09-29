import type { Field } from '../model/Field'

import { observer } from 'mobx-react-lite'

import { Ikon } from '../../csuite/icons/iconHelpers'
import { MessageErrorUI } from '../../csuite/messages/MessageErrorUI'
import { csuiteConfig } from '../config/configureCsuite'
import { Frame } from '../frame/Frame'
import { MessageInfoUI } from '../messages/MessageInfoUI'
import { normalizeProblem } from '../model/Validation'
import { RevealUI } from '../reveal/RevealUI'

/** default error block */
export const WidgetErrorsUI = observer(function WidgerErrorsUI_(p: { field: Field }) {
    const field = p.field
    if (field.hasOwnErrors === false) return null
    return (
        <Frame text='#9f3030'>
            {/* {field.pathExt} */}
            {field.ownErrors.map((e, i) => (
                // 🦀 Added `h-input` to make it less ugly, but not sure if it's the right way
                <RevealUI key={i} trigger={'click'} content={() => e.longerMessage ?? 'no extra infos'}>
                    <div tw='flex items-center gap-1 h-input'>
                        <Ikon.mdiAlert />
                        {e.message}
                    </div>
                </RevealUI>
            ))}
        </Frame>
    )
})

/** default error block */
export const WidgetConfigErrorsUI = observer(function WidgetConfigErrorsUI_(p: { field: Field }) {
    // 💬 2024-09-17 rvion:
    // | this component is only visible during dev
    if (!csuiteConfig.isDev) return null

    const field = p.field
    const configPbs = normalizeProblem(field.ownConfigSpecificProblems)
    if (configPbs.length === 0) return null
    return (
        <MessageInfoUI title={`Field Config Invalid (ONLY VISIBLE DURING DEV)`}>
            {configPbs.map((e, i) => (
                // 🦀 Added `h-input` to make it less ugly, but not sure if it's the right way
                <RevealUI key={i} trigger={'click'} content={() => e.longerMessage ?? 'no extra infos'}>
                    <div tw='flex items-center gap-1 h-input'>
                        <Ikon.mdiNinja />
                        {e.message}
                    </div>
                </RevealUI>
            ))}
        </MessageInfoUI>
    )
})
