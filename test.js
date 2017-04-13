describe('service tests', function() {
	//beforeEach(module('myApp'));
	//var binarysearch;

//	beforeEach(
//		inject(['binarysearch', function(_binarysearch_){
		// The injector unwraps the underscores (_) from around the parameter names when matching
//		binarysearch = _binarysearch_;
//	}]));
	it('binary search', function() {
		angular.mock.module('myApp');
		var service;
		angular.mock.inject(function GetDependencies(binarysearch) {
			service = binarysearch;
		});
		// your test assertion goes here
		//this.lessthanequalto = function(I, start, end, val){//return largest index a using binary search such that I[a][0] + T[a][1]<= val

		var I = [[1, 6], [3, 6], [5, 6]];
		I.sort(function(a,b){ 	//sort I on basis of endtimes
			if(a[0] +a[1] < b[0] + b[1])return -1;
			if(a[0] + a[1] > b[0] + b[1])return 1;
			return 0;
		});
		console.log(I);
		expect(service.lessthanequalto(I, 0, I.length-1, 2)).toEqual(-1);
		expect(service.lessthanequalto(I, 0, I.length-1, 4)).toEqual(-1);
		expect(service.lessthanequalto(I, 0, I.length-1, 6)).toEqual(-1);
		expect(service.lessthanequalto(I, 0, I.length-1, 8)).toEqual(0);
		expect(service.lessthanequalto(I, 0, I.length-1, 10)).toEqual(1);
		expect(service.lessthanequalto(I, 0, I.length-1, 12)).toEqual(2);

	});
});
