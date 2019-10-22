<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Laravel') }}</title>
    @include('components.gascript')
    <!-- Styles -->
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">

    <link rel="stylesheet" type="text/css" href="https://cdn-geoweb.s3.amazonaws.com/esri-leaflet-geocoder/0.0.1-beta.5/esri-leaflet-geocoder.css">
</head>
<body>
    <!-- Page Content -->
    @yield('content')
    <!-- /#page-content-wrapper -->

    <!-- Scripts -->
    <script src="https://js.stripe.com/v3/"></script>
    <script type="text/javascript">
      // Set Globals Here
      window.env = "{{$_ENV['APP_ENV']}}"
      window.page = "{{$page}}"
      window.zoomLimit = "{{$_ENV['ZOOM_LIMIT']}}"
      window.geojsontileserver = "{{$_ENV['GEOJSON_TILE_SERVER']}}"
      window.geojsontilename = "{{$_ENV['GEOJSON_FILE_NAME']}}"
      window.unitCost = "{{$_ENV['UNIT_COST_USD']}}"
      window.perUnitSqKm = "{{$_ENV['PER_UNIT_SQKM']}}"
      window.stripe = Stripe("{{$_ENV['STRIPE_PUB_KEY']}}")
      window.couponEnabled = "{{$coupons_enabled}}"
      window.supportEmail = "{{$_ENV['SUPPORT_EMAIL']}}"
    </script>
    <script src="{{ asset('js/app.js') }}"></script>
    <script src="https://cdn-geoweb.s3.amazonaws.com/esri-leaflet/0.0.1-beta.5/esri-leaflet.js"></script>
    <script src="https://cdn-geoweb.s3.amazonaws.com/esri-leaflet-geocoder/0.0.1-beta.5/esri-leaflet-geocoder.js"></script>
</body>
</html>
