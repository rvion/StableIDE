import type { CushyAppL } from '../../models/CushyApp'
import type { DraftL } from '../../models/Draft'

import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useLayoutEffect } from 'react'

import { FormUI } from '../../controls/FormUI'
import { InstallRequirementsBtnUI } from '../../controls/REQUIREMENTS/Panel_InstallRequirementsUI'
import { BoxSubtle } from '../../rsuite/box/BoxMisc'
import { BoxUI } from '../../rsuite/box/BoxUI'
import { MarkdownUI } from '../../rsuite/MarkdownUI'
import { MessageInfoUI } from '../../rsuite/messages/MessageInfoUI'
import { PhoneWrapperUI } from '../../rsuite/PhoneWrapperUI'
import { RevealUI } from '../../rsuite/reveal/RevealUI'
import { SelectUI } from '../../rsuite/SelectUI'
import { Message } from '../../rsuite/shims'
import { useSt } from '../../state/stateContext'
import { stringifyUnknown } from '../../utils/formatters/stringifyUnknown'
import { draftContext } from '../../widgets/misc/useDraft'
import { DraftHeaderUI } from './DraftHeaderUI'
import { RecompileUI } from './RecompileUI'

export const Panel_Draft = observer(function Panel_Draft_(p: { draftID: DraftID }) {
    // 1. get draft
    const st = useSt()
    const draft = typeof p.draftID === 'string' ? st.db.draft.get(p.draftID) : p.draftID
    return <DraftUI draft={draft} />
})

export const DraftUI = observer(function Panel_Draft_(p: { draft: Maybe<DraftL> }) {
    const st = useSt()
    const draft = p.draft

    // useEffect(() => draft?.AWAKE(), [draft?.id])

    // ensure
    useLayoutEffect(() => {
        if (draft?.name != null) st.layout.syncTabTitle('Draft', { draftID: draft.id }, draft.name)
    }, [draft?.name])

    // 1. draft
    if (draft == null) return <ErrorPanelUI>Draft not found</ErrorPanelUI>

    // 2. app
    const app = draft.app
    if (app == null) return <ErrorPanelUI>File not found</ErrorPanelUI>

    // 3. compiled app
    const compiledApp = app.executable_orExtract
    if (compiledApp == null) return <AppCompilationErrorUI app={app} />

    // 4. get form
    const guiR = draft.form
    if (guiR == null)
        return (
            <ErrorPanelUI>
                {/* <div>{draft.id}</div> */}
                <div>draft.form is null</div>
                {/* <div>test: {draft.test}</div> */}
            </ErrorPanelUI>
        )

    if (guiR.error)
        return (
            <>
                <DraftHeaderUI draft={draft} />
                <ErrorPanelUI>
                    <RecompileUI always app={draft.app} />
                    <b>App failed to load</b>
                    <div>❌ {guiR.error}</div>
                    <div>{stringifyUnknown(guiR.error)}</div>
                </ErrorPanelUI>
            </>
        )

    // 5. render form
    const { containerClassName, containerStyle } = compiledApp.def ?? {}
    const defaultContainerStyle = {} // { margin: '0 auto' }

    const wrapMobile = st.isConfigValueEq('draft.mockup-mobile', true)
    const metadata = draft.app.executable_orExtract?.metadata
    // {/* <ActionDraftListUI card={card} /> */}
    const OUT = (
        <draftContext.Provider value={draft} key={draft.id}>
            <RecompileUI app={draft.app} />
            <BoxUI
                base={0}
                style={toJS(containerStyle ?? defaultContainerStyle)}
                tw={['flex-1 flex flex-col p-2 gap-1', containerClassName]}
                onKeyUp={(ev) => {
                    // submit on meta+enter
                    if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) {
                        ev.preventDefault()
                        ev.stopPropagation()
                        draft.start({})
                    }
                }}
            >
                <DraftHeaderUI draft={draft} />
                {draft.shouldAutoStart && (
                    <MessageInfoUI>Autorun active: this draft will execute when the form changes</MessageInfoUI>
                )}
                {metadata?.help && (
                    <MessageInfoUI>
                        <MarkdownUI tw='_WidgetMardownUI w-full' markdown={metadata.help} />
                    </MessageInfoUI>
                )}

                {metadata?.description && (
                    <BoxSubtle>
                        <MarkdownUI tw='_WidgetMardownUI text-sm italic px-1 w-full' markdown={metadata.description} />
                    </BoxSubtle>
                )}
                {metadata?.requirements && (
                    <InstallRequirementsBtnUI label='requirements' active={true} requirements={metadata.requirements} />
                )}
                <div tw='pb-10'>
                    <FormUI
                        // theme={{
                        //     // base: 'oklch(0, 0, 200)',
                        //     // base: 'rgb(255, 250, 240)',
                        //     // base: '#1E212B',
                        //     text: { contrast: 0.9 /* chromaBlend: 99, hueShift: 0 */ },
                        // }}
                        key={draft.id}
                        form={draft.form}
                    />
                </div>
                <RevealUI
                    content={() => (
                        <div tw='overflow-auto bd1' style={{ maxHeight: '30rem' }}>
                            <ul>
                                {Object.keys(app.script.data.metafile?.inputs ?? {}).map((t, ix) => (
                                    <li key={ix}>{t}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                >
                    <div tw='subtle'>{Object.keys(app.script.data.metafile?.inputs ?? {}).length} files</div>
                </RevealUI>
            </BoxUI>
        </draftContext.Provider>
    )
    if (!wrapMobile) return OUT
    return (
        <div tw='flex flex-col items-center pt-2'>
            <SelectUI
                tw='w-full'
                options={() => [
                    { label: 'iPhone 5', value: 5 },
                    { label: 'iPhone 6', value: 6 },
                ]}
                onChange={null}
                getLabelText={(t): string => {
                    return t.label
                }}
            />
            <PhoneWrapperUI tw='m-auto' size={5}>
                {OUT}
            </PhoneWrapperUI>
        </div>
    )
})

/**
 * this is the root interraction widget
 * if a workflow need user-supplied infos, it will send an 'ask' request with a list
 * of things it needs to know.
 */
const ErrorPanelUI = observer(function ErrorPanelUI_(p: { children: React.ReactNode }) {
    return (
        <div tw='h-full'>
            <Message type='error'>{p.children}</Message>
        </div>
    )
})

export const AppCompilationErrorUI = observer(function AppCompilationErrorUI_(p: { app: CushyAppL }) {
    return (
        <ErrorPanelUI>
            <h3>invalid app</h3>
            <RecompileUI always app={p.app} />
            <pre tw='bg-black text-white text-xs'>{p.app.script.data.code}</pre>
        </ErrorPanelUI>
    )
})
