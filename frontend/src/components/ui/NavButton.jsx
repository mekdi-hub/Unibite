import React from 'react'

/**
 * Navigation Button Component for Sidebars
 * Optimized for dashboard navigation with active states
 */

const NavButton = ({ 
  children, 
  icon,
  active = false,
  badge = null,
  onClick,
  className = '',
  ...props 
}) => {
  
  const baseStyles = 'group w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200'
  
  const activeStyles = active
    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200 transform hover:scale-105'
    : 'text-gray-600 hover:text-red-600 hover:bg-white hover:border-2 hover:border-red-500 border-2 border-transparent hover:translate-x-1 hover:shadow-md'
  
  const buttonClasses = `${baseStyles} ${activeStyles} ${className}`
  
  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      {...props}
    >
      {icon && (
        <span className={`${active ? 'text-white' : 'text-gray-600 group-hover:text-red-600'} transition-colors duration-200`}>
          {icon}
        </span>
      )}
      <span>{children}</span>
      {active && (
        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
      )}
      {badge && !active && (
        <div className="ml-auto">
          <span className="flex items-center justify-center min-w-[24px] h-6 bg-red-500 text-white text-xs font-bold rounded-full px-2 animate-pulse">
            {badge}
          </span>
        </div>
      )}
    </button>
  )
}

export default NavButton
