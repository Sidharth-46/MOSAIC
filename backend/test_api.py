import asyncio
from routers.dashboard import get_dashboard

async def main():
    try:
        res = await get_dashboard()
        print(res)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
