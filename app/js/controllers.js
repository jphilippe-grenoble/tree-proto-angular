'use strict';

/* Controllers */

angular.module('myApp.controllers', ['ui.bootstrap'])
    .controller('TreeContoller', ['$scope', '$http', 'pathFactory', function($scope, $http, pathFactory) {


        if (!Array.prototype.last){
            Array.prototype.last = function(){
                return this[this.length - 1];
            };
        }

        $scope.loader = null;
        $scope.isCollapsed = false;
        $scope.clipboard = null;
        $scope.history = null;
        $scope.redoDisabled = true;
        $scope.undoDisabled = true;
        $scope.path = pathFactory.getPath();
        $scope.historyState = -1;
        $scope.histArray = [];

        $scope.update = function() {
          var e, i, _i, _len, _ref;
          _ref = $scope.path;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            e = _ref[i];
            e.pos = i;
          }
          return console.log(['Updated', $scope.path]);
        };

        $scope.sortableOptions = {
            update: $scope.update,
            axis: 'y',
            connectWith: '.ui-sortable'
        };

        $scope.init = function() {
            $scope.histArray = [];

            $http.get('tree.json')
                .success(function(data) {
                    updateHistory(data);
                }
            );
        };

        $scope.undo = function() {
            $scope.historyState = $scope.historyState -1;
            $scope.path = $scope.histArray[$scope.historyState];
            $scope.redoDisabled = false;
            if ($scope.historyState == -1) {
                $scope.undoDisabled = true;
            }
        };

        $scope.redo = function() {
            $scope.historyState = $scope.historyState + 1;
            $scope.path = $scope.histArray[$scope.historyState];
            $scope.undoDisabled = false;
            if ($scope.historyState == $scope.histArray.length - 1) {
                $scope.redoDisabled = true;
            }
        };

        $scope.rename = function() {
            updateHistory($scope.path);
        };

        $scope.remove = function(step) {
            function walk(path) {
                var children = path.children,
                    i;

                if (children) {
                    i = children.length;
                    while (i--) {
                        if (children[i] === step) {
                            return children.splice(i, 1);
                        } else {
                            walk(children[i]);
                        }
                    }
                }
            }

            walk($scope.path.steps[0]);

            updateHistory($scope.path);
        };

        $scope.removeChildren = function(step) {
            step.children = [];

            updateHistory($scope.path);
        };

        $scope.copy = function(step) {
            $scope.clipboard = step;
        };

        $scope.paste = function(step) {
            // Clone voir : http://stackoverflow.com/questions/122102/most-efficient-way-to-clone-an-object
            var stepCopy = jQuery.extend(true, {}, $scope.clipboard);

            stepCopy.name = stepCopy.name + '_copy';

            step.children.push(stepCopy);
            updateHistory($scope.path);
        };

        $scope.addChild = function(step) {
            var post = step.children.length + 1;
            var newName = step.name + '-' + post;

            step.children.push(
                {
                    id         : null,
                    name       : newName,
                    parentId   : null,
                    type       : 'seq',
                    expanded   : true,
                    dataType   : null,
                    dataId     : null,
                    templateId : null,
                    children   : []
                }
            );

            updateHistory($scope.path);
        };

        $scope.saveTemplate = function(path) {
            // TODO
            // $http ... etc
            $http
                .post('../api/index.php/pathtemplates', path)
                .success ( function (data) {
                    alert(data);
                });
        };

        var updateHistory = function(path) {
            //TODO:  CA NE MARCHE PAS!
            if ($scope.historyState !== $scope.histArray.length - 1) {
                $scope.histArray.splice($scope.historyState + 1, $scope.histArray.length - $scope.historyState);
            }

            var pathCopy = jQuery.extend(true, {}, path);
            $scope.histArray.push(pathCopy);

            $scope.historyState = $scope.historyState + 1;

            var pathCopy = jQuery.extend(true, {}, $scope.histArray.last());
            $scope.path = pathCopy;

            $scope.undoDisabled = false;
            $scope.redoDisabled = true;
        }

    }]
);