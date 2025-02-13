import type { Command } from '../csuite/commands/Command'
import type { IconName } from '../csuite/icons/icons'
import type { PanelCategory } from './PanelCategory'

import { ctx_global } from '../csuite/command-topic/ctx_global'
import { command } from '../csuite/commands/Command'
import { defineMenu, type Menu } from '../csuite/menu/Menu'
import { SimpleMenuAction } from '../csuite/menu/SimpleMenuAction'
import { Trigger } from '../csuite/trigger/Trigger'

export type PanelHeader = {
   title: string
   icon?: IconName
}

export type PanelPreset<Props> = {
   props: Partial<Props>
   icon?: IconName
   name?: string
}

export type PanelDef<Props> = {
   //
   name: string
   category: PanelCategory
   widget: () => React.FC<Props>
   header: (p: NoInfer<Props>) => PanelHeader
   icon: IconName
   def: () => NoInfer<Props>
   presets?: {
      [name: string]: () => PanelPreset<Props>
   }
   about?: string
   tabColor?: string
}

// TODO: rename to `Page`
export class Panel<Props> {
   $PanelHeader!: PanelHeader
   $Props!: Props

   /** default command to open the panel with default props */
   defaultCommand: Command

   constructor(public p: PanelDef<Props>) {
      this.defaultCommand = command({
         id: 'panel.default.open.' + this.name,
         description: `Open ${this.name} panel`,
         label: this.name,
         ctx: ctx_global,
         action: () => {
            const props: Props = this.p.def()
            cushy.layout.open(this.name as any, props, { where: 'left' })
            return Trigger.Success
         },
         icon: this.icon,
      })
   }

   get category(): PanelCategory {
      return this.p.category
   }

   get name(): string {
      return this.p.name
   }

   get tabColor(): Maybe<string> {
      return this.p.tabColor
   }

   get widget(): React.FC<Props> {
      return this.p.widget()
   }

   get header(): (p: NoInfer<Props>) => PanelHeader {
      return this.p.header
   }

   get icon(): IconName | undefined {
      return this.p.icon
   }

   get menuEntries(): (Menu | Command)[] {
      const presets = Object.entries(this.p.presets ?? {})
      const out: (Menu | Command)[] = []

      const defEntry = this.defaultCommand /* new SimpleMenuAction({
            label: this.name,
            icon: this.p.icon,
            onPick: () => {
                const props: Props = this.p.def()
                cushy.layout.FOCUS_OR_CREATE(this.name as any, {}, 'LEFT_PANE_TABSET')
            },
        }) */
      const baseProps = this.p.def()
      if (presets.length === 0) {
         out.push(defEntry)
      } else {
         const sub = presets.map(([name, presetFn]) => {
            return new SimpleMenuAction({
               label: name,
               icon: this.p.icon,
               onClick: (): void => {
                  const preset: PanelPreset<any> = presetFn()
                  const props: Props = { ...baseProps, ...preset.props }
                  cushy.layout.open(this.name as any, props, { where: 'left' })
               },
            })
         })
         const x: Menu = defineMenu({
            icon: this.p.icon,
            title: this.name,
            id: this.name,
            entries: () => [defEntry, ...sub],
         })
         out.push(x)
      }
      return out
   }
}
