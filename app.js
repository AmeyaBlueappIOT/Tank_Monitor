var app = angular.module('plunker', ['nvd3']);


app.controller('MainCtrl', function($scope) {
	
	
	 $scope.api = api;
	
	    $scope.api.onSuccess = function(message){

    };
     
        $scope.api.onError = function(message){

    };
    
     $scope.api.onSuccess('Connecting ....');

    $scope.toggleRelay = function() {
        $scope.api.toggleRelay($scope.api.isOn);
    };

    $scope.api.updateUI = function(){
        $scope.$apply();
    };
	
    $scope.options = {
		
        chart: {
            type: 'lineChart',
            height: 400,
            margin : {
                top: 20,
                right: 20,
                bottom: 40,
                left: 55
            },
            x: function(d){ return d.x; },
            y: function(d){ return d.y; },
            useInteractiveGuideline: true,
            duration: 1000,    
            yAxis: {
				axisLabel:'mA',
                tickFormat: function(d){
                   return d3.format('.01f')(d);
                }
            },
            xAxis: {
                axisLabel:'Time',
                tickFormat: function(d){
				
					var d = new Date();
					var currDate = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
                    			return currDate;
				
                }
}
        }
    };
    
  
    
    $scope.data = [{ values: [], key: 'Random Walk' }];
        
    $scope.run = true;
    
    var x = 20;
   
    setInterval(function(){
	    if (!$scope.run) return;
	    $scope.data[0].values.push({ x: x,	y: $scope.api.currentValue});
		
      if ($scope.data[0].values.length > 20) 
		  $scope.data[0].values.shift();
	    $scope.x++;

      $scope.$apply(); // update both chart
    }, 3000);  


app.directive('liquidTank', function ($parse, $http) {
  return {
    restrict: 'E',
    scope: false,
    replace: true,
    transclude: false,
    template: '<div/>',
    link: function (scope, element, attrs) {

      scope.draw = function() {
		  
        if(attrs.hasOwnProperty('canvasId')) {
          scope.canvasId = attrs.canvasId;
        }
        if(attrs.hasOwnProperty('width')) {
          scope.width = attrs.width;
        }
        if(attrs.hasOwnProperty('height')) {
          scope.height = attrs.height;
        }
        if(attrs.hasOwnProperty('steps')) {
          var arr_steps = attrs.steps.split(',');
          scope.steps = [];
          for(var i in arr_steps) {
            scope.steps.push(parseInt(arr_steps[i]));
          }
        }
        if(attrs.hasOwnProperty('liquidColor')) {
          scope.color = [];
          if(attrs.liquidColor === "random") {
            scope.color.push(_.random(0,255));
            scope.color.push(_.random(0,255));
            scope.color.push(_.random(0,255));
          } else {
            var arr_color = attrs.liquidColor.split(',',3);
            for(var j in arr_color) {
              scope.color.push(parseInt(arr_color[j]));
            }
            if(arr_color.length < 2) {
              //fill out 3-element array with copies of the same element
              scope.color.push(parseInt(arr_color[0]));
              scope.color.push(parseInt(arr_color[0]));
            }
            if(arr_color.length === 2) {
              console.log('Caution: wrong format for liquid-color');
            }
          }
        }
  
        element.html('<canvas id="'+scope.canvasId+'" width="'+scope.width+'" height="'+scope.height+'"></canvas>');
  
        //Meter canvas stuff
        var c=document.getElementById(scope.canvasId);
        var pjs = new Processing(c);
        
        pjs.setup = function() {
            pjs.size(c.width,c.height);
           pjs.background(255,255,255,0);
        }
        scope.totalSteps = scope.steps[_.random(scope.steps.length-1)];
		console.log(scope.totalSteps);
		
        scope.filledSteps = window.api.currentValue;//(8/16)*10;//_.random(1,scope.totalSteps-1);
        window.api.updateUI();
        console.log(scope.filledSteps);
        var fillPct = scope.filledSteps/scope.totalSteps;
		console.log(fillPct);
        var fillHeight = c.height*fillPct;
        var lineY = c.height/scope.totalSteps;   // different steps 
        var coloredRing = {red:{r:150,g:50,b:100},green:{r:50,g:150,b:100},blue:{r:50,g:100,b:150}};
         console.log('%c'+'fillHeight: '+fillHeight,'background:#000;color:#bd5');
        pjs.draw = function() {
          //background color
         pjs.fill(200);
		  
		  // rectangle
          pjs.rect(0,20,c.width-1,c.height-40);
          //filled portion
          pjs.fill(scope.color[0],scope.color[1],scope.color[2]);
		  // Bottom Ellipsis
         pjs.ellipse(c.width/2,c.height-20,c.width-1,20);
         pjs.rect(0,lineY*(scope.totalSteps-scope.filledSteps),c.width-1,fillHeight-20);
          //ghetto fix to make bottom of tank look nice
          pjs.stroke(scope.color[0],scope.color[1],scope.color[2]);
          pjs.rect(1,c.height-21,c.width-3,1);
          //top of filled liquid
          if(scope.color[0] > scope.color[1] && scope.color[0] > scope.color[2]) {
            pjs.stroke(coloredRing.red.r,coloredRing.red.g,coloredRing.red.b);
          } else if(scope.color[1] > scope.color[0] && scope.color[1] > scope.color[2]) {
            pjs.stroke(coloredRing.green.r,coloredRing.green.g,coloredRing.green.b);
          } else if(scope.color[2] > scope.color[0] && scope.color[2] > scope.color[1]) {
            pjs.stroke(coloredRing.blue.r,coloredRing.blue.g,coloredRing.blue.b);
          } else {
            pjs.stroke(0);
          }
          pjs.ellipse(c.width/2,lineY*(scope.totalSteps-scope.filledSteps),c.width-3,20);
          //top(closing) ellipsis
          pjs.fill(200);
          pjs.stroke(63);
          pjs.ellipse(c.width/2,20,c.width,20);
          //measurement marks
          pjs.fill(0);
          pjs.stroke(127);
		  
		  // steps print ex: 33% 66%
          for(var i = 1; i < scope.totalSteps; i++) {
             pjs.line(1,lineY*i,40,lineY*i);
            pjs.text((scope.totalSteps-i)*Math.floor(100/scope.totalSteps)+'%',42,lineY*i+5);
          }
        }
        
        pjs.setup();
        pjs.draw();
      }
      
      scope.draw();

    }
  }
});

function callSomething()
{
		console("callSomething");
}

function callNewValues($scope)
{
	
	console.log("calling new values--"+$scope.i);
	
	
	
}
