// utils/parseArcgisToGeoJSON.ts
import type { Feature, FeatureCollection, Geometry, GeometryCollection } from "geojson";
import * as arcgis from "@terraformer/arcgis";

// --- type guards
const isFeatureCollection = (x: any): x is FeatureCollection =>
  x && x.type === "FeatureCollection" && Array.isArray(x.features);

const isFeature = (x: any): x is Feature =>
  x && x.type === "Feature" && x.geometry !== undefined;

const isGeometryCollection = (x: any): x is GeometryCollection =>
  x && x.type === "GeometryCollection" && Array.isArray(x.geometries);

const isGeometry = (x: any): x is Geometry =>
  x && typeof x.type === "string" && (x.coordinates !== undefined || isGeometryCollection(x));

export const parseArcgisToGeoJSON = (arcInput: unknown): FeatureCollection => {
  // Case 1: ArcGIS FeatureSet { features: [...] }
  if ((arcInput as any)?.features && Array.isArray((arcInput as any).features)) {
    const feats: Feature[] = [];
    for (const f of (arcInput as any).features) {
      const converted: any = arcgis.arcgisToGeoJSON(f);
      if (isFeatureCollection(converted)) feats.push(...converted.features);
      else if (isFeature(converted)) feats.push(converted);
      else if (isGeometry(converted)) feats.push({ type: "Feature", geometry: converted, properties: {} });
    }
    return { type: "FeatureCollection", features: feats };
  }

  // Case 2: Array campuran (feature/geometry/FC)
  if (Array.isArray(arcInput)) {
    const feats: Feature[] = [];
    for (const v of arcInput as any[]) {
      const converted: any = arcgis.arcgisToGeoJSON(v);
      if (isFeatureCollection(converted)) feats.push(...converted.features);
      else if (isFeature(converted)) feats.push(converted);
      else if (isGeometry(converted)) feats.push({ type: "Feature", geometry: converted, properties: {} });
    }
    return { type: "FeatureCollection", features: feats };
  }

  // Case 3: Single objek
  const converted: any = arcgis.arcgisToGeoJSON(arcInput as any);
  if (isFeatureCollection(converted)) return converted;
  if (isFeature(converted)) return { type: "FeatureCollection", features: [converted] };
  if (isGeometry(converted)) {
    return {
      type: "FeatureCollection",
      features: [{ type: "Feature", geometry: converted, properties: {} }],
    };
  }

  // Fallback aman
  return { type: "FeatureCollection", features: [] };
};
