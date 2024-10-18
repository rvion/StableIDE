import { useApp } from '@pixi/react'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'

export const ResizeTestUI = observer(function ResizeTestUI_(p: {}) {
    const app = useApp()
    useEffect(() => {
        setTimeout(() => {
            // change canvas size
            console.log(`[🤠] 🔴`, app.view)
            // resize view
            app.view.width = 1000
            app.view.height = 1000
            // resize canvas
            app.view.style!.width = 1000 + 'px'
            app.view.style!.height = 1000 + 'px'
        }, 1000)
    }, [app])

    return null
})
