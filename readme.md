## The World Wide Web Application

This web application show the earth as a map, with overlaid tiles served from a custom tileserver. Each tile links to a
specific domain. You simple draw a shape, pay a dollar or so and then you're live!

## Remarks
- Uses Stripe Checkout to create and redirect to checkout sessions hosted on Stripe.com
- Uses custom made geojson-tile-server. Link to repo can be found [for the tile-server repo here](https://github.com/timothycarambat/the_www_tileserver)
- Hosted on AWS Elastic Beanstalk'
- Uses the following AWS services:
  - certificate manager
  - Route 53
  - Elastic Beanstalk PHP 7.3
  - Load Balancer
- Payments are always at minimum 1.00 per unit sqkm
- Backend is Postgres latest version supported


## Development
- clone repo
- `npm install && composer require`
- Build out .env file from `.env.example`
- `php artisan migrate && php artisan db:seed`
- `npm run watch` or for prod build `npm run prod`
- `php artisan serve`
- [Go to Site](http://localhost:8000)
