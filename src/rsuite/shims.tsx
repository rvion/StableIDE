import type { IconName } from '../icons/icons'
import type { RSAppearance, RSSize } from './RsuiteTypes'

import Color from 'colorjs.io'
import { observer } from 'mobx-react-lite'
import { type CSSProperties, ReactNode } from 'react'

import { IkonOf } from '../icons/iconHelpers'
import { Box } from '../theme/colorEngine/Box'
import { exhaust } from '../utils/misc/exhaust'
import { RevealUI } from './reveal/RevealUI'

// form
export const FormHelpTextUI = (p: any) => <div {...p}></div>

let isDragging = false

// inputs
export const Button = (p: {
    // hack
    tabIndex?: number
    hue?: number | string
    hueShift?: number | undefined
    className?: string
    icon?: Maybe<IconName>
    active?: Maybe<boolean>
    size?: Maybe<RSSize>
    loading?: boolean
    disabled?: boolean
    appearance?: Maybe<RSAppearance>
    style?: CSSProperties
    /** 🔶 DO NOT USE; for */
    onClick?: (ev: React.MouseEvent<HTMLElement>) => void
    children?: ReactNode
}) => {
    const {
        //
        icon,
        active,
        hue,
        hueShift,
        size,
        loading,
        disabled,
        appearance,
        onClick,
        className,
        ...rest
    } = p

    const isDraggingListener = (ev: MouseEvent) => {
        if (ev.button == 0) {
            isDragging = false
            window.removeEventListener('mouseup', isDraggingListener, true)
        }
    }
    const chroma: number = (() => {
        if (active) return 0.1

        if (appearance === 'primary') return 0.1
        if (appearance === 'ghost') return 0
        if (appearance === 'link') return 0
        if (appearance === 'default') return 0.1
        if (appearance === 'subtle') return 0
        if (appearance == null) return 0.1
        exhaust(appearance)
        return 0.1
    })()

    const contrast: number = (() => {
        if (active) return 0.8
        if (appearance === 'primary') return 1
        if (appearance === 'ghost') return 0
        if (appearance === 'link') return 0
        if (appearance === 'default') return 0.1
        if (appearance === 'subtle') return 0
        if (appearance == null) return 0.1
        exhaust(appearance)
        return 0.1
    })()

    const border: number = (() => {
        if (appearance === 'primary') return 3
        if (appearance === 'ghost') return 0
        if (appearance === 'link') return 0
        if (appearance === 'default') return 1
        if (appearance === 'subtle') return 0.5
        if (appearance == null) return 1
        exhaust(appearance)
        return 1
    })()

    const hueFinal = ((): number | undefined => {
        if (p.hue == null) return
        if (typeof p.hue === 'number') return p.hue
        if (typeof p.hue === 'string') return new Color(p.hue).oklch[2]
        return
    })()
    return (
        <Box
            base={{ contrast, chroma, hue: hueFinal, hueShift }}
            hover
            tabIndex={p.tabIndex ?? -1}
            border={border}
            className={className}
            onMouseDown={(ev) => {
                if (ev.button == 0) {
                    onClick?.(ev)
                    isDragging = true
                    window.addEventListener('mouseup', isDraggingListener, true)
                }
            }}
            onMouseEnter={(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                if (isDragging) onClick?.(ev)
            }}
            {...rest}
            tw={[
                'btn',
                p.loading || p.disabled ? 'btn-disabled' : null,
                p.active ? 'btn-active' : null,
                // appearance
                //     ? (() => {
                //           if (appearance === 'primary') return 'btn-primary'
                //           if (appearance === 'ghost') return 'btn-outline'
                //           if (appearance === 'link') return 'btn-link'
                //           if (appearance === 'default') return null
                //           if (appearance === 'subtle') return null
                //           return exhaust(appearance)
                //       })()
                //     : null,
                p.size
                    ? (() => {
                          if (p.size === 'sm') return 'btn-sm'
                          if (p.size === 'xs') return 'btn-xs'
                          if (p.size === 'lg') return 'btn-lg'
                          if (p.size === 'md') return null
                          return exhaust(p.size)
                      })()
                    : null,
                // ...(p?.tw ?? []),
            ]}
        >
            {p.icon && <IkonOf name={p.icon} />}
            {p.children}
        </Box>
    )
}

