import { PerspectiveCamera, RenderTexture, Text } from '@react-three/drei'
import { useRef } from 'react'

// prettier-ignore
const sides: { color: string; text: string; }[] = [
    { text: 'Front', color: 'red' },
    { text: 'Back', color: 'cyan' },
    { text: 'Top', color: 'green' },
    { text: 'Bottom', color: 'yellow' },
    { text: 'Right', color: 'orange' },
    { text: 'Left', color: 'pink' },
];
// https://codesandbox.io/p/sandbox/drei-rendertexture-0z8i2c?file=%2Fsrc%2FApp.js%3A11%2C22
export function Cube(): React.JSX.Element {
   const textRef = useRef<any>()
   return (
      <mesh>
         <boxGeometry />
         {sides.map((s, ix) => (
            <meshStandardMaterial key={s.text} attach={`material-${ix}`}>
               <RenderTexture attach='map' anisotropy={16}>
                  <PerspectiveCamera makeDefault manual aspect={1 / 1} position={[0, 0, 5]} />
                  <color attach='background' args={[s.color]} />
                  <Text
                     //
                     // font={(suspend(inter) as any).default}
                     ref={textRef}
                     fontSize={2}
                     color='#555'
                  >
                     {s.text}
                  </Text>
               </RenderTexture>
            </meshStandardMaterial>
         ))}
      </mesh>
   )
}
