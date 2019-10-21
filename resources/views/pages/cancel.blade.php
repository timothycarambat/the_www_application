@extends('layouts.purchase')

@section('content')
<!-- HOME SECTION GOES HERE -->
<div id="page-content-wrapper">
    <div class="end-container-fluid">

      <div class="svg-container">
        @include('components.networksvg')
      </div>


      <div class="row justify-content-md-center">
        <div class="col-xs-12 text-center">
          <img class='end-logo' src='images/logo.svg'/>
        </div>

        <div id="myModal" class="end-modal fade in" style="display:block">
        	<div class="modal-dialog modal-newsletter">
        		<div class="modal-content">
        				<div class="modal-header">
        					<h4>You Cancelled Your Order</h4>
        				</div>
        				<div class="modal-body text-center">
                  <p>As a result, the zone you drew will not be available on the map. If you want to redraw your zone or see the other zones you can go back with the button below.<p>
                  <a class='btn btn-primary' href='/'> Return To the World Wide Web </a>
                  <div class="footer-link"><i class="far fa-envelope-open fa-fw"></i><a href="mailto:{{$_ENV['SUPPORT_EMAIL']}}">{{$_ENV['SUPPORT_EMAIL']}}</a></div>
        				</div>
        		</div>
        	</div>
        </div>

      </div>
    </div>
</div>
@endsection
