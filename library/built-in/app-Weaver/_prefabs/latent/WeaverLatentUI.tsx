import type { MediaImageL } from '../../../../../src/models/MediaImage'
import type { $WeaverLatent } from './prefab_weaver_latent'

import { observer } from 'mobx-react-lite'

import { useDropZone, useImageDrop } from '../../../../../src/widgets/galleries/dnd'
import { StackCardUI, type StackData } from '../prefab_Stack'

export const StackLatentUI = observer(function WeaverLatentUI_(p: {
   field: $WeaverLatent['$Field']
   dataField: StackData['$Field']
   stackField: X.XList<StackData>['$Field']
   stackIndex: number
}) {
   const field = p.field
   const f = field.value
   const theme = cushy.preferences.theme.value
   const aspectRatio = f.image.height / f.image.width
   const horizontal = f.image.width > f.image.height
   return (
      <StackCardUI //
         field={p.dataField}
         stackField={p.stackField}
         stackIndex={p.stackIndex}
         icon={p.field.config.icon}
      >
         <div tw='py-1'>
            <UY.Layout.Row align>
               {Object.keys(field.Mode.config.items).map((key: string) => {
                  return (
                     <UY.boolean.default
                        toggleGroup={field.id + '_LATENTGROUP'}
                        display={'button'}
                        expand
                        value={field.Mode.isBranchEnabled(key as any)}
                        onValueChange={() => field.Mode.toggleBranch(key as any)}
                     >
                        {key}
                     </UY.boolean.default>
                  )
               })}
            </UY.Layout.Row>
            {/* <UY.Prop obj={field.} /> */}
            <div tw='py-1'>
               <UY.Layout.Col tw='gap-1'>
                  <UY.number.def field={field.BatchSize} />
                  {/* <field.BatchSize.UI /> */}
                  {field.Mode.value.empty && (
                     <UY.Layout.Col align>
                        <UY.number.def field={field.Dimensions.Width} />
                        <UY.number.def field={field.Dimensions.Height} />
                     </UY.Layout.Col>
                  )}
                  {field.Mode.value.image && (
                     <UY.Layout.Row tw='gap-1'>
                        <UY.Layout.Col align>
                           <UY.number.def field={field.Location.X} />
                           <UY.number.def field={field.Location.Y} />
                        </UY.Layout.Col>
                        <UY.Layout.Col align>
                           <UY.number.def field={field.Scale.X} />
                           <UY.number.def field={field.Scale.Y} />
                        </UY.Layout.Col>
                     </UY.Layout.Row>
                  )}
                  {field.Mode.value.random && (
                     <UY.Layout.Col align>
                        <UY.number.def field={field.Dimensions.Width} />
                        <UY.number.def field={field.Dimensions.Height} />
                     </UY.Layout.Col>
                  )}
               </UY.Layout.Col>
            </div>
            <UY.Misc.ResizableFrame startSize={512}>
               <_EmptyUI field={field} />
            </UY.Misc.ResizableFrame>
         </div>
      </StackCardUI>
   )
})
const _EmptyUI = observer(function _EmptyUI_(p: { field: $WeaverLatent['$Field'] }) {
   // const theme = cushy.preferences.theme.value
   const f = p.field.value
   const imageL = p.field.Image.value

   const [isOver, dropRef] = UY.DropZone({
      accept: ['Image', '__NATIVE_FILE__'],
      config: { shallow: true },
      onDrop: (match) => {
         match({
            Image: (data: MediaImageL) => {
               console.log('WE DROPPING BOYS', data)
               f.image = data
            },
            __NATIVE_FILE__: (data) => {
               console.log('WE DROPPING FILES THO?', data)
            },
         })
      },
      onHover: (item, monitor) => {
         console.log('WTFFFFFF')
         cushy.dndHandler.setContent({
            icon: 'mdiImage',
            label: 'YYOOO',
            suffixIcon: 'mdiMenuOpen',
         })
      },
   })

   const horizontal = imageL.width > imageL.height
   const correctX = horizontal ? f.scale.x : f.scale.x * (imageL.width / imageL.height)
   const correctY = horizontal ? f.scale.y * (imageL.height / imageL.width) : f.scale.y
   const imageScaleX = 2 - correctX
   const imageScaleY = 2 - correctY

   // multiply by aspect ratio
   return (
      <div //Contain the Overlay so it doesn't seep in to resizable frame's footer
         ref={dropRef}
         tw={['relative flex h-full w-full overflow-hidden', isOver && 'opacity-75']}
      >
         {f.mode.image && (
            <div tw='flex h-full w-full items-center justify-center'>
               <div
                  tw='!aspect-square'
                  style={{
                     // width: `${100 * scale.x}%`,
                     // height: `${scale.y > 1 ? 100 * scale.y : 100}%`,
                     // height: `${scale.y > 1 ? scale.y * 100 : 100}%`,
                     height: `100%`,
                     maxWidth: '100%',
                     maxHeight: '100%',
                     // transform: `
                     // scaleX(${scale.x})
                     // scaleY(${scale.y})`,
                  }}
               >
                  <div // Fixes vertical position while maintaining aspect ratio
                     tw='flex h-full w-full items-center justify-center'
                  >
                     <UY.Misc.Frame
                        base={{ contrast: -0.1 }}
                        tw='!aspect-square w-full self-center overflow-hidden '
                        roundness={3}
                        style={{
                           width: `100%`,
                           // paddingRight: `${scale.x * 100 - 100}%`,
                           // paddingLeft: `${scale.x * 100 - 100}%`,
                           // height: `${scale.y > 1 ? 100 * scale.y : 100}%`,
                           // height: `${scale.y >= 1 ? 100 * scale.y : 100 * scale.x}%`,
                           maxWidth: '100%',
                           maxHeight: '100%',
                        }}
                     >
                        <img
                           //
                           src={p.field.Image.value.url}
                           tw='h-full w-full object-contain '
                           style={{
                              transform: `
                              translateX(${-(f.location.x / imageL.width) * 100}%)
                              translateY(${-(f.location.y / imageL.height) * 100}%)
                              scaleX(
                               ${correctX > 1 ? (imageScaleX > 0.01 ? imageScaleX : 0.01) : '100%'}
                              )
                              scaleY(
                                 ${correctY > 1 ? Math.max(0.01, Math.min(imageScaleY, 1)) : '100%'}
                              )
                              `,
                           }}
                        />
                     </UY.Misc.Frame>
                  </div>
               </div>
            </div>
         )}
         <_SizeIndicatorUI field={p.field} />
      </div>
   )
})

