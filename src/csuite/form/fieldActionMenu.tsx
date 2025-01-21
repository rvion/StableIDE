import type { MenuEntry } from '../menu/MenuEntry'
import type { Field } from '../model/Field'
import type { Provenance } from '../provenance/Provenance'

import { MenuDividerUI_ } from '../dropdown/MenuDivider2'
import { defineMenuTemplate, MenuTemplate } from '../menu/MenuTemplate'
import { SimpleMenuAction } from '../menu/SimpleMenuAction'
import { SimpleMenuModal } from '../menu/SimpleMenuModal'
import { potatoClone } from '../utils/potatoClone'
import { toastInfo } from '../utils/toasts'
import { CreatePresetUI } from './CreatePresetUI'

export type FieldActionMenuProps = {
   field: Field
   provenance?: Maybe<Provenance>
}

export const fieldActionMenu: MenuTemplate<FieldActionMenuProps> = defineMenuTemplate({
   title: 'widget actions',
   entries: ({ field, provenance }) => {
      const out: MenuEntry[] = []
      // CREATE PRESET ACTION
      const presets = field.config.presets ?? []
      out.push(
         new MenuTemplate({
            icon: 'mdiLanguageXaml',
            title: `Presets ${presets.length}`,
            disabled: presets.length === 0,
            entries: (): MenuEntry[] =>
               presets.map(
                  (entry) =>
                     new SimpleMenuAction({
                        label: entry.label,
                        icon: entry.icon,
                        onClick: (): void => entry.apply(field),
                     }),
               ),
         }).bind({}),
      )
      out.push(
         new SimpleMenuModal({
            label: 'Create Preset',
            icon: 'mdiPlus',
            submit: (): void => {
               console.log(`[🤠] values`)
            },
            UI: (w): React.JSX.Element => <CreatePresetUI field={field} />,
         }),
      )
      out.push(
         new SimpleMenuAction({
            label: 'Open in VSCode',
            icon: 'mdiMicrosoftVisualStudioCode',
            disabled: (): boolean => provenance == null,
            onClick: (): Promise<void> | void => {
               console.log(`[🤠] `, provenance)
               return provenance?.open?.()
            },
         }),
      )
      // RESET
      out.push(
         new SimpleMenuAction({
            label: 'Reset',
            icon: 'mdiUndoVariant',
            disabled: (): boolean => !field.hasChanges,
            onClick: (): void => void field.reset(),
         }),
      )
      out.push(MenuDividerUI_)
      out.push(
         new SimpleMenuAction({
            label: 'Save Snapshot',
            icon: 'mdiArrowLeftBox',
            onClick: (): void => {
               const snap = field.saveSnapshot()
               console.log(JSON.stringify(potatoClone(snap), null, 4))
            },
         }),
      )

      out.push(
         new SimpleMenuAction({
            label: 'Restore Snapshot',
            icon: 'mdiArrowRightBox',
            disabled: (): boolean => !field.hasSnapshot,
            onClick: (): void => void field.revertToSnapshot(),
         }),
      )
      out.push(MenuDividerUI_)

      // COLLAPSE ALL CHILDREN
      out.push(
         new SimpleMenuAction({
            label: 'Collapse All',
            icon: 'mdiCollapseAll',
            onClick: (): void => field.collapseAllChildren(),
         }),
      )

      // EXPAND ALL CHILDREN
      out.push(
         new SimpleMenuAction({
            label: 'Expand All',
            icon: 'mdiExpandAll',
            disabled: field.hasNoChild,
            onClick: (): void => field.expandAllChildren(),
         }),
      )

      out.push(MenuDividerUI_)

      // out.push(
      //     new SimpleMenuAction({
      //         label: 'Create Preset (V2)',
      //         onPick: () => cushy.layout.addCustomV2(CreatePresetUI, { widget /* 🔴 */ }),
      //     }),
      // )
      // if (presets.length > 0) {
      // // out.push(MenuDividerUI_)
      // for (const entry of presets) {
      //     out.push(
      //         new SimpleMenuAction({
      //             label: entry.label,
      //             icon: entry.icon,
      //             onClick: (): void => entry.apply(field),
      //         }),
      //     )
      // }
      // }
      out.push(MenuDividerUI_)
      out.push(
         new SimpleMenuAction({
            label: `copy path (${field.path})`,
            icon: 'mdiContentCopy',
            onClick: (): Promise<void> => {
               toastInfo(field.path)
               return navigator.clipboard.writeText(field.path)
            },
         }),
      )
      out.push(
         new SimpleMenuAction({
            label: `copy pathExt (${field.pathExt})`,
            icon: 'mdiContentCopy',
            onClick: (): Promise<void> => {
               toastInfo(field.path)
               return navigator.clipboard.writeText(field.pathExt)
            },
         }),
      )

      return out
      // CUSTOM ACTIONS
      // return [
      //     new SimpleMenuEntry('foo', () => console.log('foo')),
      //     new SimpleMenuEntry('bar', () => console.log('foo')),
      //     //
      //     // cmd_copyImage.bind(image),
      //     // menu_copyImageAs.bind(image),
      // ]
   },
})
