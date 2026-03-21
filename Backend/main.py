from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
#from database import engine, Base
#import models

from credit_risk_api import router as credit_router
from market_risk_api import router as market_router
from operational_risk_api import router as operational_router

# Neon mein tables automatically ban jaayengi
#Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(credit_router)
app.include_router(market_router)
app.include_router(operational_router)
@app.get("/")
def root():
    return {"status": "ok", "message": "Financial Risk API running"}
