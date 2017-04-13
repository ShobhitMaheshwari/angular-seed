describe('service tests', function() {
	it('binary search', function() {
		angular.mock.module('myApp');
		var service;
		angular.mock.inject(function GetDependencies(binarysearch) {
			service = binarysearch;
		});
		// your test assertion goes here

		var I = [[1, 6], [3, 6], [5, 6]];
		I.sort(function(a,b){ 	//sort I on basis of endtimes
			if(a[0] +a[1] < b[0] + b[1])return -1;
			if(a[0] + a[1] > b[0] + b[1])return 1;
			return 0;
		});
		//return largest index a using binary search such that I[a][0] + T[a][1]<= val
		expect(service.lessthanequalto(I, 0, I.length-1, 2)).toEqual(-1);
		expect(service.lessthanequalto(I, 0, I.length-1, 4)).toEqual(-1);
		expect(service.lessthanequalto(I, 0, I.length-1, 6)).toEqual(-1);
		expect(service.lessthanequalto(I, 0, I.length-1, 8)).toEqual(0);
		expect(service.lessthanequalto(I, 0, I.length-1, 10)).toEqual(1);
		expect(service.lessthanequalto(I, 0, I.length-1, 12)).toEqual(2);

		//return smallest index a using binary search such that I[a][0] >= val
		expect(service.greaterthanequalto(I, 0, I.length-1, 0)).toEqual(0);
		expect(service.greaterthanequalto(I, 0, I.length-1, 2)).toEqual(1);
		expect(service.greaterthanequalto(I, 0, I.length-1, 4)).toEqual(2);
		expect(service.greaterthanequalto(I, 0, I.length-1, 6)).toEqual(-1);
		expect(service.greaterthanequalto(I, 0, I.length-1, 8)).toEqual(-1);
		expect(service.greaterthanequalto(I, 0, I.length-1, 10)).toEqual(-1);

	});

	it('binning', function(){
		angular.mock.module('myApp');
		var service;
		angular.mock.inject(function GetDependencies(binning) {
			service = binning;
		});

		expect(service.binning([3, 11], 10, 2)).toEqual([ 1, 2, 1, 1, 1 ]);
		expect(service.binning([3, 9], 10, 2)).toEqual([ 1, 1, 1, 1, 1 ]);
		expect(service.binning([3, 10], 10, 2)).toEqual([ 1, 1, 1, 1, 1 ]);
		expect(service.binning([13, 11], 10, 2)).toEqual([ 1, 2, 1, 1, 1 ]);
	});

	it('plotData', function(){
		angular.mock.module('myApp');
		var service;
		angular.mock.inject(function GetDependencies(plotData) {
			service = plotData;
		});

		var I = [[1,6], [3,10], [5,6], [9, 8], [15, 6], [19, 6], [23, 4]];
		var list = Array.from(service.getOverlapIntervals(I, [8, 10]));
		list.sort(function(a,b){
			if(a[0]  < b[0])return -1;
			if(a[0]  > b[0])return 1;
			return 0;
		});

		expect(list.length).toEqual(4);
		expect(list).toEqual([[3,10],[5,6],[9, 8],[15,6]]);
	});

});