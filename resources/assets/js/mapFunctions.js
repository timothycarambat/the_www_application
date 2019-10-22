import {checkoutZone} from './checkout'
import {supportButton} from './supportControl'

function setMapPanRestriction() {
  var southWest = L.latLng(-89.98155760646617, -180),
  northEast = L.latLng(89.99346179538875, 180);
  var bounds = L.latLngBounds(southWest, northEast);
  map.setMaxBounds(bounds);
  map.on('drag', function() {
  	map.panInsideBounds(bounds, { animate: false });
  });
}

// Set Location Marker, Center Map, and Hide/unassign loader.
window.removeLoader = () => {
  window.leafletLoader.hide()
  window.leafletLoader = undefined
}

function setGeoJsonLayer() {
  window.geoJSONObjects = []
  // check zoom level. If it is too high of a view just remove the geoJSON and
  // dont ask for tiles. Otherwise clear current layer so we can refresh it.
  geojsonTileLayer && map.removeLayer(geojsonTileLayer)

  var style = {
        "clickable": true,
        "color": "#00D",
        "fillColor": "#00D",
        "weight": 1.0,
        "opacity": 0.3,
        "fillOpacity": 0.2
    };
    var hoverStyle = {
        "fillOpacity": 0.5
    };

    geojsonTileLayer = new L.TileLayer.GeoJSON(`${geojsontileserver}/${geojsontilename}/{z}/{x}/{y}.geojson`, {
            clipTiles: true,
            unique: function (feature) {
                return feature.id;
            }
        }, {
            onEachFeature: function (feature, layer) {
              feature.geometry.geometries && geoJSONObjects.push( turf.buffer(feature.geometry.geometries[0], 5) )
                if (feature.properties) {
                		layer.on('click', (elayer) => {
                      alertify.confirm('Confirm Open', `This will open a new window to: <br> ${elayer.target.feature.properties.redirect}`
                      , function(){ window.open(elayer.target.feature.properties.redirect) }
                      , function(){ alertify.message('You declined to open the window.') })
                      .set({
                        'labels': {ok: 'Open Link', cancel:''}
                      })
  									})
                }
            }
        }
    );
    map.addLayer(geojsonTileLayer);
}

function enableDrawingTools() {
   const currentZoom = map.getZoom()
   if (currentZoom < 8 ) {
     window.drawControl && map.removeControl(window.drawControl)
     window.drawControl = null
     return false
   }
   window.drawControl && map.removeControl(window.drawControl)

   window.editableLayers = new L.FeatureGroup();
   map.addLayer(editableLayers);
   var drawnItems = new L.FeatureGroup();
   map.addLayer(drawnItems);
   window.drawControl = new L.Control.Draw({
     draw: {
            polyline: false,
  					circle: false,
  					circlemarker: false,
  					marker: false,
            edit: false,
            polygon: false,
            rectangle: {
                shapeOptions: {
                    clickable: true,
                    color: '#0db832'
                }
            },
        },
   });
   map.addControl(drawControl);


   // since you can only draw one shape lets just preserve the instance of the layer
   map.on('draw:created', function (e) {
  	 window.newLayer = e.layer
   })

   map.on('draw:drawstop', function (e) {
  	 window.polyCoords = []
     let newTurfPolygon
     let invalidShape = false
  	 newLayer.getLatLngs().map((coords) => {
  		 polyCoords.push([coords.lng, coords.lat])
  	 })
  	 polyCoords.push(polyCoords[0])
     newTurfPolygon = turf.polygon([polyCoords])

     if (geoJSONObjects.length > 0) {
       for (i=0; i < geoJSONObjects.length; i++) {
         invalidShape = turf.booleanContains(newTurfPolygon, geoJSONObjects[i]) || turf.booleanOverlap(newTurfPolygon, geoJSONObjects[i])
       }
     }

     if (invalidShape){
       handleInvalidShape()
       return false
     }

     editableLayers.addLayer(newLayer);
     window.zoneArea = (turf.area(newTurfPolygon) / 1e6)
     getRedirectUrl()
  });
}

function enableLocationSearch() {
  let searchControl = new L.esri.Controls.Geosearch({'position': 'topleft'}).addTo(map);

  searchControl.on('results', function(data){
    map.panTo(data.results[0].latlng);
  });
}

window.formatAmount = (value, isCurrency = false) => {
  if (isCurrency){
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  } else {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value).replace('$','')
  }
}

// reset newLayer and show alert
window.handleInvalidShape = () => {
  window.newLayer = null
  alertify.error('Your zone cannot overlap or intersect that much into another zone!', 3.5);
}

