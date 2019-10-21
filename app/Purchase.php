<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model {
  protected $fillable = [
    'checkout_id', 'url', 'purchase_details', 'method',
  ];
    public static function create_purchase_record($total, $method, $request, $checkout_id = null) {
      if ($checkout_id == null) {
        $checkout_id = uniqid('www_');
      }
      $data = [
        'redirect' => $request->redirect,
        'cost' => $total,
        'coords' => $request->coords,
        'area' => $request->area,
        'couponID' => $request->couponId,
      ];

      Purchase::create([
        'checkout_id' => $checkout_id,
        'url' => $request->redirect,
        'purchase_details' => json_encode($data),
        'method' => $method,
      ]);

      return $checkout_id;
    }

    public function geojson() {
      return $this->hasOne('App\GeoJson');
    }
}
