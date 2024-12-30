import { observer } from 'mobx-react-lite'

export type WidgetPadProps = {
   children: any
   /** Enables the theme-based padding */
   enable?: boolean
}

/** Decoration that gives horizontal padding, uses `group.padding` theme option */
export const WidgetPadUI = observer(function WidgetPadUI_(p: WidgetPadProps) {
   const theme = cushy.preferences.theme.value

   return (
      <div
         style={{
            //
            paddingLeft: `${theme.groups.padding}rem`,
            paddingRight: `${theme.groups.padding}rem`,
         }}
      >
         {p.children}
      </div>
   )
})
