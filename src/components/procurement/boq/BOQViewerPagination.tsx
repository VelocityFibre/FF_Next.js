/**
 * BOQ Viewer Pagination Component
 */

import { ITEMS_PER_PAGE } from './BOQViewerTypes';

interface BOQViewerPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  filteredItems: number;
  onPageChange: (page: number) => void;
}

export default function BOQViewerPagination({
  currentPage,
  totalPages,
  totalItems,
  filteredItems,
  onPageChange
}: BOQViewerPaginationProps) {
  if (totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredItems);

  return (
    <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {startIndex} to {endIndex} of {filteredItems} items
          {filteredItems !== totalItems && (
            <span className="text-gray-500"> (filtered from {totalItems} total)</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-1">
            {/* First page */}
            {currentPage > 3 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className="px-3 py-1 text-sm hover:bg-gray-100 rounded"
                >
                  1
                </button>
                {currentPage > 4 && <span className="px-1 text-gray-500">...</span>}
              </>
            )}
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage <= 3 
                ? i + 1 
                : currentPage >= totalPages - 2 
                  ? totalPages - 4 + i 
                  : currentPage - 2 + i;
              
              if (pageNum < 1 || pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 text-sm rounded ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {/* Last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="px-1 text-gray-500">...</span>}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="px-3 py-1 text-sm hover:bg-gray-100 rounded"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}