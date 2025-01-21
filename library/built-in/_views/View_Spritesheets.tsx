import type { Group } from 'three'

import { Html, Image, useGLTF } from '@react-three/drei'
import { type ThreeElements, useFrame } from '@react-three/fiber'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { useEffect, useMemo, useRef } from 'react'

/** this custom view  */
export const CustomViewSpriteSheet = view<{
   imageID: MediaImageID
}>({
   preview: () => <div>🚶‍♂️‍➡️</div>,
   render: (p) => <SpriteSheetUI imageID={p.imageID} />,
})

const SpriteSheetUI = observer(function SpriteSheet(p: { imageID: MediaImageID | null }) {
   const image = cushy.db.media_image.get(p.imageID)
   const form = cushy.forms.use(
      (ui) =>
         ui.fields(
            {
               row: ui.int({ min: 1, default: /* 4 */ 1 }),
               col: ui.int({ min: 1, default: /* 4 */ 6 }),
               border: ui.int({ default: 0 }),
               padding: ui.int({ default: 0 }),
               fps: ui.int({ default: 8, min: 1 }),
               imagePerAnim: ui.int({ default: 6 }),
            },
            {
               label: 'controls',
               presets: [
                  {
                     icon: 'mdiAnimationPlay',
                     label: '4 dirs',
                     apply: (f): void => void f.setPartialValue({ row: 4, col: 4, imagePerAnim: 4 }),
                  },
                  {
                     icon: 'mdiRun',
                     label: 'run 1x6',
                     apply: (f): void => void f.setPartialValue({ row: 1, col: 6, imagePerAnim: 6 }),
                  },
               ],
            },
         ),
      {
         name: 'Spritesheet Showcase',
         // initialSerial: () => cushy.readJSON<FormSerial>('settings/spritesheet.json'),
         // onSerialChange: (form) => cushy.writeJSON('settings/spritesheet.json', form.serial),
      },
   )
   const uist = useLocalObservable(() => ({ step: 0 }))
   const v = form.value
   useEffect(() => {
      const i = setInterval(() => uist.step++, 1000 / v.fps)
      return (): void => clearInterval(i)
   }, [v.fps])
   if (image == null) return <div>no image</div>
   const cellWidth = image?.width / v.col
   const cellHeight = image?.height / v.row
   const totalAnim = Math.floor((v.row * v.col) / v.imagePerAnim)
   return (
      <>
         <div tw='absolute right-0 z-20 w-96'>{form.UI()}</div>
         {totalAnim} animations
         <div tw='flex flex-wrap'>
            {new Array(totalAnim).fill(0).map((_, i) => {
               const nth = v.imagePerAnim
               const startIx = i * v.imagePerAnim + (uist.step % v.imagePerAnim)
               const nthCol = startIx % v.col
               const nthRow = Math.floor(startIx / v.col)
               const startX = nthCol * cellWidth
               const startY = nthRow * cellHeight
               return (
                  <div key={i} tw='bd'>
                     ({startX}, {startY}){/* {startIx} */}
                     <img
                        src={image?.url}
                        style={{
                           width: cellWidth,
                           height: cellHeight,
                           border: `${form.value.border}px solid black`,
                           padding: `${form.value.padding}px`,
                           // select sub-part of the image
                           objectPosition: `-${startX}px -${startY}px`,
                           objectFit: 'none',
                        }}
                     />
                  </div>
               )
            })}
         </div>
      </>
   )
})

// const useGLTFProxy = (url: string) => {}
const Can3 = observer(function Can3_(props: ThreeElements['group'] & { _textureURL?: string }) {
   // writeFileSync('src/outputs/3d-scene/can3/test/can3.gltf,')
   const gltf = useGLTF(`/library/built-in/_views/_can3/can3.gltf`)
   const { nodes, materials } = gltf
   const uist = useLocalObservable(() => ({ hover: false }))
   const ref = useRef<Group>(null!)
   const cache = useMemo(() => ({ total: 0 }), [])
   useFrame((state, delta) => {
      ref.current.rotation.y += 0.03
      cache.total += delta
      ref.current.rotation.x = Math.cos(cache.total) * 0.3
   })

   return (
      <group {...props} dispose={null}>
         {/* quick way to debug gltf content */}
         {
            <Html>
               <div>Gtlf content</div>
               <pre tw='text-xs' style={{ color: 'black', background: 'white', opacity: 0.5 }}>
                  {JSON.stringify(
                     {
                        nodes: Object.keys(nodes),
                        materials: Object.keys(materials),
                     },
                     null,
                     3,
                  )}
               </pre>
            </Html>
         }
         {props._textureURL && (
            <Image
               position={[0, 0, -0.1]}
               url={props._textureURL!}
               scale={[0.3, 0.3]}
               // material={textAlt ? new MeshStandardMaterial({ map: textAlt }) : undefined}
            />
         )}
         {/* <Image
                    position={[0.6, 0, 0]}
                    url={gltf.materials['lobster texture'].map.source.toJSON().url}
                    scale={[0.3, 0.3]}
                    // material={textAlt ? new MeshStandardMaterial({ map: textAlt }) : undefined}
                /> */}
         {/* actual glb(gltf) */}

         <group position={[0, 0, 0]} ref={ref}>
            {/* Auto-generated by: https://github.com/pmndrs/gltfjsx
                    Command: npx gltfjsx@6.2.16 /Users/loco/dev/CushyStudio/src/outputs/3d-scene/can3/can3.glb -h */}
            <mesh
               // key={xx}
               // onPointerLeave={() => {
               //     console.log(`[🤠] gltf a`)
               //     material.map.source = source1
               //     material.map.needsUpdate = true
               //     material.needsUpdate = true
               // }}
               // onPointerEnter={() => {
               //     console.log(`[🤠] gltf b`)
               //     material.map.source = source2
               //     material.map.needsUpdate = true
               //     material.needsUpdate = true
               // }}
               onPointerOver={() => (uist.hover = true)}
               onPointerOut={() => (uist.hover = false)}
               // @ts-ignore
               geometry={nodes.Cylinder.geometry}
               material={materials['lobster texture']}
               // material={textAlt ? undefined : materials['lobster texture']}
            >
               {/* {textAlt ? <meshStandardMaterial map={textAlt} /> : undefined} */}
            </mesh>
            {/* @ts-ignore */}
            <mesh geometry={nodes.Cylinder_1.geometry} material={materials.Top} />
            {/* <Sparkles count={20} scale={0.1} size={6} speed={0.4} /> */}
         </group>
      </group>
   )
})
