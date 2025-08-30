import clsx from 'clsx'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function Logo({ size = 'medium', className }: LogoProps) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8', 
    large: 'h-12 w-12'
  }

  const textSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  }

  return (
    <div className={clsx('flex items-center space-x-3', className)}>
      {/* Glow effect */}
      <div className="relative">
        <div className={clsx(
          'absolute inset-0 bg-primary blur-sm opacity-20 rounded-lg',
          sizeClasses[size]
        )} />
        <div className={clsx(
          'relative bg-primary rounded-lg p-2 flex items-center justify-center',
          sizeClasses[size]
        )}>
          <svg 
            className="text-primary-foreground" 
            fill="currentColor" 
            viewBox="0 0 24 24"
            style={{ width: '60%', height: '60%' }}
          >
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            <path d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="white"/>
          </svg>
        </div>
      </div>
      <div>
        <h1 className={clsx('font-bold text-gray-900', textSizeClasses[size])}>
          SecureSign
        </h1>
        <p className="text-gray-500 text-sm">Assinatura Digital</p>
      </div>
    </div>
  )
}
