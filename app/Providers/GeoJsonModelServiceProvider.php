<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class GeoJsonModelServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
      \App\GeoJson::observe(\App\Observers\GeoJsonObserver::class);
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
