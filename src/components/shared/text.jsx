import React, { useState } from 'react'
import clsx from 'clsx'


import { Textarea } from '../ui/textarea'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
export const TextOption = ({
  data,
  label,
  placeholder,
  name,
  rows,
  onValueChange,
  compact = false,
}) => {
  const [value, setValue] = useState(data?.[name] ?? '')

  return (
    <div
      className={clsx('flex text-sm', {
        'flex-col gap-2': !compact,
        'items-center gap-2': compact,
      })}
    >
      <Label className="whitespace-nowrap">{label}</Label>

      {rows && rows > 1 ? (
        <Textarea
          value={value}
          placeholder={placeholder}
          rows={rows}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => onValueChange && onValueChange(name, value)}
          className="bg-transparent w-full nodrag nowheel"
        />
      ) : (
        <Input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onBlur={(e) =>
            onValueChange && onValueChange(name, e.target.value)
          }
          className="bg-transparent w-full nodrag nowheel"
        />
      )}
    </div>
  )
}
