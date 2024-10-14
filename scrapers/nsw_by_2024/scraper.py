#!/usr/bin/python

import requests
import csv
import datetime
import json
import os
import re
import time
from dataclasses import dataclass

USE_CACHE = False
OUTPUT_FILE = f'nsw-by-{datetime.date.today().isoformat()}.csv'
BY_ELECTIONS = [
    {
        "name": "Epping",
        "api_url": "https://map.elections.nsw.gov.au/PlacemarkApi.ashx?mode=PP&ID=SB2402-028"
    },
    {
        "name": "Hornsby",
        "api_url": "https://map.elections.nsw.gov.au/PlacemarkApi.ashx?mode=PP&ID=SB2402-037"
    },
    {
        "name": "Pittwater",
        "api_url": "https://map.elections.nsw.gov.au/PlacemarkApi.ashx?mode=PP&ID=SB2402-066"
    }
]


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
    try:
        polling_places: dict[tuple[str,str],PollingPlace] = {}    
        for details in BY_ELECTIONS:
            _scrape_by_elections(polling_places, details["name"], details["api_url"])

    finally:
        _write_csv(polling_places.values())
    
    
def _scrape_by_elections(polling_places: dict[str,PollingPlace], by_election_name: str, api_url: str):
    print(by_election_name)
    print(api_url)
    response = requests.get(api_url, headers={
        "Cookie": "nlbi_926237=UYyyUYHTbQB1oVHjKjUJ5gAAAACn7S8VsY27dKbXy5nnvh5t; visid_incap_926237=Itfv06c0Q4KNUF2UZCQsvzrZaGYAAAAAQUIPAAAAAAC5r1d+os1nT4pgWS6mC63M; visid_incap_143128=eutjHLFBREWPEFrzVlmAY7cmtGYAAAAAQUIPAAAAAABSf9ywePT7F5g0nq3C3NTp; _gcl_au=1.1.1042189051.1723604307; _ga=GA1.1.900720583.1723604308; ARRAffinity=862636cafd1d92ab0ca1217f148870a09b7769c3eb4e5a763d58f073f118c717; ARRAffinitySameSite=862636cafd1d92ab0ca1217f148870a09b7769c3eb4e5a763d58f073f118c717; _ga_2JDS9B9KL5=GS1.1.1725402031.3.1.1725402032.59.0.0; _ga_QPQKP6JF1H=GS1.1.1725402031.3.1.1725402032.0.0.0; incap_ses_170_926237=ckU+F9j4qyP/gQC2Q/ZbAshYDGcAAAAAxZU6LCtnFtKwcT1qWQqX8w==; incap_ses_1839_926237=uWQ2KUY41gea+15T4nCFGTUMDWcAAAAAw48sAfJ6xnfYStv8qiIm+g==; ASP.NET_SessionId=nxwi023xb0jmae0inx4nnigk; incap_ses_1802_143128=gD4tUJKRQGTjlz0Xl/0BGUsMDWcAAAAAo7J8o1I04lFCwS2O+UAelA==",
    })
    data = response.json()
    
    for record in data:
        print(record)
        pp_name = record['Name']
        pp_address = record['Address']
        pp_key = (pp_name, pp_address)
        
        if pp_key in polling_places:
            pp = polling_places[pp_key]
            pp.districts.append(by_election_name)
            #print(f'    existing polling place {pp_name}: districts = {pp.districts}')
            
        else:
            wheelchair_access = _get_wheelchair_access(record)

            pp = PollingPlace(
                name = pp_name,
                districts = [by_election_name],
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
