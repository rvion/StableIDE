export type CivitaiSearchResult = {
   items: CivitaiSearchResultItem[]
   metadata: SearchResultMetadata
}

export type CivitaiSearchResultItem = {
   /*	The identifier for the model */
   id: number
   /*	The name of the model */
   name: string
   /*	The description of the model (HTML) */
   description: string
   /* The model type */
   type:
      | 'Checkpoint'
      | 'TextualInversion'
      | 'Hypernetwork'
      | 'AestheticGradient'
      | 'LORA'
      | 'Controlnet'
      | 'Poses'
   /*	Whether the model is NSFW or not */
   nsfw: boolean
   /* The tags associated with the model */
   tags: string[]
   creator: {
      /* The name of the creator */
      username: string
      /* The url of the creators avatar */
      image: string | null
   }
   modelVersions: CivitaiModelVersion[]
}

export type CivitaiModelVersion = {
   /* The identifier for the model version */
   id: number
   /* The name of the model version */
   name: string
   /* The description of the model version (usually a changelog) */
   description: string
   /* The date in which the version was created */
   createdAt: Date
   /* The base model used to train the model */
   baseModel: string
   /* The download url to get the model file for this specific version */
   downloadUrl: string
   /* The words used to trigger the model */
   trainedWords: string[]

   files: CivitaiDownloadableFile[]
   images: ModelImage[]
}

export type CivitaiDownloadableFile = {
   id: number
   sizeKB: number
   name: string
   type: 'Model' | 'VAE' | string // 'Model'
   metadata: { fp: string; size: string; format: string } //{ fp: 'fp16'; size: 'pruned'; format: 'SafeTensor' }
   pickleScanResult: Maybe<string> // 'Success'
   pickleScanMessage: Maybe<string> // 'No Pickle imports'
   virusScanResult: Maybe<string> // 'Success'
   virusScanMessage: Maybe<string> // null
   scannedAt: Maybe<string> // '2024-01-08T04:52:42.578Z'
   hashes: {
      [key: string]: string
   }
   downloadUrl: string // 'https://civitai.com/api/download/models/290640'
   primary: boolean // true
}

export type ModelImage = {
   /** The url for the image */
   url: string
   /** Whether or not the image is NSFW (note: if the model is NSFW, treat all images on the model as NSFW) */
   nsfw: string
   /** The original width of the image */
   width: number
   /** The original height of the image */
   height: number
   /** The blurhash of the image */
   hash: string
   /** The generation params of the image */
   meta: object | null
}
type SearchResultMetadata = {
   /*The total number of items available*/
   totalItems: string
   /*The the current page you are at*/
   currentPage: string
   /*The the size of the batch*/
   pageSize: string
   /*The total number of pages*/
   totalPages: string
   /*The url to get the next batch of items*/
   nextPage: string
   /*The url to get the previous batch of items*/
   prevPage: string
}
