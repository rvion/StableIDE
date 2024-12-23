import type { BaseSchema } from '../../model/BaseSchema'
import type { FieldConfig } from '../../model/FieldConfig'
import type { FieldSerial } from '../../model/FieldSerial'
import type { Repository } from '../../model/Repository'
import type { Problem_Ext } from '../../model/Validation'

import { reaction } from 'mobx'

import { Field, type KeyedField, type VALUE_MODE } from '../../model/Field'
import { bang } from '../../utils/bang'
import { clamp_or_min_or_zero } from '../../utils/clamp'
import { registerFieldClass } from '../WidgetUI.DI'
import { hole, type HOLE } from './HOLE'
import { ListButtonAdd100ItemsUI } from './ListButtonAdd100ItemsUI'
import { ListButtonAddUI } from './ListButtonAddUI'
import { ListButtonClearUI } from './ListButtonClearUI'
import { ListButtonFoldUI } from './ListButtonFoldUI'
import { ListButtonUnfoldUI } from './ListButtonUnfoldUI'
import { WidgetList_BodyUI } from './WidgetList_BodyUI'
import { WidgetList_LineUI } from './WidgetList_LineUI'

// #region 🔶AUTO
interface AutoBehaviour<out T extends BaseSchema> {
   /** list of keys that must be present */
   keys(self: T['$Field']): string[] // ['foo', 'bar', 'baz']

   /** for every item given by the list above */
   getKey(self: T['$Field'], ix: number): string

   /** once an item if  */
   init(key: string /* foo */): T['$Value']
}

// #region CONFIG
export interface Field_list_config<out T extends BaseSchema>
   extends FieldConfig<
      {
         /**
          * item schema;
          * function notation to support tuples
          */
         element: ((ix: number) => T) | T

         /**
          * when specified, the list will work in some AUTOMATIC mode
          *  - disable the "add" button
          *  - disable the "remove" button
          *  - disable the "clear" button
          *  - automatically add or remove missing items when reaction
          *  - subscribe via mobx to anything you want
          */
         auto?: AutoBehaviour<T>

         /** @default: true */
         sortable?: boolean

         // #region config DEFAULT
         /**
          * mininum length;
          * if min > 0, list will be populated on creation
          * if length < min, list will be populated with empty items
          * if length <= min, list will not be clearable
          * */
         min?: number

         /** max length */
         max?: number

         defaultLength?: number
      },
      Field_list_types<T>
   > {}

// #region SERIAL type
export type Field_list_serial<T extends BaseSchema> = FieldSerial<{
   $: 'list'
   /** when undefined, means the list has not be `set` yet */
   items_?: (T['$Serial'] | HOLE)[]
   size?: number
}>

// #region VALUE type
export type Field_list_value<T extends BaseSchema> = T['$Value'][]
export type Field_list_unchecked<T extends BaseSchema> = T['$Unchecked'][]

// #region $FieldType
export type Field_list_types<T extends BaseSchema> = {
   $Type: 'list'
   $Config: Field_list_config<T>
   $Serial: Field_list_serial<T>
   $Value: Field_list_value<T>
   $Unchecked: Field_list_unchecked<T>
   $Field: Field_list<T>
   $Child: T['$Field']
   $Reflect: Field_list_types<T>
}

