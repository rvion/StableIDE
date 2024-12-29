import type { BaseInst } from './BaseInst'
import type { LiveDB } from './LiveDB'
import type { $BaseInstanceFields } from './LiveInstance'
import type { TableInfo } from './TYPES_json'
import type { RunResult } from 'better-sqlite3'
import type { DeleteQueryBuilder, SelectQueryBuilder } from 'kysely'

// 💬 2024-03-14 commented serial checks for now
// import { Value, ValueError } from '@sinclair/typebox/value'
import { action, type AnnotationMapEntry } from 'mobx'
import { nanoid } from 'nanoid'

import { makeAutoObservableInheritance } from '../csuite/mobx/mobx-store-inheritance'
import { kysely } from '../DB'
import { sqlbench, sqlbenchRaw } from '../utils/microbench'
import { DEPENDS_ON } from './LiveHelpers'
import { type KyselyTables, type LiveDBSubKeys, schemas, type TableName } from './TYPES.gen'

export interface LiveEntityClass<TABLE extends TableInfo> {
   new (...args: any[]): TABLE['$L']
}

export class LiveTable<
   //
   TABLE extends TableInfo<keyof KyselyTables>,
   AAAAA extends {
      new (
         ...args: any[]
         //
         // db: LiveDB,
         // st: STATE,
         // table: LiveTable<TABLE, any>,
         // data: TABLE['$T'],
      ): BaseInst<any>
   },
