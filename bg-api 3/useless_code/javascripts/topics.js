/**
 * Created by Mbb on 2017/5/29.
 */
$('#itemstable').bootstrapTable({
    url:'/topics/list',//取数据的api地址
    queryParams:function (params) {
        console.log(params)
        var temp = {
            limit:params.limit,//单页数量
            offset:params.offset,//页码
            search:params.search,// 搜索内容
            status:$("#statusSelect").val()
            //传上,当前页最后一个数组的updateTime
            //order 升降顺序,不用
            //search 在需要搜索的地方使用
            //其他参数,可以自定义
        }
        return temp;
    },
    onClickRow:function (row, $element) {
        var url = '/topics/detail?id='+row.id;
        //点击row跳转至详情页
        window.location.href=url;
    },
    dataType:'json',
    toolbar:'#toolbar',
    striped:true,
    cache:false,
    search:true,
    pagination:true,
    sidePagination:'server',
    clickToSelect:true,
    //showColumns: true, //显示列控制按钮
    showRefresh: true, //显示刷新按钮
    //showExport:true,
    //showToggle:true,
    //exportDataType:'all',
    //exportTypes:['csv','excel','txt'],
    //exportOptions:{
    //    fileName: 'units列表'
    //},
    columns:[{
        field:'id',
        title:'ID'
    },{
        field:'title',
        title:'标题'
    },{
        field:'focus',
        title:'焦点语'
    },{
        field:'detail',
        title:'详细描述'
    }]
})