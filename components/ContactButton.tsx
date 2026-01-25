'use client';

import { useState } from 'react';
import ContactModal from './ContactModal';

interface ContactButtonProps {
  children: React.ReactNode;
  className?: string;
  productName?: string;
  onClick?: () => void;
}

export default function ContactButton({ children, className = "", productName, onClick }: ContactButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (onClick) onClick();
    setIsModalOpen(true);
  };

  return (
    <>
      <button 
        onClick={handleClick}
        className={className}
      >
        {children}
      </button>

      <ContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productName={productName}
      />
    </>
  );
}

