
app.factory('connector', function ($http, $q,$rootScope) {
    var columns = null;
    var lines = null;
    var metrics = null;
    var idx = null;
    var grid = null;
    var categoriesC = null;
    var categoriesL = null;
    var categoriesM = null;
    var newgrid = false;
    var reverse = false;

    var setReverse = function (data) {
        reverse = data;
    }
    var getReverse = function () {
        return reverse;
    }

    var setColumns = function (data) {
        columns = data;
    }
    var getColumns = function () {
        return columns;
    }
    var setIdx = function (data) {
        idx = data;
    }
    var getIdx = function () {
        return idx;
    }
    var setLines = function (data) {
        lines = data;
    }
    var getLines = function () {
        return lines;
    }
    var setMetrics = function (data) {
        metrics = data;
    }
    var getMetrics = function () {
        return metrics;
    }
    var setGrid = function (data) {
        grid = data;
    }
    var getGrid = function () {
        return grid;
    }
    var setCategoriesC = function (data) {
        $rootScope.$emit("categoriesC", data);
    }
    var setCategoriesL = function (data) {
        $rootScope.$emit("categoriesL", data);
    }
    var setCategoriesM = function (data) {
        $rootScope.$emit("categoriesM", data);
    }
    var setNewGrid = function (data) {
        $rootScope.$emit("newGrid", data);
    }
    var getNewGrid = function () {
        return newgrid;
    }
    return {
        setColumns: setColumns,
        getColumns: getColumns,
        setLines: setLines,
        getLines: getLines,
        setMetrics: setMetrics,
        getMetrics: getMetrics,
        setIdx: setIdx,
        getIdx: getIdx,
        setGrid: setGrid,
        getGrid: getGrid,
        setCategoriesC: setCategoriesC,
        setCategoriesL: setCategoriesL,
        setCategoriesM: setCategoriesM,
        setNewGrid: setNewGrid,
        getNewGrid: getNewGrid,
        getReverse: getReverse,
        setReverse:setReverse,
    };
});
