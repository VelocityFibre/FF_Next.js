/**
 * Header Search Bar Component
 */

import { Search } from 'lucide-react';
import { SearchBarProps } from './HeaderTypes';

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="relative hidden md:block">
      <input
        type="text"
        placeholder="Search projects, clients..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-4 py-2 w-64 border border-border-primary rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent"
      />
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
    </div>
  );
}