import type { STATE } from '../../../../state/state'

import * as csv from '@fast-csv/parse'
import { createReadStream } from 'fs'
import { isObservable } from 'mobx'

export enum DanbooruTagCategory {
   General = 0,
   Artist = 1,
   Copyright = 3,
   Character = 4,
   Meta = 5,
}

export type DanbooruTagCategoryData = { name: string; color: string }

export type DanbooruTag = {
   /** main tag label */
   text: string
   /** tag category */
   category: DanbooruTagCategory
   /** proxy for popularity */
   count: number
   /** alternative wording that must not be used */
   aliases: string[]
}

export class DanbooruTags {
   tags: DanbooruTag[] = []
   private tagsMap: Map<string, DanbooruTag> = new Map()

   parseRow = (data: (string | undefined)[]): DanbooruTag => {
      if (
         data[0] == null || //
         data[1] == null ||
         data[2] == null
      ) {
         console.log(`🔶 invalid danbooru tag row: ${data}`)
         return {
            text: '❌ unknown',
            category: 0 as DanbooruTagCategory,
            count: 0,
            aliases: [],
         }
      }
      return {
         text: data[0] ?? '❌ unknown',
         category: parseInt(data[1] ?? '0') as DanbooruTagCategory,
         count: parseInt(data[2] ?? '0'),
         aliases: data[3]?.split(',') ?? [],
      }
   }

   static build = (st: STATE): DanbooruTags => {
      if (!DanbooruTags._instance) DanbooruTags._instance = new DanbooruTags(st)
      return DanbooruTags._instance
   }

   private static _instance: DanbooruTags
   private constructor(public st: STATE) {
      if (DanbooruTags._instance) throw new Error('DanbooruTags is a singleton')
      DanbooruTags._instance = this
      const filePaths = []
      const enabledTags = cushy.preferences.system.value.tags
      if (enabledTags.danbooru) filePaths.push('completions/danbooru.csv')
      if (enabledTags.danbooruNSFW) filePaths.push('completions/danbooru_nsfw.csv')
      if (enabledTags.e621) filePaths.push('completions/e621.csv')
      if (enabledTags.e621NSFW) filePaths.push('completions/e621_nsfw.csv')

      filePaths.forEach((filePath) => {
         createReadStream(filePath)
            .pipe(csv.parse({ headers: false, delimiter: ',' }))
            .on('error', (error) => console.error(error))
            .on('data', (row) => {
               const parsedTag = this.parseRow(row)
               if (parsedTag.count < enabledTags.remove) return
               const existingTag = this.tagsMap.get(parsedTag.text)
               if (existingTag) {
                  if (existingTag.count < parsedTag.count) {
                     this.tagsMap.set(parsedTag.text, parsedTag)
                  }
               } else {
                  this.tagsMap.set(parsedTag.text, parsedTag)
               }
            })
            .on('end', () => {
               this.tags = Array.from(this.tagsMap.values())
               console.log(`[🏷️] DanbooruTags: ${this.tags.length} tags parsed and sorted by count`)
            })
      })

      if (isObservable(this.tags)) throw new Error(`tags shouldn't be observable for perf reasons`)
   }
}
