import { useState, useCallback } from "react";

export interface CalculatorState {
  amount: number;
  years: number;
  compoundInterest: boolean;
}

export interface CalculatorResults {
  initialAmount: number;
  finalAmount: number;
  interestGenerated: number;
}

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>({
    amount: 50000,
    years: 3,
    compoundInterest: false
  });

  const updateAmount = useCallback((amount: number) => {
    setState(prev => ({ ...prev, amount }));
  }, []);

  const updateYears = useCallback((years: number) => {
    setState(prev => ({ ...prev, years }));
  }, []);

  const updateCompoundInterest = useCallback((compoundInterest: boolean) => {
    setState(prev => ({ ...prev, compoundInterest }));
  }, []);

  const calculateResults = useCallback((): CalculatorResults => {
    const { amount, years, compoundInterest } = state;
    
    let finalAmount: number;
    if (compoundInterest) {
      finalAmount = amount * Math.pow(1.09, years);
    } else {
      finalAmount = amount + (amount * 0.09 * years);
    }
    
    const interestGenerated = finalAmount - amount;
    
    return {
      initialAmount: amount,
      finalAmount: Math.round(finalAmount),
      interestGenerated: Math.round(interestGenerated)
    };
  }, [state]);

  return {
    state,
    updateAmount,
    updateYears,
    updateCompoundInterest,
    calculateResults
  };
}
