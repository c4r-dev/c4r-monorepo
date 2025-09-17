"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import './viewPage.css';

function ViewPage() {
  const [studentInputs, setStudentInputs] = useState([]);
  const [filterInput, setFilterInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [searchType, setSearchType] = useState("exact");
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const searchParams = useSearchParams();
  const router = useRouter();
  const source = searchParams.get('source');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');
  const fromTime = searchParams.get('fromTime');
  const toTime = searchParams.get('toTime');

  // Column resize refs
  const columnRefs = useRef({});
  const [resizing, setResizing] = useState(null);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [source, fromDate, toDate, fromTime, toTime]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (source) params.append('source', source);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (fromTime) params.append('fromTime', fromTime);
    if (toTime) params.append('toTime', toTime);
    
    const url = params.toString() 
      ? `/api/studentInput?${params.toString()}`
      : '/api/studentInput';
      
    fetch(url)
      .then((response) => response.json())
      .then((data) => setStudentInputs(data.studentInputs));
  }, [source, fromDate, toDate, fromTime, toTime]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filterData = (data) => {
    if (!filterInput.trim()) return data;

    return data.filter(item => {
      const activityName = item.activityName || '';
      const searchTerm = filterInput.trim();

      switch (searchType) {
        case 'exact':
          return activityName.toLowerCase() === searchTerm.toLowerCase();
        case 'begins':
          return activityName.toLowerCase().startsWith(searchTerm.toLowerCase());
        case 'ends':
          return activityName.toLowerCase().endsWith(searchTerm.toLowerCase());
        case 'contains':
          return activityName.toLowerCase().includes(searchTerm.toLowerCase());
        default:
          return true;
      }
    });
  };

  const sortedData = filterData([...studentInputs]).sort((a, b) => {
    if (sortConfig.key === 'createdAt') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }
    return sortConfig.direction === 'asc'
      ? a[sortConfig.key]?.localeCompare(b[sortConfig.key])
      : b[sortConfig.key]?.localeCompare(a[sortConfig.key]);
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleResizeStart = (e, columnId) => {
    setResizing({
      columnId,
      startX: e.pageX,
      startWidth: columnRefs.current[columnId].offsetWidth
    });
  };

  useEffect(() => {
    const handleResize = (e) => {
      if (resizing) {
        const diff = e.pageX - resizing.startX;
        const newWidth = Math.max(100, resizing.startWidth + diff);
        columnRefs.current[resizing.columnId].style.width = `${newWidth}px`;
      }
    };

    const handleResizeEnd = () => {
      setResizing(null);
    };

    if (resizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [resizing]);

  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleFilterApply = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (filterInput.trim()) {
      params.append('source', filterInput.trim());
      params.append('searchType', searchType);
    }
    if (startDate) {
      params.append('fromDate', startDate);
    }
    if (endDate) {
      params.append('toDate', endDate);
    }
    if (startTime) {
      params.append('fromTime', startTime);
    }
    if (endTime) {
      params.append('toTime', endTime);
    }

    setCurrentPage(1);
    const queryString = params.toString();
    router.push(`/ViewPageV2${queryString ? `?${queryString}` : ''}`);
  };

  const clearFilters = () => {
    setFilterInput("");
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setSearchType("exact");
    setCurrentPage(1);
    router.push('/ViewPageV2');
  };

  const exportToCSV = () => {
    // Convert data to CSV format
    const headers = ['Activity Name', 'Feedback', 'Comment', 'Date'];
    const csvRows = [headers];

    studentInputs.forEach(input => {
      csvRows.push([
        input.activityName,
        input.answerQ1,
        input.fbtool,
        new Date(input.createdAt).toLocaleString()
      ].map(field => 
        // Escape fields that contain commas or quotes
        typeof field === 'string' ? 
          `"${field.replace(/"/g, '""')}"` : 
          field
      ));
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback-export${source ? `-${source}` : ''}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container">
      <div className="filters-panel">
        <div className="filters-header">
          <h2 className="filters-title">Current Filters</h2>
          <div className="button-group">
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
            <button onClick={exportToCSV} className="btn btn-success">
              Export to CSV
            </button>
          </div>
        </div>
        <div className="filters-status">
          <p>Source: {source ? source : 'No filter applied'}</p>
          <p>Date Range: {fromDate && toDate ? 
            `${formatDate(fromDate + (fromTime ? `T${fromTime}` : ''))} to ${formatDate(toDate + (toTime ? `T${toTime}` : ''))}` 
            : 'No date filter applied'}</p>
        </div>
        
        <form onSubmit={handleFilterApply} className="filters-form">
          <div className="source-filter">
            <div className="search-group">
              <label className="search-label">Activity Name Search</label>
              <div className="search-row">
                <select
                  className="search-type-select"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="exact">Matches exactly</option>
                  <option value="begins">Begins with</option>
                  <option value="ends">Ends with</option>
                  <option value="contains">Contains</option>
                </select>
                <input
                  type="text"
                  value={filterInput}
                  onChange={(e) => setFilterInput(e.target.value)}
                  placeholder="Enter activity name..."
                  className="input-field"
                />
                <button type="submit" className="btn btn-primary">
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
          
          <div className="date-time-grid">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </form>
      </div>

      <div className="table-header">
        <h1 className="filters-title">All feedback</h1>
        <div className="table-controls">
          <div className="items-per-page">
            <label className="form-label">Show:</label>
            <select 
              value={itemsPerPage} 
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="select-field"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
            <span className="form-label">entries</span>
          </div>
          <div className="search-results">
            {studentInputs.length > 0 && (
              <span>Found {studentInputs.length} matching activities</span>
            )}
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="feedback-table">
          <thead>
            <tr>
              {[
                { id: 'activityName', label: 'Activity Name' },
                { id: 'answerQ1', label: 'Feedback' },
                { id: 'fbtool', label: 'Comment' },
                { id: 'createdAt', label: 'Date' }
              ].map(column => (
                <th
                  key={column.id}
                  onClick={() => handleSort(column.id)}
                  ref={el => columnRefs.current[column.id] = el}
                  className={sortConfig.key === column.id ? `sorted-${sortConfig.direction}` : ''}
                >
                  {column.label}
                  <div
                    className="resize-handle"
                    onMouseDown={(e) => handleResizeStart(e, column.id)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((input) => (
              <tr key={input._id}>
                <td>{input.activityName}</td>
                <td 
                  className={`expandable-cell ${expandedRows.has(input._id) ? 'expanded' : ''}`}
                  onClick={() => toggleRowExpansion(input._id)}
                >
                  {input.answerQ1}
                </td>
                <td 
                  className={`expandable-cell ${expandedRows.has(input._id) ? 'expanded' : ''}`}
                  onClick={() => toggleRowExpansion(input._id)}
                >
                  {input.fbtool}
                </td>
                <td>{formatDate(input.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="pagination">
          <div className="pagination-info">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} entries
          </div>
          <div className="pagination-controls">
            <button
              className="page-button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              className="page-button"
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-button ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-button"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button
              className="page-button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewPageContainer() {
  return (
    <div>
      <Suspense fallback={<div className="loading">Loading...</div>}>
        <ViewPage />
      </Suspense>
    </div>
  );
}
