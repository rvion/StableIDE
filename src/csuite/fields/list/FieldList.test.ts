import type { Field_list_config } from './FieldList'

import { describe, expect, it } from 'bun:test'
import { toJS } from 'mobx'

import { simpleBuilder as b } from '../../index'
import { expectJSON } from '../../model/TESTS/utils/expectJSON'

describe('FieldList', () => {
   const S1 = b.string({ default: '🔵' }).list({ defaultLength: 3 })
   const S123 = b.string({ default: '🔵' }).list()

   describe('reset', () => {
      it('works', () => {
         const S = b.int({ default: 3 }).list({ defaultLength: 3 })
         const E = S.create()
         E.value = [1, 2, 3]
         E.reset()
         expectJSON(E.value).toEqual([3, 3, 3])
      })
   })

   describe('isSet', () => {
      it('is true with list()', () => {
         const S_def = b.int().list()
         const E_def = S_def.create()
         expect(E_def.isSet).toBe(true)
      })

      it('is false with list_()', () => {
         const S_nodef = b.int().list_()
         const E_nodef = S_nodef.create()
         expect(E_nodef.isSet).toBe(false)
      })

      type VisualValid = '✅' | '❌'
      type VisualSet = '🛟' | '🟢'
      it('is correct for all of the combination of (min, max, defaultLen)', () => {
         const configsWithExpectedIsSetAndIsValid: [
            //
            VisualSet,
            VisualValid,
            Omit<Field_list_config<any>, 'element'>,
         ][] = [
            // Set, Valid, Config,
            // (min=0, max=0, default=0)
            ['🛟', '❌', { min: 0 }], // too
            ['🛟', '❌', { max: 0 }],
            ['🛟', '❌', { min: 0, max: 0 }],
            ['🟢', '✅', { defaultLength: 0 }],
            ['🟢', '✅', { defaultLength: 0, min: 0 }],
            ['🟢', '✅', { defaultLength: 0, max: 0 }],
            ['🟢', '✅', { defaultLength: 0, min: 0, max: 0 }],

            // (min=3, max=6, default=0)
            ['🛟', '❌', { min: 3 }],
            ['🛟', '❌', { max: 6 }],
            ['🛟', '❌', { min: 3, max: 6 }],
            ['🟢', '✅', { defaultLength: 0 }],
            ['🟢', '❌', { defaultLength: 0, min: 3 }], // FAILS
            ['🟢', '✅', { defaultLength: 0, max: 6 }],
            ['🟢', '❌', { defaultLength: 0, min: 3, max: 6 }],

            // (min=3, max=6, default=5)
            ['🛟', '❌', { min: 3 }],
            ['🛟', '❌', { max: 6 }],
            ['🛟', '❌', { min: 3, max: 6 }],
            ['🟢', '✅', { defaultLength: 5 }],
            ['🟢', '✅', { defaultLength: 5, min: 3 }],
            ['🟢', '✅', { defaultLength: 5, max: 6 }],
            ['🟢', '✅', { defaultLength: 5, min: 3, max: 6 }],

            // (min=3, max=6, default=7)
            ['🛟', '❌', { min: 3 }],
            ['🛟', '❌', { max: 6 }],
            ['🛟', '❌', { min: 3, max: 6 }],
            ['🟢', '✅', { defaultLength: 7 }],
            ['🟢', '✅', { defaultLength: 7, min: 3 }],
            ['🟢', '❌', { defaultLength: 7, max: 6 }],
            ['🟢', '❌', { defaultLength: 7, min: 3, max: 6 }],
         ]

         for (const TC of configsWithExpectedIsSetAndIsValid) {
            const [set, valid, config] = TC
            const S = b.int().list_({
               min: config.min,
               max: config.max,
               defaultLength: config.defaultLength,
            })
            const E = S.create()
            expect({
               TC,
               set: E.isSet,
               valid: E.isValid,
            }).toEqual({
               TC,
               set: set === '🟢',
               valid: valid === '✅',
            })
         }
      })
   })

   describe('yolo', () => {
      it('works', () => {
         const S = b.int().list({ min: 3 })
         const E = S.create()
         expect(E.value.length).toEqual(3)
         expect(E.value[0]).toEqual(0)
         expect(E.value[1]).toEqual(0)
         expect(E.value[2]).toEqual(0)
         // 🔴 proxy error when using `expect`
         // VVVVV
         expectJSON(E.value).toEqual([0, 0, 0])

         E.addItem({ at: 1, value: 8 })
         expectJSON(E.value).toEqual([0, 8, 0, 0])
         expectJSON(E.serial).toEqual({
            $: 'list',
            items_: [
               { $: 'number', value: 0 },
               { $: 'number', value: 8 },
               { $: 'number', value: 0 },
               { $: 'number', value: 0 },
            ],
         })
      })
   })
   describe('tupples', () => {
      it('works', () => {
         const S2 = b.list({
            min: 2,
            element: (x) => {
               if (x % 2 === 0) return b.int()
               return b.string()
            },
         })
         const a = S2.create()
         expect(a.length).toBe(2)
         expectJSON(a.value).toEqual([0, ''])

         a.setValue([1, 2])
         expectJSON(a.value).toEqual([1, '2'])
      })
   })

   // INSTANCIATION -------------------
   describe('instanciation', () => {
      it('works without default', () => {
         const E1 = S123.create()
         expectJSON(E1.value).toEqual([])
      })

      it('works WITH default', () => {
         const S1 = b.string({ default: '🔵' }).list({ defaultLength: 3 })
         const E1 = S1.create()
         expectJSON(E1.value).toEqual(['🔵', '🔵', '🔵'])
         expectJSON(E1.serial).toMatchObject({
            // prettier-ignore
            items_: [
                    { value: '🔵' },
                    { value: '🔵' },
                    { value: '🔵' },
                ],
         })
      })
   })

   // SET SERIAL ----------------------
   describe('setSerial', () => {
      it('works', () => {
         const S1 = b.string({ default: '🔵' }).list({ defaultLength: 3 })
         const E1 = S1.create()
         expectJSON(E1.value).toEqual(['🔵', '🔵', '🔵'])
         expect(E1.length).toBe(3)
         const serial = {
            $: 'list' as const,
            items_: [
               { $: 'str' as const, value: '🔵' },
               { $: 'str' as const, value: '🟢' },
            ],
         }

         E1.setSerial(serial)
         expect(E1.serial === serial).toBe(true)
         expect(E1.length).toBe(2)
         expectJSON(E1.value).toEqual(['🔵', '🟢'])
         expect(toJS(E1.serial)).toMatchObject(serial)
      })
   })

   describe('setValue', () => {
      it('works', () => {
         const E1 = S1.create()
         expectJSON(E1.value).toEqual(['🔵', '🔵', '🔵'])
         expect(E1.length).toBe(3)
         E1.value = ['🔵', '🟢']
         expect(E1.length).toBe(2)
         expectJSON(E1.value).toEqual(['🔵', '🟢'])
         expect(toJS(E1.serial)).toMatchObject({
            $: 'list' as const,
            items_: [
               { $: 'str' as const, value: '🔵' },
               { $: 'str' as const, value: '🟢' },
            ],
         })
      })

      it('updates the serial without touching the old one', () => {
         const S1 = b.string({ default: '🔵' }).list({ defaultLength: 3 })
         const E1 = S1.create()
         const oldSerial = E1.serial
         expect(oldSerial.items_?.length).toBe(3)
         E1.value = ['🔵', '🟢']
         expect(oldSerial.items_?.length).toBe(3)
         const newSerial = E1.serial
         expect(newSerial.items_?.length).toBe(2)
         expect(toJS(newSerial)).toMatchObject({
            $: 'list' as const,
            items_: [
               { $: 'str' as const, value: '🔵' },
               { $: 'str' as const, value: '🟢' },
            ],
         })
      })
   })

   // STRUCTURAL SHARING --------------
   it('generate a new serial for each field', () => {
      const E1 = S1.create()
      const E2 = S1.create(E1.serial)

      // same shape
      expect(E1.items.length).toBe(3)
      expect(E1.serial).toEqual(E2.serial)
      expect(E1.at(1)!.serial).toEqual(E2.at(1)!.serial)

      // same refs
      expect(E1.serial === E2.serial).toBe(true)
      expect(E1.at(1)!.serial === E2.at(1)!.serial).toBe(true)
   })

   // EFFECTS -------------------------
   it('doesnt apply serial effect nor value effect on instanciation ', () => {
      // 🔴 TODO
   })

   describe('value proxy', () => {
      it('is mutable', () => {
         const S2 = b.int({ default: 3 }).list({ defaultLength: 1 })
         const a = S2.create()
         expect(a.length).toBe(1)
         expectJSON(a.value).toEqual([3])

         a.value[0] = 8

         expect(a.length).toBe(1)
         expectJSON(a.value).toEqual([8])
      })

      it('can ADD/PUSH/POP/SPLICE/... items at the end/start/middle/...', () => {
         const S2 = b.int({ default: 3 }).list({ defaultLength: 1 })
         const a = S2.create()
         expectJSON(a.value).toEqual([3])

         a.value[1] = 8
         expectJSON(a.value).toEqual([3, 8])

         a.value.push(9)
         expectJSON(a.value).toEqual([3, 8, 9])

         a.value.pop()
         expectJSON(a.value).toEqual([3, 8])

         a.value.unshift(4)
         expectJSON(a.value).toEqual([4, 3, 8])

         a.value.shift()
         expectJSON(a.value).toEqual([3, 8])
      })

      it('can .removeAllItems()', () => {
         const S2 = b.int({ default: 3 }).list({ min: 3 })
         const a = S2.create()
         expectJSON(a.value).toEqual([3, 3, 3])

         a.value.push(8)
         a.value.push(8)
         expectJSON(a.value).toEqual([3, 3, 3, 8, 8])

         a.removeAllItems()
         expectJSON(a.value).toEqual([3, 3, 3])
      })

      describe('map', () => {
         it('should map items', () => {
            const S2 = b.int({ default: 3 }).list({ min: 3 })
            const a = S2.create()
            expectJSON(a.value).toEqual([3, 3, 3])
            const r = a.value.map((x) => x + 1)

            expect(r).toEqual([4, 4, 4])
         })
      })

      describe('filter', () => {
         it('should filter items', () => {
            const S = b.int().list()
            const f = S.create()

            f.value = [1, 2, 3, 4, 5, 6]
            expectJSON(f.value).toEqual([1, 2, 3, 4, 5, 6])

            const filtered = f.value.filter((x) => x > 3)
            expect(filtered).toEqual([4, 5, 6])
         })
      })
   })

   // RESET ---------------------------
   it('field.reset() should always yield same serial as schema.create(null) except for updatedAt', () => {
      const S2 = b.int({ default: 3 }).list({ min: 3 })
      const a1 = S2.create()
      expect(a1.length).toBe(3)

      // set value then reset
      const a2 = S2.create()
      a2.value[3] = 8
      expectJSON(a2.value).toEqual([3, 3, 3, 8])
      expect(a2.length).toBe(4)

      // reset
      a2.reset()
      expect(a2.length).toBe(3)

      // should be same serial since we reset
      expect(toJS(a2.serial)).toMatchObject(toJS(a1.serial))
      // expect(toJS(a1.serial)).toEqual(toJS(a2.serial))
   })

   describe('.moveItem', () => {
      it('properly update indexes', () => {
         const S = b.int().list({ defaultLength: 8 })
         const E = S.create()
         E.value = E.value.map((_, ix) => ix)
         expectJSON(E.value).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
         E.moveItem(0, 1)
         expectJSON(E.value).toEqual([1, 0, 2, 3, 4, 5, 6, 7])
         expect(E.items[0]?.mountKey).toBe('0')
         expect(E.items[1]?.mountKey).toBe('1')
      })
   })

   describe('.splice', () => {
      it('properly update indexes', () => {
         const S = b.int().list({ defaultLength: 8 })
         const E = S.create()
         E.value = E.value.map((_, ix) => ix)
         expectJSON(E.value).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
         E.splice(3, 2)
         expectJSON(E.value).toEqual([0, 1, 2, 5, 6, 7])
         expect(E.items[0]?.mountKey).toBe('0')
         expect(E.items[1]?.mountKey).toBe('1')
         expect(E.items[2]?.mountKey).toBe('2')
         expect(E.items[3]?.mountKey).toBe('3')
         expect(E.items[4]?.mountKey).toBe('4')
         expect(E.items[5]?.mountKey).toBe('5')
      })
   })

   it('properly forwards value mode through proxy', () => {
      const S = b.string_().list({ defaultLength: 3 })
      const E = S.create()
      E.value[0] = 'zero'

      expect(E.value_unchecked[0]).toBe('zero')
      expect(E.value_unchecked[1]).toBeUndefined()
      expect(E.value_unchecked[2]).toBeUndefined()
      expect(E.value_unchecked.map((x) => x)).toEqual(['zero', undefined, undefined])

      expect(E.value[0]).toBe('zero')
      expect(() => E.value[1]).toThrow()
      expect(() => E.value[2]).toThrow()
      expect(() => E.value.map((x) => x)).toThrow()

      expect(E.value_or_zero[0]).toBe('zero')
      expect(E.value_or_zero[1]).toBe('')
      expect(E.value_or_zero[2]).toBe('')
      expect(E.value_or_zero.map((x) => x)).toEqual(['zero', '', ''])
   })
})
