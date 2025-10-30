
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { FilterIcon, SearchIcon, XIcon } from '../icons/Icon';
import { FilterDefinition, ActiveFilter } from '../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface FilterBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  filterDefinitions: FilterDefinition[];
  activeFilters: ActiveFilter[];
  onActiveFiltersChange: (filters: ActiveFilter[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  children?: React.ReactNode;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
    searchTerm, 
    onSearchTermChange, 
    filterDefinitions, 
    activeFilters, 
    onActiveFiltersChange,
    onFocus,
    onBlur,
    children
}) => {
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
    const [currentFilterId, setCurrentFilterId] = useState<string | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsFilterPopoverOpen(false);
                setCurrentFilterId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addFilter = (filter: ActiveFilter) => {
        if (!activeFilters.some(f => f.id === filter.id && f.value === filter.value)) {
            onActiveFiltersChange([...activeFilters, filter]);
        }
        setCurrentFilterId(null);
        setIsFilterPopoverOpen(false);
    };

    const removeFilter = (filterToRemove: ActiveFilter) => {
        onActiveFiltersChange(activeFilters.filter(f => f.id !== filterToRemove.id || f.value !== filterToRemove.value));
    };

    const clearFilters = () => {
        onActiveFiltersChange([]);
    };
    
    const selectedFilterDef = filterDefinitions.find(def => def.id === currentFilterId);
    const availableFilterDefs = filterDefinitions.filter(def => !activeFilters.some(f => f.id === def.id));

    return (
        <div className="space-y-2">
             <div className="flex items-center gap-2">
                <div className="relative flex-grow min-w-0">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                        onFocus={onFocus}
                        onBlur={onBlur}
                    />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {filterDefinitions.length > 0 && (
                         <div className="relative" ref={popoverRef}>
                            <Button variant="outline" onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}>
                                <FilterIcon className="w-4 h-4 mr-2"/>
                                Filters
                                {activeFilters.length > 0 && <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{activeFilters.length}</span>}
                            </Button>

                            {isFilterPopoverOpen && (
                                <div className="absolute top-full right-0 mt-2 w-72 bg-card border rounded-lg shadow-lg z-20 p-4 space-y-3">
                                    <h4 className="font-semibold text-sm">Add Filter</h4>
                                    {availableFilterDefs.length > 0 && (
                                         <Select onValueChange={(value) => setCurrentFilterId(value)}>
                                            <SelectTrigger><SelectValue placeholder="Select a filter..."/></SelectTrigger>
                                            <SelectContent>
                                                {availableFilterDefs.map(def => (
                                                    <SelectItem key={def.id} value={def.id}>{def.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                   
                                    {selectedFilterDef?.type === 'select' && (
                                        <Select onValueChange={(value) => addFilter({ id: selectedFilterDef.id, value, label: selectedFilterDef.options?.find(o => o.value === value)?.label || value })}>
                                            <SelectTrigger><SelectValue placeholder={`Select a ${selectedFilterDef.label}...`}/></SelectTrigger>
                                            <SelectContent>
                                                {selectedFilterDef.options?.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                     <p className="text-xs text-muted-foreground text-center">
                                        {availableFilterDefs.length === 0 ? "All available filters have been applied." : "Select a property to filter by."}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    {children}
                </div>
            </div>
            {activeFilters.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    {activeFilters.map(filter => {
                        const def = filterDefinitions.find(d => d.id === filter.id);
                        return (
                            <div key={`${filter.id}-${filter.value}`} className="flex items-center gap-1.5 bg-muted text-muted-foreground rounded-full pl-3 pr-1 py-0.5 text-xs font-medium">
                                <span>{def?.label}: <span className="font-semibold text-foreground">{filter.label}</span></span>
                                <button onClick={() => removeFilter(filter)} className="rounded-full hover:bg-background p-0.5">
                                    <XIcon className="w-3 h-3"/>
                                </button>
                            </div>
                        )
                    })}
                    <Button variant="link" size="sm" onClick={clearFilters} className="text-xs">Clear all</Button>
                </div>
            )}
        </div>
    );
};

export default FilterBar;
