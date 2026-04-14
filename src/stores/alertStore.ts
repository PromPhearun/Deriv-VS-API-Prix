import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AlertType = 'price' | 'technical' | 'trade' | 'economic';

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
}

export interface TechnicalAlert {
  id: string;
  symbol: string;
  indicator: 'rsi' | 'macd';
  condition: string; // e.g., 'overbought', 'oversold', 'crossover_up', 'crossover_down'
  value?: number;
  isActive: boolean;
}

export interface AlertSettings {
  browserNotifications: boolean;
  soundAlerts: boolean;
  tradeStatus: boolean;
  economicCalendar: boolean;
}

interface AlertStore {
  settings: AlertSettings;
  priceAlerts: PriceAlert[];
  technicalAlerts: TechnicalAlert[];
  updateSettings: (settings: Partial<AlertSettings>) => void;
  addPriceAlert: (alert: Omit<PriceAlert, 'id'>) => void;
  removePriceAlert: (id: string) => void;
  togglePriceAlert: (id: string) => void;
  addTechnicalAlert: (alert: Omit<TechnicalAlert, 'id'>) => void;
  removeTechnicalAlert: (id: string) => void;
  toggleTechnicalAlert: (id: string) => void;
}

export const useAlertStore = create<AlertStore>()(
  persist(
    (set) => ({
      settings: {
        browserNotifications: false,
        soundAlerts: false,
        tradeStatus: true,
        economicCalendar: true,
      },
      priceAlerts: [],
      technicalAlerts: [],
      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      addPriceAlert: (alert) =>
        set((state) => ({
          priceAlerts: [
            ...state.priceAlerts,
            { ...alert, id: Math.random().toString(36).substring(2, 9) },
          ],
        })),
      removePriceAlert: (id) =>
        set((state) => ({
          priceAlerts: state.priceAlerts.filter((a) => a.id !== id),
        })),
      togglePriceAlert: (id) =>
        set((state) => ({
          priceAlerts: state.priceAlerts.map((a) =>
            a.id === id ? { ...a, isActive: !a.isActive } : a
          ),
        })),
      addTechnicalAlert: (alert) =>
        set((state) => ({
          technicalAlerts: [
            ...state.technicalAlerts,
            { ...alert, id: Math.random().toString(36).substring(2, 9) },
          ],
        })),
      removeTechnicalAlert: (id) =>
        set((state) => ({
          technicalAlerts: state.technicalAlerts.filter((a) => a.id !== id),
        })),
      toggleTechnicalAlert: (id) =>
        set((state) => ({
          technicalAlerts: state.technicalAlerts.map((a) =>
            a.id === id ? { ...a, isActive: !a.isActive } : a
          ),
        })),
    }),
    {
      name: 'promo-alert-storage',
    }
  )
);
