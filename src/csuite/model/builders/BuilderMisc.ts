import type { FieldTypes } from '../$FieldTypes'

import { Field_button, type Field_button_config } from '../../fields/button/FieldButton'
import { Field_color, type Field_color_config } from '../../fields/color/FieldColor'
import { Field_markdown, type Field_markdown_config } from '../../fields/markdown/FieldMarkdown'
import { Field_matrix, type Field_matrix_config } from '../../fields/matrix/FieldMatrix'
import { Field_number, type Field_number_config } from '../../fields/number/FieldNumber'
import { Field_seed, type Field_seed_config } from '../../fields/seed/FieldSeed'
import { Field_size, type Field_size_config } from '../../fields/size/FieldSize'
import { Field_string, type Field_string_config } from '../../fields/string/FieldString'
import { BaseBuilder } from './BaseBuilder'

interface SchemaAndAliasesᐸ_ᐳ extends HKT<FieldTypes> {
   Size: Apply<this, Field_size>
   Seed: Apply<this, Field_seed>
   Color: Apply<this, Field_color>
   Matrix: Apply<this, Field_matrix>
   Button: HKT<any> // ... 😩
   Markdown: Apply<this, Field_markdown>
   Number: Apply<this, Field_number>
}

export class BuilderMisc<Schemaᐸ_ᐳ extends SchemaAndAliasesᐸ_ᐳ> extends BaseBuilder<Schemaᐸ_ᐳ> {
   static fromSchemaClass = BaseBuilder.buildfromSchemaClass(BuilderMisc)

   size_(config: Field_size_config = {}): Schemaᐸ_ᐳ['Size'] {
      return this.buildSchema(Field_size, config)
   }

   size(config: Field_size_config = {}): Schemaᐸ_ᐳ['Size'] {
      const def = config.default ?? {
         aspectRatio: '1:1',
         modelType: 'SD1.5 512',
         height: 512,
         width: 512,
      }
      return this.size_({ collapsed: false, default: def, ...config })
   }

   seed(config: Field_seed_config = {}): Schemaᐸ_ᐳ['Seed'] {
      return this.seed_({ defaultMode: 'randomize', ...config })
   }

   seed_(config: Field_seed_config = {}): Schemaᐸ_ᐳ['Seed'] {
      return this.buildSchema(Field_seed, config)
   }

   color(config: Field_color_config = {}): Schemaᐸ_ᐳ['Color'] {
      return this.buildSchema(Field_color, config)
   }

   /**
    * legacy string-based `color` (based on `Field_string`)
    *
    * - value is string
    * - serial is plain string
    * - no specific validation
    *
    *
    * @deprecated
    * @see {@link color} for a better color field based on colorjs.io
    */
   colorV2(config: Field_string_config = {}): Schemaᐸ_ᐳ['Color'] {
      return this.buildSchema(Field_string, { inputType: 'color', default: 'red', ...config })
   }

   matrix(config: Field_matrix_config): Schemaᐸ_ᐳ['Matrix'] {
      return this.buildSchema(Field_matrix, { default: [], ...config })
   }

   button<K>(config: Field_button_config): Apply<Schemaᐸ_ᐳ['Button'], K> {
      return this.buildSchema(Field_button<K>, { default: false, ...config })
   }

   /** variants: `header` */
   markdown(config: Field_markdown_config | string): Schemaᐸ_ᐳ['Markdown'] {
      return this.buildSchema(Field_markdown, typeof config === 'string' ? { markdown: config } : config)
   }

   /** [markdown variant]: inline=true, label=false */
   header(config: Field_markdown_config | string): Schemaᐸ_ᐳ['Markdown'] {
      const finalConfig: Field_markdown_config =
         typeof config === 'string'
            ? { markdown: config, inHeader: true, label: false }
            : { inHeader: true, label: false, justifyLabel: false, ...config }
      return this.buildSchema(Field_markdown, finalConfig)
   }

   pixel(config: Omit<Field_number_config, 'mode' | 'parse' | 'format'> = {}): Schemaᐸ_ᐳ['Number'] {
      const finalConf: Field_number_config = { mode: 'int', ...config, unit: 'px', suffix: 'px' }
      return this.buildSchema(Field_number, finalConf)
   }
}
