import type { IconName } from '../icons/icons'
import type { Trigger } from '../trigger/Trigger'
import type { MenuProps } from './Menu'
import type { MenuBuilder } from './MenuBuilder'
import type { MenuEntry } from './MenuEntry'

import { nanoid } from 'nanoid'
import { createElement, type DependencyList, memo, useMemo } from 'react'

import { Menu } from './Menu'
import { MenuInstance } from './MenuInstance'
import { menuManager } from './menuManager'
import { MenuRootUI } from './MenuRootUI'
import { MenuUI } from './MenuUI'

/** simplest way to create a menu template */
export const defineMenuTemplate = <P>(def: MenuTemplateProps<P>): MenuTemplate<P> => new MenuTemplate(def)

export type MenuTemplateID = Tagged<string, 'MenuTemplateID'>
export type MenuTemplateProps<Props> = {
   title: string
   /**
    * used to register menu into menu manager so you can open menu by ref
    * required for hot performant / simple hot reload
    */
   id?: string
   icon?: Maybe<IconName>
   entries: (props: Props, builder: MenuBuilder<any>) => MenuEntry[]
   disabled?: boolean
}

export class MenuTemplate<PROPS> {
   constructor(public def: MenuTemplateProps<PROPS>) {
      this.id = def.id ?? nanoid()
      menuManager.registerMenuTemplate(this)
   }

   id: MenuTemplateID

   /** menut title */
   get title(): string {
      return this.def.title
   }

   /** MenuUI JSX.Elemnt */
   MenuEntriesUI = memo((p: PROPS): React.JSX.Element => {
      const menu = useMemo(() => this.bind(p), [p])
      const menuInst = useMemo(() => new MenuInstance(menu, undefined, null), [menu])
      return createElement(MenuUI, { menu: menuInst })
   })

   /** Menu with a root anchro */
   DropDownUI = memo((p: PROPS): React.JSX.Element => {
      const menu = useMemo(() => this.bind(p), [p])
      const menuInst = useMemo(() => new MenuInstance(menu, undefined, null), [menu])
      return createElement(MenuRootUI, { menu: menuInst })
   })

   /** bind a menu to give props */
   bind = (
      props: PROPS,
      /**
       * at bind time, we can override menu props;
       * e.g. to change title
       */
      overrides?: Partial<MenuProps>,
   ): Menu => {
      const menuProps: MenuProps = {
         title: this.def.title,
         icon: this.def.icon,
         entries: (builder) => this.def.entries(props, builder),
         disabled: this.def.disabled,
         ...overrides,
      }

      return new Menu(menuProps)
   }

   /** bind, wrapped in a useMemo  */
   useBind = (props: PROPS, deps?: DependencyList): Menu => {
      return useMemo(() => this.bind(props), deps ?? [props])
   }

   /** push the menu to current activity */
   open(props: PROPS): Trigger | Promise<Trigger> {
      // TODO probably very bad perf-wise
      return this.bind(props).open()
   }
}
