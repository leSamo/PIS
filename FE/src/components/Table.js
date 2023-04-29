import React, { Fragment } from 'react';
import { TableComposable, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { Button, ButtonVariant, Bullseye, Spinner, Pagination, Split, SplitItem } from '@patternfly/react-core';
import TableEmptyState from './TableEmptyState';
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

const Table = ({ title, columns, isLoading, rows, actions, sortBy, onSort, page, perPage, itemCount, onSetPage, onPerPageSelect, emptyText }) => {
  const sortEnabled = sortBy != undefined && onSort != undefined;
  const paginationEnabled = page != undefined && perPage != undefined && itemCount != undefined;

  const paginationProps = {
    itemCount,
    perPage,
    page,
    onSetPage,
    onPerPageSelect,
    titles: {
      items: '',
      perPageSuffix: 'per page'
    },
    style: {
      margin: 8
    }
  }

  return isLoading ? (
    <Bullseye>
      <Spinner />
    </Bullseye>
  ) : (
    <Fragment>
      <Split>
        <SplitItem>
          {title}
        </SplitItem>
        <SplitItem isFilled />
        {paginationEnabled &&
          <SplitItem>
            <Pagination
              {...paginationProps}
              variant="top"
            />
          </SplitItem>
        }
      </Split>
      <TableComposable
        aria-label="Simple table"
        variant="compact"
      >
        <Thead>
          <Tr>
            {columns.filter(column => column.type !== 'hidden').map(({ label }, columnIndex) => (
              <Th key={columnIndex} sort={sortEnabled && { sortBy, onSort, columnIndex }}>{label}</Th>
            ))}
          </Tr>
        </Thead>
        {rows?.length === 0 ?
          <Tbody>
            <Tr>
              <Td colspan="100%">
                <TableEmptyState>{emptyText}</TableEmptyState>
              </Td>
            </Tr>
          </Tbody>
          : <Tbody>
            {rows?.map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {row.filter((cell, index) => columns[index].type !== 'hidden').map((cell, cellIndex) => (
                  <Td key={`${rowIndex}_${cellIndex}`}>
                    {columns[cellIndex].link
                      ? <a href={columns[cellIndex].link(cell, row)}>{cell}</a>
                      : columns[cellIndex].type === 'date'
                        ? new Date(cell).toLocaleString("en-US")
                        : columns[cellIndex].type === 'boolean'
                          ? (cell ? <CheckIcon color="green" /> : <TimesIcon color="red" />)
                          : cell ?? columns[cellIndex].fallback
                    }
                  </Td>
                ))}
                <Td key={rowIndex + "_actions"}>
                  {actions && [].concat(actions).map(({ label, onClick, buttonProps, resolver }) => resolver?.(row) !== false &&
                    <Button key={label} style={{ marginRight: 16 }} variant={ButtonVariant.secondary} onClick={() => onClick(row)} {...buttonProps}>{label}</Button>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        }
      </TableComposable>
      {paginationEnabled &&
        <Pagination
          {...paginationProps}
          variant="bottom"
        />
      }
    </Fragment>
  )
};

export default Table;
