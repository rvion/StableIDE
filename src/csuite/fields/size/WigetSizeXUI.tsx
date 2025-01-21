import type { Field_size } from './FieldSize'
import type { AspectRatio, ModelType } from './WidgetSizeTypes'

import { observer } from 'mobx-react-lite'

import { ToggleButtonUI } from '../../checkbox/InputBoolToggleButtonUI'
import { InputBoolUI } from '../../checkbox/InputBoolUI'
import { Frame } from '../../frame/Frame'

const modelBtn = (uist: Field_size, model: ModelType): React.JSX.Element => (
   <ToggleButtonUI //
      toggleGroup='size'
      tw='w-input'
      value={uist.desiredModelType == model}
      onValueChange={() => {
         uist.setModelType(model)
         uist.touch()
      }}
      text={model}
      onBlur={() => uist.touch()}
   />
)

export const WigetSizeXUI = observer(function WigetSizeXUI_(p: { size: Field_size }) {
   const uist: Field_size = p.size
   const resoBtn = (ar: AspectRatio): React.JSX.Element => (
      <InputBoolUI //
         toggleGroup='size'
         display='button'
         value={uist.desiredAspectRatio == ar}
         onValueChange={() => uist.setAspectRatio(ar)}
         text={ar}
      />
   )
   return (
      <Frame tw='w-132 flex flex-col gap-1 p-1'>
         <div tw='flex flex-row justify-center'>
            {modelBtn(p.size, '1.5')}
            {modelBtn(p.size, 'xl')}
         </div>
         <div tw='flex flex-wrap items-center gap-1.5'>
            <div tw='join'>{resoBtn('1:1')}</div>
            <div tw='join flex flex-col'>
               {resoBtn('16:9')}
               {resoBtn('9:16')}
            </div>
            <div tw='join flex flex-col'>
               {resoBtn('4:3')}
               {resoBtn('3:4')}
            </div>
            <div tw='join flex flex-col'>
               {resoBtn('3:2')}
               {resoBtn('2:3')}
            </div>
            {p.size.desiredModelType === 'xl' && (
               <>
                  <div tw='join flex flex-col'>
                     {resoBtn('16:15')}
                     {resoBtn('15:16')}
                  </div>
                  <div tw='join flex flex-col'>
                     {resoBtn('17:15')}
                     {resoBtn('15:17')}
                  </div>
                  <div tw='join flex flex-col'>
                     {resoBtn('9:7')}
                     {resoBtn('7:9')}
                  </div>
                  <div tw='join flex flex-col'>
                     {resoBtn('18:13')}
                     {resoBtn('13:18')}
                  </div>
                  <div tw='join flex flex-col'>
                     {resoBtn('19:13')}
                     {resoBtn('13:19')}
                  </div>
                  <div tw='join flex flex-col'>
                     {resoBtn('7:4')}
                     {resoBtn('4:7')}
                  </div>
                  <div tw='join flex flex-col'>
                     {resoBtn('21:11')}
                     {resoBtn('11:21')}
                  </div>
                  <div tw='join flex flex-col'>
                     {resoBtn('2:1')}
                     {resoBtn('1:2')}
                  </div>
               </>
            )}
         </div>
      </Frame>
   )
})
