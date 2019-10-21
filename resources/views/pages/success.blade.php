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
          <img class='end-logo' src='/images/logo.svg'/>
        </div>

        <div id="myModal" class="end-modal fade in" style="display:block">
        	<div class="modal-dialog modal-newsletter">
        		<div class="modal-content">
        				<div class="modal-header">
                  @if ($processing_result)
        					     <h4>Your Zone is Live!</h4>
                  @else
                    <h4>There was an issue processing your zone.</h4>
                  @endif
        				</div>
        				<div class="modal-body text-center">
                  @if ($processing_result)
                    <p>Usually this process takes about a minute to finish. By the time you're done reading this your zone will be live!<p>
                  @else
                    <p>This usually isnt a big deal. Just email us telling us what you were doing to get to this point. Usually, its because you did not complete
                      the payment process. If you were charged then please contact us and we will get it right.
                    <p>
                  @endif
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
