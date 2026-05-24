"""
GeofenceManager — evaluates whether a location is inside/near a geofence
and returns the distance to the nearest boundary.
"""
from datetime import datetime

class GeofenceManager:
    def distance_to_boundary(self, location: dict, geofence: dict) -> float:
        """
        Returns distance in km from location to nearest geofence polygon edge.
        TODO: implement proper point-in-polygon + edge distance.
        """
        return 1.5  # placeholder km

    def get_dynamic_risk_multiplier(self, context: dict) -> float:
        """
        Returns a multiplier (0.5–2.0) based on season/time/weather.
        Example: harvest season at dusk = 1.8x base risk.
        """
        multiplier = 1.0
        if context.get("season") == "harvest":
            multiplier *= 1.4
        if context.get("time_of_day") in ("dusk", "dawn"):
            multiplier *= 1.3
        if context.get("weather") == "rain":
            multiplier *= 1.2
        return min(multiplier, 2.0)
