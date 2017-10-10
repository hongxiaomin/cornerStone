$(function(){
	(function(){
		var columns=[
			{
				radio: true
			},
			{
				field: 'id',
				title: 'ID',
			},
			{
				field: 'name',
				title: 'Name',
			},
			{
				field: 'type',
				title: 'Type',
			},
			{
				field: 'url',
				title: 'Url',
			},
			{
				field: 'parentId',
				title: 'Parent Name',
			},
			{
				field: 'parentIds',
				title: 'Parents Name',
			},
			{
				field: 'permission',
				title: 'Permission',
			},
			{
				field: 'isEnable',
				title: 'isEnable',
			}
		];
		var url = '';
		var oTable = new TableInit();
			queryParams = function(params) {
			var offset=params.offset;
			var numbers=(offset/params.limit)+1;
			var temp = {
//				pageSize: params.limit,
//				pageNumber: numbers,
			};
			return temp;
		};
		oTable.Init(columns, url, queryParams);
		
	})();
})
