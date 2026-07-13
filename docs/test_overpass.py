"""
test_overpass.py — quick manual test of the OpenStreetMap data source
before wiring it into the Django backend.

Run:
    pip install requests
    python test_overpass.py

Asks for a place name (geocoded via Nominatim) and what you're
searching for (hospital / clinic / doctors / all), then prints the
raw matches from Overpass so you can eyeball data quality before
building anything on top of it.
"""

import sys
import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Overpass's public instance expects a real User-Agent identifying the
# app/contact — required by their usage policy, not optional.
HEADERS = {"User-Agent": "HEALTH-02-demo-test-script/1.0 (contact: replace-with-your-email@example.com)"}

FACILITY_TAGS = {
    "hospital": ["hospital"],
    "clinic": ["clinic"],
    "doctors": ["doctors"],
    "all": ["hospital", "clinic", "doctors"],
}


def geocode_place(place_name: str):
    """Turn a place name into (lat, lon) using Nominatim."""
    params = {"q": place_name, "format": "json", "limit": 1}
    try:
        resp = requests.get(NOMINATIM_URL, params=params, headers=HEADERS, timeout=10)
        resp.raise_for_status()
    except requests.exceptions.Timeout:
        print("  -> Nominatim request timed out after 10s. Likely a firewall/proxy/VPN blocking outbound HTTPS.")
        return None
    except requests.exceptions.ConnectionError as e:
        print(f"  -> Couldn't connect to Nominatim at all: {e}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"  -> Nominatim request failed: {e}")
        return None

    results = resp.json()
    if not results:
        return None
    return float(results[0]["lat"]), float(results[0]["lon"]), results[0]["display_name"]


def build_query(lat: float, lon: float, radius_m: int, amenities: list):
    clauses = "\n".join(
        f'  node["amenity"="{a}"](around:{radius_m},{lat},{lon});' for a in amenities
    )
    return f"[out:json][timeout:25];\n(\n{clauses}\n);\nout body;"


def search_facilities(lat: float, lon: float, radius_m: int, amenities: list):
    query = build_query(lat, lon, radius_m, amenities)
    resp = requests.post(OVERPASS_URL, data={"data": query}, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    return resp.json().get("elements", [])


def format_result(el: dict) -> str:
    tags = el.get("tags", {})
    name = tags.get("name", "(no name tag — skipped in real sync)")
    amenity = tags.get("amenity", "?")
    phone = tags.get("phone") or tags.get("contact:phone") or "—"
    addr_parts = [tags.get("addr:housenumber"), tags.get("addr:street"), tags.get("addr:city")]
    address = ", ".join(p for p in addr_parts if p) or "—"
    return f"  • {name}  [{amenity}]\n      phone: {phone}\n      address: {address}\n      lat/lon: {el.get('lat')}, {el.get('lon')}"


def main():
    print("=== OpenStreetMap Overpass test ===\n")

    place = input("Place to search near (e.g. 'Udupi, Karnataka'): ").strip()
    if not place:
        print("No place entered, exiting.")
        sys.exit(1)

    print("\nWhat are you searching for?")
    print("  1) hospital")
    print("  2) clinic")
    print("  3) doctors (individual practices)")
    print("  4) all of the above")
    choice = input("Choose 1-4: ").strip()
    amenities = FACILITY_TAGS.get(
        {"1": "hospital", "2": "clinic", "3": "doctors", "4": "all"}.get(choice, "all"),
        FACILITY_TAGS["all"],
    )

    radius_input = input("Search radius in meters [default 5000]: ").strip()
    radius_m = int(radius_input) if radius_input else 5000

    print(f"\nGeocoding '{place}'...", flush=True)
    geo = geocode_place(place)
    if not geo:
        print("Geocoding failed or found nothing. See message above, or try a more specific place name.")
        sys.exit(1)
    lat, lon, matched_name = geo
    print(f"Matched: {matched_name}")
    print(f"Coordinates: {lat}, {lon}\n")

    print(f"Querying Overpass for {amenities} within {radius_m}m...", flush=True)
    try:
        elements = search_facilities(lat, lon, radius_m, amenities)
    except requests.exceptions.Timeout:
        print("Overpass request timed out after 30s. The public instance can be slow/overloaded — try again in a minute, or reduce radius.")
        sys.exit(1)
    except requests.exceptions.ConnectionError as e:
        print(f"Couldn't connect to Overpass at all: {e}")
        sys.exit(1)
    except requests.RequestException as e:
        print(f"Overpass request failed: {e}")
        sys.exit(1)

    print(f"\n{len(elements)} raw results returned.\n")

    named = [el for el in elements if el.get("tags", {}).get("name")]
    print(f"{len(named)} have a usable 'name' tag (the rest would be skipped in a real sync):\n")

    for el in named:
        print(format_result(el))

    if not named:
        print("No named results — try a larger radius or a denser area.")


if __name__ == "__main__":
    main()