import os
from pathlib import Path
from time import sleep

from demsausage.util import get_env, get_url_safe_election_name
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.firefox.service import Service
from webdriver_manager.firefox import GeckoDriverManager


def get_map_screenshot(election):
    firefox_options = FirefoxOptions()
    firefox_options.add_argument("--headless")
    # firefox_options.add_argument("--no-sandbox")
    # firefox_options.add_argument("--ignore-certificate-errors")
    firefox_options.add_argument("--kiosk")  # Ensures the window size we set is the actual output size of the screenshot
    firefox_options.binary_location = FirefoxBinary('/usr/lib/firefox-esr/firefox-esr')

    if os.path.isfile('/app/logs/webdriver/geckodriver.log') is False:
        Path('/app/logs/webdriver/').mkdir(parents=True, exist_ok=True)
        with open('/app/logs/webdriver/geckodriver.log', 'x') as f:
            pass

    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install(), log_path='/app/logs/webdriver/geckodriver.log'), options=firefox_options)

    # https://typito.com/blog/video-resolutions/
    # driver.set_window_size(2560, 1440)
    # driver.set_window_size(1920, 1080)
    driver.set_window_size(1200, 630)
    driver.get(f'{get_env("PUBLIC_SITE_URL")}/{get_url_safe_election_name(election)}?embed=1')

    # Give the map and basemap tiles time to load
    sleep(6)

    def find_element_or_none():
        try:
            return driver.find_element(by=By.CSS_SELECTOR, value='div.map-loading')
        except NoSuchElementException:
            return None

    # Try and wait for the map to finish loading
    retryCounter = 0
    while find_element_or_none() is not None and retryCounter < 10:
        retryCounter += 1
        sleep(2)

    # driver.save_screenshot('screenie.png')
    image = driver.get_full_page_screenshot_as_png()

    driver.quit()

    return image

    # For targeting particular elements
    # https://www.lambdatest.com/blog/python-selenium-screenshots/
    # driver.implicitly_wait(10)

    # General docs
    # https://www.selenium.dev/documentation/webdriver/getting_started/first_script/
    # https://sites.google.com/chromium.org/driver/getting-started
