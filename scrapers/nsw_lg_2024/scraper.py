#!/usr/bin/python

import csv
import datetime
import json
import os
import re
import time
from dataclasses import dataclass

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.firefox.service import Service
from webdriver_manager.firefox import GeckoDriverManager

USE_CACHE = False
OUTPUT_FILE = f'nsw-{datetime.date.today().isoformat()}.csv'
INDEX_PAGE = 'https://elections.nsw.gov.au/elections/find-my-electorate'


@dataclass
class PollingPlace:
    name: str
    districts: list[str]
    premises: str
    address: str
    lat: float
    lon: float
    wheelchair_access: str
    wheelchair_access_description: str


def scrape():
    # USE FOR LINUX
    # driver = webdriver.Firefox()

    # USE FOR MACOS
    firefox_options = FirefoxOptions()
    firefox_options.add_argument("--headless")
    firefox_options.add_argument("--kiosk")  # Ensures the window size we set is the actual output size of the screenshot
    firefox_options.binary_location = '/Applications/Firefox.app/Contents/MacOS/firefox'
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=firefox_options)

    driver.get(INDEX_PAGE)
            
    district_links = [
        (elem.get_attribute('textContent'), elem.get_attribute('href'))
        for elem in driver.find_elements(By.CSS_SELECTOR, '#elec-councils-panel li a')
    ]

    if USE_CACHE is True:
        print("Using cached results\n")
    else:
        print("Not using cached results\n")
    
    try:
        polling_places: dict[tuple[str,str],PollingPlace] = {}    
        for district_name, href in district_links:
            _scrape_district(driver, polling_places, district_name, href)
            
            if USE_CACHE is False:
                time.sleep(3)

    finally:
        _write_csv(polling_places.values())
    
    
def _scrape_district(driver, polling_places: dict[str,PollingPlace], district_name: str, href: str):
    print(f'district {district_name}: {href}')

    if USE_CACHE is True:
        with open(f"./cache/{district_name}.json", "r") as f:
            data = json.load(f)
    else:
        driver.get(href)
        
        match = re.search(f'"(LG[0-9]+-[0-9]+)"', driver.page_source)
        if match is None:
            #with open('last_page', 'w') as f:
            #    f.write(driver.page_source)
            raise Exception(f'Could not find event code for {district_name} ({href})')
            
        event_code = match.group(1)
        
        print(f'    event code = "{event_code}"')
        
        # Getting raw JSON out of Selenium requires a bit of hoop-jumping.
        driver.get(f'view-source:http://map.elections.nsw.gov.au/PlacemarkApi.ashx?mode=PP&ID={event_code}')
        data = json.loads(driver.find_element(By.TAG_NAME, 'pre').get_attribute('textContent'))

        with open(f"./cache/{district_name}.json", "w") as f:
            json.dump(data, f)
    
    for record in data:        
        pp_name = record['Name']
        pp_address = record['Address']
        pp_key = (pp_name, pp_address)
        
        if pp_key in polling_places:
            pp = polling_places[pp_key]
            pp.districts.append(district_name)
            #print(f'    existing polling place {pp_name}: districts = {pp.districts}')
            
        else:
            wheelchair_access = _get_wheelchair_access(record)

            pp = PollingPlace(
                name = pp_name,
                districts = [district_name],
                premises = record['Premises'],
                address = f"{record['Address']}, {record['Locality']} {record['Postcode']}",
                lat = record['Lat'],
                lon = record['Lon'],
                wheelchair_access = wheelchair_access["summary"],
                wheelchair_access_description = wheelchair_access["description"]
            )            
            polling_places[pp_key] = pp            
            #print(f'    new polling place = {pp}')
        
        
def _get_wheelchair_access(record: dict):
    if record['Access'] is True:
        return {
            "summary": "Full",
            "description": ""
        }
    elif record['AssistedAccess'] is True:
        return {
            "summary": "Assisted",
            "description": '; '.join(record['FeatureValues'])
        }
    elif record['Access'] is False and record['AssistedAccess'] is False:
        return {
            "summary": "None",
            "description": ""
        }
    
    raise Exception(f"Unhandled wheelchair access mode: {record}")
    
    
def _write_csv(polling_places: list[PollingPlace]):
    with open(OUTPUT_FILE, 'w') as f:
        writer = csv.writer(f)
        writer.writerow(['ec_id', 'name', 'divisions', 'premises', 'address', 
                         'lat', 'lon', 'state', 'wheelchair_access', 'wheelchair_access_description'])
        
        for pp in polling_places:
            writer.writerow(['', pp.name, ', '.join(list(set(pp.districts))), pp.premises, pp.address, 
                             pp.lat, pp.lon, 'NSW', pp.wheelchair_access, pp.wheelchair_access_description])


if __name__ == '__main__':
    scrape()
