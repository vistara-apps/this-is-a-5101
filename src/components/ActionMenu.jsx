const ActionMenu = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  ...props 
}) => {
  const baseClasses = 'flex items-center px-4 py-3 rounded-md font-medium transition-all duration-200 cursor-pointer'
  
  const variants = {
    primary: 'bg-white hover:bg-gray-50 text-gray-800 shadow-sm hover:shadow-md border border-gray-200',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
  }

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export default ActionMenu