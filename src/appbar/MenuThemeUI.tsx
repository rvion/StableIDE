import { observer } from 'mobx-react-lite'

import { Dropdown } from '../csuite/dropdown/Dropdown'

export const MenuThemeUI = observer(function MenuThemeUI_(p: {}) {
   return (
      <Dropdown //
         title='Theme'
         content={() => <div tw='[width:38rem]'>{cushy.preferences.theme.UI()}</div>}
      />
   )
})
