const logger = require('../../../../logging/logger.js');
'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Chip,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';

type Order = 'asc' | 'desc';

interface Column<T = any> {
  id: keyof T;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => React.ReactNode;
  sortable?: boolean;
}

interface C4RDataTableProps<T = any> {
  /** Table columns configuration */
  columns: Column<T>[];
  /** Table data */
  data: T[];
  /** Whether table is in loading state */
  loading?: boolean;
  /** Whether to show search functionality */
  searchable?: boolean;
  /** Whether to show pagination */
  paginated?: boolean;
  /** Rows per page options */
  rowsPerPageOptions?: number[];
  /** Whether to show export functionality */
  exportable?: boolean;
  /** Table title */
  title?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional actions in toolbar */
  actions?: React.ReactNode;
  /** Callback for row click */
  onRowClick?: (row: T, index: number) => void;
  /** Callback for export */
  onExport?: (data: T[]) => void;
  /** Custom row styling */
  getRowProps?: (row: T, index: number) => any;
  /** Initial sort configuration */
  defaultOrderBy?: keyof T;
  /** Initial sort direction */
  defaultOrder?: Order;
}

/**
 * C4R Data Table
 * 
 * Feature-rich data table component for displaying activity results,
 * user data, and other tabular information across C4R activities.
 * 
 * Features:
 * - Sorting and pagination
 * - Search functionality
 * - Export capabilities
 * - Responsive design
 * - Loading states
 * - Custom formatting
 * 
 * @example
 * ```tsx
 * const columns = [
 *   { id: 'name', label: 'Name', sortable: true },
 *   { id: 'score', label: 'Score', align: 'right', format: (value) => `${value}%` },
 *   { id: 'status', label: 'Status', format: (value) => <Chip label={value} /> },
 * ];
 * 
 * <C4RDataTable
 *   title="Activity Results"
 *   columns={columns}
 *   data={results}
 *   searchable
 *   exportable
 *   onRowClick={(row) => logger.app.info('Clicked:', row)}
 * />
 * ```
 */
export default function C4RDataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  searchable = false,
  paginated = true,
  rowsPerPageOptions = [10, 25, 50],
  exportable = false,
  title,
  emptyMessage = 'No data available',
  actions,
  onRowClick,
  onExport,
  getRowProps,
  defaultOrderBy,
  defaultOrder = 'asc',
}: C4RDataTableProps<T>) {
  const [order, setOrder] = useState<Order>(defaultOrder);
  const [orderBy, setOrderBy] = useState<keyof T>(defaultOrderBy || columns[0]?.id);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Sorting
  const sortedData = React.useMemo(() => {
    const comparator = (a: T, b: T) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    };
    
    return [...filteredData].sort(comparator);
  }, [filteredData, order, orderBy]);

  // Pagination
  const paginatedData = React.useMemo(() => {
    if (!paginated) return sortedData;
    
    const startIndex = page * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage, paginated]);

  const handleRequestSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = () => {
    if (onExport) {
      onExport(sortedData);
    }
  };

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      {/* Table Header */}
      {(title || searchable || exportable || actions) && (
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {title && (
              <Typography variant="h4" component="h2">
                {title}
              </Typography>
            )}
            
            {searchable && (
              <TextField
                size="small"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {actions}
            
            {exportable && (
              <Tooltip title="Export Data">
                <IconButton onClick={handleExport} size="small">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      )}

      {/* Table Content */}
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                      {orderBy === column.id && (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      )}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                const rowProps = getRowProps ? getRowProps(row, index) : {};
                
                return (
                  <TableRow
                    hover={!!onRowClick}
                    key={index}
                    onClick={() => onRowClick?.(row, index)}
                    sx={{ 
                      cursor: onRowClick ? 'pointer' : 'default',
                      ...rowProps?.sx,
                    }}
                    {...rowProps}
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      const formattedValue = column.format ? column.format(value) : value;
                      
                      return (
                        <TableCell 
                          key={String(column.id)} 
                          align={column.align || 'left'}
                        >
                          {formattedValue}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {paginated && !loading && paginatedData.length > 0 && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
}