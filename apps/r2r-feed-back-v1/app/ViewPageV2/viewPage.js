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
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Filter data based on search term
  const filteredData = studentInputs.filter(input => 
    input.activityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = [...filteredData].sort((a, b) => {
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

  // Reset to first page when changing items per page
  const handleItemsPerPageChange = (newValue) => {
    setItemsPerPage(Number(newValue));
    setCurrentPage(1);
  };

  // ... rest of the existing functions ...

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
          <div className="search-controls">
            <div className="source-filter">
              <input
                type="text"
                value={filterInput}
                onChange={(e) => setFilterInput(e.target.value)}
                placeholder="Enter source filter..."
                className="input-field"
              />
              <button type="submit" className="btn btn-primary">
                Apply Filter
              </button>
            </div>
            <div className="search-filter">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search activity names..."
                className="input-field"
              />
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
            <label className="form-label">Items per page:</label>
            <select 
              value={itemsPerPage} 
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              className="select-field"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div className="search-results">
            {searchTerm && (
              <span>Found {filteredData.length} matching activities</span>
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
                <td>{input.answerQ1}</td>
                <td>{input.fbtool}</td>
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

export default ViewPage; 