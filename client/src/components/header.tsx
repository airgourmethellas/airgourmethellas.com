import React from 'react';
import { cn } from '@/lib/utils';
import { Link } from "wouter";
import LogoWithWhiteBg from './logo-with-white-bg';

interface HeaderProps {
  className?: string;
  showWelcome?: boolean;
}

export default function Header({ className, showWelcome = true }: HeaderProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-6 bg-white', className)}
         style={{ backgroundColor: 'white' }}>
      <div className="flex flex-col items-center cursor-pointer mb-3"
           style={{ backgroundColor: 'white', padding: '10px' }}>
        <LogoWithWhiteBg width={300} linkToHome={true} />
      </div>
      
      {showWelcome && (
        <>
          <h1 className="mt-4 text-xl font-semibold">Welcome to Air Gourmet Hellas</h1>
          <div className="mt-2 flex flex-col items-center gap-2">
            <Link href="/menu" className="text-blue-600 hover:text-blue-800 font-medium">
              View Our Menu
            </Link>
            <a 
              href="https://www.airgourmet.gr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              Visit Our Website
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </>
      )}
    </div>
  );
}