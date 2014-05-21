(function(ng, app) {
  'use strict';

  var List = function($timeout, selectBox, elem, scope) {
    this.items = [];
    this.options = [];
    this.$timeout = $timeout;
    this.selectBox = selectBox;
    this.selectBox.bind('change', {'scope': scope}, this.change.bind(this));
    $timeout(function() {
      ng.forEach(selectBox.children('option'), function(option, index) {
        var optionEl = ng.element(option);
        if ($.trim(optionEl.text()) != '') {
          this.options.push(optionEl);
          this.items.push({
            'text': optionEl.text(),
            'value': optionEl.attr('value'),
            'selected': false,
            'index': index
          });
        }
      }, this);
      $timeout(function() {
        elem.find('li').bind('click', function(e) {
          var index = elem.find('li').index(e.target);
          ng.forEach(this.options, function(option, optionIndex) {
            if (optionIndex == index) {
              option.get(0).selected = true;
              option.change();
            }
          });
        }.bind(this));
      }.bind(this));
    }.bind(this));
  };

  List.prototype.change = function(e) {
    var selectedIndex = [];
    ng.forEach(this.selectBox.find('option:selected'), function(option) {
      selectedIndex.push(this.selectBox.find('option').index(option));
    }, this);
    ng.forEach(this.items, function(item) {
      e.data.scope.$apply(function() {
        item.selected = selectedIndex.indexOf(item.index) !== -1;
      });
    }, this);
  };

  var ListDirective = function($compile, $timeout, $parse) {
    return {
      'restrict': 'A',
      'scope': true,
      'replace': true,
      'templateUrl': 'templates/adminui-list.html',
      'link': function(scope, elem, attrs) {
        var list = null;
        var options = attrs['ngOptions'];
        var multiple = $parse(attrs['multiple'])(scope);
        var NG_OPTIONS_REGEXP = new RegExp(
          '^\\s*([\\s\\S]+?)(?:\\s+as\\s+([\\s\\S]+?))' +
          '?(?:\\s+group\\s+by\\s+([\\s\\S]+?))?\\s+for\\s+' +
          '(?:([\\$\\w][\\$\\w]*)|(?:\\(\\s*([\\$\\w][\\$\\w]*)\\s*,\\s*' +
          '([\\$\\w][\\$\\w]*)\\s*\\)))\\s+in\\s+' +
          '([\\s\\S]+?)(?:\\s+track\\s+by\\s+([\\s\\S]+?))?$'
        );
        var optionsMatch = options.match(NG_OPTIONS_REGEXP);
        var optionModelName = optionsMatch[7];
        var selectBox = ng.element('<select>')
          .attr('ng-options', options)
          .attr('ng-change', attrs['ngChange'])
          .attr('ng-model', attrs['ngModel'])
          .append(ng.element('<option>'));
        if (multiple === true) {
          selectBox.attr('multiple', true);
        }
        selectBox = $compile(selectBox)(scope);
        scope.$watch(attrs['ngModel'], function(value, oldValue) {
          if (value !== oldValue) {
            scope.$parent[attrs['ngModel']] = value;
          }
        }, true);
        scope.$parent.$watch(attrs['ngModel'], function(value, oldValue) {
          scope[attrs['ngModel']] = value;
        }, true);
        scope.$watch(optionModelName, function(value, oldValue) {
          list = new List($timeout, selectBox, elem, scope);
          scope.listItems = list.items;
        }, true);
      }
    };
  };

  app.directive('adminuiList',
    ['$compile', '$timeout', '$parse', ListDirective]
  );
})(angular, angular.module('ntd.directives'));