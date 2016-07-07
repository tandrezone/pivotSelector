//controlador colunas

    app.controller('MainControllerC', function ($scope, $rootScope, SegmentBuilderC, apiCall, connector, SegmentBuilderL) {
        apiCall.getDefaultByID(connector.getIdx()).then(function (response) {
            var defC = JSON.parse(response.Json);
            if (!$.isEmptyObject(defC)) {
                SegmentBuilderC.setData(defC);
                apiCall.getRequest(SegmentBuilderC.currentSegment).then(function (response) {
                    connector.setNewGrid(response);
                });
            }
            $scope.dataMainGroup = SegmentBuilderC.currentSegment;
        });

        $scope.$on('reverse', function (e, attr) {
            if (attr) {
                $scope.dataMainGroup = SegmentBuilderL.currentSegment;
            } else {
                $scope.dataMainGroup = SegmentBuilderC.currentSegment;
            }
        });
    });
    //controlador linhas

    app.controller('MainControllerL', function ($scope, $rootScope, SegmentBuilderL, apiCall, connector, SegmentBuilderC) {
        apiCall.getDefaultByID(connector.getIdx()).then(function (response) {
            var defL = JSON.parse(response.Json)
            if (!$.isEmptyObject(defL)) {
                SegmentBuilderL.setData(defL);
                apiCall.getRequest(SegmentBuilderL.currentSegment).then(function (response) {
                    connector.setNewGrid(response);
                });
            }
            $scope.dataMainGroup = SegmentBuilderL.currentSegment;
        });
        $scope.$on('reverse', function (e, attr) {
            if (attr) {
                $scope.dataMainGroup = SegmentBuilderC.currentSegment;
            } else {
                $scope.dataMainGroup = SegmentBuilderL.currentSegment;
            }
        });
    });

    //controlador metricas
    app.controller('MainControllerM', function ($scope, $rootScope, SegmentBuilderM, apiCall, connector) {
        apiCall.getDefaultByID(connector.getIdx()).then(function (response) {
            var defM = JSON.parse(response.Json)
            if (!$.isEmptyObject(defM)) {
                SegmentBuilderM.setData(defM);
                apiCall.getRequest(SegmentBuilderM.currentSegment).then(function (response) {
                    connector.setNewGrid(response);
                });
            }
            $scope.dataMainGroup = SegmentBuilderM.currentSegment;
        });
    });

    app.controller('saver', function ($scope, $rootScope, apiCall) {
        $scope.saving = function (evt) {
            evt.preventDefault();
            apiCall.savingDef();
        }
    });

    app.controller('filtros', function ($scope, $rootScope, SegmentBuilderM, apiCall, connector) {
        $scope.ChangeSelect = function () {
            var getRequest = false;
            var genres = $("#LSB_Genres").val();
            if (genres != null) {
                getRequest = true;
            }
            var channels = $("#LSB_Channels").val();
            if (channels != null) {
                getRequest = true;
            }

            if (getRequest) {
                apiCall.getRequest(SegmentBuilderM.currentSegment).then(function (response) {
                    connector.setNewGrid(response);
                });
            }

        }
    });

    app.controller('begin', function ($scope, $rootScope, apiCall, connector, SegmentBuilderC, SegmentBuilderL, SegmentBuilderM, $timeout, $compile) {

        var pivotSettingDefaultId = 0;
        var target = $("#HF_Target").val();

        switch (target) {
            case "channel":
                {
                    pivotSettingDefaultId = 5;
                    break;
                }
            case "daypart":
                {
                    var daypart = $("#HF_DaypartC").val();

                    if (daypart === "2") {
                        pivotSettingDefaultId = 3;
                    }
                    else {
                        pivotSettingDefaultId = 2;
                    }
                    break;
                }
            case "rapportEmissions":
                {
                    pivotSettingDefaultId = 1;
                    break;
                }
            case "rapportIndicateurQualite":
                {
                    pivotSettingDefaultId = 6;
                    break;
                }
            default:
                {
                    pivotSettingDefaultId = $("#pivotgrid_setting").attr("idx");
                    if (!pivotSettingDefaultId) {
                        pivotSettingDefaultId = 0;
                    }
                }
            }

        connector.setIdx(pivotSettingDefaultId);

        $scope.getPivot = function (evt) {
            evt.preventDefault();
            $("#pivot").html("<div pivot></div>");
            $compile($("#pivot").contents())($scope);
        }
        $scope.reverse = function (evt) {
            var isReversed = connector.getReverse();
            if (!isReversed) {
                evt.preventDefault();
                $scope.$broadcast('reverse', true);
                connector.setReverse(true);
            } else {
                evt.preventDefault();
                $scope.$broadcast('reverse', false);
                connector.setReverse(false);

            }
            apiCall.getRequest(SegmentBuilderC.currentSegment, null, null, SegmentBuilderC.currentSegment, SegmentBuilderL.currentSegment).then(function (response) {
                connector.setNewGrid(response);
            });
        }
    });


    app.controller('grid', function ($scope, $rootScope, apiCall, connector, $log, $interval, $timeout) {
        $scope.page = 1;

        $scope.nrResults = 20;
        $scope.begin = 0;
        $scope.nrofpages = $scope.total;

        var paginating = new Array();

        $rootScope.$on('newGrid', function (event, grid) {
            $scope.Data = grid.data.Result;
        });

        $rootScope.$on('newGrid', function (event, grid) {
            $scope.total = grid.data.TotalRows;
            $scope.nrofpagesPernrofResults = Math.ceil($scope.total / $scope.nrofpages);
            $scope.nrxOptions = [{ val: $scope.total, txt: "All" }, { val: 20, txt: 20 }, { val: 60, txt: 60 }, { val: 150, txt: 150 }];

            if ($scope.nrofpagesPernrofResults <= 1) {
                $scope.nrofpagesPernrofResults = 1;
            }

            $('#page-selection').bootpag({
                total: $scope.nrofpagesPernrofResults,
                page: $scope.page,
                maxVisible: 5,
                leaps: true,
                firstLastUse: true,
                first: '←',
                last: '→',
                wrapClass: 'pagination',
                activeClass: 'active',
                disabledClass: 'disabled',
                nextClass: 'next',
                prevClass: 'prev',
                lastClass: 'last',
                firstClass: 'first'
            }).on("page", function (event, num) {
                changePage(num);
            });
        });

        $rootScope.$on('newGrid', function (event, grid) {
            $timeout(function () {
                if (jQuery("#sel1 option").eq(0).val() != $scope.total) {
                    jQuery("#sel1 option").eq(0).remove();
                }
                $("body").getNiceScroll().resize();
            });
        });

        $scope.clean = function (text) {
            return text;
        }

        $scope.$watch(
                       "page",
                       function handleFooChange(newValue, oldValue) {
                           getRequestPerPage();
                       }
                   );

        $scope.$watch(
                   "nrofpages",
                   function handleFooChange(newValue, oldValue) {
                       getRequestPerPage();
                   }
               );

        var getRequestPerPage = function () {
            apiCall.getRequest($scope.data, $scope.page, $scope.nrofpages).then(function (response) {
                   connector.setNewGrid(response);
            });
        }

        var changePage = function (num) {
            $timeout(function () {
                $scope.page = num;
            });
        }
    });
