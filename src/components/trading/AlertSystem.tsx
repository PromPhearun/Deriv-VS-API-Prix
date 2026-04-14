import React, { useState, useEffect, useRef } from 'react';
import { useAlertStore } from '../../stores/alertStore';
import { useTradingStore } from '../../stores/tradingStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Bell, BellRing, Volume2, Trash2, Plus, LineChart, Calendar } from 'lucide-react';
import { requestNotificationPermission, triggerNotification } from '../../utils/notificationUtils';
import toast from 'react-hot-toast';

// Simple indicator evaluation logic hook
function useAlertEvaluator() {
  const { currentTick, currentSymbol } = useTradingStore();
  const { priceAlerts, removePriceAlert } = useAlertStore();
  const lastEvaluatedTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!currentTick || !currentSymbol) return;
    if (lastEvaluatedTickRef.current === currentTick.epoch) return; // Prevent duplicate evaluations

    lastEvaluatedTickRef.current = currentTick.epoch;

    priceAlerts.forEach(alert => {
      if (!alert.isActive || alert.symbol !== currentSymbol) return;

      let triggered = false;
      if (alert.condition === 'above' && currentTick.quote > alert.targetPrice) {
        triggered = true;
      } else if (alert.condition === 'below' && currentTick.quote < alert.targetPrice) {
        triggered = true;
      }

      if (triggered) {
        const message = `${alert.symbol} hit target! Crossed ${alert.condition} ${alert.targetPrice}.`;
        
        // Browser/Native Notification
        triggerNotification(`Price Alert: ${alert.symbol}`, {
          body: `${message} Current price: ${currentTick.quote}`
        });
        
        // In-app Toast Notification
        toast.success(message, {
          duration: 6000,
          position: 'top-center',
        });
        
        // Remove one-time alerts
        removePriceAlert(alert.id);
      }
    });

  }, [currentTick, currentSymbol, priceAlerts, removePriceAlert]);
}

