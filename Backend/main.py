from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
<<<<<<< HEAD
#from database import engine, Base
#import models
=======
from database import engine, Base
import models
from business_risk_api import router as business_router #Adii

>>>>>>> 4d68a4c209e4ae533fa11bb053948c5d03e0ed31

from credit_risk_api import router as credit_router
from market_risk_api import router as market_router
from operational_risk_api import router as operational_router
from E_commerce_fraud_risk_api import router as fraud_router


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
<<<<<<< HEAD
app.include_router(operational_router)
app.include_router(fraud_router)
=======
app.include_router(business_router) #Adii

>>>>>>> 4d68a4c209e4ae533fa11bb053948c5d03e0ed31
@app.get("/")
def root():
    return {"status": "ok", "message": "Financial Risk API running"}
