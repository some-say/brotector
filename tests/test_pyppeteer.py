import pytest
import asyncio
from pyppeteer import launch
from utils import __hml_path__, Detected
from selenium_driverless.utils.utils import find_chrome_executable


async def detect(page):
    await page.goto(__hml_path__)
    await asyncio.sleep(0.1)
    for _ in range(2):
        detections = await page.evaluate("""
            async ()=>{
                await brotector.init_done; 
                return brotector.detections
            }
        """)
        if len(detections) > 0:
            print("\n")
            print(detections)
            print("\n")
            raise Detected(detections)
        await asyncio.sleep(5)


@pytest.mark.asyncio
async def test_pyppeteer():
    browser = await launch(headless=False, executablePath=find_chrome_executable(),
                           ignoreDefaultArgs=True)
    page = await browser.newPage()
    with pytest.raises(Detected):
        await detect(page)
    await browser.close()


@pytest.mark.asyncio
async def test_pyppeteer_stealthy():
    browser = await launch(headless=False, executablePath=find_chrome_executable(), args=['--disable-blink-features=AutomationControlled'])
    page = await browser.newPage()
    with pytest.raises(Detected):
        await detect(page)
    await browser.close()
