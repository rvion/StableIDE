import type { UnifiedCanvas } from '../states/UnifiedCanvas'
import type { UnifiedImage } from '../states/UnifiedImage'

import { observer } from 'mobx-react-lite'
import { fileURLToPath } from 'url'

import { Button } from '../../../csuite/button/Button'
import { SpacerUI } from '../../../csuite/components/SpacerUI'
import { Frame } from '../../../csuite/frame/Frame'
import { CachedResizedImage } from '../../../csuite/image/CachedResizedImageUI'
import { InputNumberUI } from '../../../csuite/input-number/InputNumberUI'
import { InputStringUI } from '../../../csuite/input-string/InputStringUI'
import { BasicShelfUI } from '../../../csuite/shelf/ShelfUI'
import { useSt } from '../../../state/stateContext'
import { useImageDrop } from '../../../widgets/galleries/dnd'
import { useUnifiedCanvas } from '../states/UnifiedCanvasCtx'

const UCLayerUI = observer(function UCLayerUI_(p: { canvas: UnifiedCanvas; UCImage?: UnifiedImage; index: number }) {
    let ui = <div></div>

    const img = p.UCImage
    if (!img) {
        return ui
    }

    const inputHeight = cushy.preferences.interface.value.inputHeight
    const visible = img.group.isVisible()

    ui = (
        <Frame
            tw={[
                //
                'flex gap-2',
                'p-1',
                'rounded-md',
            ]}
            base={{ contrast: 0.1, chroma: 0.077 }}
            // border
            hover
            style={{
                // Do not use interface.value.inputHeight in the future. Have a separate option for layer size?
                height: `${inputHeight * 3.5}rem`,
                // filter: 'drop-shadow(0px 1px 0px black)',
            }}
        >
            <Frame
                base={{ contrast: -0.1 }}
                border={{ contrast: 0.4 }}
                tw='overflow-clip rounded-md'
                style={{
                    width: `${inputHeight * 3}rem`,
                    minWidth: `${inputHeight * 3}rem`,
                    maxWidth: `${inputHeight * 3}rem`,
                    // filter: 'drop-shadow(0px 1px 0px black)',
                }}
            >
                <CachedResizedImage
                    draggable={false}
                    onDragStart={() => false}
                    onDrop={() => false}
                    src={fileURLToPath(img.img.url)}
                    size={128}
                />
            </Frame>
            {/*  */}
            <div tw='flex w-full flex-col'>
                <div
                    tw={[
                        //
                        'flex flex-grow gap-2',
                    ]}
                    style={{ height: `${inputHeight}rem` }}
                >
                    <InputStringUI
                        getValue={() => img.name}
                        setValue={(val) => {
                            img.name = val
                        }}
                    />
                </div>
                <div
                    tw={[
                        //
                        'flex flex-grow gap-2',
                    ]}
                    style={{ height: `${inputHeight}rem` }}
                ></div>
                <div
                    tw={[
                        //
                        'flex flex-grow gap-2',
                    ]}
                    style={{ height: `${inputHeight}rem` }}
                >
                    <Frame //
                        tw='h-full w-8 rounded-sm'
                        base={{ hue: 250, chroma: 0.1, contrast: 0.5 }}
                        border={{ contrast: 0.2 }}
                        text={{ contrast: 0.2 }}
                        textShadow={{ contrast: -1 }}
                        icon='mdiBrush'
                        square
                    />
                    <SpacerUI />
                    <Button
                        onClick={() => {
                            // p.canvas.images.splice(p.index, 1)
                            // p.UCImage?.hide()
                            img.group.visible(!visible)
                            p.canvas.imageLayer.cache()
                        }}
                        icon={visible ? 'mdiEye' : 'mdiEyeClosed'}
                        subtle
                        borderless
                        square
                    ></Button>
                </div>
            </div>
        </Frame>
    )
    return ui
})