export const Input = (p: JSX.IntrinsicElements['input']) => {
    const { tw, className, children, ...rest } = p
    return (
        <input tw={[tw, className, 'input input-bordered input-sm']} {...rest}>
            {children}
        </input>
    )
}
export const InputNumberBase = observer(function InputNumberBase_(
    //
    p: JSX.IntrinsicElements['input'] & { _size?: RSSize },
) {
    const sizeClass = p._size ? `input-${p._size}` : null
    return (
        <input //
            type='number'
            tw={['input input-sm', sizeClass]}
            {...p}
        ></input>
    )
})

export const Slider = observer(function Slider_(p: JSX.IntrinsicElements['input']) {
    return (
        <input //
            type='range'
            {...p}
            tw={['range range-sm range-primary']}
        ></input>
    )
})

export const Radio = observer(function Radio_(p: JSX.IntrinsicElements['input']) {
    return (
        <input //
            type='radio'
            {...p}
        ></input>
    )
})

export const Toggle = observer(function Toggle_(p: JSX.IntrinsicElements['input']) {
    return (
        <input //
            type='checkbox'
            {...p}
            tw={[
                //
                'toggle toggle-primary',
                // p.checked && 'toggle-success',
            ]}
        ></input>
    )
})

// https://daisyui.com/components/rating/#mask-star-2-with-warning-color
// TODO: remove that and just use a basic btn
export const Rate = (p: {
    //
    value?: number
    name: string
    disabled?: boolean
    max?: number
    onChange?: (value: number) => void
}) => (
    <div tw='rating rating-md rating-sm'>
        {new Array(p.max ?? 1).fill(0).map((_, ix) => (
            <input
                key={ix}
                name={p.name}
                checked={p.value === ix}
                onChange={() => p.onChange?.(ix)}
                type='radio'
                tw={['mask mask-star fade-in-40', p.disabled ? 'bg-base-300' : 'bg-orange-400']}
            />
        ))}
    </div>
)

// tooltips
export const Whisper = (p: {
    /** @deprecated */
    enterable?: boolean
    /** @deprecated */
    placement?: string
    speaker: ReactNode
    children: ReactNode
}) => <RevealUI content={() => p.speaker}>{p.children}</RevealUI>

// misc
export const Panel = (p: {
    //
    header?: ReactNode
    className?: string
    children: ReactNode
}) => {
    const { header, children, ...rest } = p
    return (
        <div
            //
            // style={{ border: '1px solid #404040' }}
            tw='p-2 border border-opacity-25 bg-base-200 bg-opacity-50 border-base-content input-bordered rounded-btn'
            {...rest}
        >
            {header}
            {p.children}
        </div>
    )
}

export const ProgressLine = observer(function ProgressLine_(p: {
    //
    className?: string
    percent?: number
    status: 'success' | 'active'
}) {
    const status = p.status === 'success' ? 'progress-success' : 'progress-info'
    return (
        <progress
            //
            tw={[status, 'm-0 progress', p.className]}
            value={p.percent}
            max={100}
        ></progress>
    )
})

// ------------------------------------------------------------------------
const messageIcon = (type: MessageType): ReactNode => {
    if (type === 'error') return <span className='material-symbols-outlined !text-xl'>error</span>
    if (type === 'info') return <span className='material-symbols-outlined !text-xl'>info</span>
    if (type === 'warning') return <span className='material-symbols-outlined !text-xl'>warning</span>
    exhaust(type)
    return null
}
type MessageType = 'error' | 'info' | 'warning'
export const Message = observer(function Message_(p: {
    //
    type: MessageType
    header?: ReactNode
    showIcon?: boolean
    children?: ReactNode
}) {
    const { showIcon, ...rest } = p
    return (
        <div
            tw={[
                p.type === 'error' //
                    ? 'bg-error text-error-content'
                    : p.type === 'warning'
                      ? 'bg-warning text-warning-content'
                      : 'bg-base text-base-content',
            ]}
            {...rest}
        >
            {p.header}
            <div
                //
                className='flex flex-wrap items-center gap-2 p-2'
            >
                {messageIcon(p.type)}
                <div>{p.children}</div>
            </div>
        </div>
    )
})
export const Tag = (p: any) => <div {...p}></div>

export const Loader = observer((p: { size?: RSSize; className?: string }) => (
    <span
        //
        className={p.className}
        tw={[`loading loading-spinner loading-${p.size ?? 'sm'}`]}
    ></span>
))