// #region STATE
export class Field_list<T extends BaseSchema> //
   extends Field<Field_list_types<T>>
{
   // #region TYPE
   static readonly type: 'list' = 'list'
   static readonly emptySerial: Field_list_serial<any> = { $: 'list' }
   static codegenValueType(config: Field_list_config<any>): string {
      // 💬 2024-10-11 rvion:
      // | we should finally remove support for dynamic children without going first though dynamic !
      const schemaAt0 = typeof config.element === 'function' ? config.element(0) : config.element
      return `${schemaAt0.codegenValueType()}[]`
   }
   static migrateSerial(): undefined {}

   // #region UI
   DefaultHeaderUI = WidgetList_LineUI
   DefaultBodyUI = WidgetList_BodyUI

   // #region UI/preview
   /** size of the preview */
   get size(): number {
      return this.serial.size ?? this._defaultPreviewSize
   }

   set size(val: number) {
      this.runInTransaction(() => {
         this.patchSerial((serial) => {
            if (val === this._defaultPreviewSize) delete serial.size
            else serial.size = val
         })
      })
   }

   private get _defaultPreviewSize(): number {
      return 128
   }

   // #region ....
   get isOwnSet(): boolean {
      return this.serial.items_ != null
   }

   get length(): number {
      return this.items.length
   }

   items: T['$Field'][] = []

   get last(): T['$Field'] | null {
      return this.items[this.items.length - 1] ?? null
   }
   get first(): T['$Field'] | null {
      return this.items[0] ?? null
   }

   get hasChanges(): boolean {
      // 💬 2024-06-?? rvion:
      //  | in auto mode, length is managed,
      //  | so we must not take it into account
      // 💬 2024-07-05 rvion:
      //   | ^^^ 🤔< NOT SURE about my previous opinion here
      //   |         I'll add some '🔴' for future review
      if (!this.config.auto) {
         const defaultLength = clamp_or_min_or_zero(
            this.config.defaultLength,
            this.config.min,
            this.config.max,
         )
         if (this.items.length !== defaultLength) return true
      }
      // check if any remaining item has changes
      return this.items.some((i) => i.hasChanges)
   }

   // resetSmart(): void {
   //     // fix size
   //     if (!this.config.auto) {
   //         const defaultLength = clampOpt(this.config.defaultLength, this.config.min, this.config.max)
   //         for (let i = this.items.length; i > defaultLength; i--) this.removeItem(this.items[i - 1]!)
   //         for (let i = this.items.length; i < defaultLength; i++) this.addItem({ skipBump: true })
   //     }

   //     // reset all remaining values
   //     for (const i of this.items) i.reset()
   // }

   findItemIndexContaining(widget: Field): number | null {
      let at = widget as Field | null
      let child = at
      while (at != null) {
         at = at.parent
         if (at === this) {
            return this.items.indexOf(child as T['$Field'])
         }
         child = at
      }
      return null
   }

   get childrenAll(): T['$Field'][] {
      return this.items
   }

   get subFieldsWithKeys(): KeyedField[] {
      return this.items.map((field, ix) => ({ key: ix.toString(), field }))
   }

   schemaAt(ix: number): T {
      const _schema = this.config.element
      const schema: T =
         typeof _schema === 'function' //
            ? _schema(ix)
            : _schema
      return schema
   }

   get isAuto(): boolean {
      return this.config.auto != null
   }

   // probably slow and clunky;
   // TODO: rewrite this piece of crap
   private startAutoBehaviour(): void {
      const auto = this.config.auto
      if (auto == null) return

      const disposeFn = reaction(
         () => auto.keys(this),
         (keys: string[]) => {
            this.runInTransaction(() => {
               // 1. Add missing entries
               const currentKeys: string[] = this.items.map((i, ix) => auto.getKey(i, ix))
               const missingKeys: string[] = keys.filter((k) => !currentKeys.includes(k))
               for (const k of missingKeys) {
                  this.addItem({ value: auto.init(k) })
               }

               // 2. delete items that must be removed.
               let ix = 0
               for (const item of this.items.slice()) {
                  const isExtra = !keys.includes(auto.getKey(item, ix++))
                  if (!isExtra) continue
                  this.removeItem(item)
               }
            })
         },
         { fireImmediately: true },
      )

      this.disposeFns.push(disposeFn)
   }

   constructor(
      repo: Repository,
      root: Field | null,
      parent: Field | null,
      schema: BaseSchema<Field_list<T>>,
      initialMountKey: string,
      serial?: Field_list_serial<T>,
   ) {
      super(repo, root, parent, schema, initialMountKey, serial)
      this.init(serial, {
         // UI
         DefaultHeaderUI: false,
         DefaultBodyUI: false,

         // values
         value_or_fail: false,
         value_or_zero: false,
         value_unchecked: false,
      })
      this.startAutoBehaviour()
   }

   at(ix: number): T['$Field'] | undefined {
      return this.items[ix]
   }

   get valueArr(): Field_list_value<T> {
      return this.items.map((i) => i.value)
   }

   valueArrMode(mode: VALUE_MODE): Field_list_value<T> | Field_list_unchecked<T> {
      return this.items.map((i) => i.getValue(mode))
   }

   _acknowledgeNewChildSerial(
      //
      mountKey: string,
      nextChildSerial: any,
   ): boolean {
      // parse index
      const index = parseInt(mountKey, 10)

      // ensure index is valid
      if (isNaN(index))
         throw new Error(`❌ FieldList._acknowledgeNewChildSerial: parsed index is Nan (raw=${mountKey})`)
      if (index < 0) throw new Error(`❌ FieldList._acknowledgeNewChildSerial: index(${index}) is < 0`)
      if (index > this.items.length)
         throw new Error(`❌ FieldList._acknowledgeNewChildSerial: index is OOB (${index}`)

      // make sure the serial.items_ is set (akin to saying that from now-on, the field is `set`)
      // 💬 2024-09-11 rvion:
      // | 🔴 we could actually throw here 🤔
      // | it's probably possible to make sure this is set before, since we're in control of
      // | all primitive actions on that field.
      if (this.serial.items_ == null) {
         this.patchSerial((draft) => void (draft.items_ = []))
      }

      // swap the pointer in the serial.items_ array at given index to new serial
      return this.patchSerial((draft) => {
         draft.items_![index] = nextChildSerial
      })
   }

   get isCollapsible(): boolean {
      return this.length > 0
   }

   protected setOwnSerial(next: Field_list_serial<T>): void {
      // reset every previous value (🔴 pretty bad; reconciliation would be better)
      for (const item of this.items) item.disposeTree()

      // reset the instance list (🔴 again, pretty bad; reconciliation would be better)
      this.items = []

      // 2. ASSIGN SERIAL
      this.assignNewSerial(next)

      // apply default value
      // IF AND ONLY IF both
      //  - we are NOT in auto mode
      //  - we are not set yet
      if (next.items_ == null) {
         if (!this.config.auto) {
            const defaultLength = this.config.defaultLength // clamp_or_null(this.config.defaultLength, this.config.min, this.config.max)
            // console.log(`[🤠] AA defaultLength`, defaultLength)
            if (defaultLength == null) {
               // no default, we never set the `draft.items_`, so the
               // field remains unset
               return
            }

            this.patchSerial((draft) => void (draft.items_ = []))
            for (let i = this.items.length; i < defaultLength; i++) {
               this.addItem({ applyEvenIfAtMaxLen: true })
            }
         }
         return
      }

      const nextChildrenSerials = next.items_
      for (const [ix, subSerial] of nextChildrenSerials.entries()) {
         const schema = this.schemaAt(ix)
         const mountKey = ix.toString()

         if (subSerial == null) throw new Error('❌ List item serial is null; invariant violation')
         if (subSerial == hole) throw new Error('❌ List item serial is hole; invariant violation')

         this.RECONCILE({
            mountKey,
            correctChildSchema: schema,
            existingChild: null,
            targetChildSerial: subSerial,
            // ⏸️ targetChildSerial: subSerial === hole ? null : subSerial,
            // ⏸️ targetChildSerial: subSerial === hole ? schema.fieldConstructor.emptySerial : subSerial,
            attach: (sub) => {
               // console.log(`[🤠] setOwnSerial > reconciled created a new child`, mountKey)
               // push instead of doing [ix]= ... since we're re-creating them in order
               this.items.push(sub)
               // bang(this.serial.items_).push(sub.serial)
            },
         })
         // const subWidget = schema.instanciate(this.repo, this.root, this, subSerial)
         // this.items.push(subWidget)
      }

      // 💬 2024-09-10: 🙅🙅‍♀️🙅‍♂️ < NO LONGER TRUE !!
      // | we don't want to invent data by default
      // |
      // | ```ts
      // | // 3. add missing items if min specified
      // | const missingItems = (this.config.min ?? 0) - this.items.length
      // | for (let i = 0; i < missingItems; i++) {
      // |     this.addItem()
      // | }
      // | ```
   }

   /**
    * code below is very wtf, and surprisingly simple for what it achieve
    * see `src/csuite/model/TESTS/proxy.test.ts` if you're not scared
    */

   value_or_fail: Field_list_value<T> = new Proxy([], this.makeValueProxy('fail'))
   value_or_zero: Field_list_value<T> = new Proxy([], this.makeValueProxy('zero'))
   value_unchecked: Field_list_unchecked<T> = new Proxy([], this.makeValueProxy('unchecked'))

   // 🦊 get value_or_fail(): Field_list_value<T> {
   // 🦊     const x: this['$Value'] = new Proxy([], this.makeValueProxy('fail'))
   // 🦊     Object.defineProperty(this, 'value_or_fail', { value: x })
   // 🦊     return x
   // 🦊 }

   // 🦊 get value_or_zero(): Field_list_value<T> {
   // 🦊     const x: this['$Value'] = new Proxy([], this.makeValueProxy('zero'))
   // 🦊     Object.defineProperty(this, 'value_or_zero', { value: x })
   // 🦊     return x
   // 🦊 }

   // 🦊 get value_unchecked(): Field_list_unchecked<T> {
   // 🦊     const x: this['$Unchecked'] = new Proxy([], this.makeValueProxy('unchecked'))
   // 🦊     Object.defineProperty(this, 'value_unchecked', { value: x })
   // 🦊     return x
   // 🦊 }

   get value(): Field_list_value<T> {
      return this.value_or_fail
   }

   set value(val: Field_list_value<T>) {
      this.runInTransaction(() => {
         for (let i = 0; i < val.length; i++) {
            // 1. replace existing items
            if (i < this.items.length) {
               this.items[i]!.value = val[i]
            }
            // 2. add missing items
            else {
               this.addItem()
               this.items[i]!.value = val[i]
            }
         }
         this.splice(val.length)
      })
   }

   private makeValueProxy(mode: VALUE_MODE): ProxyHandler<never> {
      return {
         get: (_, prop: any): any => {
            // ⏸️ console.log(`[GET]`, prop)
            const target = this.items as any
            if (typeof prop === 'symbol') return target[prop]

            // MOBX HACK ----------------------------------------------------
            // Handle mutations
            if (prop === 'toJSON') return () => this.valueArrMode(mode)
            if (prop === 'pop') return () => this.pop()
            if (prop === 'shift') return () => this.shift()
            if (prop === 'unshift') return (...args: any[]) => this.unshift(...args)
            if (prop === 'push') return (...args: any[]) => this.push(...args)
            if (prop === 'map') return (...args: [any, any]) => this.valueArrMode(mode).map(...args)
            if (prop === 'filter') return (...args: [any, any]) => this.valueArrMode(mode).filter(...args)

            // MOBX HACK ----------------------------------------------------

            // handle numbers (1) and number-like ('1')
            if (parseInt(prop, 10) === +prop) {
               const field: Maybe<Field> = this.items[+prop]
               return field?.getValue(mode)
               // return target[+prop]?.getvalue
            }

            // defer to valueArr for other props
            return this.valueArrMode(mode)[prop]
         },

         set: (_, prop: any, value): boolean => {
            // ⏸️ console.log(`[SET]`, prop, value)
            if (typeof prop === 'symbol') return false
            if (parseInt(prop, 10) === +prop) {
               const index = +prop
               if (index === this.items.length) {
                  this.addItem({ value })
                  return true
               } else if (this.items[prop]) {
                  this.items[prop]!.value = value
                  return true
               }
            }
            return false
         },

         has: (_, prop: any): boolean => {
            return Reflect.has(this.valueArr, prop)
         },
      }
   }

   // #region Validation
   get ownConfigSpecificProblems(): Problem_Ext {
      return null
   }

   get ownTypeSpecificProblems(): string[] {
      // console.log(`[🤠] `, this.config.min, this.length)
      // console.log(`[🤠] `, this.config.max, this.length)
      const out: string[] = []
      if (
         //
         this.config.min != null &&
         this.length < this.config.min
      ) {
         out.push(`List is too short`)
      }

      if (
         //
         this.config.max != null &&
         this.length > this.config.max
      ) {
         out.push(`List is too long`)
      }
      return out
   }

   // ADDING ITEMS -------------------------------------------------
   duplicateItemAtIndex(ix: number): Maybe<T['$Field']> {
      const item = this.items[ix]!
      return this.addItem({
         at: ix + 1,
         value: item.isValid ? item.value : undefined,
      })
   }

   // TODO: support partial values ?
   /**
    * Appends new elements to the end of an array,
    * and returns the new length of the array.
    */
   push(...values: T['$Value'][]): number {
      if (values.length === 0) return this.length
      this.runInTransaction(() => {
         for (const v of values) {
            this.addItem({ value: v })
         }
      })
      return this.length
   }

   // TODO: add that:
   // pushSerials(...serials: T['$Serial'][]): number {
   //     if (serials.length === 0) return this.length
   //     this.runInValueTransaction(() => {
   //         for (const s of serials) {
   //             this.addItem({ serial: s })
   //         }
   //     })
   //     return this.length
   // }

   /**
    * Inserts new elements at the start of an array,
    * and returns the new length of the array.
    */
   unshift(...values: T['$Value'][]): number {
      if (values.length === 0) return this.length
      this.runInTransaction(() => {
         for (const v of values) {
            this.addItem({ value: v, at: 0 })
         }
      })
      return this.length
   }

   addItem(
      p: {
         at?: number
         value?: T['$Value']
         serial?: T['$Serial']
         applyEvenIfAtMaxLen?: boolean
      } = {},
   ): Maybe<T['$Field']> {
      if (p.at != null && p.at < 0) return void console.log(`[🔶] list.addItem: at is negative`)
      if (p.at != null && p.at > this.items.length)
         return void console.log(`[🔶] list.addItem: at is out of bounds`)
      if (!Boolean(p.applyEvenIfAtMaxLen) && this.config.max != null && this.items.length >= this.config.max)
         return void console.log(`[🔶] list.addItem: list is already at max length`)

      return this.runInTransaction(() => {
         const at: number = p.at ?? this.items.length
         this.patchSerial((draft) => {
            if (draft.items_ == null) {
               if (at !== 0) throw new Error('❌ Field_list is not sparsed')
               draft.items_ = [hole]
            } else {
               draft.items_.splice(at, 0, hole)
            }
         })
         const schema = this.schemaAt(at) // TODO: evaluate schema in the form loop
         const item = schema.instanciate(this.repo, this.root, this, at.toString(), p.serial ?? null)
         if (p.value) item.value = p.value
         this.items.splice(at, 0, item)
         for (let i = at + 1; i < this.items.length; i++) bang(this.items[i]).mountKey = i.toString()
         // 👉 lists are assume not to be sparsed         ^^^^
         return item
      })
   }

   // MOVING ITEMS ---------------------------------------------------
   moveItem(
      /** previous item index in the list */
      oldIndex: number,
      /** new index in the list to move the item to */
      newIndex: number,
   ): void {
      if (oldIndex === newIndex) return console.log(`[🔶] list.moveItem: oldIndex === newIndex`)
      if (oldIndex < 0 || oldIndex >= this.length)
         return console.log(`[🔶] list.moveItem: oldIndex out of bounds`)
      if (newIndex < 0 || newIndex >= this.length)
         return console.log(`[🔶] list.moveItem: newIndex out of bounds`)

      this.runInTransaction(() => {
         this.patchSerial((draft) => {
            // serials
            const serials = draft.items_
            if (serials == null) throw new Error('❌ Field_list is not set yet')
            serials.splice(newIndex, 0, bang(serials.splice(oldIndex, 1)[0]))

            // instances
            const instances = this.items
            instances.splice(newIndex, 0, bang(instances.splice(oldIndex, 1)[0]))

            // update mountKeys
            const minIndex = Math.min(oldIndex, newIndex)
            const maxIndex = Math.max(oldIndex, newIndex)
            for (let ix = minIndex; ix <= maxIndex; ix++) {
               bang(instances[ix]).mountKey = ix.toString()
            }
         })
      })
   }

   // REMOVING ITEMS ------------------------------------------------

   /**
    * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
    * @returns An array containing the elements that were deleted.
    */
   splice(
      /**  The zero-based location in the array from which to start removing elements. */
      start: number,
      /** The number of elements to remove. */
      deleteCount: number = Infinity,
   ): T['$Field'][] {
      if (deleteCount === 0) return []
      if (start >= this.length) return []
      let deleted: T['$Field'][] = []
      this.runInTransaction(() => {
         // remove from serial
         this.patchSerial((draft) => {
            if (draft.items_ == null) throw new Error('❌ Field_list is not set yet')
            draft.items_.splice(start, deleteCount)
         })
         // remove from instance list
         deleted = this.items.splice(start, deleteCount)

         // dispose every removed children
         for (const x of deleted) x.disposeTree()

         // update mountKeys of every children after the removal start index
         for (let ix = start; ix < this.items.length; ix++) {
            bang(this.items[ix]).mountKey = ix.toString()
         }
      })
      return deleted
   }

   /**
    * Removes all elements from the array and
    * @returns An array containing the elements that were deleted.
    */
   removeAllItems(): T['$Field'][] {
      // ensure list is not empty
      if (this.length === 0) {
         console.log(`[🔶] list.removeAllItems: list is already empty`)
         return []
      }
      // ensure list is not at min len already
      const minLen = this.config.min ?? 0
      if (this.length <= minLen) {
         console.log(`[🔶] list.removeAllItems: list is already at min lenght`)
         return []
      }
      // remove all items
      return this.splice(minLen)
      // this.MUTVALUE(() => {
      //     this.serial.items_ = this.serial.items_.slice(0, minLen)
      //     this.items = this.items.slice(0, minLen)
      // })
   }

   removeItem(item: T['$Field']): Maybe<T['$Field']> {
      // ensure item is in the list
      const i = this.items.indexOf(item)
      if (i === -1) {
         // 💬 2024-07-11 rvion: should we throw
         return void console.log(`[🔶] list.removeItem: item not found`)
      }
      this.removeItemAt(i)
      return item
   }

   pop(): void {
      this.removeItemAt(this.items.length - 1)
   }

   /**
    * Removes the first element from an array and returns it.
    * If the array is empty, undefined is returned and the array is not modified.
    */
   shift(): Maybe<T['$Field']> {
      return this.removeItemAt(0)
   }

   removeItemAt(i: number): Maybe<T['$Field']> {
      if (this.length < i) return null
      return this.splice(i, 1)[0]
   }
}

// DI
registerFieldClass('list', Field_list)