// Could probably be re-used if de-coupled from the field, fuck this thing
const _SizeIndicatorUI = observer(function _SizeIndicatorUI_(p: { field: $WeaverLatent['$Field'] }) {
   const theme = cushy.preferences.theme.value
   const f = p.field.value
   const imageL = p.field.Image.value

   const horizontal = f.mode.image ? imageL.width > imageL.height : f.dimensions.width > f.dimensions.height

   const scale = f.mode.image
      ? {
           x: horizontal ? f.scale.x : f.scale.x * (imageL.width / imageL.height),
           y: horizontal ? f.scale.y * (imageL.height / imageL.width) : f.scale.y,
        }
      : {
           x: horizontal ? 1 : f.dimensions.width / f.dimensions.height,
           y: horizontal ? f.dimensions.height / f.dimensions.width : 1,
        }

   const shadowColor = theme.global.shadow?.color ?? 'black'

   return (
      <div tw='absolute flex h-full w-full items-center justify-center'>
         <div
            tw='flex !aspect-square items-center justify-center'
            style={{
               height: '100%',
               maxWidth: '100%',
               maxHeight: '100%',
            }}
         >
            <div
               // tw='!aspect-square'
               style={{
                  width: '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  // Use transform here because it works with floats and will not cause popping/mis-alignments.
               }}
            >
               <UY.Misc.Frame
                  base={{ contrast: -0.1 }}
                  tw={[
                     'flex aspect-square h-full w-full items-center justify-center',
                     f.mode.image && '!bg-transparent',
                  ]}
               >
                  <UY.Misc.Frame
                     tw={['!aspect-square', f.mode.image && '!bg-transparent']}
                     border={{ contrast: 0.2, chromaBlend: 5 }}
                     base={
                        f.mode.image
                           ? {
                                contrast: 0.5,
                                chromaBlend: 1.5,
                                hue: 145,
                             }
                           : {
                                contrast: theme.global.active.l?.contrast
                                   ? theme.global.active.l?.contrast + 0.1
                                   : undefined,
                                // contrast: 100,
                                chroma: theme.global.active.c?.chroma,
                                chromaBlend: theme.global.active.c?.chromaBlend,
                                hue: theme.global.active.h?.hue,
                                hueShift: theme.global.active.h?.hueShift,
                             }
                     }
                     roundness={3}
                     style={{
                        width: `${Math.max(scale.x * 100, 0)}%`,
                        height: `${Math.max(scale.y * 100, 0)}%`,
                        maxWidth: `100%`,
                        maxHeight: `100%`,
                        borderStyle: f.mode.image ? 'dashed' : 'solid',
                        borderWidth: '1px',
                        // Creates an outline around the border
                        filter: f.mode.image
                           ? `drop-shadow(1px 0px ${shadowColor}) drop-shadow(-1px 0px ${shadowColor}) drop-shadow(0px 1px ${shadowColor}) drop-shadow(0px -1px ${shadowColor})`
                           : undefined,
                     }}
                  />
               </UY.Misc.Frame>
            </div>
         </div>
      </div>
   )
})
