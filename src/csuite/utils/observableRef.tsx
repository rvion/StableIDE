import type { DependencyList } from 'react'

import { makeAutoObservable, observable } from 'mobx'
import { useMemo } from 'react'

export function useObservableRef<T extends any>(deps: DependencyList): ObservableRef<T> {
   return useMemo(() => new ObservableRef(), deps)
}

export function createObservableRef<T extends any>(value?: T): ObservableRef<T> {
   return new ObservableRef(value)
}

export class ObservableRef<T extends any> {
   private _onFirstMount: ((value: T) => void) | null = null

   focusOnMountOrNowIfMounted(): void {
      this.onMount((value) => {
         if (value instanceof HTMLElement) value.focus()
      })
   }

   onMount(fn: (value: T) => void): void {
      if (this._current !== null) fn(this._current)
      else this._onFirstMount = fn
   }

   constructor(private _current: T | null = null) {
      makeAutoObservable<this, '_current'>(this, { _current: observable.ref })
   }

   get current(): T | null {
      return this._current ?? null
   }

   set current(value: T | null) {
      this._current = value

      if (value != null && this._onFirstMount !== null) {
         this._onFirstMount(value)
         this._onFirstMount = null
      }
   }
}
