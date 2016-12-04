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
    var pruneCluster = new PruneClusterForLeaflet();

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
    // Function: clickLayer
    /////////////////////////////////////////////////////////
    var clickLayer = function (e, feature, layer) {
        sidebar.close();
        var props = layer.feature.properties;
        var displayLayerInfo = function (e) {
            $('#layers .sidebar-maincontent .list-group').empty();
            sidebar.open('layers');
            $.each(props, function (i, x) {
                if (x != null) $('#layers .sidebar-maincontent .list-group').append('<div class="list-group-item"><p class="list-group-item-text"><strong>' + i.replace(/_/g, ' ').toLowerCase() + '</strong>.  ' + x + '</p></div>');
            });
        };
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
                var onEachFeature = function (feature, layer) { layer.on('click', function (e) { clickLayer(e, feature, layer); }); };
                var pointToLayer = function (feature, latlng) {
                    var options = { icon: 'leaf', borderColor: layer.colour, textColor: layer.colour, backgroundColor: 'transparent' };
                    return L.marker(latlng, { icon: L.BeautifyIcon.icon(options) });
                };
                var newLayer = L.Proj.geoJson(layer.data, { onEachFeature: onEachFeature, pointToLayer: pointToLayer });
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
            $('#divCategories').append('<h5 class="text-muted">' + i + '</h5>');
            $('#divCategories').append('<ul id="layerList' + i + '" class="nav nav-pills nav-stacked"></ul>');
            $.each(x, function (y, l) {
                $('#divCategories #layerList' + i).append('<li class="li-layer" data-layer="' + l.name + '"><a href="#">' + l.name + '</a></li>');
            });
        });

        // Attach click event to the checkboxes
        $('.li-layer a').click(function (evt) {
            evt.preventDefault();
            if ($(evt.target.parentNode).hasClass('active')) {
                removeLayerFromMap(evt.target.parentNode.dataset['layer']);
                $(evt.target.parentNode).removeClass('active');
            } else {
                $(evt.target.parentNode).addClass('active');
                addLayerToMap(evt.target.parentNode.dataset['layer']);
            }
        });
    });
});