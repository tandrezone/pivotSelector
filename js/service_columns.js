app.factory('SegmentBuilderC', function() {

    var groupInfo = {

    };

    var new_element = {
        group: {
            position: -1,
            type: 'group',
            id: '-1',
            elements: []
        }
    };

    var data = {
        position: 1,
        type: 'line',
        elements: [

        ]
    };
    var getNewGroup = function(position, name, type) {
        var group = angular.copy(new_element.group);
        group.id = 'gr' + Math.floor((Math.random()*100000)+1);
        group.position = position;
        group.name = name;
        group.vartype = type
        return group;
    };


    var resetAllIdInThisGroup = function(elements) {
      debugger;
        angular.forEach(elements, function(element, key){
            element.id = element.type + Math.floor((Math.random()*100000)+1);
            resetAllIdInThisGroup(element.elements);
        });
    };


    var removeElementFromGroup = function (elements_array, element_id, parent_id) {
        if(elements_array) {
            for(var i = 0; i < elements_array.length; i++) {
                if(elements_array[i].id == parent_id) {
                    var removed = _.remove(elements_array[i].elements, function(elem) { return elem.id === element_id; });
                    if(removed.length == 1) {
                        return removed[0];
                    }
                    else {
                        console.error('removeElementFromGroup - BIG FAIL..');
                    }
                }
                var found = removeElementFromGroup(elements_array[i].elements, element_id, parent_id);
                if(found) return found;
            }
        }
    };

    var addElementToGroup = function(elements_array, element_to_add, new_parent_id, new_position) {
        if(elements_array) {
            for(var i = 0; i < elements_array.length; i++) {
                if(elements_array[i].id == new_parent_id) {

                    if(elements_array[i].elements.length > 0) {
                        var ordered_array = _.sortBy(_.map(elements_array[i].elements, function(elem) { return {id: elem.id, position: elem.position}; }), 'position');

                        if(new_position == 0) {
                            element_to_add.position = ordered_array[0]['position'] - 1;
                        }
                        else if(new_position >= ordered_array.length) {
                            element_to_add.position = ordered_array[ordered_array.length-1]['position'] + 1;
                        }
                        else {
                            var previous_position = ordered_array[new_position-1]['position'];
                            var next_position = ordered_array[new_position]['position'];
                            element_to_add.position = (previous_position + next_position)/2;
                        }
                    }
                    else {
                        element_to_add.position = 1;
                    }

                    elements_array[i].elements.push(element_to_add);
                    return true;
                }
                var done = addElementToGroup(elements_array[i].elements, element_to_add, new_parent_id, new_position);
                if(done) return done;
            }
        }
    }

    var moveElementInsideGroup = function(elements_array, element_id, parent_id, new_position) {
        if(elements_array) {
            for(var i = 0; i < elements_array.length; i++) {
                if(elements_array[i].id == parent_id) {

                    // recupere tous les id ordonnés par position
                    var ordered_array = _.sortBy(_.map(elements_array[i].elements, function(elem) { return {id: elem.id, position: elem.position}; }), 'position');
                    var new_position_value;

                    // verif si on déplace elem a une position superieure à l'actuelle
                    for(var j = 0; j < ordered_array.length; j++) {
                        if(ordered_array[j]['id'] == element_id) {
                            var current_position = j;

                            // si oui on decrémente la position cible
                            if(new_position > current_position && new_position > 0) {
                                new_position--;
                            }
                            break;
                        }
                    }
                    _.remove(ordered_array, function(elem) { return elem.id === element_id; });

                    // should be the first
                    if(new_position == 0) {
                        new_position_value = ordered_array[0]['position'] - 1;
                    }
                    // should be the last
                    else if(new_position >= ordered_array.length) {
                        new_position_value = ordered_array[ordered_array.length-1]['position'] + 1;
                    }
                    // should be in the middle
                    else {
                        var previous_position = ordered_array[new_position-1]['position'];
                        var next_position = ordered_array[new_position]['position'];
                        new_position_value = (previous_position + next_position)/2;
                    }

                    _.forEach(elements_array[i].elements, function(elem) {
                        if(elem.id == element_id) {
                            elem.position = new_position_value;
                        }
                    });
                }
                var done = moveElementInsideGroup(elements_array[i].elements, element_id, parent_id, new_position);
                if(done) return done;
            }
        }
    };

    // adapt all recursive with:
    // http://blog.wax-o.com/2014/01/how-to-find-deep-and-get-parent-in-javascript-nested-objects-with-recursive-functions-and-the-reference-concept-level-beginner/
    var moveElement = function(element_id, parent_id, new_parent_id, new_position) {
      var jsonToSend = JSON.stringify(data);

        var is_ok;
        if(new_parent_id == parent_id) {
          is_ok = moveElementInsideGroup([data], element_id, parent_id, new_position);
        }
        else {
          var element_removed = removeElementFromGroup([data], element_id, parent_id, new_parent_id, new_position);
          is_ok = addElementToGroup([data], element_removed, new_parent_id, new_position);
        }
        var jsonToSend = JSON.stringify(data);
        console.log(jsonToSend);
        console.log(data);
    };



    return {
        getNewGroup: getNewGroup,
        moveElement: moveElement,
        groupInfo: groupInfo,
        currentSegment: data
    };
});
