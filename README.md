# @peransa/table

[![npm version](https://img.shields.io/npm/v/%40peransa%2Ftable.svg)](https://www.npmjs.com/package/@peransa/table)
[![license](https://img.shields.io/npm/l/%40peransa%2Ftable.svg)](./LICENSE)

A lightweight, dependency-free React table component with sorting, pagination, row selection, custom cell rendering, and loading/empty states — fully typed for TypeScript.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Sorting](#sorting)
- [Pagination](#pagination)
- [Row Selection](#row-selection)
- [Custom Cell Rendering](#custom-cell-rendering)
- [Row Click Handling](#row-click-handling)
- [Loading & Empty States](#loading--empty-states)
- [Horizontal Scrolling](#horizontal-scrolling)
- [Styling](#styling)
- [API Reference](#api-reference)
- [Development](#development)

## Features

- **Zero runtime dependencies** — only `react`/`react-dom` as peer dependencies
- **Typed by design** — generic `Table<T>` infers column keys and cell value types from your data
- **Sorting** — built-in comparator for strings/numbers, or bring your own via the `useSortTable` hook
- **Pagination** — client-side slicing out of the box, or fully controlled/server-side mode
- **Row selection** — single and select-all checkboxes
- **Custom cell rendering** — per-column `render` function
- **Loading and empty states** — built in, no extra markup required
- **Horizontal scroll** — automatic edge-fade shadows for wide tables

## Installation

```bash
npm install @peransa/table
# or
yarn add @peransa/table
# or
pnpm add @peransa/table
```

`react` and `react-dom` (`^18.0.0` or `^19.0.0`) are peer dependencies and must already be present in your project.

The component ships its CSS separately from the JS bundle, so import it once (e.g. in your app's entry point):

```ts
import '@peransa/table/dist/index.css';
```

## Quick Start

```tsx
import { Table, Column } from '@peransa/table';
import '@peransa/table/dist/index.css';

interface User {
  id: number;
  name: string;
  age: number;
}

const columns: Column<User>[] = [
  { title: 'Name', key: 'name' },
  { title: 'Age', key: 'age' },
];

const dataSource: User[] = [
  { id: 1, name: 'John Doe', age: 30 },
  { id: 2, name: 'Jane Smith', age: 25 },
];

function App() {
  return <Table columns={columns} dataSource={dataSource} dataIndex="id" />;
}
```

## Core Concepts

Every `Table` needs three things:

- `columns` — an array of `Column<T>` describing what to render in the header and each cell
- `dataSource` — the array of row objects (`T[]`)
- `dataIndex` — the key on `T` that uniquely identifies a row (used for React keys, row selection, and `onRowClick`). It **must** be unique per row — duplicate values will cause incorrect selection/click behavior.

`Table` is generic over `T`, so column keys, `render` value types, `sort.sortBy`, and `rowSelection` keys are all type-checked against your actual data shape.

## Sorting

Sorting is entirely controlled by you — `Table` doesn't own any sort state itself. Pass a `sort` object and the header cells become clickable, with a sort-direction icon on the active column:

```tsx
import { Table, useSortTable } from '@peransa/table';

function App() {
  const { sortBy, sortOrder, handleSortBy } = useSortTable<User>({
    defaultSort: 'name',
    defaultSortOrder: 'asc', // optional, defaults to 'asc'
  });

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      dataIndex="id"
      sort={{ sortBy, sortOrder, onSort: handleSortBy }}
    />
  );
}
```

`useSortTable` just tracks `sortBy`/`sortOrder` and toggles direction when the same column is clicked twice — you're free to manage this state yourself instead (e.g. to persist it in the URL or sync it with a server query).

**Notes:**
- Only `number` and `string` column values are sortable by the built-in comparator (`SortBy<T>` only accepts keys of those types); other columns can still be displayed but won't be orderable.
- `Column.sorter` exists on the type but is not currently wired up to the sort engine — sorting is always by raw value comparison on the field named in `sortBy`, not a custom comparator.
- Sorting is applied in place on the `dataSource` array you pass in (`Array.prototype.sort` mutates and returns the same reference). If you rely on referential immutability elsewhere (Redux, memoization, frozen objects), pass a copy: `dataSource={[...data]}`.

## Pagination

`Table` supports two pagination modes depending on whether you provide `pagination.onChange`.

**Client-side (uncontrolled)** — omit `onChange` and `Table` slices `dataSource` for you based on `pageSize`:

```tsx
<Table
  columns={columns}
  dataSource={dataSource} // full dataset
  dataIndex="id"
  pagination={{ pageSize: 10, total: dataSource.length }}
/>
```

**Controlled / server-side** — provide `onChange` and `Table` will *not* slice the data; you're expected to pass only the current page's rows and update them yourself when the page changes:

```tsx
const [page, setPage] = useState(1);
const pageSize = 10;
const { rows, total } = useServerData(page, pageSize); // your own fetching logic

<Table
  columns={columns}
  dataSource={rows} // only the current page
  dataIndex="id"
  pagination={{
    pageSize,
    total, // total row count across ALL pages, used to compute page count
    current: page,
    onChange: setPage,
  }}
/>;
```

**Note:** `pagination.current` only sets the *initial* page on mount — `Table` owns page state internally afterward. To force the page back to 1 from outside (e.g. after changing a filter), remount the table with a `key` prop rather than relying on `pagination.current` to sync.

## Row Selection

```tsx
const [selectedIds, setSelectedIds] = useState<number[]>([]);

<Table
  columns={columns}
  dataSource={dataSource}
  dataIndex="id"
  rowSelection={{
    selectedRows: selectedIds,
    onChange: (id) =>
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      ),
    allSelected: selectedIds.length === dataSource.length,
    onSelectAll: () =>
      setSelectedIds((prev) =>
        prev.length === dataSource.length ? [] : dataSource.map((r) => r.id)
      ),
  }}
/>;
```

The select-all checkbox in the header only renders if `onSelectAll` is provided; the per-row checkbox column renders whenever `rowSelection` (with a `selectedRows` array) is passed.

## Custom Cell Rendering

Provide a `render` function on a column to control exactly what's rendered in each cell. It receives the cell value, the full row record, and the row index:

```tsx
const columns: Column<User>[] = [
  { title: 'Name', key: 'name' },
  {
    title: 'Age',
    key: 'age',
    render: (age, record, index) => (
      <strong>{age >= 18 ? 'Adult' : 'Minor'}</strong>
    ),
  },
];
```

Columns without a `render` function fall back to displaying the raw cell value.

## Row Click Handling

```tsx
<Table
  columns={columns}
  dataSource={dataSource}
  dataIndex="id"
  onRowClick={(id) => console.log('Clicked row:', id)}
/>
```

`onRowClick` receives the row's `dataIndex` value. Call `event.preventDefault()` inside a cell's own click handler (e.g. a button in a `render` function) to stop a click from also bubbling up to `onRowClick`.

## Loading & Empty States

```tsx
<Table columns={columns} dataSource={[]} dataIndex="id" loading />
```

- `loading` shows a built-in spinner row and takes priority over the empty state.
- An empty `dataSource` (and `loading` not set) automatically renders a "No Data" placeholder — no extra setup needed.

## Horizontal Scrolling

Set `width` to a value wider than the container to enable horizontal scrolling with fade shadows at the scrollable edges:

```tsx
<Table columns={columns} dataSource={dataSource} dataIndex="id" width="1200px" />
```

## Styling

Pass `className` to style the outer wrapper, and/or target the library's own class names directly:

| Class | Element |
| --- | --- |
| `.peransa-table-wrapper` | Outer wrapper around the scroll container and pagination |
| `.peransa-table-container` | Scrollable container around the `<table>` |
| `.peransa-table-table` | The `<table>` element |
| `.peransa-table-head` | `<thead>` |
| `.peransa-table-body` | `<tbody>` |
| `.peransa-table-cell` | Header and body `<th>`/`<td>` cells |
| `.peransa-table-head-cell-content-wrapper` | Wrapper around a header cell's title + sort icon |
| `.peransa-table-pagination-wrapper` | Wrapper around the pagination controls |
| `.peransa-table-pagination` | The pagination button group |
| `.peransa-table-no-data` | Empty-state container |
| `.peransa-table-loader-wrapper` / `.peransa-table-loader` | Loading spinner |
| `.peransa-table-checkbox` | Row selection checkboxes |

## API Reference

### `TableProps<T>`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `columns` | `Column<T>[]` | Yes | Column definitions |
| `dataSource` | `T[]` | Yes | Row data |
| `dataIndex` | `keyof T` | Yes | Unique row identifier field |
| `rowSelection` | `RowSelection<T>` | No | Enables row selection checkboxes |
| `pagination` | `Pagination` | No | Enables pagination controls |
| `sort` | `Sort<T>` | No | Enables sortable column headers |
| `className` | `string` | No | className applied to the outer wrapper |
| `width` | `string` | No | Forces table width, enabling horizontal scroll |
| `testId` | `string` | No | `data-testid` applied to the outer wrapper |
| `loading` | `boolean` | No | Shows the loading state |
| `onRowClick` | `(id: T[keyof T]) => void` | No | Called with a row's `dataIndex` value on click |

### `Column<T, K extends keyof T = keyof T>`

| Field | Type | Description |
| --- | --- | --- |
| `title` | `string` | Header label |
| `key` | `K` | Field on `T` to read for this column |
| `render` | `(value: T[K], record: T, index: number) => ReactNode` | Optional custom cell renderer |
| `sorter` | `(a: T, b: T) => number` | Reserved for future use — not currently invoked by the sort engine |

### `Pagination`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `pageSize` | `number` | Yes | Rows per page |
| `total` | `number` | Yes | Total row count (across all pages) |
| `current` | `number` | No | Initial page (default `1`) — see [Pagination](#pagination) for controlled-mode caveats |
| `onChange` | `(page: number) => void` | No | If provided, switches `Table` into controlled/server-side pagination mode |

### `RowSelection<T, K extends keyof T = keyof T>`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `selectedRows` | `T[K][]` | Yes | Currently selected `dataIndex` values |
| `onChange` | `(selectedRowKey: T[K]) => void` | Yes | Called with a row's key when its checkbox is toggled |
| `allSelected` | `boolean` | No | Checked state of the header "select all" checkbox |
| `onSelectAll` | `() => void` | No | Renders the header checkbox when provided |

### `Sort<T>`

| Field | Type | Description |
| --- | --- | --- |
| `sortBy` | `SortBy<T>` (keys of `T` whose values are `number \| string \| null`) | Currently active sort column |
| `sortOrder` | `'asc' \| 'desc'` | Currently active sort direction |
| `onSort` | `(sortBy: keyof T) => void` | Called with a column's key when its header is clicked |

### `useSortTable<T>(options)`

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `defaultSort` | `SortBy<T>` | Yes | Initial sort column |
| `defaultSortOrder` | `'asc' \| 'desc'` | No | Initial sort direction (default `'asc'`) |

Returns `{ sortBy, sortOrder, handleSortBy }`, ready to spread into `Table`'s `sort` prop (see [Sorting](#sorting)).

## Development

```bash
npm run build          # Build dist/ with Rollup
npm run watch           # Rebuild on change
npm test                # Run the Jest test suite
npm run test:coverage   # Run tests with coverage
npm run lint            # Lint with ESLint
npm run lint:fix        # Lint and auto-fix
```

## License

MIT
