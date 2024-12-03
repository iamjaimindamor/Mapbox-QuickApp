import { useEffect, useRef, useState } from "react";
import SideBar from "../dashboard/SideBar";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const LocationTracking = () => {
  const mapRef = useRef<any>();
  const mapContainerRef = useRef<any>();
  const [currentLocation, SetCurrentLocation] = useState<any>();
  
  const key = import.meta.env.VITE_MAP_BOX_API_KEY
  
  useEffect(() => {
    mapboxgl.accessToken = key;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: STATIC_GEO_DATA[0],
      zoom: 13,
    });

    const parseStringData = () => {
      let path = "";
      STATIC_GEO_DATA.map((val: any, index: any) => {
        path += `${val[0] + "," + val[1] + ";"}`;
        if (index == 0) {
          new mapboxgl.Marker({ color: "green" })
            .setLngLat(val)
            .addTo(mapRef.current);
        } else if (STATIC_GEO_DATA.length - 1 == index) {
          new mapboxgl.Marker({ color: "red" })
            .setLngLat(val)
            .addTo(mapRef.current);
        } else {
          new mapboxgl.Marker({ color: "grey" })
            .setLngLat(val)
            .addTo(mapRef.current);
        }
      });
      path = path.slice(0, path.length - 1);
      return path;
    };

    const getRoute = async () => {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${parseStringData()}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${key}`,
        { method: "GET" }
      );

      const json = await query.json();
      const data = json.routes[0];
      const route = data.geometry.coordinates;

      const geojson = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: route,
        },
      };

      if (mapRef.current.getSource("route")) {
        mapRef.current.getSource("route").setData(geojson);
      }
      else {
        mapRef.current.addLayer({
          id: "route",
          type: "line",
          source: {
            type: "geojson",
            data: geojson,
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3887be",
            "line-width": 5,
            "line-opacity": 0.75,
          },
        });
      }
    }

    mapRef.current.on("load", () => {
      getRoute();
    });

    const success = (position: any) => {
      const { longitude, latitude } = position.coords;
      SetCurrentLocation([longitude, latitude]);
    };

    navigator.geolocation.getCurrentPosition(success);

    return () => {
      mapRef.current.remove();
    };
  }, []);

  const STATIC_GEO_DATA: any = [
    [72.623891, 23.20362],
    [72.632607, 23.202815],
    [72.623268, 23.206782],
    [72.629149, 23.208067],
    [72.630324, 23.204964],
    [72.633016, 23.208078],
    [72.638458, 23.207834],
    [72.636589, 23.210246],
    [72.627994, 23.210936],
    [72.624266, 23.212918],
    [72.633694, 23.217096],
    [72.641537, 23.213263],
    [72.645035, 23.209101],
    [72.645805, 23.207043],
  ];

  return (
    <>
      <SideBar />
      <div className="col-md-11 welcome_div_mobile mt-2">
        <div
          id="map-container"
          style={{ width: "500px", height: "500px", border: "1px solid black" }}
          ref={mapContainerRef}
        />
      </div>
    </>
  );
};

export default LocationTracking;
