<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp;

use App\Purchase;

class MainController extends Controller
{
    public static function ping(Request $request) {
      try {
        $client = new GuzzleHttp\Client();
        $response = $client->request('GET', $request->url);
        return json_encode(['urlValid' => $response->getStatusCode() !== 404]);
      } catch (\Exception $e) {
        return json_encode(['urlValid' => !in_array($e->getCode(), [404, 0, 500]) ]);
      }
    }

    public static function create_stripe_checkout_session($total, $redirect) {
      \Stripe\Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

      $session = \Stripe\Checkout\Session::create([
        'payment_method_types' => ['card'],
        'line_items' => [[
          'name' => "New Redirect Zone for ".$_ENV['APP_NAME'],
          'description' => 'Purchase of a Redirect Zone to '.$redirect,
          'images' => [$_ENV['APP_URL']."/images/logo.png"],
          'amount' => $total * 100,
          'currency' => 'usd',
          'quantity' => 1,
        ]],
        'success_url' => $_ENV['APP_URL']."/success?session_id={CHECKOUT_SESSION_ID}",
        'cancel_url' => $_ENV['APP_URL']."/cancel",
      ]);

      return $session;
    }

    // validate coupon code + get discount && and check new (possibly) discounted amount
    // that the value is greater than 0.10
    public static function create_checkout_session(Request $request) {
      $total_cost_usd = $request->area * ($_ENV['UNIT_COST_USD'] / $_ENV['PER_UNIT_SQKM']);
      $total_cost_usd = $total_cost_usd < 1.00 ? 1.00 : round($total_cost_usd, 2);
      $coupon = MainController::getCouponDetails($request->couponId);

      if ($coupon['validCoupon']) {
        $total_cost_usd = round($total_cost_usd - ($total_cost_usd * $coupon['discount']), 2);
      }

      // this means the zone costs nothing so we need to just save and implment into geojson.
      if ($total_cost_usd == 0.00) {
        $session_id = Purchase::create_purchase_record($total_cost_usd, 'internal', $request);
        $is_stripe = false;
        $redirectTo = $_ENV['APP_URL']."/success?session_id=".$session_id;
      } else {
        $session_id = MainController::create_stripe_checkout_session($total_cost_usd, $request->redirect)->id;
        Purchase::create_purchase_record($total_cost_usd, 'stripe', $request, $session_id);
        $is_stripe = true;
        $redirectTo = null;
      }


      return json_encode([
        'checkoutSessionId' => $session_id,
        'isStripe' => $is_stripe,
        'redirectTo' => $redirectTo,
      ]);
    }

    public static function validate_coupon(Request $request) {
        return json_encode(MainController::getCouponDetails($request->couponId));
    }

    public static function getCouponDetails($couponId) {
      $couponId = empty($couponId) ? '' : $couponId;
      $valid_coupons = json_decode($_ENV['WWW_COUPONS']);
      $valid_coupon = property_exists($valid_coupons, $couponId);
      $discount = $valid_coupon ? $valid_coupons->{$couponId} : 0.00;

      return [
        'validCoupon' => $valid_coupon,
        'discount' => $discount,
      ];
    }
}
