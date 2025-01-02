import type { IconName } from '../../../../src/csuite/icons/icons'
import type { UI_LatentV3 } from '../../_prefabs/prefab_latent_v3'
import type { $WeaverPromptList } from './prompting/WeaverPrompting'

import { observer } from 'mobx-react-lite'

export type StackType = 'conditioning' | 'latent'

export type StackData = X.XGroup<{
   name: X.XString
   data: X.XOptional<
      X.XChoices<{
         prompting: $WeaverPromptList
         latent: UI_LatentV3
      }>
   >
}>

export const StackCardUI = observer(function StackCardUI_(p: {
   field: StackData['$Field']
   stackField: X.XList<StackData>['$Field']
   stackIndex: number
   icon?: IconName
   children?: React.ReactNode
}) {
   const theme = cushy.preferences.theme.value

   return (
      <UY.Misc.Frame
         tw='overflow-clip'
         base={{ contrast: 0.1 }}
         border={theme.groups.border}
         roundness={theme.global.roundness}
      >
         <UY.Misc.Frame tw='select-none !gap-2 px-2 py-1' line>
            <UY.Misc.Frame row line linegap={false}>
               <UY.boolean.default
                  tw='!border-none !bg-transparent'
                  // subtle
                  square
                  size='input'
                  display='button'
                  toggleGroup='h802w4ggh704b9w34gb9'
                  // borderless
                  value={p.field.isCollapsed}
                  icon={p.field.isCollapsed ? 'mdiChevronRight' : 'mdiChevronDown'}
                  onValueChange={() => {
                     p.field.toggleCollapsed()
                  }}
               />
               <UY.Misc.Frame square size='input' icon={p.icon} />
            </UY.Misc.Frame>
            <UY.Misc.Frame
               //
               align
               border
               expand
               line
               row
               dropShadow={theme.global.shadow}
               roundness={theme.global.roundness}
            >
               <UY.string.input field={p.field.Name} />
               <UY.boolean.default
                  display='button'
                  square
                  size={'input'}
                  toggleGroup='stackEnable'
                  // active={p.field.Data.active}
                  value={p.field.Data.active}
                  onValueChange={(value) => {
                     p.field.Data.setActive(value)
                  }}
                  icon={p.field.Data.active ? 'mdiCheckboxBlankCircle' : 'mdiCheckboxBlankCircleOutline'}
               />
            </UY.Misc.Frame>
            <UY.Misc.Button
               tw='!border-none !bg-transparent'
               subtle
               square
               size='input'
               icon={'mdiClose'}
               onClick={() => {
                  p.stackField.removeItemAt(p.stackIndex)
               }}
            />
         </UY.Misc.Frame>
         {!p.field.isCollapsed && p.children}
      </UY.Misc.Frame>
   )
})
