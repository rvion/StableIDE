import type { IconName } from '../icons/icons'

import { makeAutoObservable } from 'mobx'

import { Button } from '../button/Button'
import { CommandSym } from '../introspect/_isCommand'
import { Trigger } from '../trigger/Trigger'
import { BoundCommand } from './BoundCommand'
import { cmdHelper, type CmdHelper } from './CmdHelper'
import { commandManager, type CushyShortcut } from './CommandManager'

// ------------------------------------------------------------------------------------------
// COMMAND = a function with a name, a description, and a condition whether it can be started or not
type Command_<Ctx = any> = {
    icon?: IconName
    combos?: CushyShortcut | CushyShortcut[]
    label: string
    id: string // ❓ make optional ; autogenerated ?
    description?: string
    ctx: CommandContext<Ctx>
    action: (t: Ctx, CmdHelper: CmdHelper) => Trigger | Promise<Trigger>
    /** placeholder; unused for now */
    undo?: (t: Ctx) => Trigger | Promise<Trigger>
    // keymap
    validInInput?: boolean
    continueAfterSuccess?: boolean
    // menu?: (p: Props, t: Ctx) => MenuEntry[]
    /** menuEntries */
}

// ------------------------------------------------------------------------------------------
export interface Command<Ctx = any> extends Command_<Ctx> {}
export class Command<Ctx = any> {
    $SYM = CommandSym

    /** alias for label */
    get title(): string {
        return this.label
    }

    get firstCombo(): CushyShortcut | undefined {
        if (this.combos == null) return undefined
        if (Array.isArray(this.combos)) {
            if (this.combos.length === 0) return undefined
            else return this.combos[0]
        } else return this.combos
    }

    constructor(public conf: Command_<Ctx>) {
        Object.assign(this, conf)
    }

    /** bind a command to a static context, bypassing its context provider */
    bind(ctx: Ctx): BoundCommand<Ctx> {
        return new BoundCommand(this, ctx)
    }

    /**
     * method to programmatically call a command,
     * using when to both extract context and check if command can run
     */
    execute = (): Trigger | Promise<Trigger> => {
        const context = this.conf.ctx.check()
        if (context === Trigger.UNMATCHED) return Trigger.UNMATCHED
        const res = this.conf.action?.(context!, cmdHelper)
        return res
    }

    NavBarBtnUI = (p: { label?: string }): JSX.Element => {
        return (
            <Button border={false} onClick={() => this.execute()}>
                {p.label ?? this.label}
            </Button>
        )
    }
}

// ------------------------------------------------------------------------------------------
export class CommandContext<Ctx = any> {
    constructor(
        /** display name */
        public name: string,

        /** actual function code */
        public check: () => Ctx | Trigger.UNMATCHED,
    ) {
        makeAutoObservable(this)
    }

    /** set of all commands that have been registered will be listed there */
    commands: Set<Command<Ctx>> = new Set()

    /** list of known commands based on this context */
    get commandsArr(): Command<Ctx>[] {
        return Array.from(this.commands)
    }

    /** register a new command in the global command manager */
    command(p: {
        combo: CushyShortcut | CushyShortcut[]
        idSuffix?: string
        label: string
        action?: (t: Ctx) => Trigger | Promise<Trigger>
        /** @default true */
        validInInput?: boolean
        icon?: IconName
    }): Command<Ctx> {
        return command({
            id: `tree.${p.idSuffix}`,
            combos: Array.isArray(p.combo) ? p.combo : [p.combo],
            label: p.label,
            ctx: this,
            validInInput: true,
            action: p.action ?? ((): Trigger => Trigger.UNMATCHED),
            icon: p.icon,
        })
    }

    /**
     * create a new sub-command context
     * that may be UNMATCHED in more cases; or have some more specific value
     */
    derive<X>(fn: (ctx: Ctx) => X | Trigger.UNMATCHED): CommandContext<X> {
        return new CommandContext<X>(this.name, () => {
            const ctx = this.check()
            if (ctx === Trigger.UNMATCHED) return Trigger.UNMATCHED
            return fn(ctx)
        })
    }
}

// small helper to create commands and register them globally
export function command<Ctx extends any>(t: Omit<Command_<Ctx>, 'type'>): Command<Ctx> {
    const cmd = new Command(t as any)
    commandManager.registerCommand(cmd)
    return cmd
}
