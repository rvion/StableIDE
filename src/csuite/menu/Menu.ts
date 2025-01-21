import type { IconName } from '../icons/icons'
import type { MenuBuilder } from './MenuBuilder'
import type { MenuEntry } from './MenuEntry'

import { nanoid } from 'nanoid'
import { createElement, useMemo } from 'react'

import { activityManager } from '../activity/ActivityManager'
import { MenuSym } from '../introspect/_isMenu'
import { Trigger } from '../trigger/Trigger'
import { MenuBarUI } from './MenuBarUI'
import { MenuInstance } from './MenuInstance'
import { MenuRootUI } from './MenuRootUI'

/**
 * simplest way to create a menu template when your menu has no props.
 * if it has props, you probably want to use `defineMenuTemplate` instead.
 * and bind the menuTemplate to give it props where it makes sense.
 */
export const defineMenu = (def: MenuProps): Menu => new Menu(def)

export type MenuID = Tagged<string, 'MenuID'>

export type MenuProps = {
   title: string
   /**
    * used to register menu into menu manager so you can open menu by ref
    * required for hot performant / simple hot reload
    */
   id?: string
   icon?: Maybe<IconName>
   entries: (builder: MenuBuilder<any>) => MenuEntry[]
   disabled?: boolean
}

export class Menu {
   id: MenuID
   $SYM = MenuSym

   get title(): string {
      return this.def.title
   }

   get icon(): Maybe<IconName> {
      return this.def.icon
   }

   constructor(public def: MenuProps) {
      this.id = def.id ?? nanoid()
      // /menuManager.registerMenuTemplate(this)
   }

   UI = (): React.JSX.Element => {
      const menuInst = useMemo(() => new MenuInstance(this, undefined, null), [])
      return createElement(MenuRootUI, { menu: menuInst })
   }

   DropDownUI = (): React.JSX.Element => {
      const menuInst = useMemo(() => new MenuInstance(this, undefined, null), [])
      return createElement(MenuRootUI, { menu: menuInst })
   }

   MenuBarUI = (p: { autoFocus?: boolean }): React.JSX.Element => {
      const menuInst = useMemo(() => new MenuInstance(this, undefined, null), [])
      return createElement(MenuBarUI, { menu: menuInst, autoFocus: p.autoFocus })
   }

   /** what is it used for  */
   init = (keysTaken?: Set<string>): MenuInstance => {
      return new MenuInstance(this, keysTaken, null)
   }

   /** push the menu to current activity */
   open(): Trigger | Promise<Trigger> {
      const instance = new MenuInstance(this, undefined, null)
      activityManager.start(instance)
      return Trigger.Success
   }
}