export default function AlertSystem() {
  const { currentSymbol } = useTradingStore();
  const {
    settings,
    priceAlerts,
    technicalAlerts,
    updateSettings,
    addPriceAlert,
    removePriceAlert,
    togglePriceAlert,
    addTechnicalAlert,
    removeTechnicalAlert,
    toggleTechnicalAlert
  } = useAlertStore();

  useAlertEvaluator();

  const [activeTab, setActiveTab] = useState<'price' | 'technical' | 'settings'>('price');
  
  // Price alert form state
  const [targetPrice, setTargetPrice] = useState('');
  const [priceCondition, setPriceCondition] = useState<'above' | 'below'>('above');

  // Technical alert form state
  const [indicator, setIndicator] = useState<'rsi' | 'macd'>('rsi');
  const [techCondition, setTechCondition] = useState('overbought');

  const handleBrowserNotificationToggle = async () => {
    if (!settings.browserNotifications) {
      const granted = await requestNotificationPermission();
      if (granted) {
        updateSettings({ browserNotifications: true });
        triggerNotification('Notifications Enabled', { body: 'You will now receive alerts via browser notifications.' });
      } else {
        alert('Notification permission denied by browser.');
      }
    } else {
      updateSettings({ browserNotifications: false });
    }
  };

  const handleAddPriceAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice || isNaN(Number(targetPrice)) || !currentSymbol) return;
    
    addPriceAlert({
      symbol: currentSymbol,
      targetPrice: Number(targetPrice),
      condition: priceCondition,
      isActive: true,
    });
    setTargetPrice('');
  };

  const handleAddTechnicalAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSymbol) return;

    addTechnicalAlert({
      symbol: currentSymbol,
      indicator,
      condition: techCondition,
      isActive: true,
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Alerts & Notifications
        </CardTitle>
        <div className="flex gap-2">
           <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('price')}
            className={activeTab === 'price' ? 'bg-secondary' : ''}
          >
            Price
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('technical')}
            className={activeTab === 'technical' ? 'bg-secondary' : ''}
          >
            Technical
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('settings')}
            className={activeTab === 'settings' ? 'bg-secondary' : ''}
          >
            Settings
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {activeTab === 'price' && (
          <div className="space-y-4">
            <form onSubmit={handleAddPriceAlert} className="flex gap-2 items-center">
              <span className="text-sm font-medium w-20 truncate" title={currentSymbol || ''}>{currentSymbol || 'No Asset'}</span>
              <Select
                value={priceCondition}
                onChange={(e) => setPriceCondition(e.target.value as 'above' | 'below')}
                options={[
                  { value: 'above', label: 'Goes Above' },
                  { value: 'below', label: 'Goes Below' },
                ]}
                className="w-[130px] h-9"
              />
              <Input
                type="number"
                step="any"
                placeholder="Target Price"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="h-9 flex-1"
                required
              />
              <Button type="submit" size="sm" className="h-9 gap-1" disabled={!currentSymbol}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </form>
            
            <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto">
              {priceAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active price alerts.</p>
              ) : (
                priceAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={alert.isActive} 
                        onChange={() => togglePriceAlert(alert.id)}
                        className="cursor-pointer"
                      />
                      <span className="text-sm">
                        <span className="font-semibold">{alert.symbol}</span> {alert.condition} {alert.targetPrice}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removePriceAlert(alert.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
           <div className="space-y-4">
             <form onSubmit={handleAddTechnicalAlert} className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={indicator}
                  onChange={(e) => {
                    const val = e.target.value as 'rsi' | 'macd';
                    setIndicator(val);
                    setTechCondition(val === 'rsi' ? 'overbought' : 'crossover_up');
                  }}
                  options={[
                    { value: 'rsi', label: 'RSI' },
                    { value: 'macd', label: 'MACD' },
                  ]}
                  className="w-full sm:w-[130px] h-9"
                />

                <Select
                  value={techCondition}
                  onChange={(e) => setTechCondition(e.target.value)}
                  options={
                    indicator === 'rsi' 
                    ? [
                        { value: 'overbought', label: 'Overbought (> 70)' },
                        { value: 'oversold', label: 'Oversold (< 30)' }
                      ]
                    : [
                        { value: 'crossover_up', label: 'Bullish Crossover' },
                        { value: 'crossover_down', label: 'Bearish Crossover' }
                      ]
                  }
                  className="flex-1 h-9"
                />

                <Button type="submit" size="sm" className="h-9 gap-1 whitespace-nowrap" disabled={!currentSymbol}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
             </form>
             
             <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto">
              {technicalAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active technical alerts.</p>
              ) : (
                technicalAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={alert.isActive} 
                        onChange={() => toggleTechnicalAlert(alert.id)}
                        className="cursor-pointer"
                      />
                      <span className="text-sm">
                        <span className="font-semibold uppercase">{alert.indicator}</span> on {alert.symbol} ({alert.condition.replace('_', ' ')})
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeTechnicalAlert(alert.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
           </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <BellRing className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Browser Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive native OS alerts</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                className="cursor-pointer h-4 w-4" 
                checked={settings.browserNotifications}
                onChange={handleBrowserNotificationToggle}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Sound Alerts</p>
                  <p className="text-xs text-muted-foreground">Play sound on alert</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                className="cursor-pointer h-4 w-4" 
                checked={settings.soundAlerts}
                onChange={(e) => updateSettings({ soundAlerts: e.target.checked })}
              />
            </div>

             <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <LineChart className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Trade Status</p>
                  <p className="text-xs text-muted-foreground">Opened, closed, P/L updates</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                className="cursor-pointer h-4 w-4" 
                checked={settings.tradeStatus}
                onChange={(e) => updateSettings({ tradeStatus: e.target.checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Economic Calendar</p>
                  <p className="text-xs text-muted-foreground">High impact events</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                className="cursor-pointer h-4 w-4" 
                checked={settings.economicCalendar}
                onChange={(e) => updateSettings({ economicCalendar: e.target.checked })}
              />
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}