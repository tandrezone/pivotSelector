//Este serviço destina-se a lidar com os dados provenientes das metricas
//depende da apiCall
app.factory('SegmentBuilderM', function (apiCall, connector,$log) {
    //aqui é definido se é horizontal ou vertical
    var groupInfo = {
        relation: [
            { value: 'horizontal', name: 'horizontal' },
            { value: 'vertical', name: 'vertical' },
        ]
    };
    //aqui é o json de cada elemento novo criado
    var new_element = {
        criterion: {
            position: -1,
            type: 'criterion',
            id: '-1',
            criterion: ''
        }
    };
    //json inicial

    var data = {
        position: 1,
        type: 'metrics',
        id: 'gr35848',
        relation: 'horizontal',
        elements: [


        ]
    };

    response = null;

    var setData = function (newData) {
        data.relation = newData[2].relation;
        data.elements = newData[2].elements;
        apiCall.getCategories().then(function (response) {
            response = removeFromCategories(data, response);
            connector.setCategoriesM(response);
        });
    }
    var removeFromCategories = function (data, response) {
        for (var i = 0; i < data.elements.length; i++) {
            for (var b = 0; b < response.variables.length; b++) {
                if (response.variables[b].name == data.elements[i].name) {
                    response.variables[b].remove = 1;
                }
            }
            if (data.type != 'metrics') {
                if (data.elements[i].elements.length != 0) {
                    removeFromCategories(data.elements[i], response);
                }
            }

        }
        return response
    }


    var getNewCriterion = function (position, name, type, code) {
        var criterion = angular.copy(new_element.criterion);
        criterion.id = 'cr' + Math.floor((Math.random() * 100000) + 1);
        criterion.position = position;
        criterion.name = name;
        criterion.varype = type
        criterion.code = code;
        return criterion;
    };

    var getNewSegment = function (position) {
        var segment = angular.copy(new_element.segment);
        segment.id = 'se' + Math.floor((Math.random() * 100000) + 1);
        segment.position = position;
        return segment;
    };

    var getNewGroup = function (position) {
        var group = angular.copy(new_element.group);
        group.id = 'gr' + Math.floor((Math.random() * 100000) + 1);
        group.position = position;
        return group;
    };


    var resetAllIdInThisGroup = function (elements) {
        angular.forEach(elements, function (element, key) {
            element.id = element.type + Math.floor((Math.random() * 100000) + 1);

            if (element.type == 'group') {
                resetAllIdInThisGroup(element.elements);
            }
        });
    };


    var duplicateElement = function (element, position) {
        var duplicate_element = angular.copy(element);
        duplicate_element.id = duplicate_element.type.substr(0, 2) + Math.floor((Math.random() * 100000) + 1);
        duplicate_element.position = position;

        if (duplicate_element.type == 'group') {
            resetAllIdInThisGroup(duplicate_element.elements);
        }

        return duplicate_element;
    };


    var removeElementFromGroup = function (elements_array, element_id, parent_id) {
        if (elements_array) {
            for (var i = 0; i < elements_array.length; i++) {
                if (elements_array[i].id == parent_id) {
                    var removed = _.remove(elements_array[i].elements, function (elem) { return elem.id === element_id; });
                    if (removed.length == 1) {
                        return removed[0];
                    }
                    else {
                        console.error('removeElementFromGroup - BIG FAIL..');
                    }
                }
                var found = removeElementFromGroup(elements_array[i].elements, element_id, parent_id);
                if (found) return found;
            }
        }
    };

    var addElementToGroup = function (elements_array, element_to_add, new_parent_id, new_position) {
        if (elements_array) {
            for (var i = 0; i < elements_array.length; i++) {
                if (elements_array[i].id == new_parent_id) {

                    if (elements_array[i].elements.length > 0) {
                        var ordered_array = _.sortBy(_.map(elements_array[i].elements, function (elem) { return { id: elem.id, position: elem.position }; }), 'position');

                        if (new_position == 0) {
                            element_to_add.position = ordered_array[0]['position'] - 1;
                        }
                        else if (new_position >= ordered_array.length) {
                            element_to_add.position = ordered_array[ordered_array.length - 1]['position'] + 1;
                        }
                        else {
                            var previous_position = ordered_array[new_position - 1]['position'];
                            var next_position = ordered_array[new_position]['position'];
                            element_to_add.position = (previous_position + next_position) / 2;
                        }
                    }
                    else {
                        element_to_add.position = 1;
                    }

                    elements_array[i].elements.push(element_to_add);
                    return true;
                }
                var done = addElementToGroup(elements_array[i].elements, element_to_add, new_parent_id, new_position);
                if (done) return done;
            }
        }
    }

    var moveElementInsideGroup = function (elements_array, element_id, parent_id, new_position) {
        if (elements_array) {
            for (var i = 0; i < elements_array.length; i++) {
                if (elements_array[i].id == parent_id) {

                    var ordered_array = _.sortBy(_.map(elements_array[i].elements, function (elem) { return { id: elem.id, position: elem.position }; }), 'position');
                    var new_position_value;

                    for (var j = 0; j < ordered_array.length; j++) {
                        if (ordered_array[j]['id'] == element_id) {
                            var current_position = j;

                            if (new_position > current_position && new_position > 0) {
                                new_position--;
                            }
                            break;
                        }
                    }
                    _.remove(ordered_array, function (elem) { return elem.id === element_id; });

                    if (new_position == 0) {
                        new_position_value = ordered_array[0]['position'] - 1;
                    }
                    else if (new_position >= ordered_array.length) {
                        new_position_value = ordered_array[ordered_array.length - 1]['position'] + 1;
                    }
                    else {
                        var previous_position = ordered_array[new_position - 1]['position'];
                        var next_position = ordered_array[new_position]['position'];
                        new_position_value = (previous_position + next_position) / 2;
                    }

                    _.forEach(elements_array[i].elements, function (elem) {
                        if (elem.id == element_id) {
                            elem.position = new_position_value;
                        }
                    });
                }
                var done = moveElementInsideGroup(elements_array[i].elements, element_id, parent_id, new_position);
                if (done) return done;
            }
        }
    };

    // adapt all recursive with:
    // http://blog.wax-o.com/2014/01/how-to-find-deep-and-get-parent-in-javascript-nested-objects-with-recursive-functions-and-the-reference-concept-level-beginner/

    var moveElement = function (element_id, parent_id, new_parent_id, new_position) {
        var is_ok;

        if (new_parent_id == parent_id) {
            is_ok = moveElementInsideGroup([data], element_id, parent_id, new_position);
        }
        else {
            var element_removed = removeElementFromGroup([data], element_id, parent_id, new_parent_id, new_position);

            is_ok = addElementToGroup([data], element_removed, new_parent_id, new_position);
        }
        apiCall.getRequest(data).then(function (response) {
            connector.setGrid(response);
        });

    };



    return {
        getNewCriterion: getNewCriterion,
        getNewSegment: getNewSegment,
        getNewGroup: getNewGroup,
        duplicateElement: duplicateElement,
        moveElement: moveElement,
        groupInfo: groupInfo,
        setData: setData,
        currentSegment: data
    };
});
