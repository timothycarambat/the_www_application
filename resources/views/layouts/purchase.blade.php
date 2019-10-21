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
</head>
<body>
    <!-- Page Content -->
    @yield('content')
    <!-- /#page-content-wrapper -->
    <script type="text/javascript">
      // Set Globals Here
      window.env = "{{$_ENV['APP_ENV']}}"
      window.page = "{{$page}}"
    </script>
    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
