# Embracing mobx `observer(...)` even when it seems unnecessary

When you are using mobx, you may want to wrap all your components in `observer` wrapper.
even When it seems unnecessary.


Let's take that simple component

```tsx
export const IconUI = (p: { icon: string }) => (
   <span>
      {p.icon}
   </span>
)
```

You may probably want to wrap them in `observer` wrapper:

```tsx
import { observer } from "mobx-react-lite";

export const IconUI = observer(function IconUI_(p: { icon: string }): React.JSX.Element {
   return (
      <span>
         {p.icon}
      </span>
   )
})

```

Why ?

- [obvious            | week argument  ] future-proofing yourself; if you add some stuff later, you can always
- [less obvious       | good argument  ] you probably want the `memo` part that comes with useObserver.
- [not obvious at all | strong argument] enable you to use getters in your props :O

```tsx
import {IconUI} from './IconUI'

const ExpensiveComponent = observer(function ExpensiveComponent() {
   const store = useStore()
   return (
      <div>
         <IconUI {...{get icon(){return <observable-expression>}}} />
      </div>
   )
})
```

Here, the dereferencing of the icon will be done **WITHIN** the `IconUI` component, not the
`ExpensiveComponent`, hence speeding up the rendering of the `ExpensiveComponent` component
quite a lot.