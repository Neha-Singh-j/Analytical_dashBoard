import os
import requests
import time

# Preset exchange rate matrix
FALLBACK_RATES = {
    "USD": 1.0,
    "EUR": 0.92,
    "INR": 83.50,
    "GBP": 0.79
}

_currency_cache = {
    "timestamp": time.time(), # Initialize to current time so first request uses instant rates
    "rates": dict(FALLBACK_RATES)
}

DEFAULT_API_URL = os.getenv("CURRENCY_API_URL", "https://open.er-api.com/v6/latest/USD")

def get_exchange_rates():
    global _currency_cache
    now = time.time()

    # Refresh cache asynchronously or with very short timeout if 1 hour has passed
    if now - _currency_cache["timestamp"] > 3600:
        try:
            # 1 second fast timeout to prevent blocking API requests
            response = requests.get(DEFAULT_API_URL, timeout=1.0)
            if response.status_code == 200:
                data = response.json()
                rates = data.get("rates", {})
                if rates:
                    _currency_cache["rates"] = {
                        "USD": 1.0,
                        "EUR": float(rates.get("EUR", 0.92)),
                        "INR": float(rates.get("INR", 83.50)),
                        "GBP": float(rates.get("GBP", 0.79))
                    }
                    _currency_cache["timestamp"] = now
        except Exception:
            # Silent fallback to existing cache timestamp update
            _currency_cache["timestamp"] = now

    return _currency_cache["rates"]

def convert_currency(amount, target_currency="USD"):
    target_currency = (target_currency or "USD").upper()
    if target_currency == "USD":
        return round(amount, 2), "USD", 1.0
    rates = get_exchange_rates()
    rate = rates.get(target_currency, 1.0)
    return round(amount * rate, 2), target_currency, rate
