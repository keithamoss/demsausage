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


def scrape():
    driver = webdriver.Firefox()
    driver.get(INDEX_PAGE)
            
    district_links = [
        (elem.get_attribute('textContent'), elem.get_attribute('href'))
        for elem in driver.find_elements(By.CSS_SELECTOR, '#az-district li a')
    ]
    
    try:
        polling_places: dict[tuple[str,str],PollingPlace] = {}    
        for district_name, href in district_links:
            _scrape_district(driver, polling_places, district_name, href)
            time.sleep(3)

    finally:
        _write_csv(polling_places.values())
    
    
def _scrape_district(driver, polling_places: dict[str,PollingPlace], district_name: str, href: str):
    print(f'district {district_name}: {href}')
    driver.get(href)
    
    match = re.search(f'eventcode = "(SG[0-9]+-[0-9]+)"', driver.page_source)
    if match is None:
        #with open('last_page', 'w') as f:
        #    f.write(driver.page_source)
        raise Exception(f'Could not find event code for {district_name} ({href})')
        
    event_code = match.group(1)
    
    print(f'    event code = "{event_code}"')
    
    # Getting raw JSON out of Selenium requires a bit of hoop-jumping.
    driver.get(f'view-source:http://map.elections.nsw.gov.au/PlacemarkApi.ashx?mode=PP&ID={event_code}')
    data = json.loads(driver.find_element(By.TAG_NAME, 'pre').get_attribute('textContent'))
    
    for record in data:        
        pp_name = record['Name']
        pp_address = record['Address']
        pp_key = (pp_name, pp_address)
        
        if pp_key in polling_places:
            pp = polling_places[pp_key]
            pp.districts.append(district_name)
            #print(f'    existing polling place {pp_name}: districts = {pp.districts}')
            
        else:
            pp = PollingPlace(
                name = pp_name,
                districts = [district_name],
                premises = record['Premises'],
                address = f"{record['Address']}, {record['Locality']} {record['Postcode']}",
                lat = record['Lat'],
                lon = record['Lon'],
                wheelchair_access = _get_wheelchair_access(record)
            )            
            polling_places[pp_key] = pp            
            #print(f'    new polling place = {pp}')
        
        
def _get_wheelchair_access(record: dict):
    if record['Access'] is True:
        return 'Wheelchair accessible'
    if record['AssistedAccess'] is True:
        return 'Wheelchair accessible with assistance: ' + '; '.join(record['FeatureValues'])
    return ''
    
    
def _write_csv(polling_places: list[PollingPlace]):
    with open(OUTPUT_FILE, 'w') as f:
        writer = csv.writer(f)
        writer.writerow(['ec_id', 'name', 'divisions', 'premises', 'address', 
                         'lat', 'lon', 'state', 'wheelchair_access'])
        
        for pp in polling_places:
            writer.writerow(['', pp.name, ', '.join(pp.districts), pp.premises, pp.address, 
                             pp.lat, pp.lon, 'NSW', pp.wheelchair_access])


if __name__ == '__main__':
    scrape()
