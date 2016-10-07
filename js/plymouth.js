var plymouth = {
    getDataSetsByCategory: function (callback) {
        var categories = {};
        $.each(config.data, function (i, x) {
            if (!categories[x.category]) categories[x.category] = [];
            categories[x.category].push(x);
        });
        callback(categories);
    }
};