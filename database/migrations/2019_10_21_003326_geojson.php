<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Geojson extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
      Schema::create('geojson', function (Blueprint $table) {
          $table->increments('id');
          $table->string('purchase_id');
          $table->string('url');
          $table->json('coords');
          $table->timestamp('updated_at')->nullable();
          $table->timestamp('created_at')->nullable();
      });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
      Schema::dropIfExists('geojson');
    }
}
