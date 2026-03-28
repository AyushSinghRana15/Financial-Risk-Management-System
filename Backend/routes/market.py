from fastapi import APIRouter
import yfinance as yf

router = APIRouter()

TICKERS = {
    "NIFTY 50": "^NSEI",
    "SENSEX": "^BSESN",
    "BANK NIFTY": "^NSEBANK",
    "S&P 500": "^GSPC",
    "NASDAQ": "^IXIC",
    "BTC": "BTC-USD",
    "ETH": "ETH-USD",
    "Gold": "GC=F"
}

@router.get("/market-data")
def get_market_data():
    result = {}

    try:
        for name, symbol in TICKERS.items():
            data = yf.Ticker(symbol).history(period="2d")

            if len(data) < 1:
                continue

            latest = data.iloc[-1]
            prev = data.iloc[-2] if len(data) > 1 else latest

            price = round(latest["Close"], 2)
            change = round(((latest["Close"] - prev["Close"]) / prev["Close"]) * 100, 2)

            result[name] = {
                "price": price,
                "change": change
            }

        return result

    except Exception as e:
        return {"error": str(e)}