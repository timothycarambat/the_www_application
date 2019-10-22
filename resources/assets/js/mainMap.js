import {makeBaseMap} from './mapFunctions'

function showIntro() {
  alertify.confirm('Welcome to the Internet',
                `
                  The Internet is such a fascinating place - isn't it? This is an easy way to explore it.
                  With this tool feel free to pan and zoom around the map. Every blue zone you click goes to
                  a different website on the net! Think of it like the lottery of the internet - you're not sure
                  where youll end up!
                  <br><br>
                  If you look to the top right you will see the search bar - to lookup locations on the map, as well as
                  the draw tool. Draw as large of a zone as you like and set it to where ever you would like it to go!
                  <br><br>
                  Zones are currently $${window.unitCost} USD / ${window.perUnitSqKm}km<sup>2</sup>
                  <br><br>
                  If you have any issues you or comments email us at <a href='mailto:${window.supportEmail}'>${window.supportEmail}</a>
                `
                , function(){ removeLoader()}
                , function(){ removeLoader()})
                .set({
                  'labels': {ok: 'Start Exploring!', cancel: ''},
                });

}

$(function() { if (window.page === 'map') {
  makeBaseMap()
  showIntro()
}})
