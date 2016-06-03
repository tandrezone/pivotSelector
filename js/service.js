
app.factory('SegmentBuilderM', function() {

    var groupInfo = {
      relation: [
          {value:'horizontal',    name:'horizontal'},
          {value:'vertical',     name:'vertical'},
      ]
    };

    var new_element = {
        criterion: {
            position: -1,
            type: 'criterion',
            id: '-1',
            criterion: ''
        }
    };

    var data = {
        position: 1,
        type: 'group',
        id: 'gr35848',
        relation: 'horizontal',
        elements: [


        ]
    };


    var getNewCriterion = function(position, name, type) {
        var criterion = angular.copy(new_element.criterion);
        criterion.id = 'cr' + Math.floor((Math.random()*100000)+1);
        criterion.position = position;
        criterion.name = name;
        criterion.varype = type
        return criterion;
    };

    var getNewSegment = function(position) {
        var segment = angular.copy(new_element.segment);
        segment.id = 'se' + Math.floor((Math.random()*100000)+1);
        segment.position = position;
        return segment;
    };

    var getNewGroup = function(position) {
        var group = angular.copy(new_element.group);
        group.id = 'gr' + Math.floor((Math.random()*100000)+1);
        group.position = position;
        return group;
    };


    var resetAllIdInThisGroup = function(elements) {
        angular.forEach(elements, function(element, key){
            element.id = element.type + Math.floor((Math.random()*100000)+1);

            if(element.type == 'group') {
                resetAllIdInThisGroup(element.elements);
            }
        });
    };


    var duplicateElement = function(element, position) {
        var duplicate_element = angular.copy(element);
        duplicate_element.id = duplicate_element.type.substr(0, 2) + Math.floor((Math.random()*100000)+1);
        duplicate_element.position = position;

        if(duplicate_element.type == 'group') {
            resetAllIdInThisGroup(duplicate_element.elements);
        }

        return duplicate_element;
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

                        // should be the first
                        if(new_position == 0) {
                            element_to_add.position = ordered_array[0]['position'] - 1;
                        }
                        // should be the last
                        else if(new_position >= ordered_array.length) {
                            element_to_add.position = ordered_array[ordered_array.length-1]['position'] + 1;
                        }
                        // should be in the middle
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
                            console.log('UPDATE > ',new_position,' (elem.position=',new_position_value,') > ', elem);
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
        var is_ok;

        console.log('Move element id ', element_id, ' from group ', parent_id, ' into the group ', new_parent_id, ' at the position ', new_position);

        if(new_parent_id == parent_id) {
          // trouve le groupe parent et change la position de l'element
          is_ok = moveElementInsideGroup([data], element_id, parent_id, new_position);
        }
        else {
          // retrouver l'element dans le segment et le retirer du groupe ou il est
          var element_removed = removeElementFromGroup([data], element_id, parent_id, new_parent_id, new_position);

          // trouver son nouveau groupe, calculer sa nouvelle position et l'inserer
          is_ok = addElementToGroup([data], element_removed, new_parent_id, new_position);
        }


    };



    return {
        getNewCriterion: getNewCriterion,
        getNewSegment: getNewSegment,
        getNewGroup: getNewGroup,
        duplicateElement: duplicateElement,
        moveElement: moveElement,
        groupInfo: groupInfo,
        currentSegment: data
    };
});

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

app.factory('SegmentBuilderL', function() {

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
        type: 'lines',
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
        aux = {"type":"coluna", "elements":[]};
        console.log(convertToWebservice(data.elements, aux.elements));
    };

    var convertToWebservice= function(data, aux){
      for(var a = 0; a < data.length; a++){
        aux.push({"name":data[a].name, "type":data[a].type, "elements":[]})
        if(data[a].elements.length != 0){
          convertToWebservice(data[a].elements, aux.elements)
        }
      }
      return aux;
    }



    return {
        getNewGroup: getNewGroup,
        moveElement: moveElement,
        groupInfo: groupInfo,
        currentSegment: data
    };
});
