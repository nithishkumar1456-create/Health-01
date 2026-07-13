import requests
import time

class OverpassAPIError(Exception):
    """Custom exception raised for Overpass API sync errors."""
    pass

def search_nearby_facilities(lat: float, lng: float, radius_m: int = 5000) -> list[dict]:
    """
    Search nearby clinical facilities (hospitals, clinics, doctors) using OSM Overpass API.
    Handles rate limits (429) and gateway timeouts (504) with a 5-second retry delay.
    """
    query = f"""[out:json][timeout:25];
(
  node["amenity"="hospital"](around:{radius_m},{lat},{lng});
  node["amenity"="clinic"](around:{radius_m},{lat},{lng});
  node["amenity"="doctors"](around:{radius_m},{lat},{lng});
);
out body;"""

    headers = {
        "User-Agent": "HEALTH-02-demo/1.0 (contact: mrcyb@example.com)"
    }
    
    url = "https://overpass-api.de/api/interpreter"
    
    for attempt in range(2):
        try:
            response = requests.post(
                url,
                data={"data": query},
                headers=headers,
                timeout=30
            )
            
            # Handle rate limits or gateway timeouts
            if response.status_code in [429, 504]:
                if attempt == 0:
                    time.sleep(5)
                    continue
                else:
                    raise OverpassAPIError(
                        f"Overpass API returned status {response.status_code} after retry. Details: {response.text}"
                    )
            
            if response.status_code != 200:
                raise OverpassAPIError(
                    f"Overpass API returned HTTP {response.status_code}: {response.text}"
                )
            
            try:
                data = response.json()
            except ValueError as e:
                raise OverpassAPIError(f"Malformed JSON response from Overpass API: {str(e)}")
            
            elements = data.get("elements", [])
            return elements

        except requests.RequestException as e:
            if attempt == 0:
                time.sleep(5)
                continue
            raise OverpassAPIError(f"Request to Overpass API failed after retry: {str(e)}")
            
    return []
