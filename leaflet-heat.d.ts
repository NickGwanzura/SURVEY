import "leaflet";

declare module "leaflet" {
  interface HeatLayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: Record<number, string>;
  }

  interface HeatLayer extends Layer {
    setOptions(options: HeatLayerOptions): this;
    addLatLng(latlng: LatLngExpression | HeatLatLngTuple): this;
    setLatLngs(latlngs: HeatLatLngTuple[]): this;
    redraw(): this;
  }

  type HeatLatLngTuple = [number, number, number?];

  function heatLayer(
    latlngs: HeatLatLngTuple[],
    options?: HeatLayerOptions,
  ): HeatLayer;
}
