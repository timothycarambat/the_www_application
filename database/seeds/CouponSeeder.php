<?php

use Illuminate\Database\Seeder;

use App\Coupon;

class CouponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run() {
        Coupon::create([
          'code' => 'FREE4ME',
          'discount' => 1.0,
          'active' => true,
        ]);

        Coupon::create([
          'code' => 'FIFTY0FF',
          'discount' => 0.5,
          'active' => true,
        ]);
    }
}
