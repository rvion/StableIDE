import type { LiveDB } from '../db/LiveDB'
import type { TABLES } from '../db/TYPES.gen'
import type { IJsonModel } from 'flexlayout-react'
import type { AnnotationMapEntry } from 'mobx'

import { toastError } from '../csuite/utils/toasts'
import { BaseInst } from '../db/BaseInst'
import { LiveTable } from '../db/LiveTable'
import { perspectiveHelper } from '../router/perspectives/_PerspectiveBuilder'

export class PerspectiveRepo extends LiveTable<TABLES['perspective'], typeof PerspectiveL> {
   getOrCreateWith = (name: string, layout: () => IJsonModel): PerspectiveL => {
      const x = this.selectOne((t) => t.where('name', '=', name))
      if (x) return x
      return this.create({
         priority: 100,
         name,
         layout: layout(),
      })
   }

   get all(): PerspectiveL[] {
      return this.findMany()
   }

   constructor(liveDB: LiveDB) {
      super(liveDB, 'perspective', '🗂️', PerspectiveL)
      this.init()
   }
}

export class PerspectiveL extends BaseInst<TABLES['perspective']> {
   instObservabilityConfig: undefined
   dataObservabilityConfig: Record<string, AnnotationMapEntry> = {
      layout: false,
      layoutDefault: false,
   }
   open(): void {
      cushy.layout.openPerspective(this)
      cushy.project.perspective = this
   }

   get isActive(): boolean {
      return cushy.layout.perspective === this
   }

   resetToDefault(): void {
      this.update({ layout: cushy.layout.makeNewPerspective_default1() })
      cushy.layout.openPerspective(this)
   }

   saveSnapshot(): void {
      this.update({ layoutDefault: this.data.layout })
   }
   resetToSnapshot(): void {
      this.update({ layout: this.data.layoutDefault ?? cushy.layout.makeNewPerspective_default1() })
      cushy.layout.openPerspective(this)
   }
   duplicate(): void {
      this.clone({ name: this.data.name + '2' }).open()
   }
   delete(): void {
      const perspectives = cushy.db.perspective.all
      if (perspectives.length === 1) {
         console.error('Cannot delete last perspective')
         toastError('Cannot delete last perspective')
         return
      }
      if (cushy.layout.perspective === this) {
         cushy.layout.openPerspective(perspectives.find((p) => p !== this)!)
      }
      super.delete({})
   }
}
