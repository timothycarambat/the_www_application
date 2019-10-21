<!--
VIEW IN FULL SCREEN MODE
FULL SCREEN MODE: http://salehriaz.com/404Page/404.html

DRIBBBLE: https://dribbble.com/shots/4330167-404-Page-Lost-In-Space
-->
@extends('layouts.purchase')

@section('content')
  @include('components.errorstyle')
  <body class="bg-purple">
      <div class="stars">
          <div class="central-body">
              <img class="image-404" src="/images/404.svg" width="300px">
              <a href="/" class="btn-go-home">Return To Earth</a>
          </div>
          <div class="objects">
              <img class="object_rocket" src="images/rocket.svg" width="40px">
              <div class="earth-moon">
                  <img class="object_earth" src="images/earth.svg" width="100px">
                  <img class="object_moon" src="images/moon.svg" width="80px">
              </div>
              <div class="box_astronaut">
                  <img class="object_astronaut" src="images/astronaut.svg" width="140px">
              </div>
          </div>
          <div class="glowing_stars">
              <div class="star"></div>
              <div class="star"></div>
              <div class="star"></div>
              <div class="star"></div>
              <div class="star"></div>

          </div>

      </div>

  </body>
@endsection