// get redirect Url via Model and start checkout process
window.getRedirectUrl = () => {
  let totalCost = window.zoneArea * (window.unitCost / window.perUnitSqKm)
  let forcedMin = false

  if (totalCost < 1.00) {
    forcedMin = true
    totalCost = 1.00
  }

  alertify.confirm( 'Set Redirect and Checkout',
               `
               <h4 class='text-center'>Pre-Checkout Summary</h4>
               <div class='well cost-breakdown'>
                <p>
                 Total Area: ${formatAmount(window.zoneArea)}km<sup>2</sup>
                 <br>
                 Rate: $${window.unitCost} USD / ${window.perUnitSqKm}km<sup>2</sup>
                 <br>
                 Total: ${formatAmount(totalCost, true)}
                </p>
                ${window.couponEnabled ?
                  `
                  <label> Coupon: </label>
                  <div class="inner-addon left-addon">
                     <i class="coupon glyphicon"></i>
                     <input
                       style='width: 50%'
                       id='couponId'
                       onblur='applyCoupon()'
                       type="text"
                       class="form-control"
                       placeholder='Code'
                     />
                  <p class='hidden' id='couponTotal'> Total with Coupon: <b></b></p>
                 </div>
                  `
                  :
                  ''
                }

               </div>
               Enter a valid URL:
               <p class='small'><b>NOTE:</b> If you need to change or update the url after - just email us!</p>
               <p class='small'>When you're done - just click <b>Checkout</b> and youll be set! When the checkmark is green youll be able to proceed.</p>
               <div class="inner-addon left-addon">
                  <i class="url glyphicon glyphicon-remove-sign"></i>
                  <input
                    id='redirectUrlInput'
                    onblur='testLink()'
                    type="text"
                    class="form-control"
                    placeholder='https://yourwebsitehere.com'
                  />
              </div>
               `
               , function(evt, value) {
                  window.redirectUrl = $('#redirectUrlInput').val()
                  checkoutZone()
               }
               , function() {
                 window.zoneArea = 0.00
                 editableLayers.removeLayer(newLayer);
                 window.newLayer = null
                 window.polyCoords = []
                 alertify.error('Your zone order was cancelled.')
               })
               .set({
                 'closable': false,
                 'labels': {ok: 'Checkout!', cancel:'Cancel'},
               });
    $('.ajs-button.ajs-ok').addClass('disabled').attr('disabled', true)
}

// Ping the URL they entered to prevent dead links from being posted.
window.testLink = () => {
  let url = event.target.value
  $('.url.glyphicon.glyphicon-remove-sign, .url.glyphicon-ok-sign')
    .removeClass('glyphicon-remove-sign glyphicon-ok-sign')
    .addClass('glyphicon-refresh fast-right-spinner')
  $('.ajs-button.ajs-ok').addClass('disabled').attr('disabled', true)


  fetch(`/ping?url=${url}`)
  .then((response) => response.json())
  .then((result) => {
    if (result.urlValid) {
      $('.url.glyphicon.glyphicon-refresh')
        .removeClass('glyphicon-refresh fast-right-spinner')
        .addClass('glyphicon-ok-sign')
      $('.ajs-button.ajs-ok').addClass('disabled').attr('disabled', false)
    } else {
      $('.url.glyphicon.glyphicon-refresh, .url.glyphicon-ok-sign')
        .removeClass('glyphicon-refresh fast-right-spinner glyphicon-ok-sign')
        .addClass('glyphicon-remove-sign')
      $('.ajs-button.ajs-ok').addClass('disabled').attr('disabled', true)
    }
  });
}

window.applyCoupon = () => {
  window.couponId = event.target.value

  if (couponId == '') {
    $('.coupon.glyphicon, .coupon.glyphicon-ok-sign')
      .removeClass('glyphicon-remove-sign glyphicon-ok-sign glyphicon-refresh fast-right-spinner')
    $('#couponTotal').addClass('hidden')

    return false
  }

  else if (window.zoneArea * (window.unitCost / window.perUnitSqKm) > 5.00) {

  }

  $('.coupon.glyphicon')
    .removeClass('glyphicon-remove-sign glyphicon-ok-sign glyphicon-refresh fast-right-spinner')
    .addClass('glyphicon-refresh fast-right-spinner')

    fetch(`/validate_coupon?couponId=${couponId}`)
    .then((response) => response.json())
    .then((result) => {
      if (result.validCoupon) {
        $('.coupon.glyphicon.glyphicon-refresh')
          .removeClass('glyphicon-refresh fast-right-spinner')
          .addClass('glyphicon-ok-sign')
        let currentTotal = window.zoneArea * (window.unitCost / window.perUnitSqKm)
        currentTotal = currentTotal < 1.00 ? 1.00 : currentTotal

        let newTotal = currentTotal - (currentTotal * result.discount)

        // prevent giving away too much area for nothing.
        if (newTotal == 0.00 && currentTotal > 5.00) {
          $('.coupon.glyphicon, .coupon.glyphicon-ok-sign')
            .removeClass('glyphicon-remove-sign glyphicon-ok-sign glyphicon-refresh fast-right-spinner')
          $('#couponTotal').addClass('hidden')
          $('#couponId').val('')
          window.couponId = null
          alertify.error('You cannot use this coupon for a value more than $5.00')
          return false
        }

        let displayTotal = formatAmount(newTotal, true)
        $('#couponTotal, #couponTotal > b')
          .removeClass('hidden')
          .eq(1)
          .text(displayTotal)
      } else {
        $('.coupon.glyphicon.glyphicon-refresh, .url.glyphicon-ok-sign')
          .removeClass('glyphicon-refresh fast-right-spinner glyphicon-ok-sign')
          .addClass('glyphicon-remove-sign')
        $('#couponTotal').addClass('hidden')
      }
    });

}

//////////////////////////////////////////////////////////////////
////              EXPORTS                                       //
//////////////////////////////////////////////////////////////////

export function makeBaseMap() {
  window.geojsonTileLayer = null

  // Init Map Object
  window.map = L.map('mapid', {
    center: [34.052235, -118.243683],
    zoom: 10,
	  minZoom: window.zoomLimit,
  });

  // make it to where user cannot pan outside map
  setMapPanRestriction()

  // Show Base layer
  let osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    noWrap: true,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  window.leafletLoader = L.control.loader().addTo(map);
  map.addControl(new supportButton());

  setGeoJsonLayer()
  enableDrawingTools()
  enableLocationSearch()

  /////TEST///
  // window.LatLng = {latitude:30.009284, longitude: -90.143888}
  // window.zoneArea = 5000.00
  // removeLoader()
  // setGeoJsonLayer()
  // enableDrawingTools()
  // enableLocationSearch()
  // getRedirectUrl()
  /////TEST///
}
