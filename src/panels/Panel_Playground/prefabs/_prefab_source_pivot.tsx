import type { FormBuilder } from 'src/controls/FormBuilder'
import { Kwery } from 'src/utils/misc/Kwery'
import { gmbCols } from './_prefab_columns'
import { locoLocations } from './_prefab_locoUtil1'

/*
//-----------------------
## alt1.  TCD(tableau croisé dynamique) / pivot table
cols
    - { col: 'date' (YYYY-MM)} (🔶 some FORMAT_DATE(val from dropdown) function prob required)
rows
    - { col: 'location'}
values:
    - { col: 'rating', summaryMethod: 'avg'}
    - { col: '*', summaryMethod: 'count'}
filter:
    - { col: 'gmb_created_at', op: 'between', from: 'M-12', to: NOW() }

out: {yyyy, MM, COUNT, avgRating, location }[]

*/

// .select([
//     knex.raw('to_char(gmb_created_at, 'YYYY-MM') as YOLO'),
//  ])
//  .whereBetween('gmb_created_at', [startingDate, new Date()])
//  .avg('rating as overall_rating')     // 🔶 TCD VALUES
//  .count('* as reviews_total_count')
//  .groupBy(to_char(gmb_created_at, 'YYYY-MM'))          // 🔶 TCD COLS
//  .groupBy(YOLO)          // 🔶 TCD COLS
//  .orderBy(to_char(gmb_created_at, 'YYYY-MM'))
//  .orderBy(YOLO)
// */

export const ui_selectData_pivot = (ui: FormBuilder) => {
    // const shared = ui.shared('foo', ui.string())
    const gmbColumnUI = (key: string) => {
        const colName = ui.shared(`${key}-col`, ui.selectOne({ choices: gmbCols, border: false }))
        const as = ui.string({ label: 'as' })
        return ui.fields({ colName, as }, { layout: 'H', label: false })
    }
    const order = ui.selectOne({ border: false, choices: [{ id: 'asc' }, { id: 'desc' }] }) // .optional()
    const fn = ui
        .choice({
            appearance: 'tab',
            items: {
                avg: ui.group(),
                count: ui.group(),
                to_char: ui.fields({ format: ui.string() }),
                custom: ui.fields({ template: ui.string() }, { tooltip: 'use ? to embed the column value' }),
                YYYYMM: ui.group(),
            },
        })
        .optional()
    const condition = ui.choice({
        appearance: 'tab',
        items: {
            eq: ui.fields({ value: ui.string() }, { label: '=' }),
            gt: ui.fields({ value: ui.string() }, { label: '>' }),
            gte: ui.fields({ value: ui.string() }, { label: '>=' }),
            lt: ui.fields({ value: ui.string() }, { label: '<' }),
            lte: ui.fields({ value: ui.string() }, { label: '<=' }),
            between: ui.fields({ from: ui.string(), to: ui.string() }, { label: '>_<' }),
        },
    })

    const values = ui.shared(
        'values',
        ui.list({
            label: '🔢 Values',
            element: (ix) =>
                ui.fields(
                    { column: gmbColumnUI(`values-${ix}`), fn: fn },
                    { layout: 'V', border: false, summary: (items) => items.column.colName.id },
                ),
        }),
    )

    const cols = ui.shared(
        'cols',
        ui.list({
            label: '🚦 Cols',
            element: (ix) =>
                ui.fields(
                    { column: gmbColumnUI(`cols-${ix}`), fn: fn, order },
                    { layout: 'V', border: false, summary: (items) => items.column.colName.id },
                ),
        }),
    )

    const xAxis = ui.list({
        label: '📊 Abcisses',
        element: (ix) =>
            ui.fields(
                {
                    category: ui.selectOne({ choices: (['value', 'category', 'time', 'log'] as const).map((id) => ({ id })) }),
                    dataKey: ui.selectOne({ choices: () => cols.shared.value.map((v) => ({ id: v.column.as })) }),
                },
                { layout: 'H' },
            ),
    })

    return ui.fields(
        {
            xAxis,

            series: ui.list({
                label: '📊 Series',
                element: (ix) =>
                    ui.fields({
                        type: ui.selectOne({ choices: [{ id: 'bar' }, { id: 'line' }] }),
                        name: ui.string({}),
                        dataKey: ui.selectOne({ choices: () => values.shared.value.map((v) => ({ id: v.column.as })) }),
                    }),
            }),

            location: ui.selectOne({ choices: locoLocations }),

            table: ui.selectOne({ choices: [{ id: 'gmb_review' }] }),

            rows: ui.list({
                label: '🚥 Rows',
                element: (ix) =>
                    ui.fields(
                        { column: gmbColumnUI(`rows-${ix}`), fn: fn, order },
                        { layout: 'V', border: false, summary: (items) => items.column.colName.id },
                    ),
            }),

            cols,
            values,

            filters: ui.list({
                label: '🔍 Filters',
                element: (ix) =>
                    ui.fields(
                        { column: gmbColumnUI(`filters-${ix}`), fn: fn, condition },
                        { summary: (items) => items.column.colName.id },
                    ),
            }),

            // -------------------
            // groupBy: ui.selectMany({ choices: gmbCols /* appearance: 'tab' */ }),
            // orderBy: ui.fields(
            //     {
            //         field: ui.selectMany({ choices: gmbCols /* appearance: 'tab' */ }),
            //         order: ui.selectOne({ choices: [{ id: 'asc' }, { id: 'desc' }] }),
            //         nulls: ui.selectOne({ choices: [{ id: 'first' }, { id: 'last' }] }),
            //     },
            //     { layout: 'H' },
            // ),
            // whereBetween: ui.fields({ from: ui.date(), to: ui.date() }).optional(),
            // whereBetween: ui
            //     .choice({
            //         appearance: 'tab',
            //         items: {
            //             customRange: ui.fields({ from: ui.string(), to: ui.string() }),
            //             lastYear: ui.group({}),
            //         },
            //     })
            //     .optional(),
            // avg: ui.selectOne({ choices: gmbCols }).optional(),
            // whereBetween: ui.time().optional(),
        },
        { border: false },
    )
}

