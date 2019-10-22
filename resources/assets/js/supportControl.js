export const supportButton = L.Control.extend({
  options: {
    position: 'topright'
  },

  onAdd: function (map) {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

    container.innerHTML = `
      <div>
        <i class='glyphicon glyphicon-envelope'
        style='line-height: 29px;
                width: 100%;
                height: 100%;
                margin-left: 17%;
                font-size: 20px;
                color: #3087d4;
                cursor: pointer;'
        ></i>
      </div>
    `
    container.style.backgroundColor = 'white';
    container.style.width = '30px';
    container.style.height = '30px';

    container.onclick = function(){
      alertify.confirm('Contact'
              ,`
                Disclaimer: We are not responsible for the links on this page and where they may lead and the content therewithin of the link.
                <br><br>
                Support: <a href='mailto:${window.supportEmail}'>${window.supportEmail}</a>
              `
              , function(){ }
              , function(){ })
              .set({
                'labels': {'ok': 'OK', 'cancel': ''}
              })
    }

    return container
  },

});
