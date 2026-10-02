import React from 'react';

/**
 * Reusable Form Input component with label and error feedback
 */
export default function Input({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="w-full text-left" data-purpose={`${id}-field`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        name={name || id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full h-10 px-3 text-xs sm:text-sm rounded-lg border bg-white text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-1 focus:ring-[#6d1844] focus:border-[#6d1844] ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
