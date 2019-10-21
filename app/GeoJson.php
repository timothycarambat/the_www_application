<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class GeoJson extends Model
{
    protected $table = 'geojson';
    protected $fillable = [
      'purchase_id', 'url' ,'coords'
    ];

    public static function process_purchase($purchase) {
      // If we have already processed this purchase then lets just go on.
      if (!is_null($purchase->geojson)) { return true; }

      if ($purchase->method == 'stripe') {
        $payment_success = GeoJson::validateStripePayment($purchase->checkout_id);
        if ($payment_success) {
          GeoJson::create_new_geojson_record($purchase);
          return true;
        }
      // Payment was internal - meaning it was free so there is no stripe record
      } else {
        GeoJson::create_new_geojson_record($purchase);
        return true;
      }

      return false;
    }

    public static function create_new_geojson_record($purchase) {
      $new_geojson = GeoJson::create([
        'purchase_id' => $purchase->id,
        'url' => $purchase->url,
        'coords' => json_encode([
            'coords' => json_decode($purchase->purchase_details)->coords,
        ]),
      ]);

      return $new_geojson;
    }

    public static function validateStripePayment($session_id) {
      \Stripe\Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);
      $stripe_checkout_session = \Stripe\Checkout\Session::retrieve($session_id);

      return !is_null($stripe_checkout_session->customer);
    }


    public function purchase() {
      return $this->belongsTo('App\Purchase');
    }
}
