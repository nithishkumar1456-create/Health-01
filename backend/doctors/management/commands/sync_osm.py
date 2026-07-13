from django.core.management.base import BaseCommand
from doctors.models import Doctor
from doctors.services.overpass_client import search_nearby_facilities, OverpassAPIError
import sys

class Command(BaseCommand):
    help = "Syncs nearby doctor and clinic facilities from OpenStreetMap via the Overpass API."

    def add_arguments(self, parser):
        parser.add_argument('--lat', type=float, required=True, help="Latitude of the query center")
        parser.add_argument('--lng', type=float, required=True, help="Longitude of the query center")
        parser.add_argument('--radius', type=int, default=5000, help="Search radius in meters")
        parser.add_argument('--city', type=str, default="", help="City name parameter (optional)")

    def handle(self, *args, **options):
        lat = options['lat']
        lng = options['lng']
        radius = options['radius']
        city = options['city']

        self.stdout.write(f"Syncing OSM facilities for lat={lat}, lng={lng}, radius={radius} meters, city={city}...")

        try:
            elements = search_nearby_facilities(lat, lng, radius)
        except OverpassAPIError as e:
            self.stderr.write(self.style.ERROR(f"Error calling Overpass API: {str(e)}"))
            sys.exit(1)

        created_count = 0
        updated_count = 0
        skipped_no_name = 0
        skipped_claimed_verified = 0

        for element in elements:
            osm_id = element.get('id')
            tags = element.get('tags', {})
            
            # Check for name tag
            name = tags.get('name')
            if not name:
                skipped_no_name += 1
                continue

            # Build address from housenumber, street, city
            housenumber = tags.get("addr:housenumber", "")
            street = tags.get("addr:street", "")
            city_tag = tags.get("addr:city", "")
            address_parts = [housenumber, street, city_tag]
            address = ", ".join([p for p in address_parts if p]).strip()

            # Build phone
            phone = tags.get("phone") or tags.get("contact:phone") or ""

            # Check amenity tag to set facility type
            amenity = tags.get("amenity")
            if amenity in ['hospital', 'clinic', 'doctors']:
                facility_type = amenity
            else:
                facility_type = 'doctors'

            latitude = element.get('lat')
            longitude = element.get('lon')

            try:
                doc = Doctor.objects.get(osm_id=osm_id)
                # Skip updates if claimed or verified
                if doc.claimed_by is not None or doc.status == Doctor.VERIFIED:
                    skipped_claimed_verified += 1
                    continue

                # Perform updates on existing row
                doc.name = name
                if phone:
                    doc.phone = phone
                if address:
                    doc.address = address
                doc.latitude = latitude
                doc.longitude = longitude
                doc.facility_type = facility_type
                
                # Skip overwriting specialization if it already exists
                # doc.specialization is CharField, check if not empty
                # We skip overwriting if a human has set a specialization
                # (OSM won't have it, but do not overwrite non-null/non-empty specialization)
                # doc.specialization default is ""
                if not doc.specialization:
                    # do not modify if it's already set
                    pass

                # Update tags
                doc.raw_osm_tags = tags
                doc.save()
                updated_count += 1

            except Doctor.DoesNotExist:
                # Create a new Doctor row
                Doctor.objects.create(
                    osm_id=osm_id,
                    name=name,
                    phone=phone,
                    address=address,
                    facility_type=facility_type,
                    latitude=latitude,
                    longitude=longitude,
                    source=Doctor.OPENSTREETMAP,
                    status=Doctor.UNVERIFIED,
                    raw_osm_tags=tags
                )
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"OSM Sync completed: {created_count} created, {updated_count} updated, "
                f"{skipped_no_name} skipped (no name tag), {skipped_claimed_verified} skipped (already claimed/verified — not overwritten)"
            )
        )
