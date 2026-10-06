import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AnalyticsContext = createContext();

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  INR: '₹',
  GBP: '£',
};

export const AnalyticsProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'all',
    deliveryStatus: 'all',
    currency: 'USD',
  });

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drillDownModal, setDrillDownModal] = useState({ isOpen: false, type: null, data: null });

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSummary({
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        delivery_status: filters.deliveryStatus !== 'all' ? filters.deliveryStatus : undefined,
        currency: filters.currency,
      });
      if (res.success) {
        setSummary(res.data);
      } else {
        setError(res.message || 'Failed to fetch summary data');
      }
    } catch (err) {
      console.error('Fetch summary error:', err);
      setError(err?.response?.data?.detail || err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: 'all',
      deliveryStatus: 'all',
      currency: 'USD',
    });
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '-';
    const symbol = CURRENCY_SYMBOLS[filters.currency] || '$';
    const formatted = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
  };

  const openDrillDown = (type, data) => {
    setDrillDownModal({ isOpen: true, type, data });
  };

  const closeDrillDown = () => {
    setDrillDownModal({ isOpen: false, type: null, data: null });
  };

  return (
    <AnalyticsContext.Provider
      value={{
        filters,
        updateFilters,
        resetFilters,
        summary,
        loading,
        error,
        refreshSummary: fetchSummary,
        formatCurrency,
        drillDownModal,
        openDrillDown,
        closeDrillDown,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