type SelectDataT = ReturnType<typeof ui_selectData_pivot>['$Output']

export const run_selectData_pivot = async (
    ui: SelectDataT,
): Promise<{ res: { data: any[] } | { err: any }; sql: string; series: SelectDataT['series']; xAxis: SelectDataT['xAxis'] }> => {
    const selectExpr: string[] = []
    const groups: string[] = []
    const where: string[] = []
    const orders: string[] = []

    for (const row of ui.rows) {
        const { alias } = sqlExpr(row.column, row.fn)
        groups.push(alias)
        orders.push(`${alias} ${row.order.id}`)
    }
    for (const col of ui.cols) {
        const ex = sqlExpr(col.column, col.fn)
        selectExpr.push(ex.full)
        groups.push(ex.alias)
        orders.push(`${ex.alias} ${col.order.id}`)
    }
    for (const val of ui.values) {
        const { full } = sqlExpr(val.column, val.fn)
        selectExpr.push(full)
    }
    for (const filter of ui.filters) {
        where.push(filterExpr(filter))
    }
    where.push(`location_id = '${ui.location.id}'`)

    let sql = `--sql
        select ${selectExpr.join(', ')}
        from ${ui.table.id}
        where ${where.join(' AND ')}
        group by ${groups.join(', ')}
        order by ${orders.join(', ')}
    `

    // const json = knex .select([
    //         knex.raw('to_char(gmb_created_at, 'YYYY-MM') as YOLO'),
    //     ])
    //     .whereBetween('gmb_created_at', [startingDate, new Date()])
    //     .avg('rating as overall_rating')     // 🔶 TCD VALUES
    //     .count('* as reviews_total_count')
    //     .groupBy(to_char(gmb_created_at, 'YYYY-MM'))          // 🔶 TCD COLS
    //     .groupBy(YOLO)          // 🔶 TCD COLS
    //     .orderBy(to_char(gmb_created_at, 'YYYY-MM'))
    //     .orderBy(YOLO)

    const res = await Kwery.get(JSON.stringify(ui), { sql }, () =>
        fetch('http://localhost:8000/EXECUTE-SQL', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sql }),
        }).then((res) => res.json()),
    )
    return { res, sql, series: ui.series, xAxis: ui.xAxis }

    function sqlExpr(
        //
        col: SelectDataT['cols' | 'rows'][number]['column'],
        fn: SelectDataT['cols' | 'rows'][number]['fn'],
    ): { expr: string; alias: string; full: string } {
        const path = `${ui.table.id}.${col.colName.id}`
        const expr = (() => {
            if (fn == null) return path
            if (fn.to_char != null) return `to_char(${path}, '${fn.to_char.format}')`
            if (fn.avg != null) return `avg(${path})`
            if (fn.count != null) return `count(${path})`
            if (fn.custom != null) return fn.custom.template.replace('?', path)
            if (fn.YYYYMM) return 'todo'
            return '🔴 TODO'
        })()
        return { expr, alias: col.as || expr, full: col.as ? `${expr} as ${col.as}` : expr }
    }

    function filterExpr(filter: SelectDataT['filters'][number]): string {
        const { alias } = sqlExpr(filter.column, filter.fn)
        if (filter.condition.between != null)
            return `${alias} between ${filter.condition.between.from} and ${filter.condition.between.to}`
        if (filter.condition.eq != null) return `${alias} = ${filter.condition.eq.value}`
        if (filter.condition.gt != null) return `${alias} > ${filter.condition.gt.value}`
        if (filter.condition.lt != null) return `${alias} < ${filter.condition.lt.value}`
        return '🔴 TODO'
    }
}
