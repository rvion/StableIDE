import type { CivitaiSearchResult, CivitaiSearchResultItem } from './CivitaiTypes'

import { makeAutoObservable } from 'mobx'

import { Debounced } from '../../csuite/utils/Debounced'
import { Promize } from '../../csuite/utils/Promize'

// civitai wrapper
export class Civitai {
   // https://github.com/civitai/civitai/wiki/REST-API-Reference#get-apiv1models
   query = new Debounced(cushy.civitaiConf.fields.defaultQuery.value ?? '', 300)
   selectedResult: Maybe<CivitaiSearchResultItem> = null

   get results(): Maybe<Promize<CivitaiSearchResult>> {
      if (!this.query.debouncedValue) return null
      return this.search({ query: this.query.debouncedValue })
   }

   constructor() {
      console.log(`[🤠] CREATING CIVITAI wrapper 🔴`)
      makeAutoObservable(this)
   }

   search = (p: {
      //
      limit?: number | string
      page?: number | string
      query?: string
      tag?: string
      username?: string
   }): Promize<CivitaiSearchResult> => {
      return Promize.get('civitai-search', p, async (): Promise<CivitaiSearchResult> => {
         console.log('[CIVITAI] search:', 'https://civitai.com/api/v1/models', p)
         const res = await fetch('https://civitai.com/api/v1/models?' + new URLSearchParams(p as any), {
            method: 'GET',
            // query: p,
            // body: Body.json(p),
         })
         // 🔴 ?
         const x: CivitaiSearchResult = (await res.json()) as any
         return x
      })
      // console.log('[CIVITAI] found:', res.data)
      // this.results = x
   }
}
