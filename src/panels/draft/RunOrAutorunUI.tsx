import type { IconName } from '../../icons/icons'
import type { DraftL } from '../../models/Draft'

import { observer } from 'mobx-react-lite'

import { InputNumberUI } from '../../controls/widgets/number/InputNumberUI'
import { Button } from '../../rsuite/button/Button'
import { RevealUI } from '../../rsuite/reveal/RevealUI'

export const RunOrAutorunUI = observer(function RunOrAutorunUI_(p: { className?: string; draft: DraftL }) {
    const draft = p.draft
    const icon: IconName = draft.shouldAutoStart ? 'mdiPause' : 'mdiPlay'
    return (
        <div tw='flex gap-1' className={p.className}>
            <RevealUI
                content={() => (
                    <div tw='p-2'>
                        <div>ms to wait after a change</div>
                        <InputNumberUI
                            //
                            mode='int'
                            value={draft.st.project.data.autostartDelay}
                            onValueChange={(value) => {
                                draft.st.project.update({ autostartDelay: value })
                            }}
                            tw='input input-bordered input-sm'
                            placeholder='ms'
                            min={0}
                            softMax={5000}
                            step={250}
                            hideSlider
                        />
                        <div>max ms to wait before running anyway</div>
                        <InputNumberUI
                            //
                            mode='int'
                            value={draft.st.project.data.autostartMaxDelay}
                            onValueChange={(val) => {
                                draft.st.project.update({ autostartMaxDelay: val })
                            }}
                            tw='input input-bordered input-sm'
                            placeholder='ms'
                            min={0}
                            softMax={5000}
                            step={250}
                            hideSlider
                        />
                    </div>
                )}
            >
                <div tw='btn btn-sm virtualBorder btn-square'>
                    <span className='material-symbols-outlined'>timer</span>
                </div>
            </RevealUI>
            <Button active={draft.shouldAutoStart} onClick={() => draft.setAutostart(!draft.shouldAutoStart)}>
                Autorun
                {draft.shouldAutoStart ? (
                    <div className='loading loading-spinner loading-sm' />
                ) : (
                    <span className='material-symbols-outlined'>repeat</span>
                )}
            </Button>
            <Button
                base={{ hue: 'green', chroma: 0.2 }}
                primary
                expand
                className='self-start'
                icon={icon}
                onClick={() => {
                    draft.st.layout.FOCUS_OR_CREATE('Output', {}, 'RIGHT_PANE_TABSET')
                    draft.setAutostart(false)
                    draft.start({})
                }}
            >
                Run
            </Button>
        </div>
    )
})
