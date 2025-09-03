
interface PoleTrackerPaginationProps {
  totalItems: number;
  filteredItems: number;
}

export function PoleTrackerPagination({ totalItems, filteredItems }: PoleTrackerPaginationProps) {
  return (
    <div className="ff-pagination">
      <div className="ff-pagination-info">
        Showing {filteredItems} of {totalItems} poles
      </div>
      <div className="ff-pagination-controls">
        <button className="ff-button ff-button-sm ff-button-secondary" disabled>
          Previous
        </button>
        <button className="ff-button ff-button-sm ff-button-primary">
          1
        </button>
        <button className="ff-button ff-button-sm ff-button-secondary" disabled>
          Next
        </button>
      </div>
    </div>
  );
}