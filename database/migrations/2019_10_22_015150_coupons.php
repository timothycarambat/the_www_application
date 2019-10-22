<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Coupons extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
      Schema::create('coupons', function (Blueprint $table) {
          $table->increments('id');
          $table->string('code');
          $table->decimal('discount', 4, 3);
          $table->boolean('active')->default(false);
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
      Schema::dropIfExists('coupons');
    }
}
