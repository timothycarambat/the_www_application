<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', 'PagesController@home');
Route::get('/cancel', 'PagesController@cancel');
Route::get('/success', 'PagesController@success');





Route::get('/ping', 'MainController@ping');
Route::get('/validate_coupon', 'MainController@validate_coupon');
Route::post('/create_checkout_session', 'MainController@create_checkout_session');
