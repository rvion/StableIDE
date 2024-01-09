import { observer } from 'mobx-react-lite'
import { useEffect, useLayoutEffect } from 'react'
import { IndexAllAppsBtnUI } from './libraryUI/LibraryHeaderUI'
import { AppCardUI } from 'src/cards/fancycard/AppCardUI'
import { useSt } from 'src/state/stateContext'

export const Panel_Welcome = observer(function Panel_Welcome_(p: {}) {
    useEffect(() => {
        // confetti
        void (async () => {
            const confetti = (await import('https://cdn.skypack.dev/canvas-confetti' as any)).default
            confetti()
        })()
    })

    return (
        <div tw='relative'>
            <section tw='text-center py-2 flex flex-col gap-2 items-center px-8'>
                <h1 tw='text-2xl'>Welcome to CushyStudio !</h1>
                <div tw='italic text-sm'>
                    Psss. You're early; this app is still in Beta. It update often, and break sometimes. Hope you'll have fun !
                </div>
                <div tw='divider mx-8'></div>
                <div>You can fill your local CushyApp database by indexing all apps in the `./library` folder</div>
                <IndexAllAppsBtnUI />
                <div tw='divider mx-8'></div>
                To get started, try those apps ?
                {['library/built-in/SDUI.ts'].map((path) => (
                    <StandaloneAppBtnUI key={path} path={path as RelativePath} />
                ))}
                <div tw='divider mx-8'></div>
                <div>
                    Time to create your own app ? Let's GOO ! and if you're feeling lost, check the{' '}
                    <div tw='btn btn-sm'>SDK examples</div> or the <div tw='btn btn-sm'>Documentation</div> website
                </div>
            </section>
        </div>
    )
})

export const StandaloneAppBtnUI = observer(function StandaloneAppBtnUI_(p: { path: RelativePath }) {
    const path = p.path
    const st = useSt()
    const file = st.library.getFile(path)

    // ensure this app is up-to-date
    useEffect(() => {
        file.extractScriptFromFile()
    }, [])

    // show script evaluation progress
    const script0 = file.script0
    if (script0 == null)
        return (
            <div>
                extracting script...
                <div className='loading'></div>
            </div>
        )

    // show app evaluation progress
    const app = script0.apps_viaScript?.[0]
    if (app == null) {
        return (
            <div>
                compiling app... <div className='loading'></div>
            </div>
        )
    }
    return (
        <div key={path}>
            <AppCardUI //
                // active={st.library.selectionCursor === ix}
                // deck={card.pkg}
                app={app}
            />
        </div>
    )
})
