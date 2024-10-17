import { observer } from 'mobx-react-lite'

export const SectionTitleUI = observer(function SectionTitleUI_(p: {
    children?: React.ReactNode
    className?: string
    label: React.ReactNode
}) {
    return (
        <b className={`flex ${p.className}`}>
            <div className='mb-auto mt-auto flex-grow'>{p.label}</div>
            {p.children}
        </b>
    )
})
