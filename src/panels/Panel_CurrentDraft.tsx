import { observer } from 'mobx-react-lite'
import { Message } from 'rsuite'
import { useSt } from 'src/state/stateContext'
import { ComboUI } from '../app/shortcuts/ComboUI'
import { MainNavEntryUI } from '../app/layout/MainNavEntryUI'
import { Panel_Draft } from './Panel_Draft'

export const Panel_CurrentDraft = observer(function CurrentDraftUI_(p: {}) {
    const st = useSt()
    const draft = st._currentDraft

    // just in case no card is selected, open one
    // useEffect(() => {
    //     if (draft?.cardPath == null) st.openCardPicker()
    // }, [])

    if (draft == null) {
        return (
            <MainNavEntryUI
                tw='m-2'
                size='lg'
                color='green'
                appearance='primary'
                onClick={() => st.openCardPicker()}
                ix='1'
                icon={<span className='material-symbols-outlined'>play_circle</span>}
                label='Open Card Picker'
                tooltip={
                    <>
                        Open the card picker
                        <ComboUI combo='meta+1' />
                    </>
                }
            />
        )
    }
    const card = draft.card
    if (card == null)
        return (
            <Message type='error' showIcon>
                card not found
            </Message>
        )
    // if (draft?.draftID == null) return <ActionDraftListUI card={card} />
    return <Panel_Draft draft={draft} />
})
