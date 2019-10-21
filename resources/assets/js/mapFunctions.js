import {checkoutZone} from './checkout'

function makeURL(url) {
  const proxy = "https://cors-anywhere.herokuapp.com/"

  return `${proxy}${url}`
}

function resolveLocation(ipv4) {
  // Please note, the use of this service requires a link back in your web project: [IP Location Finder by KeyCDN](https://tools.keycdn.com/geo)
  fetch(makeURL(`https://tools.keycdn.com/geo.json?host=${ipv4}`))
    .then((response) => response.json())
    .then((result) => {
      window.LatLng ={
        latitude: result.data.geo.latitude,
        longitude: result.data.geo.longitude,
      }
    })
    .then(() => {
      centerMap()
      setGeoJsonLayer()
      enableDrawingTools()
      enableLocationSearch()
    })
}

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
function centerMap() {
  const {latitude, longitude} = window.LatLng

  let userLoc = L.circleMarker([latitude, longitude],{
    fillColor: '#ffad14',
    color: '#c98b16',
    fillOpacity: 0.8
  }).addTo(map)

  userLoc.bindPopup("You, probably");
  userLoc.on('click', function (e) {
      this.openPopup();
  });

  map.panTo(new L.LatLng(latitude, longitude));
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
                		layer.on('click', (e) => {
  										window.open(e.target.feature.properties.redirect)
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
     invalidShape = turf.booleanContains(newTurfPolygon, geoJSONObjects[0]) || turf.booleanOverlap(newTurfPolygon, geoJSONObjects[0])

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

// if we are live just get the client IP from laravel Request::ip()
// This will save us time on the proxy request to jsonip
function getLocationAndCenter() {
  // If geolocator takes too long just show the map anyway centered on LA, CA
  setTimeout(() => {
    if (!window.LatLng) {
      window.LatLng ={
        latitude: 34.052235,
        longitude: -118.243683,
      }
      centerMap()
      setGeoJsonLayer()
      enableDrawingTools()
      enableLocationSearch()
    }
  }, 2500)

  if (window.env === 'production') {
    resolveLocation(window.ipv4)
  } else{
    fetch(makeURL("http://jsonip.com?"))
      .then((response) => response.json())
      .then((result) => resolveLocation(result.ip.split(',')[0]))
  }
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
    center: [0, 0],
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
  getLocationAndCenter()

  /////TEST///
  // window.LatLng = {latitude:30.009284, longitude: -90.143888}
  // window.zoneArea = 5000.00
  // centerMap()
  // setGeoJsonLayer()
  // enableDrawingTools()
  // enableLocationSearch()
  // getRedirectUrl()
  /////TEST///
}
