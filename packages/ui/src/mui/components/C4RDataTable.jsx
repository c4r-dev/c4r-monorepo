'use client';
const logger = require('../../../../logging/logger.js');

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
  Search,
  Download,
  FilterList,
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';

type Order = 'asc' | 'desc';

interface Column {
  id) => React.ReactNode;
  sortable: boolean;
}

interface C4RDataTableProps {
  /** Table columns configuration */
  columns, index) => void;
  /** Callback for export */
  onExport: (data) => void;
  /** Custom row styling */
  getRowProps: (row, index) => any;
  /** Initial sort configuration */
  defaultOrderBy: keyof T;
  /** Initial sort direction */
  defaultOrder: Order;
}

/**
 * C4R Data Table
 * 
 * Feature-rich data table component for displaying activity results,
 * user data, and other tabular information across C4R activities.
 * 
 * Features= [
 *   { id, label, sortable,
 *   { id, label, align, format) => `${value}%` },
 *   { id, label, format) =>  },
 * ];
 * 
 *  logger.app.info('Clicked, row)}
 * />
 * ```
 */
export default function C4RDataTable>({
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
}: C4RDataTableProps) {
  const [order, setOrder] = useState(defaultOrder);
  const [orderBy, setOrderBy] = useState(defaultOrderBy || columns[0]?.id);
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
    const comparator = (a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (aValue  {
    if (!paginated) return sortedData;
    
    const startIndex = page * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage, paginated]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = () => {
    if (onExport) {
      onExport(sortedData);
    }
  };

  return (
    
      {/* Table Header */}
      {(title || searchable || exportable || actions) && (

                {title}
              
            )}
            
            {searchable && (
               setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment="start">

            )}

      )}

      {/* Table Content */}
       (
                 handleRequestSort(column.id)}
                    >
                      {column.label}
                      {orderBy === column.id && (
                        
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        
                      )}
                    
                  ) {loading ? (
              
                Loading...

            ) {columns.length} align="center" sx={{ py="text.secondary">{emptyMessage}

            ) {
                const rowProps = getRowProps ? getRowProps(row, index) {};
                
                return (
                   onRowClick?.(row, index)}
                    sx={{ 
                      cursor,
                      ...rowProps?.sx,
                    }}
                    {...rowProps}
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      const formattedValue = column.format ? column.format(value) {String(column.id)} 
                          align={column.align || 'left'}
                        >
                          {formattedValue}
                        
                      );
                    })}
                  
                );
              })
            )}

      {/* Pagination */}
      {paginated && !loading && paginatedData.length > 0 && (
        
      )}
    
  );
}