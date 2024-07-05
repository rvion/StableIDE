import { describe, expect as expect_, it } from 'bun:test'

import { simpleBuilder as b } from '../../index'

// ------------------------------------------------------------------------------
describe('assign to value object', () => {
    it('assign to Group.value separate fields', () => {
        const S1 = b.fields({
            str1: b.string({ default: '🔵' }),
        })
        const E1 = S1.create()
        expect(E1.value.str1).toBe('🔵')
        expect(E1.fields.str1.value).toBe('🔵')

        E1.value.str1 = '🟡'
        expect(E1.value.str1).toBe('🟡')
        expect(E1.fields.str1.value).toBe('🟡')
    })

    it('assign to List.value separate items (string)', () => {
        const S1 = b.string({ default: '🔵' }).list({ min: 3 })
        const E1 = S1.create()
        expect(E1.value).toEqual(['🔵', '🔵', '🔵'])

        E1.value[1] = '🟡'
        expect(E1.value).toEqual(['🔵', '🟡', '🔵'])
        expect(E1.serial).toMatchObject({
            type: 'list',
            items_: [
                { type: 'str', val: '🔵' },
                { type: 'str', val: '🟡' },
                { type: 'str', val: '🔵' },
            ],
        })
    })
})

function expect(a: any) {
    return expect_(JSON.parse(JSON.stringify(a)))
}
