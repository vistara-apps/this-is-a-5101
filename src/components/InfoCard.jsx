const InfoCard = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = 'card transition-all duration-200'
  
  const variants = {
    default: 'hover:shadow-lg',
    highlighted: 'border-2 border-accent/20 hover:shadow-xl'
  }

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}

export default InfoCard