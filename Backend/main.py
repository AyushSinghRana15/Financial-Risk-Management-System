from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from credit_risk_api import router as credit_router
from market_risk_api import router as market_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# register routers
app.include_router(credit_router)
app.include_router(market_router)