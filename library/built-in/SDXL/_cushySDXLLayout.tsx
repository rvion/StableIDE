import type { DisplayRule } from '../../../src/csuite-cushy/presenters/Renderer'
import type { IconName } from '../../../src/csuite/icons/icons'
import type { $CushySDXLUI } from './_cushySDXLSchema'

import { observer } from 'mobx-react-lite'

import { ShellOptionalEnabledUI } from '../../../src/csuite/fields/optional/WidgetOptional'
import { IkonOf } from '../../../src/csuite/icons/iconHelpers'
import { InputNumberUI } from '../../../src/csuite/input-number/InputNumberUI'

export function _cushySDXLLayout(): Maybe<DisplayRule<$CushySDXLUI['$Field']>> {
   const ree = 1.0
   return (ui) => {
      const xxx = ui.field.Latent.bField
      // ui.apply({
      //     layout: () => [
      //         //
      //         <div>{`${xxx.logicalParent?.path} | ${xxx.logicalParent?.type}`}</div>,
      //         <div>{`${xxx.logicalParent?.logicalParent?.path} | ${xxx.logicalParent?.logicalParent?.type}`}</div>,
      //         <div>{`${xxx.type}`}</div>,
      //         '*',
      //     ],
      //     // layout: () => [
      //     //     <Card hue={knownOKLCHHues.success}>
      //     //         <ui.field.Positive.UI />
      //     //         <ui.field.PositiveExtra.UI />
      //     //         {ui.field.Extra.fields.promtPlus && <ui.field.Extra.fields.promtPlus.UI />}
      //     //         {ui.field.Extra.fields.regionalPrompt && <ui.field.Extra.fields.regionalPrompt.UI />}
      //     //     </Card>,
      //     //     <Card hue={knownOKLCHHues.info}>
      //     //         <ui.field.Model.UI />
      //     //     </Card>,
      //     //     '*',
      //     // ],
      // })
      const model = ui.field.Model
      const latent = ui.field.Latent
      ui.for(ui.field.Positive.Prompts, {
         Head: false,
         Header: false,
         Body: observer((p) => (
            <ui.catalog.list.BlenderLike<typeof p.field> //
               field={p.field}
               renderItem={(item, index) => {
                  const conditioningIcon: IconName = index == 0 ? 'mdiArrowDown' : 'mdiFormatListGroupPlus'
                  return (
                     <ui.catalog.Misc.Frame tw='flex items-center' hover key={item.id}>
                        <span tw={['line-clamp-1 w-full flex-grow px-1', !item.active && 'opacity-50']}>
                           {item.child.text}
                        </span>
                        <div tw='flex-none'>
                           <IkonOf name={conditioningIcon} />
                        </div>
                        <div tw='w-2' />
                        <div tw='flex-none'>
                           {/* <InputNumberUI
                              // TODO(bird_d/ui/logic): Implement showing strength based on the conditioning type, should only appear on blend/add/etc. concate doesn't need it for example.
                              mode='float'
                              hideSlider
                              onValueChange={() => {}}
                              value={ree}
                           /> */}
                           <ui.catalog.Misc.Checkbox
                              square // TODO(bird_d/ui): Buttons like this, where there's only an icon, should just automatically apply square if there's no text/children.
                              toggleGroup='prompt'
                              value={item.active}
                              onValueChange={(v) => item.setActive(v)}
                           />
                        </div>
                     </ui.catalog.Misc.Frame>
                  )
               }}
            />
         )),
      })
      ui.forAllFields((ui2) => {
         if (ui2.field.parent?.parent === ui.field.Positive.Prompts) {
            ui2.apply({ Head: false })
         }
         if (ui2.field.parent === ui.field.Positive.Prompts) {
            ui2.apply({ Shell: ShellOptionalEnabledUI })
         }
      })
      ui.for(latent.bField, { Shell: ui.catalog.Shell.Left })
      // ui.for(ui.field.PositiveExtra, { Title: null })
      // ui.for(ui.field.Model.Extra.fields.pag, {
      //     Shell: ui.catalog.Shell.Left,
      //     Title: ui.catalog.Title.h3,
      //     Decoration: ui.catalog.Decorations.Card,
      // })
      ui.forAllFields((ui2) => {
         // ui2.apply()
         const isTopLevelGroup = ui2.field.depth === 1 && true //

         // (ui2.field.type === 'group' || ui2.field.type === 'list' || ui2.field.type === 'choices')
         if (ui2.field.parent?.parent === ui.field.Positive.Prompts) {
            ui2.apply({
               Icon: false,
               Shell: ui.catalog.Shell.List1,
            })
         }
         if (isTopLevelGroup) {
            ui2.apply({
               // Decoration: ui2.catalog.Decorations.Card,
               // Decoration: (p) => <ui.catalog.Decorations.Card hue={hashStringToNumber(ui2.field.path)} {...p} />,
               Title: ui2.catalog.Title.h3,
            })
         }
         if (
            ui2.field.path.startsWith(latent.path + '.') &&
            ui2.field.type !== 'shared' &&
            ui2.field.type !== 'optional'
         )
            ui2.apply({ Shell: ui.catalog.Shell.Right })

         if (ui2.field.path.startsWith(model.path + '.')) ui2.apply({ Shell: ui.catalog.Shell.Right })

         let should = ui2.field.path.startsWith(ui.field.Sampler.path + '.')
         should = ui2.field.depth >= 2
         if (should) {
            if (ui2.field.isOfType('group', 'list', 'choices')) ui2.apply({ Title: ui.catalog.Title.h4 })
            if (!ui2.field.isOfType('optional', 'link', 'list', 'shared'))
               ui2.apply({ Shell: ui.catalog.Shell.Right })
         }
      })
   }
}
