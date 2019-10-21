<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Purchases extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
      Schema::create('purchases', function (Blueprint $table) {
          $table->increments('id');
          $table->string('checkout_id');
          $table->string('url');
          $table->json('purchase_details');
          $table->string('method');
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
      Schema::dropIfExists('purchases');
    }
}
