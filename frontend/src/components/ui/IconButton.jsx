import React from 'react'

/**
 * Icon Button Component with Brand Colors
 * Perfect for navigation, actions, and icon-only buttons
 */

const IconButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  rounded = 'xl',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props 
}) => {
  
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:scale-110',
    secondary: 'bg-white text-red-600 border-2 border-red-500 hover:bg-red-50 hover:border-red-600',
    ghost: 'bg-transparent text-gray-600 hover:text-red-600 hover:bg-red-50',
    outline: 'bg-transparent text-red-600 border-2 border-red-500 hover:bg-red-50',
  }
  
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-14 h-14 text-xl',
  }
  
  const roundedStyles = {
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
    'xl': 'rounded-xl',
    '2xl': 'rounded-2xl',
    'full': 'rounded-full',
  }
  
  const buttonClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${roundedStyles[rounded]} ${className}`
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default IconButton
