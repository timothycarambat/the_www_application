<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Purchase;
use App\GeoJson;

class PagesController extends Controller {

  public function home() {
    return view('pages.map')->with([
      'page' => 'map',
    ]);
  }

  public function cancel() {
    return view('pages.cancel');
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
