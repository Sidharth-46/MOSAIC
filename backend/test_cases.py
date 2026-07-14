import asyncio
from services.fir_service import FIRService

async def main():
    service = FIRService()
    cases = service.get_filtered_cases()
    print(len(cases))

asyncio.run(main())
