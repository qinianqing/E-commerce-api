/**
 * Created by Mbb on 2017/5/2.
 */
var ID = ''

//展现modal
function showAddUnitModal(row, $element) {
    //展现name、开始日期、托管天数、代码、开饭时间、规格、fb状态、用户名、手机号、订单留言、取餐点
    var name = '<label class="info-item control-label">计划名称:'+row.name+'</label>';
    var beginTime = '<label class="info-item control-label">开始时间:'+row.startDate+'</label>';
    var duration = '<label class="info-item control-label">托管天数:'+row.duration+'</label>';
    var code = '<label class="info-item control-label">代码:'+row.code+'</label>';
    var time = '<label class="info-item control-label">开饭时间:'+row.time+'</label>';
    var size = '<label class="info-item control-label">规格:'+row.size+'</label>';
    var fb = '<label class="info-item control-label">开始时间:'+row.fb+'</label>';
    var user_name = '<label class="info-item control-label">用户名:'+row.user_name+'</label>';
    var mobile = '<label class="info-item control-label">联系方式:'+row.mobile+'</label>';
    var message = '<label class="info-item control-label">开始时间:'+row.message+'</label>';
    var station = '<label class="info-item control-label">开始时间:'+row.station+'</label>';
    $('.modal-information').prepend(name,beginTime,duration,code,time,size,fb,user_name,mobile,message,station);

    // 用editable表格做一个多行表格
    ID = row.ID;
    $('#handletable').bootstrapTable('refresh');


    $('#addUnitModal').modal('show');
}

$('#handletable').bootstrapTable({
    //data:dayArray,
    url:'/planorders/plandates',//取数据的api地址
    queryParams:function (params) {
        var temp = {
            ID:ID
        }
        return temp;
    },
    cache:false,
    onEditableSave: function (field, row, oldValue, $el) {
        var data = {
            ID:ID,
            data:row
        }
        $.ajax({
            type: "post",
            url: "/planorders/handle",
            contentType:"application/json",
            // 必须把这个计划的ID传上去
            data: JSON.stringify(data),
            success: function (data, status) {
                if (data == "ok") {
                    alert("保存成功");
                }else if (data == 'illegal'){
                    $(window).attr('location','/login');
                }else {
                    alert(data)
                }
            },
            error: function () {
                alert("Error");
            },
            complete: function () {
                //刷新表格
                $('#handletable').bootstrapTable('refresh');
            }

        });
    },
    columns:[{
        field:'index',
        title:'第几天'
    },{
        field:'detail',
        title:'日期(点击编辑)',
        editable:{
            type:'date',
            title:'编辑日期',
            disabled:false,
            format: 'yyyy-mm-dd',
            viewformat: 'yyyy-mm-dd',
            datepicker: {
                weekStart: 1
            },
            validate:function (value) {
                value = $.trim(value);
                if (!value) {
                    return '不能为空';
                }
            }
        }
    }]

})

$('.form_datetime').datetimepicker({
    format:'yyyy-mm-dd',
    language:  'fr',
    weekStart: 1,
    todayBtn:  1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    minView: 2,
    forceParse: 0,
    todayBtn:console.log('加载')
});
$('#addUnitModal').on('hidden.bs.modal', function () {
    // 执行删除页面元素任务
    $('#hostplantable').bootstrapTable('refresh');
    $('.info-item').remove();
    $('.form_datetime').remove();
})

// 监控变动
$("#statusSelect").change(function(){
    $('#hostplantable').bootstrapTable('refresh');
});

$('#hostplantable').bootstrapTable({
    url:'/planorders/list',//取数据的api地址
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
        //添加日期modal
        showAddUnitModal(row, $element);
        console.log(row)
    },
    dataType:'json',
    toolbar:'#toolbar',
    striped:true,
    cache:false,
    search:true,
    pagination:true,
    sidePagination:'server',
    clickToSelect:true,
    showColumns: true, //显示列控制按钮
    showRefresh: true, //显示刷新按钮
    //showExport:true,
    showToggle:true,
    //exportDataType:'all',
    //exportTypes:['csv','excel','txt'],
    //exportOptions:{
    //    fileName: 'units列表'
    //},
    columns:[{
        field:'startDate',
        title:'开始日期'
    },{
        field:'duration',
        title:'托管天数'
    },{
        field:'code',
        title:'代码'
    },{
        field:'name',
        title:'名称'
    },{
        field:'time',
        title:'开饭时间'
    },{
        field:'size',
        title:'规格'
    },{
        field:'goUpstairs',
        title:'送餐上楼'
    },{
        field:'fb',
        title:'fb状态'
    },{
        field:'fc',
        title:'fc状态'
    },{
        field:'yz',
        title:'yz状态'
    },{
        field:'user_name',
        title:'用户名'
    },{
        field:'mobile',
        title:'手机'
    },{
        field:'avoid',
        title:'忌口'
    },{
        field:'message',
        title:'留言'
    },{
        field:'station',
        title:'站点'
    },{
        field:'stationD',
        title:'地区'
    },{
        field:'stationA',
        title:'地址'
    },{
        field:'stationP',
        title:'联系电话'
    },{
        field:'orderID',
        title:'订单号'
    },{
        field:'ID',
        title:'ID'
    }]

})