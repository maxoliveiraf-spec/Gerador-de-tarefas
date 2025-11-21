import { PaymentState } from '../types';

const STORAGE_KEY = 'edutask_payment_state';
const PIX_KEY = "00020126360014br.gov.bcb.pix0114+557199724722852040000530398654041.005802BR5925Maxwel De Oliveira Figuei6009Sao Paulo62290525REC6920D7EDA18B824741864063040970";

export const getPaymentState = (): PaymentState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const state: PaymentState = JSON.parse(stored);
    
    // Check if premium expired
    if (state.isPremium && state.premiumUntil && Date.now() > state.premiumUntil) {
      const newState = { ...state, isPremium: false, premiumUntil: null };
      savePaymentState(newState);
      return newState;
    }
    return state;
  }
  
  return {
    isPremium: false,
    premiumUntil: null,
    lastFreeGeneration: null
  };
};

export const savePaymentState = (state: PaymentState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const canGenerateTask = (): boolean => {
  const state = getPaymentState();
  
  if (state.isPremium) return true;

  const today = new Date().toISOString().split('T')[0];
  return state.lastFreeGeneration !== today;
};

export const recordGeneration = () => {
  const state = getPaymentState();
  if (!state.isPremium) {
    savePaymentState({
      ...state,
      lastFreeGeneration: new Date().toISOString().split('T')[0]
    });
  }
};

export const activatePremium = () => {
  const state = getPaymentState();
  savePaymentState({
    ...state,
    isPremium: true,
    premiumUntil: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days from now
  });
};

export const getPixKey = () => PIX_KEY;