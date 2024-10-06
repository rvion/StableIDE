import type { Field_string } from './FieldString'

import { observer } from 'mobx-react-lite'

import { useCSuite } from '../../ctx/useCSuite'
import { Frame } from '../../frame/Frame'
import { InputStringUI } from '../../input-string/InputStringUI'

export const WidgetStringUI = observer(function WidgetString(p: { field: Field_string }) {
    const field = p.field
    if (field.config.textarea) {
        return field.isCollapsed ? ( //
            <WidgetString_summary field={field} />
        ) : (
            <WidgetString_TextareaInput field={field} />
        )
    } else {
        return <WidgetString_SmallInput field={field} />
    }
})

// Textarea HEADER
export const WidgetString_summary = observer(function WidgetString_TextareaHeaderUI_(p: { field: Field_string }) {
    const field = p.field
    if (!field.config.textarea) return null
    if (!p.field.serial.collapsed) return null
    return <div tw='line-clamp-1 italic opacity-50'>{JSON.stringify(p.field.value)}</div>
})

// Textarea BODY
export const WidgetString_TextareaInput = observer(function WidgetString_TextareaBodyUI_(p: {
    field: Field_string
    readonly?: boolean
}) {
    const field = p.field
    const csuite = useCSuite()
    if (p.readonly) return <pre>{field.value_or_zero}</pre>
    return (
        <Frame base={csuite.inputContrast} expand>
            {/* <pre>{JSON.stringify(Object.keys(p))}</pre> */}
            <textarea
                style={{
                    /* ...p.widget.config.style, */
                    lineHeight: '1.3rem',
                    resize: p.field.config.resize ?? 'both',
                }}
                tw='csuite-input w-full p-2 !bg-transparent'
                placeholder={field.config.placeHolder}
                rows={3}
                value={field.value_or_zero}
                onChange={(ev) => {
                    field.value = ev.target.value
                    field.touch()
                }}
                onBlur={() => field.touch()}
            />
        </Frame>
    )
})

// string HEADER
export const WidgetString_SmallInput = observer(function WidgetStringUI_(p: { field: Field_string; readonly?: boolean }) {
    const field = p.field
    const config = field.config
    return (
        <InputStringUI
            tw={['w-full', field.mustDisplayErrors && 'rsx-field-error']}
            icon={p.field.config.innerIcon}
            type={config.inputType}
            placeholder={config.placeHolder}
            pattern={config.pattern}
            className={config.className}
            getValue={() => field.value_or_zero}
            setValue={(value) => {
                field.value = value
                field.touch()
            }}
            disabled={p.readonly}
            autoResize={config.autoResize}
            buffered={
                field.config.buffered
                    ? {
                          getTemporaryValue: (): string | null => field.temporaryValue,
                          setTemporaryValue: (value): void => void (field.temporaryValue = value),
                      }
                    : undefined
            }
            onBlur={() => field.touch()}
        />
    )
})
