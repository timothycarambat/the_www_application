function redirectToStripeCheckout(checkout_id) {
  window.stripe.redirectToCheckout({
    sessionId: checkout_id,
  }).then(function (result) {
    // If `redirectToCheckout` fails due to a browser or network
    // error, display the localized error message to your customer
    // using `result.error.message`.
    alertify.error(result.error.message, 3);
  });
}

function redirectToInternal(internalUrl) {
  window.location = internalUrl
}



export function checkoutZone() {
  $.ajax({
    url: '/create_checkout_session',
    type: 'POST',
    headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
            'Content-Type': 'application/json',
    },
    data: JSON.stringify({
      area: window.zoneArea,
      redirect: window.redirectUrl,
      coords: window.polyCoords,
      couponId: window.couponId,
    }),
    success: (response) => {
      let res = JSON.parse(response)
      res.isStripe ? redirectToStripeCheckout(res.checkoutSessionId) :
                     redirectToInternal(res.redirectTo)
    }
  });

}
