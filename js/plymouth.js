var plymouth = {
    getDataSetsByCategory: function (callback) {
        var categories = {};
        $.each(config.data, function (i, x) {
            if (!categories[x.category]) categories[x.category] = [];
            categories[x.category].push(x);
        });
        callback(categories);
    },
    getLayerByName: function (layerName, callback) {
        var layer = {};
        $.each(config.data, function (k, i) {
            if (this.name === layerName) layer = this;
        });
        if (layer.type === 'geoJson') {
            $.ajax({
                dataType: 'json',
                url: layer.url,
                success: function (data) {
                    layer.data = data;
                    callback(layer);
                    return;
                }
            });
        }
    }
};