export const UnifiedCanvasMenuUI = observer(function UnifiedCanvasMenuUI_(p: {}) {
    const canvas = useUnifiedCanvas()
    const st = useSt()
    const [dropStyle2, dropRef2] = useImageDrop(st, (img) => canvas.addMask(img))
    return (
        <>
            <BasicShelfUI anchor='right' floating tw='flex flex-col gap-1.5 p-1.5'>
                {/* TOP LEVEL BUTTON */}
                <Frame
                    tw='rounded-md p-2'
                    style={{
                        filter: 'drop-shadow(0px 1px 0px black)',
                    }}
                >
                    Layers
                    <Frame tw='rounded-md p-2' base={{ contrast: -0.1 }}>
                        <div /* SortableList */
                            // inlist={true}
                            // onSortEnd={(oldIndex, newIndex) => {
                            //     //
                            //     const images = canvas.images

                            //     const [item] = images.splice(oldIndex, 1)
                            //     const [layerItem] = canvas.imageLayer.children.splice(oldIndex, 1)

                            //     if (!item || !layerItem) {
                            //         return
                            //     }

                            //     // Step 2: Insert the item at the new index
                            //     images.splice(newIndex, 0, item)
                            //     canvas.imageLayer.children.splice(newIndex, 0, layerItem)
                            //     canvas.imageLayer.cache()
                            // }}
                            // draggedItemClassName='dragged'
                            className='list'
                            tw='flex flex-col gap-2'
                        >
                            {canvas.images
                                // .slice(0)
                                // .reverse()
                                .map((p: UnifiedImage, i: number) => {
                                    // const img = p.img
                                    return (
                                        <div /* SortableItem */ key={p.img.id}>
                                            <UCLayerUI canvas={canvas} UCImage={p} index={i} />
                                        </div>
                                    )
                                })}
                        </div>
                    </Frame>
                </Frame>

                {/* SELECTIONS */}
                <Frame tw='rounded-md p-2' border>
                    <div tw='flex items-center justify-between'>
                        Selections
                        <Button square onClick={canvas.addSelection}>
                            <span className='material-symbols-outlined'>add</span>
                        </Button>
                    </div>
                    <Frame base={{ contrast: -0.1 }} tw='w-full p-2'>
                        {canvas.selections.map((uniSel) => (
                            <Frame base={{ contrast: canvas.activeSelection === uniSel ? 0.25 : 0.1 }} border tw='p-2'>
                                <div key={uniSel.id} className='flex gap-1 whitespace-nowrap'>
                                    <div tw='flex items-center gap-0.5'>
                                        <input
                                            type='radio'
                                            checked={canvas.activeSelection === uniSel}
                                            onChange={() => (canvas.activeSelection = uniSel)}
                                            name='active'
                                            className='radio'
                                        />
                                        <InputStringUI setValue={(val) => (uniSel.name = val)} getValue={() => uniSel.name} />
                                    </div>
                                    <div className='flex-1' />
                                    <Button onClick={uniSel.remove} icon='mdiDelete' />
                                    <Button square onClick={uniSel.saveImage} icon='mdiContentSave' />
                                </div>
                                <div tw='flex gap-1'>
                                    <div tw='w-16'>width:</div>
                                    <InputNumberUI
                                        //
                                        onValueChange={(e) => {
                                            uniSel.stableData.width = e
                                            uniSel.applyStableData()
                                        }}
                                        value={uniSel.stableData.width}
                                        mode='int'
                                        softMin={128}
                                        softMax={1024}
                                        step={12}
                                    />
                                </div>
                                <div tw='flex gap-1'>
                                    <div tw='w-16'>height:</div>
                                    <InputNumberUI
                                        //
                                        onValueChange={(e) => {
                                            uniSel.stableData.height = e
                                            uniSel.applyStableData()
                                        }}
                                        value={uniSel.stableData.height}
                                        mode='int'
                                        softMin={128}
                                        softMax={1024}
                                        step={12}
                                    />
                                </div>
                            </Frame>
                        ))}
                    </Frame>
                    {/* <RevealUI>
                    <pre>{JSON.stringify(uist.stableData, null, 4)}</pre>
                </RevealUI> */}
                </Frame>

                {/* Masks */}
                <Frame tw='rounded-md p-2.5'>
                    <div ref={dropRef2}>
                        <div tw='flex items-center justify-between'>
                            <div>Masks</div>
                            <Button square onClick={() => canvas.addMask()} icon='mdiPlus'>
                                <span className='material-symbols-outlined'>add</span>
                            </Button>
                        </div>
                        {canvas.masks.map((mask) => {
                            const active = mask === canvas.activeMask
                            return (
                                <div key={mask.uid} tw='flex w-full items-center gap-1'>
                                    <input
                                        type='radio'
                                        checked={active}
                                        name='radio-1'
                                        className='radio'
                                        onChange={() => {
                                            canvas.activeMask = mask
                                        }}
                                    />
                                    <div className='flex items-center whitespace-nowrap'>
                                        <Button onClick={() => void (canvas.activeMask = mask)}>{mask.uid}</Button>
                                        <input
                                            value={mask.name}
                                            onChange={(ev) => (mask.name = ev.target.value)}
                                            tw='input input-sm'
                                            type='text'
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Frame>
                {/* DEBUG */}
                {/* <div className='w-96'>
                <pre>{JSON.stringify(canvas.infos, null, 3)}</pre>
            </div> */}
            </BasicShelfUI>
        </>
    )
})
