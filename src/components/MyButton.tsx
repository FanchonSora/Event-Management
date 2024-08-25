import React from 'react';

interface MyButtonProps {
  buttonText: string;
  onClick: () => void;
  className?: string; // Add className as an optional prop
}

const MyButton: React.FC<MyButtonProps> = ({ buttonText, onClick, className }) => {
  return (
    <button className={className} onClick={onClick}>
      {buttonText}
    </button>
  );
};

export default MyButton;
