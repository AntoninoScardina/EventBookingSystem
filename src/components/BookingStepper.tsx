import React from 'react';
import { Home, Film, Users, Clapperboard } from 'lucide-react';

interface BookingStepperProps {
  currentStep: number;
}

const StepperIcon: React.FC<{
  Icon: React.ElementType;
  step: number;
  currentStep: number;
}> = ({ Icon, step, currentStep }) => {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  let baseClasses = "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 font-medium shadow-sm border-2";
  if (isActive) {
    baseClasses += " bg-[#ebdaa8] text-gray-900 border-[#b08d57] scale-110";
  } else if (isCompleted) {
    baseClasses += " bg-green-600 text-white border-green-700";
  } else {
    baseClasses += " bg-white text-gray-400 border-gray-300";
  }

  return (
    <div className={baseClasses}>
      <Icon size={20} />
    </div>
  );
};

const StepperLine: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <div className={`h-1 flex-1 transition-all duration-500 rounded-full ${active ? 'bg-green-600' : 'bg-gray-300'}`}></div>
  );
};


const BookingStepper: React.FC<BookingStepperProps> = ({ currentStep }) => {
  return (
    <div className="mb-10 mt-4 sm:mt-2">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8 tracking-tight">Prenotazione</h2>
      <div className="flex items-center justify-center space-x-1 md:space-x-2 max-w-xl mx-auto">
        <StepperIcon Icon={Home} step={1} currentStep={currentStep} />
        <StepperLine active={currentStep > 1} />
        <StepperIcon Icon={Film} step={2} currentStep={currentStep} />
        <StepperLine active={currentStep > 2} />
        <StepperIcon Icon={Users} step={3} currentStep={currentStep} />
        <StepperLine active={currentStep > 3} />
        <StepperIcon Icon={Clapperboard} step={4} currentStep={currentStep} />
      </div>
    </div>
  );
};

export default BookingStepper;