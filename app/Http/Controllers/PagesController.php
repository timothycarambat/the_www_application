<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Purchase;
use App\GeoJson;
use App\Coupon;

class PagesController extends Controller {

  public function home() {
    return view('pages.map')->with([
      'page' => 'map',
      'coupons_enabled' => Coupon::where('active', true)->count() > 0,
    ]);
  }

  public function cancel() {
    return view('pages.cancel')->with([
      'page' => 'cancel',
    ]);
  }

  public function success(Request $request) {
    $purchase = Purchase::where('checkout_id', $request->session_id)->first();
    if(is_null($purchase)) { return view('pages.404')->with(['page'=>'404']);}
    $created_new_geojson = GeoJson::process_purchase($purchase);

    return view('pages.success')->with([
      'page' => 'success',
      'processing_result' => $created_new_geojson,
    ]);
  }

}
