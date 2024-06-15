import { describe, expect, it } from 'bun:test'

import { PromptAST } from './grammar.practical'

// (masterpiece, tree)x-0.8, (*color)x0.6 @"xl\pxll.safetensors"[.2,.8]`
const test1 = `@a[1] ?foo (baz, @test[-2,3])*1.2`
// const start = Date.now()
const expr = new PromptAST(test1)
describe('prompt grammar', () => {
    it('parse', () => {
        expect(expr.toString()).toBe(
            [
                `Prompt: `,
                `  Lora: "@a[1]" (weight=1)`,
                `    Identifier: "a"`,
                `    Number: "1"`,
                `  Wildcard: "?foo"`,
                `    Identifier: "foo"`,
                `  WeightedExpression: "(baz, @test[-2,3])*1.2"`,
                `    Content: `,
                `      Identifier: "baz"`,
                `      Separator: ","`,
                `      Lora: "@test[-2,3]" (weight=3)`,
                `        Identifier: "test"`,
                `        Number: "-2"`,
                `        Number: "3"`,
                `    Number: "1.2"`,
            ].join('\n'),
        )
    })

    it('find all Lora', () => {
        const matches = expr.findAll('Lora')
        expect(matches.length).toBe(2)
        expect(matches[0]!.name).toBe('a' as any)
        expect(matches[0]!.strength_clip).toBe(1)
        expect(matches[1]!.name).toBe('test' as any)
        expect(matches[1]!.strength_clip).toBe(3)
    })

    // const end = Date.now()
    // console.log(`[👙]`, end - start, 'ms')
})
