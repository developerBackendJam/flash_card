import React from 'react';

/**
 * Reusable Button component with variant and loading state support
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline'
  onClick,
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles =
    'h-10 px-4 rounded-lg font-semibold text-sm transition duration-150 ease-in-out focus:outline-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-[#6d1844] hover:bg-[#571135] active:bg-[#480d2b] text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-[#6d1844]',
    secondary:
      'bg-stone-100 hover:bg-stone-200 text-stone-700 focus:ring-2 focus:ring-stone-400',
    outline:
      'border-2 border-stone-200 hover:bg-stone-50 text-stone-700 focus:ring-2 focus:ring-stone-300',
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${selectedVariant} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
}
