import { observer } from 'mobx-react-lite'

import { FormUI } from '../../controls/FormUI'
import { CushyErrorBoundarySimpleUI } from '../../controls/shared/CushyErrorBoundarySimple'
import { Box, BoxBase, BoxSubtle, BoxTitle } from '../../theme/colorEngine/Box'
import { ThemeForm } from '../../theme/colorEngine/CushyTheming'

/** Freely modify this as you like, then pick the "Scratch Pad" option in the top left. Do not commit changes made to this. */
export const PlaygroundScratchPad = observer(function PlaygroundScratchPad_(p: {}) {
    return (
        <CushyErrorBoundarySimpleUI>
            <ThemeConfigUI />
        </CushyErrorBoundarySimpleUI>
    )
})

// FUCKING MAGICAL PROPERTIES: minimal direction reversal across the page
//
// -------------------
// starting with a "buffer" of 9/10 "auto" shifts to the darker color
// NOTES for self: Oscilating poitn should be .75 or something
// and .25 in the other direction
// => in means that the Context should track which direction we're moving
// -------------------
// background should string | Relative
// string means absolute
// and we convert strings to oklch to extract the components
// that's a way way better API for box
// -------------------
// 🟢 accent bleed (chroma blend) to rename (saturation multiplication?) should go past 1
// ---------------------
// relative colors
// 🟢 add chroma bonus (applied beofre contrast)

export const ThemeConfigUI = observer(function ThemeConfigUI_(p: {}) {
    const theme = cushy.themeManager

    return (
        <div tw='w-full h-full bg-base-300 p-1'>
            {/* <Box tw='p-1 m-1 bd' background={{ contrast: -1 }}> */}
            <Box
                //
                tw='p-1 m-1'
                base='oklch(.3 0.05 0)'
                border={2}
                text={{ contrast: 1, chromaBlend: 1, hueShift: 45 }}
            >
                A 1
                <BoxBase tw='p-1'>
                    <BoxBase tw='p-1'>
                        <BoxBase>yay</BoxBase>
                    </BoxBase>
                </BoxBase>
                <BoxTitle children='test' />
                <BoxSubtle children='test' />
                <Box tw='p-1 m-1' base={{ contrast: 0.05 }}>
                    A 2
                    <BoxSubtle>
                        test 1
                        <BoxSubtle children='test 2' />
                    </BoxSubtle>
                </Box>
                <Box tw='p-1 m-1 _bd' border={{ contrast: 1, chromaBlend: 1 }} base={{ contrast: 0.05, hueShift: 80 }}>
                    A 3
                    <Box tw='p-1 m-1 _bd' border={2} base={20}>
                        A 4
                        <Box tw='p-1 m-1 _bd' border={2} base={20}>
                            A 5
                            <Box tw='p-1 m-1 _bd' border={2} base={20}>
                                A 6
                                <BoxTitle tw='text-xl font-bold' children='Test' />
                                <Box
                                    tw='p-1 m-1 _bd'
                                    border={{ contrast: 0.3, chromaBlend: 1 }}
                                    base={{ contrast: 0.0, hueShift: 30 }}
                                >
                                    A 7
                                    <Box tw='p-1 m-1 _bd' border={{ contrast: 0.3, chromaBlend: 1 }} base={{ contrast: 0.05 }}>
                                        A 8
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <FormUI form={ThemeForm} />
        </div>
    )
})
