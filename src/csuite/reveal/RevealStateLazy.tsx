import type { RevealProps } from './RevealProps'

import { makeAutoObservable } from 'mobx'
import { nanoid } from 'nanoid'
import React from 'react'

import { DEBUG_REVEAL } from './RevealProps'
import { RevealState } from './RevealState'

/**
 * state wrapper that lazily initializes the actual state when actually required
 * it's important to keep that class lighweight.
 */
export class RevealStateLazy {
    uid = nanoid()
    childRef = React.createRef<HTMLDivElement>()
    constructor(
        //
        public p: RevealProps,
        public parents: RevealState[],
    ) {
        makeAutoObservable(this, { p: false })
    }
    uistOrNull: RevealState | null = null
    getRevealState = (): RevealState => {
        if (this.uistOrNull) return this.uistOrNull
        if (DEBUG_REVEAL) console.log(`[💙] init RevealUI`)
        this.uistOrNull = new RevealState({ ...this.p }, this.parents)
        return this.uistOrNull!
    }
    onContextMenu = (ev: React.MouseEvent<unknown> | MouseEvent): void => {
        // lock input on shift+right click
        if (ev.shiftKey) {
            this.getRevealState().toggleLock()
            ev.preventDefault() //  = prevent window on non-electron apps
            ev.stopPropagation()
        }
    }
    onClick = (ev: React.MouseEvent<unknown> | MouseEvent): void => this.getRevealState().onLeftClickAnchor(ev)
    onAuxClick = (ev: React.MouseEvent<unknown> | MouseEvent): void => {
        if (ev.button === 1) return this.getRevealState().onMiddleClickAnchor(ev)
        if (ev.button === 2) return this.getRevealState().onRightClickAnchor(ev)
    }
    onMouseEnter = (_: React.MouseEvent<unknown> | MouseEvent): void => this.getRevealState().onMouseEnterAnchor()
    onMouseLeave = (_: React.MouseEvent<unknown> | MouseEvent): void => this.getRevealState().onMouseLeaveAnchor()
    onFocus = (_: React.FocusEvent<unknown> | FocusEvent): void => this.getRevealState().onFocusAnchor()
    onBlur = (_: React.FocusEvent<unknown> | FocusEvent): void => this.getRevealState().onBlurAnchor()
}
