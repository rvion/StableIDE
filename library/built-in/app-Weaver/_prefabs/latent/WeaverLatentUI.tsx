import type { Field_group } from '../../../../../src/csuite/fields/group/FieldGroup'
import type { Field_number } from '../../../../../src/csuite/fields/number/FieldNumber'
import type { UI_LatentV3 } from '../../../_prefabs/prefab_latent_v3'
import type { $WeaverPromptList } from '../prompting/WeaverPrompting'

import { observer } from 'mobx-react-lite'

import { StackCardUI, type StackData } from '../prefab_Stack'

export const StackLatentUI = observer(function WeaverLatentUI_(p: {
   field: UI_LatentV3['$Field']
   dataField: StackData['$Field']
   stackField: X.XList<StackData>['$Field']
   stackIndex: number
}) {
   const field = p.field
   return (
      <StackCardUI //
         field={p.dataField}
         stackField={p.stackField}
         stackIndex={p.stackIndex}
      >
         <div tw='py-2'>
            <UY.Layout.Row align>
               {Object.keys(field.bField.config.items).map((key: string) => {
                  return (
                     <UY.boolean.default
                        toggleGroup='ah0wwth800awt'
                        display={'button'}
                        expand
                        value={field.bField.isBranchEnabled(key as any)}
                        onValueChange={() => field.bField.toggleBranch(key as any)}
                     >
                        {key}
                     </UY.boolean.default>
                  )
               })}
            </UY.Layout.Row>
            {/* <UY.Prop obj={field.bField} property={'fields'} /> */}
            {field.bField.matchExhaustive({
               emptyLatent: (value) => {
                  return (
                     <div tw='py-2'>
                        <UY.Layout.Col>
                           <UY.number.def field={value.fields.batchSize.config.field} />
                        </UY.Layout.Col>
                     </div>
                  )
               },
               image: () => <>image</>,
               random: () => <>random</>,
            })}
         </div>
         {/* {field.value.emptyLatent && <>EMPTY</>} */}
      </StackCardUI>
   )
})
