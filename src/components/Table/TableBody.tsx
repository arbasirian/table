import React from 'react';
import { cx, getUniqueId } from '../../utils';
import { TableBodyProps } from '../../types';
import IconBrandDatabricks from '../Icons/IconBrandDatabricks';
import { RowCheckbox } from '../RowCheckbox';

export const TableBody = <T,>({
  paginatedData,
  dataIndex,
  columns,
  loading,
  rowSelection,
  onRowClick,
}: TableBodyProps<T>) => {
  if (loading)
    return (
      <tr className="min-height">
        <td colSpan={columns?.length ?? 1}>
          <div className="peransa-table-loader-wrapper" data-testid="fetching-data">
            <div className="peransa-table-loader" />
          </div>
        </td>
      </tr>
    );

  if (!paginatedData || paginatedData.length < 1)
    return (
      <tr className="min-height">
        <td colSpan={columns?.length ?? 1}>
          <div className="peransa-table-no-data" data-testid="no-data">
            <IconBrandDatabricks />
            <div>No Data</div>
          </div>
        </td>
      </tr>
    );

  return paginatedData.map((record, index) => (
    <tr
      key={getUniqueId(record[dataIndex])}
      className={cx([Boolean(onRowClick) && 'has-hover'])}
      data-id="table-body-row"
      onClick={(e) => {
        if (e.defaultPrevented) return;
        onRowClick?.(record[dataIndex]);
      }}
    >
      {rowSelection && (
        <td className="peransa-table-cell" data-id="table-body-row-column">
          <RowCheckbox
            shouldPrevent
            name={String(record[dataIndex])}
            isChecked={rowSelection?.selectedRows?.includes(record[dataIndex])}
            onChange={() => rowSelection.onChange(record[dataIndex])}
          />
        </td>
      )}
      {columns.map((column) => (
        <td
          className="peransa-table-cell"
          key={getUniqueId(column.key)}
          data-id="table-body-row-column"
        >
          {column.render ? (
            column.render(record[column.key], record, index)
          ) : (
            <>{(record[column.key] ?? '') as React.ReactNode}</>
          )}
        </td>
      ))}
    </tr>
  ));
};
