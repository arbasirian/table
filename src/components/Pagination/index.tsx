import React from 'react';

interface PaginationProps {
  pageSize: number;
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  pageSize,
  total,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="peransa-table-pagination">
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          className={currentPage === i + 1 ? 'active' : ''}
          data-testid="pagination-button"
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
