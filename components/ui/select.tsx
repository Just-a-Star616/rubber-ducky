
// This is a custom, simplified implementation of a Select component
// that mimics the API of shadcn/ui but does not use Radix UI.
// It's designed for environments where installing Radix is not possible.

import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDownIcon } from '../icons/Icon';

// Context to manage select state
interface SelectContextProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string | number | null;
  setSelectedValue: (value: string | number | null) => void;
  selectedLabel: React.ReactNode;
  setSelectedLabel: (label: React.ReactNode) => void;
}

const SelectContext = createContext<SelectContextProps | null>(null);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('useSelectContext must be used within a Select provider');
  }
  return context;
};

// FIX: Add value and onValueChange props to make the Select component controlled.
interface SelectProps {
  children: React.ReactNode;
  value?: any;
  onValueChange?: (value: any) => void;
}

// Main Select component (Context Provider)
const Select = ({ children, value, onValueChange }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<React.ReactNode>(null);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find and set the label for the current value
    let initialLabel: React.ReactNode = null;
    React.Children.forEach(children, child => {
      // FIX: Cast child.props to any to access properties, resolving "does not exist on type 'unknown'" error.
      if (React.isValidElement(child) && child.type === SelectContent) {
        React.Children.forEach((child.props as any).children, item => {
          // FIX: Cast item.props to any to access properties, resolving "does not exist on type 'unknown'" error.
          if (React.isValidElement(item) && item.type === SelectItem && (item.props as any).value === value) {
            // FIX: Cast item.props to any to access properties, resolving "does not exist on type 'unknown'" error.
            initialLabel = (item.props as any).children;
          }
        });
      }
    });
    if (initialLabel) {
      setSelectedLabel(initialLabel);
    } else {
      setSelectedLabel(null);
    }
  }, [value, children]);

  const handleValueChange = (val: string | number | null) => {
    if (onValueChange) {
      onValueChange(val);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <SelectContext.Provider value={{ isOpen, setIsOpen, selectedValue: value ?? null, setSelectedValue: handleValueChange, selectedLabel, setSelectedLabel }}>
      <div ref={selectRef} className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

// The button that opens the dropdown
const SelectTrigger = React.forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(({ className, children, ...props }, ref) => {
  const { isOpen, setIsOpen } = useSelectContext();
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      {...props}
    >
      {children}
      <ChevronDownIcon className="h-4 w-4 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

// Displays the selected value or a placeholder
const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { selectedLabel } = useSelectContext();
  return <>{selectedLabel || placeholder}</>;
};
SelectValue.displayName = 'SelectValue';


// The dropdown content container
const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
  const { isOpen } = useSelectContext();
  if (!isOpen) return null;
  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 w-full mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80',
        className
      )}
      {...props}
    >
      <div className="p-1" role="listbox">{children}</div>
    </div>
  );
});
SelectContent.displayName = 'SelectContent';


// An item within the dropdown
const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(({ className, children, value, ...props }, ref) => {
  const { setIsOpen, setSelectedValue, setSelectedLabel, selectedValue } = useSelectContext();

  const handleSelect = () => {
    setSelectedValue(value);
    setSelectedLabel(children);
    setIsOpen(false);
  };

  const isSelected = selectedValue === value;

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        // FIX: The `cn` utility in this project does not support object syntax for conditional classes. Changed to use logical AND.
        isSelected && 'bg-accent',
        className
      )}
      onClick={handleSelect}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') handleSelect() }}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
