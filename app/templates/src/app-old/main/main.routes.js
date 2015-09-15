angular.module('<%= dotModuleName %>')

.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
        .state('index', {
            url: "",
            views: {
                "viewA": { template: "index.viewA" },
                "viewB": { template: "index.viewB" }
            }
        });
}])

;