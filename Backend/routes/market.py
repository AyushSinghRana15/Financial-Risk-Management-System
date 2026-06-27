from fastapi import APIRouter
import yfinance as yf  # Yahoo Finance API — free stock/index/crypto price data

router = APIRouter()

# Ticker symbols for major market indices and assets
# ^ prefix = index, -USD = crypto, =F = futures
TICKERS = {
    "NIFTY 50": "^NSEI",  # India's National Stock Exchange top 50 stocks
    "SENSEX": "^BSESN",  # India's BSE 30-stock index
    "BANK NIFTY": "^NSEBANK",  # Indian banking sector index
    "S&P 500": "^GSPC",  # US large-cap stock index
    "NASDAQ": "^IXIC",  # US tech-heavy index
    "BTC": "BTC-USD",  # Bitcoin price in USD
    "ETH": "ETH-USD",  # Ethereum price in USD
    "Gold": "GC=F"  # Gold futures
}

@router.get("/market-data")
def get_market_data():
    """Returns current price and daily % change for major market indices"""
    result = {}

    try:
        for name, symbol in TICKERS.items():
            # Fetch 2 days of price history so we can calculate daily change
            data = yf.Ticker(symbol).history(period="2d")

            if len(data) < 1:
                continue

            latest = data.iloc[-1]  # Most recent day's data
            prev = data.iloc[-2] if len(data) > 1 else latest  # Previous day

            price = round(latest["Close"], 2)
            # Daily percentage change: (today - yesterday) / yesterday * 100
            change = round(((latest["Close"] - prev["Close"]) / prev["Close"]) * 100, 2)

            result[name] = {
                "price": price,
                "change": change
            }

        return result

    except Exception as e:
        return {"error": str(e)}