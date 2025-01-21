import type { IconName } from '../icons/icons'
import type { Trigger } from '../trigger/Trigger'
import type { Command } from './Command'

import { BoundCommandSym } from '../introspect/_isBoundCommand'
import { cmdHelper } from './CmdHelper'

export type BoundCommandOpts = { label?: string }

/** A bound command; ready to be executed */
export class BoundCommand<Ctx = any> {
   /**
    * this symbol is for DI, so we can have some `instanceOf`
    * equivalent that works without dependency
    */
   $SYM = BoundCommandSym

   constructor(
      private command: Command<Ctx>,
      private ctx: Ctx,
      private ui?: BoundCommandOpts,
   ) {}

   execute = (): Trigger | Promise<Trigger> => {
      return this.command.conf.action(this.ctx, cmdHelper)
   }

   get icon(): IconName | undefined {
      return this.command.icon
   }

   NavBarBtnUI = (p: { label?: string }): React.JSX.Element => {
      return <div onClick={() => this.execute()}>{p.label ?? this.label}</div>
   }

   get label(): string {
      return this.ui?.label ?? this.command.label
   }
}