> {
   // ORM HELPER --------------------------------------------------------------------------------

   /**
    * hydrate at the end;
    * can only work with all fields
    * CANNOT use joins, NOR select only a few fields, etc
    * see `selectRaw` if you need those
    */
   select = (
      fn: (
         x: SelectQueryBuilder<KyselyTables, TABLE['$TableName'], TABLE['$T']>,
      ) => SelectQueryBuilder<any, any, TABLE['$T']> = (x) => x,
      subscriptions?: LiveDBSubKeys[],
   ): TABLE['$L'][] => {
      const query = fn(this.query1).compile() // finalize the kysely query
      const stmt = cushy.db.db.prepare(query.sql) // prepare the statement
      if (stmt == null) {
         throw new Error('INVARIANT VIOLATION; statement is null')
         // return []
      }
      cushy.db.subscribeToKeys([this.schema.sql_name])
      if (subscriptions) cushy.db.subscribeToKeys(subscriptions) // make sure this getter will re-run when any of the deps change
      const x = sqlbench(query, () => stmt.all(query.parameters)) // execute the statement
      const hydrated = x.map((data) => this.schema.hydrateJSONFields_crashOnMissingData(data)) // hydrate results
      const instances = hydrated.map((d) => this.getOrCreateInstanceForExistingData(d)) // create instances
      return instances
   }

   findMany = this.select

   /**
    * hydrate at the end;
    * can only work with all fields
    * CANNOT use joins, NOR select only a few fields, etc
    * see `selectRaw` if you need those
    */
   selectOne = (
      fn: (
         x: SelectQueryBuilder<KyselyTables, TABLE['$TableName'], TABLE['$T']>,
      ) => SelectQueryBuilder<any, any, TABLE['$T']> = (x) => x,
      subscriptions?: LiveDBSubKeys[],
   ): Maybe<TABLE['$L']> => {
      const query = fn(this.query1.limit(1)).compile() // finalize the kysely query
      const stmt = cushy.db.db.prepare(query.sql) // prepare the statement
      if (stmt == null) {
         throw new Error('INVARIANT VIOLATION; statement is null')
         // return []
      }
      cushy.db.subscribeToKeys([this.schema.sql_name])
      if (subscriptions) cushy.db.subscribeToKeys(subscriptions) // make sure this getter will re-run when any of the deps change
      const x = sqlbench(query, () => stmt.all(query.parameters)) // execute the statement
      const hydrated = x.map((data) => this.schema.hydrateJSONFields_crashOnMissingData(data)) // hydrate results
      const instances = hydrated.map((d) => this.getOrCreateInstanceForExistingData(d)) // create instances
      if (instances.length === 0) return null
      return instances[0]
   }

   findOne = this.selectOne
   // --------------------------------------------------------------------------------

   /**
    * do not hydrate entities;
    * you can use joins, select only a few fields, etc
    * see also `select` for simpler use cases, or when you need hydated entities
    */
   selectRaw = <T>(
      fn: (x: SelectQueryBuilder<KyselyTables, TABLE['$TableName'], {}>) => SelectQueryBuilder<any, any, T>,
      subscriptions?: LiveDBSubKeys[],
   ): T[] => {
      const query = fn(this.query1).compile() // finalize the kysely query
      const stmt = cushy.db.db.prepare(query.sql) // prepare the statement
      if (stmt == null) return []
      if (subscriptions) cushy.db.subscribeToKeys(subscriptions) // make sure this getter will re-run when any of the deps change
      const x = sqlbench(query, () => stmt.all(query.parameters)) // execute the statement
      return x as any[] // return the result
   }

   /**
    * do not hydrate entities;
    * you can use joins, select only a few fields, etc
    * see also `select` for simpler use cases, or when you need hydated entities
    */
   selectRaw2 = <T>(
      fn: (x: SelectQueryBuilder<KyselyTables, TABLE['$TableName'], {}>) => SelectQueryBuilder<any, any, T>,
      subscriptions?: LiveDBSubKeys[],
   ): T[] => {
      const query = fn(this.query3).compile() // finalize the kysely query
      const stmt = cushy.db.db.prepare(query.sql) // prepare the statement
      if (stmt == null) return []
      if (subscriptions) cushy.db.subscribeToKeys(subscriptions) // make sure this getter will re-run when any of the deps change
      const x = sqlbench(query, () => stmt.all(query.parameters)) // execute the statement
      return x as any[] // return the result
   }

   query1: SelectQueryBuilder<KyselyTables, TABLE['$TableName'], TABLE['$T']> = kysely
      .selectFrom(this.name)
      .selectAll(this.name)
   query2: SelectQueryBuilder<KyselyTables, TABLE['$TableName'], /*    */ {}> = kysely
      .selectFrom(this.name)
      .selectAll(this.name)
   query3: SelectQueryBuilder<KyselyTables, TABLE['$TableName'], /*    */ {}> = kysely.selectFrom(this.name)

   delete_: DeleteQueryBuilder<KyselyTables, TABLE['$TableName'], /*    */ {}> = kysely.deleteFrom(this.name)
   delete2(
      fn: (
         x: DeleteQueryBuilder<KyselyTables, TABLE['$TableName'], /*    */ {}>,
      ) => DeleteQueryBuilder<any, any, any>,
   ): RunResult {
      //
      const query = fn(this.delete_).compile() // finalize the kysely query
      const stmt = cushy.db.db.prepare(query.sql) // prepare the statement
      if (stmt == null) throw new Error('❌')
      const x = sqlbench(query, () => stmt.run(query.parameters)) // execute the statement
      return x
   }
   // ⏸️ query2: SelectQueryBuilder<KyselyTables, any, {}> = dbxx.selectFrom(this.name)
   // ⏸️ query3: SelectQueryBuilder<KyselyTables, TABLE['$TableName'], TABLE['$T']> = dbxx.selectFrom(this.name).selectAll() as any

   // private Ktor: LiveEntityClass<TABLE>
   liveEntities = new Map<string, TABLE['$L']>()
   schema: TABLE = schemas[this.name] as any
   $DATA!: TABLE['$T']
   // 🟢 --------------------------------------------------------------------------------

   /** number of entities in the table */
   get size(): number {
      DEPENDS_ON(this.liveEntities.size)
      return this.db._getCount(this.name)
   }

   // 🟢 --------------------------------------------------------------------------------
   getOrCreateInstanceForExistingData = (data: TABLE['$T']): TABLE['$L'] => {
      const id = (data as { id: string }).id
      const instance = this.liveEntities.get(id)
      if (instance) {
         // 2023-11-30 rvion: for now, I won't defensively merge the data
         // I'll do it if the app become more complex and bugs arise.
         // Object.assign(instance.data, data)
         return instance
      } else {
         return this._createInstance(data)
      }
   }

   // 🟢 --------------------------------------------------------------------------------
   /** return first entity from table, or null if table is empty */
   stmt_first = this.db.compileSelectOne_<TABLE>(
      this.schema,
      `select * from ${this.name} order by createdAt asc limit 1`,
   )
   first = (): Maybe<TABLE['$L']> => {
      return this.first_
   }
   get first_(): Maybe<TABLE['$L']> {
      const data = this.stmt_first()
      // 2023-11-30 rvion:
      // 👇 first should mosltly not depends on anything
      // I'll comment this out for the time being
      // DEPENDS_ON(this.liveEntities.size)
      if (data == null) return null
      return this.getOrCreateInstanceForExistingData(data)
   }

   // 🟢 --------------------------------------------------------------------------------
   /** return first entity from table by createdAt, or crash if table is empty */
   firstOrCrash = (): TABLE['$L'] => {
      const fst = this.first()
      if (fst == null) throw new Error('collection is empty')
      return fst
   }

   // 🟢 --------------------------------------------------------------------------------
   /** return last entity from table, or null if table is empty */
   stmt_query: string = `select * from ${this.name} order by createdAt desc limit 1`
   stmt_last = this.db.compileSelectOne_<TABLE>(this.schema, this.stmt_query)

   // 💬 2024-06-13 rvion; perf issue was caused by this
   // beeing a function instead of a getter;
   last = (): Maybe<TABLE['$L']> => {
      return this.last_
   }

   get last_(): Maybe<TABLE['$L']> {
      console.log(`[🤠] last ${this.name} (hash=size:${this.liveEntities.size})`)
      const data = sqlbenchRaw(this.stmt_query, this.stmt_last) // sqlbench(this.stmt_last, 0 as any)
      DEPENDS_ON(this.liveEntities.size)
      // console.log('last =', data)
      if (data == null) return null
      return this.getOrCreateInstanceForExistingData(data)
   }

   // 🟢 --------------------------------------------------------------------------------
   /** return last entity from table, or crash if table is empty */
   lastOrCrash = (): TABLE['$L'] => {
      const lst = this.last()
      if (lst == null) throw new Error('collection is empty')
      return lst
   }

   constructor(
      public db: LiveDB,
      public name: TableNameInDB,
      public emoji: string,
      public Ktor: AAAAA, // LiveEntityClass<TABLE>,
      public opts?: { singleton?: boolean },
   ) {
      // register
      this.db._tables.push(this)
   }

   init(obs?: { [key: string]: AnnotationMapEntry } | undefined): void {
      makeAutoObservableInheritance(this, {
         // @ts-ignore (private properties are untyped in this function)
         Ktor: false,
         _createInstance: action,
         get: action,
         ...obs,
      })
   }

   // UTILITIES -----------------------------------------------------------------------
   private SKL_getLastN = this.db.compileSelectMany<number, TABLE>( //
      this.schema,
      `select * from ${this.name} order by createdAt desc limit ?`,
   )
   getLastN = (amount: number): TABLE['$L'][] => {
      DEPENDS_ON(this.liveEntities.size)
      const ts = this.SKL_getLastN(amount)
      return ts.map((data) => this.getOrCreateInstanceForExistingData(data))
   }
   get Last10(): TABLE['$L'][] {
      DEPENDS_ON(this.liveEntities.size)
      const ts = this.SKL_getLastN(10)
      return ts.map((data) => this.getOrCreateInstanceForExistingData(data))
   }
   // ⏸️ mapData = <R>(fn: (k: T['id'], t: T) => R): R[] =>
   // ⏸️     Object.values(this._store) //
   // ⏸️         .map((data) => fn(data.id, data))

   // UTILITIES -----------------------------------------------------------------------

   private stmt_getByID = this.db.compileSelectOne<string, TABLE>(
      this.schema,
      `select * from ${this.name} where id = ?`,
   )
   get = (id: Maybe<string>): Maybe<TABLE['$L']> => {
      // if (id === 'main-schema') debugger
      if (id == null) return null

      // 1. check if instance exists in the entity map
      const val = this.liveEntities.get(id)
      if (val) return val

      // 2. check if data is on sqlite
      const x = this.stmt_getByID(id)
      if (x == null) return null

      // 3. create instance form data
      return this._createInstance(x)
   }

   getOrThrow = (id: string): TABLE['$L'] => {
      if (id == null) throw new Error(`ERR:  getOrThrow called without id`)
      const val = this.get(id)
      if (val == null) throw new Error(`ERR: ${this.name}(${id}) not found`)
      return val
   }

   getOrCreate = (id: string, def: () => Omit<TABLE['$T'], $BaseInstanceFields>): TABLE['$L'] => {
      // console.log(`🦊 ${this.name}.getOrCreate`)
      // 1. check if instance exists in the entity map
      const val = this.get(id)
      if (val == null) {
         const data = def() as any
         if (data.id && data.id !== id) throw new Error(`GET OR CREATE INVARIANT VIOLATION`)
         if (data.id == null) data.id = id
         return this.create(data)
      }
      return val
   }

   // DELETION ------------------------------------------------------------

   // stmt_deleteByID = this.db.prepareDelete<string, void>(`delete from ${this.name} where id = ?`)

   /**
    * TODO: we this use this field to throw if a
    * deleted entity is accessed after beeing deleted
    */
   zz_deleted: boolean = false

   /** * delete with custom cascade strategy */
   delete = (
      //
      id: string,
      p: TABLE['$DeleteInstructions'] = {},
   ): void => {
      const sql = `delete from ${this.name} where id = ?`
      try {
         console.log(`[🧹] starting deletion of ${this.name}[${id}]`)
         this.schema.backrefs.forEach((backref) => {
            // 1. retrieve backref delete strategy
            const fromTableName = backref.fromTable as TableName
            const fromFieldName = backref.fromField as string
            const strategyKey = `${fromTableName}_${fromFieldName}`
            let strategy = p?.[strategyKey]

            if (strategy == null) {
               console.log(`[🧹] no specified strategy for ${strategyKey} => defaulting to setNull`)
               strategy = 'set null'
            }

            // 1.1. set null
            if (strategy === 'set null') {
               console.log(`[🧹]   > updating ${fromTableName} with (${backref.fromField}=${id}) to null`)
               const softCascadeSQL = `
                    update ${backref.fromTable}
                       set ${backref.fromField} = null
                     where ${backref.fromField} = ?`
               // console.log(`[🗑️] cascade `, softCascadeSQL, id)
               const stmt = this.db.db.prepare(softCascadeSQL)
               // 🔴 TODO: requires an update of all liveInstances too
               stmt.run(id)
            }

            // 1.2. delete (cascade)
            else if (strategy === 'cascade' || typeof strategy === 'object') {
               console.log(`[🧹]   > deleting ${fromTableName} with (${backref.fromField}=${id})`)

               // 1.2.1  get self instance
               const inst = this.get(id)
               if (inst == null) throw new Error(`ERR: self not found '${id}'`)
               console.log(`[🧹]       > inst found`, inst)

               // 1.2.2. get backref table
               const backrefTable = this.db._tables.find((t) => t.name === backref.fromTable)
               if (backrefTable == null)
                  throw new Error(`ERR: backref table not found '${backref.fromTable}'`)
               console.log(`[🧹]       > backRefTable found:`, backrefTable)

               const allBackRefInstances = backrefTable.findMany((q) => q.where(backref.fromField, '=', id))
               console.log(`[🧹]       > ${allBackRefInstances.length} instances found:`, allBackRefInstances)

               for (const instWithBackref of allBackRefInstances) {
                  // 1.2.4. delete backref instance
                  if (typeof strategy === 'object') {
                     instWithBackref.delete(strategy) // pass down the delete strategy
                  } else instWithBackref.delete()
               }
            }

            // 1.3. ???
            else {
               throw new Error(`ERR: unknown strategy ${strategy}`)
            }
         })

         // 2. then delete self
         console.log(`[🗑️] cascade `, sql, id)
         const stmt = this.db.compileDelete<string, void>(sql)
         stmt(id)
         this.zz_deleted = true
         this.liveEntities.delete(id)
      } catch (e) {
         console.log(`[🗑️] sql failed:`, sql, [id])
         console.error(e)
         throw e
      }
   }

   /**
    * 1. for every backref, set the backref owner field data to null
    * 2. delete
    */
   deleteWithSoftCascade = (id: string): void => {
      const sql = `delete from ${this.name} where id = ?`
      try {
         this.schema.backrefs.forEach((backref) => {
            const softCascadeSQL = `update ${backref.fromTable} set ${backref.fromField} = null where ${backref.fromField} = ?`
            console.log(`[🗑️] cascade `, softCascadeSQL, id)
            const stmt = this.db.db.prepare(softCascadeSQL)
            // 🔴 TODO: requires an update of all liveInstances too
            stmt.run(id)
         })
         console.log(`[🗑️] cascade `, sql, id)
         const stmt = this.db.compileDelete<string, void>(sql)
         stmt(id)
         this.zz_deleted = true
         this.liveEntities.delete(id)
      } catch (e) {
         console.log(`[🗑️] sql failed:`, sql, [id])
         console.error(e)
         throw e
      }
   }
   // ------------------------------------------------------------

   // clear = () => {
   //     this.db.db.exec(`delete from ${this.name}`)
   //     this.liveEntities.clear()
   // }

   /**
    * probably unsafe to use
    * - update all in DB
    * - then patch all local instances bypassing the DB
    */
   updateAll = (changes: Partial<TABLE['$T']>): void => {
      const sql = `update ${this.name} set ${Object.keys(changes)
         .map((k) => `${k} = @${k}`)
         .join(', ')}`
      const stmt = this.db.db.prepare(sql)
      stmt.run(changes)
      for (const instance of this.liveEntities.values()) {
         instance.update_LiveOnly(changes)
      }
   }

   findAll = (): TABLE['$L'][] => {
      const stmt = this.db.db.prepare(`select * from ${this.name}`)
      const datas: TABLE['$T'][] = stmt
         .all()
         .map((data) => this.schema.hydrateJSONFields_crashOnMissingData(data))
      const instances = datas.map((d) => this.getOrCreateInstanceForExistingData(d))
      return instances
   }

   private insert = (row: Partial<TABLE['$T']>): TABLE['$L'] => {
      // 0 check that row is valid
      if (Array.isArray(row)) throw new Error('insert does not support arrays')
      if (typeof row !== 'object') throw new Error('insert does not support non-objects')

      // build the sql
      const tableInfos = this.schema
      const presentCols = Object.keys(row)
      const insertSQL = [
         `insert into ${tableInfos.sql_name}`,
         `(${presentCols.map((c) => c).join(', ')})`,
         `values`,
         `(${presentCols.map((c) => `@${c}`).join(', ')})`,
         `returning *`,
      ].join(' ')

      try {
         // prepare sql
         const stmt = this.db.db.prepare<Partial<TABLE['$T']>>(insertSQL)

         // dehydrate json fields
         const insertPayload: any = Object.fromEntries(
            Object.entries(row as any).map(([k, v]) => {
               if (Array.isArray(v)) return [k, JSON.stringify(v)]
               if (typeof v === 'object' && v != null) return [k, JSON.stringify(v) ?? 'null']
               return [k, v]
            }),
         )

         // insert the data
         const data = stmt.get(insertPayload) as any as TABLE['$T']

         // re-hydrate the resulting json (necessary for default json values in the DB)
         this.schema.hydrateJSONFields_crashOnMissingData(data)

         // return the instance
         return this._createInstance(data)
      } catch (e) {
         console.log(insertSQL)
         throw e
      }
   }

   upsert = (data: Omit<TABLE['$N'], 'createdAt' | 'updatedAt'> & { id: TABLE['$ID'] }): TABLE['$L'] => {
      const id = data.id
      // this.yjsMap.set(nanoid(), data)
      const prev = this.get(id)
      if (prev) {
         prev.update(data as any /* 🔴 */)
         return prev
      } else {
         const instance = this.create(data as any /* 🔴 */)
         return instance
      }
   }

   // upsert = (data: Omit<T, $OptionalFieldsForUpsert> & Partial<$OptionalFieldsForUpsert>): L => {
   //     const prev = this.get(data.id)
   //     if (prev == null) return this.create(data as any)
   //     prev.update(data as any)
   //     return prev
   // }

   /** only call with brand & never seen new data */
   create = (data: TABLE['$N']): TABLE['$L'] => {
      // enforce singlettons
      if (this.opts?.singleton) {
         const count = this.size
         if (count !== 0) throw new Error('ERR: singleton already exists')
      }

      const id: TABLE['$ID'] = data.id ?? nanoid()
      if (data.id == null) data.id = id
      const now = Date.now()
      data.createdAt = now
      data.updatedAt = now

      // ensure no instance exists
      // if (this.instances.has(id)) throw new Error(`ERR: ${this.name}(${id}) already exists`)
      // TOCTOU
      // console.log('🟢 A', data)
      const insertPayload = Object.fromEntries(
         Object.entries(data).map(([k, v]) => {
            if (Array.isArray(v)) return [k, JSON.stringify(v)]
            if (typeof v === 'object' && v != null) return [k, JSON.stringify(v) ?? 'null']
            return [k, v]
         }),
      )
      // console.log('🟢 B', insertPayload)
      this.insert(insertPayload as any)
      // console.log('🔴', data)

      // this._store[id] = data as T

      const instance = this._createInstance(data as any) //this._store[id])
      instance.onCreate?.(/* data as T */)

      return instance
   }

   /** only call this with some data already in the database */
   _createInstance = (data: TABLE['$T']): TABLE['$L'] => {
      const instance = new this.Ktor(
         //
         this.db,
         cushy,
         this,
         data,
      )
      // TYPE CHECKING --------------------
      // /* ⏸️ */ const schema = this.schema.schema
      // /* ⏸️ */ const valid = Value.Check(schema, data)
      // /* ⏸️ */ if (!valid) {
      // /* ⏸️ */     const errors: ValueError[] = [...Value.Errors(schema, data)]
      // /* ⏸️ */     console.log('❌', this.name)
      // /* ⏸️ */     for (const i of errors) console.log(`❌`, JSON.stringify(i))
      // /* ⏸️ */     // debugger
      // /* ⏸️ */ }
      // --------------------
      instance.init(data)
      this.liveEntities.set(data.id, instance)
      this.db.bump(this.name as LiveDBSubKeys)
      return instance
   }
}
