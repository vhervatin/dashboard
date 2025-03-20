
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className,
  size = 'md',
  animated = true
}) => {
  const sizes = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36'
  };

  return (
    <div className={cn(
      sizes[size],
      animated && 'animate-float',
      className
    )}>
      <div className="relative w-full h-full">
        <div className="absolute inset-0 rounded-full bg-petshop-blue flex items-center justify-center overflow-hidden">
          <div className="text-petshop-gold flex flex-col items-center justify-center text-center px-2">
            <span className="font-bold text-xs sm:text-sm tracking-wider">PETSHOP</span>
            <div className="flex justify-center items-center my-1">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 fill-current" viewBox="0 0 100 70">
                <path d="M75,10 C85,15 90,30 85,45 C80,60 70,65 65,65 C60,65 55,60 55,50 C55,40 65,30 75,10 Z" />
                <path d="M45,30 C50,35 50,45 45,50 C40,55 35,55 30,50 C25,45 25,35 30,30 C35,25 40,25 45,30 Z" />
                <path d="M25,35 C30,40 30,50 25,55 C20,60 15,60 10,55 C5,50 5,40 10,35 C15,30 20,30 25,35 Z" />
                <path d="M60,35 L65,45 L55,45 Z" />
              </svg>
            </div>
            <span className="font-bold text-xs sm:text-sm tracking-wider">PET</span>
            <span className="font-bold text-xs sm:text-sm tracking-wider">PARADISE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logo;
