import { observer } from 'mobx-react-lite'

export const IconUI = observer(function IconUI_(p: { icon: string; color?: string }): React.JSX.Element {
   return (
      <span
         className='material-symbols-outlined'
         style={{ fontSize: '1.2em', verticalAlign: 'middle', color: p.color }}
      >
         {p.icon}
      </span>
   )
})
