import React, { useEffect, useState } from 'react';
const Pagination = ({ activePage, pageLength, onpageChange }) => {
  const [pagesList, setPageList] = useState([1]);
  const [currentPage, setCurrentPage] = useState(activePage);
  function pages(current_page, last_page, onSides = 3) {
    // pages
    let pages = [];
    // Loop through
    for (let i = 1; i <= last_page; i++) {
      // Define offset
      let offset = i == 1 || last_page ? onSides + 1 : onSides;
      // If added
      if (
        i == 1 ||
        (current_page - offset <= i && current_page + offset >= i) ||
        i == current_page ||
        i == last_page
      ) {
        pages.push(i);
      } else if (
        i == current_page - (offset + 1) ||
        i == current_page + (offset + 1)
      ) {
        pages.push('...');
      }
    }
    return pages;
  }
  useEffect(() => {
    setPageList(pages(Number(activePage), pageLength, 1));
  }, [activePage, pageLength]);
  const changePage = (id) => {
    onpageChange(id);
    setCurrentPage(id);
    setPageList(pages(id, pageLength, 1));
  };
  const previousPage = () => {
    if (Number(currentPage) > 1) {
      setCurrentPage(Number(currentPage) - 1);
      onpageChange(currentPage);
      setPageList(pages(currentPage, pageLength, 1));
    }
  };
  const nextPage = () => {
    if (pageLength > Number(currentPage)) {
      setCurrentPage(Number(currentPage) + 1);
      onpageChange(currentPage);
      setPageList(pages(currentPage, pageLength, 1));
    }
  };
  return (
    <nav className="mt-3">
      <ul className="inline-flex -space-x-px text-sm">
        <li>
          <button
            onClick={() => previousPage()}
            className={`${
              currentPage <= 1 ? 'opacity-40' : 'opacity-100'
            } flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
          >
            Previous
          </button>
        </li>
        {pagesList.map((item, index) => (
          <li key={index}>
            <button
              disabled={item == '...'}
              onClick={() => changePage(item)}
              className={`${
                (currentPage == item
                  ? 'bg-grey-300 dark:bg-gray-600'
                  : 'bg-white dark:bg-gray-800',
                item == '...' ? 'opacity-60' : 'opacity-100')
              } flex items-center justify-center px-3 h-8 leading-tight text-gray-500 border hover:bg-gray-100 border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
            >
              {item}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => nextPage()}
            className={`${
              currentPage >= pageLength ? 'opacity-40' : 'opacity-100'
            } flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};
export default Pagination;
