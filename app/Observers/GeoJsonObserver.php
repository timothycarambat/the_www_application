<?php

namespace App\Observers;
use App\GeoJson;

use GuzzleHttp;


class GeoJsonObserver {
   public function created(GeoJson $geojson) {
     $client = new GuzzleHttp\Client(['verify' => false]);
     $res = $client->request('POST', $_ENV['GEOJSON_TILE_SERVER'].'/append', [
         'headers' => ['Content-Type' => 'application/json'],
         'body' => json_encode([
           'url' => $geojson->url,
           'coords' => json_decode($geojson->coords)->coords,
         ]),
     ]);
   }
}
