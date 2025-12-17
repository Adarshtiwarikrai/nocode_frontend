import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';



export const EditableText= ({ value, onChange, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value ?? '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);

  const handleDoubleClick = () => setIsEditing(true);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(localValue ?? '');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onChange(localValue ?? '');
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setLocalValue(value ?? '');
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          'bg-transparent border-none outline-none focus:ring-0 p-0 text-green-500 placeholder-green-400',
          className
        )}
        placeholder="Enter text"
      />
    );
  }

  return (
    <span
      onDoubleClick={handleDoubleClick}
      className={cn('cursor-pointer hover:underline text-green-500', className)}
    >
      {value || 'Double click to edit'}
    </span>
  );
};
