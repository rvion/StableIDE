import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import * as React from 'react'
import { useMemo } from 'react'

import { RegionUI } from '../../csuite/regions/RegionUI'
import { PanelHeaderUI } from '../../csuite/wrappers/PanelHeader'
import { useSt } from '../../state/stateContext'
import { useImageDrop } from '../../widgets/galleries/dnd'
import { CanvasToolbarUI, UnifiedCanvasMenuUI } from './menu/UnifiedCanvasMenuUI'
import { UnifiedCanvas } from './states/UnifiedCanvas'
import { UnifiedCanvasCtx } from './UnifiedCanvasCtx'
import { useSize } from './utils/useSize'
import { InputNumberUI } from '../../csuite/input-number/InputNumberUI'
import { InputBoolToggleButtonUI } from '../../csuite/checkbox/InputBoolToggleButtonUI'
import { Button } from '../../csuite/button/Button'

// https://github.com/devforth/painterro
export const Panel_Canvas = observer(function Panel_Canvas_(p: {
    //
    imgID?: MediaImageID
}) {
    const st = useSt()
    const containerRef = React.useRef<HTMLDivElement>(null)
    const img0 = st.db.media_image.get(p.imgID!)
    const canvas = useMemo(() => {
        if (img0 == null) throw new Error('img0 is null')
        return new UnifiedCanvas(st, img0)
    }, [img0])

    if (img0 == null) return <>❌ error</>

    // add drop handlers
    const [dropStyle, dropRef] = useImageDrop(st, (img) => runInAction(() => canvas.addImage(img)))

    // auto-resize canvas
    const size = useSize(containerRef)
    React.useEffect(() => {
        if (size == null) return
        // console.log(`[👙] size.height=`, size.height, size.width)
        canvas.stage.width(size.width)
        canvas.stage.height(size.height)
    }, [Math.round(size?.width ?? 100), Math.round(size?.height ?? 100)])

    // auto-mount canvas
    React.useEffect(() => {
        if (canvas.rootRef.current == null) return
        canvas.rootRef.current.innerHTML = ''
        canvas.stage.container(canvas.rootRef.current)
        // canvas.rootRef.current.addEventListener('keydown', canvas.onKeyDown)
        // console.log(`[🟢] MOUNT`)
        return () => {
            // console.log(`[🔴] CLEANUP`, canvas.rootRef.current)
            if (canvas.rootRef.current == null) return
        }
    }, [canvas.rootRef])

    // const scale = canvas.infos.scale * 100
    return (
        <div //
            tabIndex={0}
            onKeyDown={canvas.onKeyDown}
            onWheel={canvas.onWheel}
            ref={containerRef}
            className='flex flex-1 w-full h-full overflow-hidden'
        >
            <RegionUI name='UnifiedCanvas2' ctx={UnifiedCanvasCtx} value={canvas}>
                <PanelHeaderUI tw='grid grid-cols-[1fr_1fr_1fr]'>
                    <div tw='flex gap-2'>
                        <div // TODO(bird_d): Needs Joinable
                            tw='flex'
                        >
                            <InputNumberUI //
                                text='Brush Size'
                                mode='int'
                                value={canvas.maskToolSize}
                                onValueChange={(next) => (canvas.maskToolSize = next)}
                                min={1}
                                max={1000}
                                suffix='px'
                                step={10}
                            />
                            <InputBoolToggleButtonUI //
                                value={canvas.usePenPressure}
                                onValueChange={() => (canvas.usePenPressure = !canvas.usePenPressure)}
                                icon={canvas.usePenPressure ? 'mdiPencil' : 'mdiPencilOff'}
                                tooltip='(Not implemented) Whether or not pressure affects the radius size of a brush stroke'
                            />
                        </div>
                        <div // TODO(bird_d): Should be a joined container thing
                            tw='flex'
                        >
                            <Button //
                                square
                                icon='mdiUndo'
                                tooltip='Undo'
                                onClick={() => canvas.undo()}
                            />
                            <Button
                                square
                                disabled
                                icon='mdiRedo'
                                tooltip='Redo (Not implemented)'
                                // onClick={() => canvas.undo()}
                            />
                        </div>
                    </div>
                    <div tw='flex justify-center items-center'>
                        <InputNumberUI
                            mode='int'
                            min={32}
                            step={4}
                            onValueChange={(next) => (canvas.snapSize = next)}
                            suffix='px'
                            value={canvas.snapSize}
                        />
                        <InputBoolToggleButtonUI
                            icon={'mdiGrid'}
                            value={canvas.snapToGrid}
                            onValueChange={(v) => {
                                canvas.snapToGrid = !canvas.snapToGrid
                            }}
                        />
                    </div>
                    <div />
                </PanelHeaderUI>
                <div
                    //
                    // key={canvas.stage.id()}
                    style={dropStyle}
                    ref={dropRef}
                    className='DROP_IMAGE_HANDLER'
                    tw='_Panel_Canvas flex-grow flex flex-row h-full relative !z-0'
                >
                    {/* <GridTilingUI /> */}
                    {canvas.steps.map((s) => {
                        const infos = canvas.infos
                        const dx = infos.canvasX
                        const dy = infos.canvasY
                        const x = (s.image.x() + dx) / infos.scale
                        const y = (s.image.y() + dy) / infos.scale
                        return (
                            <div tw='absolute z-50' style={{ left: `${x}px`, top: `${y}px` }}>
                                <div className='joined'>
                                    <div tw='btn' onClick={() => s.index++}>
                                        {'<-'}
                                    </div>
                                    <div tw='btn' onClick={() => s.delete()}>
                                        ❌
                                    </div>
                                    <div tw='btn' onClick={() => s.accept()}>
                                        OK
                                    </div>
                                    <div tw='btn' onClick={() => s.index--}>
                                        {'->'}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div id={canvas.uid} ref={canvas.rootRef} tw='flex-1'></div>
                    {/* <CanvasToolbarUI /> */}
                    <UnifiedCanvasMenuUI />
                </div>
            </RegionUI>
        </div>
    )
})
