$(function () {
    jQuery.fn.reverse = [].reverse;

    var currentLayers = {};
    /////////////////////////////////////////////////
    // Map - Initialise the map, set center, zoom, etc.
    /////////////////////////////////////////////////
    var map = L.map('map').setView([52.55, -2.72], 7);
    proj4.defs("EPSG:27700", config.bngcrs);
    proj4.defs('OGC:CRS84', proj4.defs('EPSG:4326'));
    L.tileLayer(config.mapTilesLight, { attribution: config.mapAttribution }).addTo(map);
    var sidebar = L.control.sidebar('sidebar', { position: 'right' }).addTo(map);
    map.addControl(sidebar);
    L.control.locate().addTo(map);

    /////////////////////////////////////////////////////////
    // Helper Function: numFormat
    /////////////////////////////////////////////////////////
    var numFormat = function (num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return num;
    };

    /////////////////////////////////////////////////////////
    // Function: clickPoint
    /////////////////////////////////////////////////////////
    var clickPoint = function (point) {
        sidebar.close();
        var displayPointInfo = function () { sidebar.open(); };
        map.on('moveend', displayPointInfo);
        map.flyTo(L.latLng(lib.lat, lib.lng), 13);
    };

    /////////////////////////////////////////////////////////
    // Function: clickLayer
    /////////////////////////////////////////////////////////
    var clickLayer = function (e, feature, layer) {
        sidebar.close();
        var displayLayerInfo = function () { sidebar.open(); };
        map.on('moveend', displayLayerInfo);
        map.flyToBounds(layer.getBounds(), { paddingTopLeft: L.point(-350, 0) });
    };

    ////////////////////////////////////////////////////////
    // Function: addLayerToMap
    ////////////////////////////////////////////////////////
    var addLayerToMap = function (layerName) {
        var layer = {};
        plymouth.getLayerByName(layerName, function (layer) {
            if (layer.type === 'geoJson') {
                var onEachFeature = function (feature, layer) {
                    layer.on('click', function (e) {
                        clickAuth(e, feature, layer);
                    });
                };
                var newLayer = L.Proj.geoJson(layer.data);
                currentLayers[layerName] = newLayer;
                currentLayers[layerName].addTo(map);
                map.flyToBounds(currentLayers[layerName].getBounds());
            }
        });
    };

    ////////////////////////////////////////////////////////
    // Function: removeLayerFromMap
    ////////////////////////////////////////////////////////
    var removeLayerFromMap = function (layerName) {
        map.removeLayer(currentLayers[layerName]);
        delete currentLayers[layerName];
    };

    /////////////////////////////////////////////////////////////
    // INIT - Load the datasets
    /////////////////////////////////////////////////////////////
    plymouth.getDataSetsByCategory(function (data) {
        // Some will be set to display by default - get those.
        $.each(data, function (i, x) {
            $('#divCategories').append('<h4>' + i + '</h4>');
            $.each(x, function (y, l) {
                $('#divCategories').append('<div class="checkbox checkbox-success"><input id="chb' + l.name + '" data-layer="' + l.name + '" class="checkbox-layer styled" type="checkbox" /> <label for="chb' + l.name + '">' + l.name + '</label></div>');
            });
        });

        // Attach click event to the checkboxes
        $('.checkbox-layer').click(function (evt) {
            if (evt.target.checked) {
                addLayerToMap(evt.target.dataset['layer']);
            } else {
                removeLayerFromMap(evt.target.dataset['layer']);
            }
        });
    });
});