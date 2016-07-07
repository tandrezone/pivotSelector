
app.factory('apiCall', function ($http, $q, connector, $log, $rootScope, $timeout) {
    var saving = false;
    var jsonD = {};
    var idJsonSave = 0;
    var cleanReqCat = null;
    var cleanReqLine = null;
    var cleanReqMetrics = null;
    var savingPossible = false;
    var url = "";
    var kid = 0;
    var aux = 0;
    var request = 1;
    var pivotDefaultUrl = '/Services/PivotGrid.asmx/PivotSettingsDefaultsGet';
    var pivotDefaultByIdUrl = '/Services/PivotGrid.asmx/PivotSettingsDefaultsGetByID';
    var pivotSettingsUrl = '/Services/PivotGrid.asmx/PivotSettingsGet';
    var pivotRequestUrl = '/Services/PivotGrid.asmx/PivotDataGet';
    var pivotSaveUrl = '/Services/PivotGrid.asmx/PivotSettingsDefaultsSave';


    /*
     * getCategories()
     * Vai buscar as categorias ao webservice para mostrar na modal
     * @param ()
     * @return (promise) (promise é um callback)
     */
    var getCategories = function () {
        var deferred = $q.defer();
        $http.post(pivotSettingsUrl).success(function (response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    }

    /*
     * save()
     * Esta função destina-se a indicar ao sistema que os dados vao ser guardados em vez de serem enviados ao webservice
     * @param (obj(json), int)
     * @return (boolean)
     */

    var save = function (json, id) {
        jsonD = json;
        idJsonSave = id;
        saving = true;
        return true;
    }

    /*
    * getDefaults()
    * Vai buscar as settings para as colunas linhas e metricas default
    * @param ()
    * @return (promise) (promise é um callback)
    */
    var getDefaultByID = function (id) {
        var deferred = $q.defer();
        $http.get(pivotDefaultByIdUrl + "?id=" + id).success(function (response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    }

    /*
    * getDefaults()
    * Vai buscar as settings para as colunas linhas e metricas default
    * @param ()
    * @return (promise) (promise é um callback)
    */
    var getDefaults = function () {
        var deferred = $q.defer();
        $http.post(pivotDefaultUrl).success(function (response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    }

    /*
    * getRequest()
    * Vai buscar as linhas, colunas e metricas, quanto todas sao preenchidas enviapara o webservice
    * @param (obj(json))
    * @return (promise) (promise é um callback)
    */
    var getRequest = function (data, page, nrItems, dataL, dataC) {
        var pageNumber
        var deferred = $q.defer();
        if (data != undefined) {

            switch (data.type) {
                case 'columns':
                    cleanReqCat = { "category": "columns", "elements": data.elements };
                    break;
                case 'lines':
                    cleanReqLine = { "category": "lines", "elements": data.elements };
                    break;
                case 'metrics':
                    cleanReqMetrics = { "category": "metrics", "relation": data.relation, "elements": data.elements };
                    break;
            }
            if (dataC != null && dataL != null) {
                var reversed = connector.getReverse();
                if (!reversed) {
                    cleanReqCat = { "category": "lines", "elements": dataC.elements };
                    cleanReqLine = { "category": "columns", "elements": dataL.elements };
                }
                else {
                    cleanReqCat = { "category": "columns", "elements": dataC.elements };
                    cleanReqLine = { "category": "lines", "elements": dataL.elements };
                }
            }

        }

        if (!saving) {
            if (cleanReqCat != null && cleanReqLine != null && cleanReqMetrics != null) {
                request = [cleanReqCat, cleanReqLine, cleanReqMetrics];
                request = JSON.stringify(request);
                connector.getGrid(null);
                $log.debug("{'Categories':" + request + "}")

                var genres = $("#LSB_Genres").val();

                if (!genres) {
                    genres = $('#HF_GenresC').val();

                    if (!genres) {
                        genres = "";
                    }
                }

                var channels = $("#LSB_Channels").val();

                if (!channels) {
                    channels = $('#HF_ChannelsC').val();

                    if (!channels) {
                        channels = "";
                    }
                }

                if (page != undefined) {
                    pageNumber = page;
                } else {
                    pageNumber = 0;
                }
                if (nrItems != undefined) {
                    pageTotalRecords = nrItems;
                } else {
                    pageTotalRecords = 0;
                }

                //alertify.log("DATA SENDED");

                var start = new Date().getTime();

                var userId = 1;

                var startDate = $('#HF_StartDateC').val().replace(/\-/g, '');

                var endDate = $('#HF_EndDateC').val().replace(/\-/g, '');

                var daypart = $('#HF_DaypartC').val();

                var progName = $('#HF_ProgramNameC').val();

                var progId = $('#HF_ProgramId').val();

                var q = $("#TB_Title").val();

                if (!startDate || startDate === "undefined") {
                    startDate = '';
                }

                if (!endDate || endDate === "undefined") {
                    endDate = '';
                }

                if (!channels || channels === "undefined") {
                    channels = '';
                }

                if (!genres || genres === "undefined") {
                    genres = '';
                }

                if (!daypart || daypart === "undefined") {
                    daypart = '';
                }

                if (!progName || progName === "undefined") {
                    progName = '';
                }

                if (!progId || progId === "undefined") {
                    progId = '';
                }

                if (!q || q === "undefined") {
                    q = '';
                }

                //$('#HF_GendersC').val();
                //$('#HF_CspC').val();
                //$('#HF_JourneyC').val();
                //$('#HF_AgeC').val();

                var url = pivotRequestUrl + "?request=" + request + "&userId=" + userId + "&startDate=" + startDate + "&endDate=" + endDate + "&channels=" + channels + "&genres=" + genres + "&vars=&q=" + q + "&progName=" + progName + "&dayparts=" + daypart + "&pageNumber=" + pageNumber + "&resultsByPage=" + pageTotalRecords + "&progId=" + progId;
                $log.debug(url);

                $timeout(function () {
                    $("body").getNiceScroll().resize();
                });

                $http({
                    method: "GET",
                    url: url,
                }).then(function mySucces(response) {
                    var end = new Date().getTime();
                    var time = end - start;
                    if (response.data != "") {
                        deferred.resolve(response);
                        //alertify.success("DATA RECIVED IN " + time + "ms NUMBER OF ROWS: " + response.data.Result.Rows.length);
                        connector.setNewGrid(response);
                        deferred.resolve(data);
                    } else {
                        $(".glyphicon-refresh").parent().html("Erreur , aucune réponse")
                    }

                }, function myError(response) {
                    alertify.error("ERROR");
                });



            }
        }
        return deferred.promise;
    }
    /*
    * savingDef()
    * É chamada quando é feito save das defeniçoes default
    * @param ()
    * @return (String)
    */
    var savingDef = function () {
        if (!cleanReqCat) {
            cleanReqCat = { "category": "columns", "elements": [] };
        }

        if (!cleanReqLine) {
            cleanReqLine = { "category": "lines", "elements": [] };
        }

        if (!cleanReqMetrics) {
            cleanReqMetrics = { "category": "metrics", "elements": [] };
        }

        var json = [cleanReqCat, cleanReqLine, cleanReqMetrics];
        var id = idJsonSave;
        var url = pivotSaveUrl + "?id=" + id + "&json=" + JSON.stringify(json);
        $http.get(url);
        alertify.success("SAVED");
    }
    return {
        getCategories: getCategories,
        getRequest: getRequest,
        getDefaults: getDefaults,
        getDefaultByID: getDefaultByID,
        save: save,
        savingDef: savingDef,
    };
});
