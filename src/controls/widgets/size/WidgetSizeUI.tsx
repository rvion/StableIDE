import type { ResolutionState } from './ResolutionState'
import type { Widget_size } from './WidgetSize'
import type { AspectRatio, ModelType } from './WidgetSizeTypes'

import { observer } from 'mobx-react-lite'

import { BoxUI } from '../../../rsuite/box/BoxUI'
import { InputBoolUI } from '../../../rsuite/checkbox/InputBoolUI'
import { Frame } from '../../../rsuite/frame/Frame'
import { InputNumberUI } from '../number/InputNumberUI'

export const WigetSize_BlockUI = observer(function WigetSize_BlockUI_(p: { widget: Widget_size }) {
    return <WigetSizeXUI sizeHelper={p.widget.sizeHelper} bounds={p.widget.config} />
})

export const WigetSize_LineUI = observer(function WigetSize_LineUI_(p: { widget: Widget_size }) {
    return <WidgetSizeX_LineUI sizeHelper={p.widget.sizeHelper} bounds={p.widget.config} />
})

export const WidgetSizeX_LineUI = observer(function WidgetSize_LineUI_(p: {
    sizeHelper: ResolutionState
    bounds?: { min?: number; max?: number; step?: number }
}) {
    const uist = p.sizeHelper

    // const ratio = uist.width / uist.height
    // const ratioIcon = ratio == 1.0 ? 'mdiApproximatelyEqual' : ratio > 1.0 ? 'mdiCropLandscape' : 'mdiCropPortrait'

    return (
        <div className='flex flex-1 flex-col gap-1'>
            <BoxUI //Joined container
                hover
                border={{ contrast: 0.25 }}
                tw={[
                    'WIDGET-FIELD w-full h-full flex items-center overflow-clip',
                    // 'border border-base-100 border-b-base-200',
                    // 'border-b-2 hover:border-base-200 hover:border-b-base-300',
                ]}
                style={{ padding: '0px' }}
            >
                <InputNumberUI
                    //
                    min={p.bounds?.min ?? 128}
                    max={p.bounds?.max ?? 4096}
                    step={p.bounds?.step ?? 32}
                    mode='int'
                    tw='!border-none'
                    value={uist.width}
                    hideSlider
                    onValueChange={(next) => uist.setWidth(next)}
                    forceSnap={true}
                    text='Width'
                    suffix='px'
                />
                <div tw='h-full' style={{ width: '1px' }} />
                <InputNumberUI
                    //
                    min={p.bounds?.min ?? 128}
                    max={p.bounds?.max ?? 4096}
                    step={p.bounds?.step ?? 32}
                    hideSlider
                    mode='int'
                    tw='!border-none'
                    value={uist.height}
                    onValueChange={(next) => uist.setHeight(next)}
                    forceSnap={true}
                    text='Height'
                    suffix='px'
                />
                {/* <Button onClick={uist.flip} icon={ratioIcon} style={{ border: 'none', borderRadius: '0px' }} /> */}
                <div tw='h-full' style={{ width: '1px' }} />
                <AspectRatioSquareUI sizeHelper={uist} />
                <div tw='h-full' style={{ width: '1px' }} />
                <AspectLockButtonUI sizeHelper={uist} />
            </BoxUI>
            {/* <div tw='flex items-center gap-1'>
                <div // Extra div because gap-1 will eat in to the child's width for SOME reason
                ></div>
            </div> */}
        </div>
    )
})

export const AspectLockButtonUI = observer(function AspectLockButtonUI_(p: { sizeHelper: ResolutionState }) {
    const uist = p.sizeHelper
    return (
        <Frame // Aspect Lock button
            active={uist.isAspectRatioLocked}
            style={{ border: 'unset', borderRadius: '0px' }}
            icon={uist.isAspectRatioLocked ? 'mdiLink' : 'mdiLinkOff'}
            onMouseDown={(ev) => {
                uist.isAspectRatioLocked = !uist.isAspectRatioLocked
                if (!uist.isAspectRatioLocked) {
                    return
                }
                // Need to snap value if linked
                if (uist.wasHeightAdjustedLast) {
                    uist.setHeight(uist.height)
                } else {
                    uist.setWidth(uist.width)
                }
            }}
        />
    )
})

export const AspectRatioSquareUI = observer(function AspectRatioSquareUI_(p: { sizeHelper: ResolutionState }) {
    const uist = p.sizeHelper
    const ratioDisplaySize = 26
    return (
        <Frame // Aspect ratio display background
            square
            size='xs'
            tw={[
                //
                'flex',
                'overflow-clip',
                'items-center justify-center',
            ]}
            // style={{ width: `${ratioDisplaySize}px`, height: `${ratioDisplaySize}px` }}
            style={{ border: 'unset', borderRadius: '0px' }}
            onClick={uist.flip}
        >
            <Frame
                tw='!relative w-full h-full'
                style={{
                    //
                    width: '100%',
                    height: '100%',
                    borderRadius: '0px',
                    // Use transform here because it works with floats and will not cause popping/mis-alignments.
                    transform: `
                 scaleX(${uist.width < uist.height ? Math.round((uist.width / uist.height) * ratioDisplaySize) / ratioDisplaySize : '1'})
                 scaleY(${uist.height < uist.width ? Math.round((uist.height / uist.width) * ratioDisplaySize) / ratioDisplaySize : '1'})`,
                }}
                // icon='mdiCheckboxBlank'
                square
            />
        </Frame>
    )
})

export const WigetSizeXUI = observer(function WigetSizeXUI_(p: {
    // size: SizeAble
    sizeHelper: ResolutionState
    bounds?: { min?: number; max?: number; step?: number }
}) {
    const uist = p.sizeHelper
    // if (!uist.isAspectRatioLocked) return null
    const resoBtn = (ar: AspectRatio) => (
        <InputBoolUI //
            display='button'
            value={uist.desiredAspectRatio == ar}
            onValueChange={() => uist.setAspectRatio(ar)}
            text={ar}
        />
    )

    const modelBtn = (model: ModelType) => (
        <InputBoolUI
            //
            display='button'
            value={uist.desiredModelType == model}
            onValueChange={() => uist.setModelType(model)}
            text={model}
        />
    )

    const portrait = uist.height / uist.width > 1.0

    return (
        <BoxUI
            border={{ contrast: uist.isAspectRatioLocked ? 0.0 : -0.05 }}
            base={{ contrast: uist.isAspectRatioLocked ? 0.0 : -0.05 }}
        >
            <div tw='flex'>
                <div tw='join'>
                    {modelBtn('1.5')}
                    {modelBtn('xl')}
                </div>

                {/* <div tw='btn btn-xs' onClick={() => uist.flip()}> */}
                {/* <span className='material-symbols-outlined'>rotate_right</span> */}
                {/* </div> */}
                <div tw='ml-auto flex items-center gap-1.5'>
                    <div tw='join'>{resoBtn('1:1')}</div>
                    {/* <div>|</div> */}
                    <div tw='join'>
                        {resoBtn('16:9')}
                        {resoBtn('9:16')}
                    </div>
                    {/* <div>|</div> */}
                    <div tw='join'>
                        {resoBtn('4:3')}
                        {resoBtn('3:4')}
                    </div>
                    {/* <div>|</div> */}
                    <div tw='join'>
                        {resoBtn('3:2')}
                        {resoBtn('2:3')}
                    </div>
                </div>
            </div>
        </BoxUI>
    )
})
