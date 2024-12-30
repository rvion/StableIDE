import { observer } from 'mobx-react-lite'

export const BasicShelfContentUI = observer(function BasicShelfContentUI_(
   p: React.HTMLAttributes<HTMLDivElement>,
) {
   return <div tw='flex flex-1 overflow-auto' {...p} />
})
