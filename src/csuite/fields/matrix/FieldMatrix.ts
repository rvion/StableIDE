/*
 * 🔴 TODO: rewrite as field composite
 */

import type { BaseSchema } from '../../model/BaseSchema'
import type { FieldConfig } from '../../model/FieldConfig'
import type { FieldSerial } from '../../model/FieldSerial'
import type { Repository } from '../../model/Repository'
import type { Problem_Ext } from '../../model/Validation'

import { runInAction } from 'mobx'

import { Field } from '../../model/Field'
import { bang } from '../../utils/bang'
import { registerFieldClass } from '../WidgetUI.DI'
import { WidgetMatrixUI } from './WidgetMatrixUI'

export type Field_matrix_cell = {
   x: number
   y: number
   row: string
   col: string
   value: boolean
}

// #region $Config
export type Field_matrix_config = FieldConfig<
   {
      default?: { row: string; col: string }[]
      rows: string[]
      cols: string[]
   },
   Field_matrix_types
>

// #region $Serial
export type Field_matrix_serial = FieldSerial<{
   $: 'matrix'
   /** only contains cells that are ONs */
   selected?: Field_matrix_cell[]
}>

// #region $Value
export type Field_matrix_value = Field_matrix_cell[]
export type Field_matrix_unchecked = Field_matrix_value | undefined

// #region $Types
export type Field_matrix_types = {
   $Type: 'matrix'
   $Config: Field_matrix_config
   $Serial: Field_matrix_serial
   $Value: Field_matrix_value
   $Unchecked: Field_matrix_unchecked
   $Field: Field_matrix
   $Child: never
   $Reflect: Field_matrix_types
}

// #region State
export class Field_matrix extends Field<Field_matrix_types> {
   // #region Static
   static readonly type: 'matrix' = 'matrix'
   static readonly emptySerial: Field_matrix_serial = { $: 'matrix' }
   static migrateSerial(): undefined {}

   // #region Ctor
   constructor(
      repo: Repository,
      root: Field | null,
      parent: Field | null,
      schema: BaseSchema<Field_matrix>,
      initialMountKey: string,
      serial?: Field_matrix_serial,
   ) {
      super(repo, root, parent, schema, initialMountKey, serial)
      this.init(serial, {
         DefaultHeaderUI: false,
         DefaultBodyUI: false,
      })
   }

   // #region UI
   DefaultHeaderUI = WidgetMatrixUI
   DefaultBodyUI: undefined = undefined

   // #region Serial
   protected setOwnSerial(next: Field_matrix_serial): void {
      this.assignNewSerial(next)

      const cells = this.serial.selected ?? this.config.default ?? []
      const selectedCells = new Set(cells.map(({ row, col }) => this.getCellkey(row, col)))

      // make sure every cell has the right value
      for (const [x, row] of this.config.rows.entries()) {
         for (const [y, col] of this.config.cols.entries()) {
            const cellKey = this.getCellkey(row, col)
            const value = selectedCells.has(cellKey)
            const prev = this.store.get(cellKey)
            if (prev == null) this.store.set(cellKey, { x, y, col, row, value })
            else prev.value = value
         }
      }

      this.patchSerial((draft) => void (draft.selected = this.activeCells))
   }

   /** list of all active cells */
   get value(): Field_matrix_value {
      return this.value_or_fail
   }

   get value_or_fail(): Field_matrix_value {
      if (this.serial.selected == null) throw new Error('Field_matrix.value_or_fail: field not set')
      return this.serial.selected
   }

   get value_or_zero(): Field_matrix_value {
      return this.serial.selected ?? []
   }

   get value_unchecked(): Field_matrix_unchecked {
      return this.serial.selected
   }

   /** 🔶 this is inneficient */
   set value(val: Field_matrix_value) {
      runInAction(() => {
         // 1. reset all cells to false
         for (const c of this.allCells) {
            c.value = false
         }
         // 2. apply all values from list
         for (const v of val) {
            this.store.set(this.getCellkey(v.row, v.col), v)
         }
         // 3. update
         this.UPDATE()
      })
   }

   /** list of all possible row keys */
   get rows(): string[] {
      return this.config.rows
   }

   /** list of all possible colum keys */
   get cols(): string[] {
      return this.config.cols
   }

   // #region validation
   get ownConfigSpecificProblems(): Problem_Ext {
      return null
   }

   get ownTypeSpecificProblems(): Problem_Ext {
      return null
   }

   get isOwnSet(): boolean {
      return this.serial.selected != null
   }

   get hasChanges(): boolean {
      const def = this.config.default
      if (def == null) return this.value.length != 0
      else {
         if (def.length != this.value.length) return true
         for (const v of this.value) {
            if (!def.find((d) => d.row == v.row && d.col == v.col)) return true
         }
         return false
      }
   }

   /** store of all active cells */
   private store = new Map<string, Field_matrix_cell>()

   /** return some unique string from a tupple [row: string, col: string] */
   private getCellkey(row: string, col: string): string {
      return `${row} &&& ${col}`
   }

   /** return all cells, regardless of if they're on or off */
   get allCells(): Field_matrix_cell[] {
      return Array.from(this.store.values())
   }

   /**
    * Internal method to update serial from the live list of active cells
    * every setter should update this
    */
   private UPDATE(): void {
      this.runInTransaction(() => {
         this.patchSerial((draft) => void (draft.selected = this.activeCells))
      })
   }

   /** list of all cells that are active/on */
   get activeCells(): Field_matrix_cell[] {
      return this.allCells.filter((v) => v.value)
   }

   /** whether the first grid cell is ON */
   get firstValue(): boolean {
      return this.allCells[0]?.value ?? false
   }

   /** set every cell in the matrix field to the given value `<value>`  */
   setAll(value: boolean): void {
      for (const v of this.allCells) v.value = value
      this.UPDATE()
      // this.p.set(this.values)
   }

   /** set all cells in given row `<row>` to value `<val>`  */
   setRow(row: string, val: boolean): void {
      for (const v of this.cols) {
         const cell = this.getCell(row, v)
         cell.value = val
      }
      this.UPDATE()
   }

   /** set all cells in given column `<col>` to value `<val>`  */
   setCol(col: string, val: boolean): void {
      for (const r of this.rows) {
         const cell = this.getCell(r, col)
         cell.value = val
      }
      this.UPDATE()
   }

   /** get cell at {rol x col} */
   getCell(row: string, col: string): Field_matrix_cell {
      return bang(this.store.get(this.getCellkey(row, col)))
   }

   /** set cell at {rol x col} to given value */
   setCell(row: string, col: string, value: boolean): void {
      const cell = this.getCell(row, col)
      cell.value = value
      this.UPDATE()
   }
}

// DI
registerFieldClass('matrix', Field_matrix)
