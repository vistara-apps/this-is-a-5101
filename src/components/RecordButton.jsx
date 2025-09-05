const RecordButton = ({ 
  children, 
  variant = 'inactive', 
  onClick, 
  className = '',
  ...props 
}) => {
  const baseClasses = 'flex items-center justify-center px-6 py-4 rounded-full font-medium transition-all duration-200 cursor-pointer'
  
  const variants = {
    active: 'bg-red-600 hover:bg-red-700 text-white shadow-lg animate-pulse',
    inactive: 'bg-primary hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
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

export default RecordButton