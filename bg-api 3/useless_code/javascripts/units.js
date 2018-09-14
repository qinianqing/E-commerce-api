/**
 * Created by zhangwei on 17/5/2.
 */

$('.form_datetime').datetimepicker({
    format:'yyyy-mm-dd',
    language:  'fr',
    weekStart: 1,
    todayBtn:  1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    minView: 2,
    forceParse: 0
});
$("#dateselect").change(function(){
    $('#unittable').bootstrapTable('refresh');
});
$('#unittable').bootstrapTable({
    url:'/units/list',//取数据的api地址
    queryParams:function (params) {
        console.log(params)
        var temp = {
            limit:params.limit,//单页数量
            offset:params.offset,//页码
            search:params.search,// 搜索内容
            date:$("#dateselect").val()
            //传上,当前页最后一个数组的updateTime
            //order 升降顺序,不用
            //search 在需要搜索的地方使用
            //其他参数,可以自定义
        }
        return temp;
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
    showExport:true,
    showToggle:true,
    exportDataType:"basic",
    exportTypes:['csv','excel','txt'],
    exportOptions:{
        fileName: 'units列表'
    },
    onEditableSave: function (field, row, oldValue, $el) {
        $.ajax({
            type: "post",
            url: "/units/edit",
            contentType:"application/json",
            data: JSON.stringify(row),
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
                $('#unittable').bootstrapTable('refresh');
            }

        });
    },
    columns:[{
        field:'date',
        title:'日期',
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
    },{
        field:'code',
        title:'代码'
    },{
        field:'name',
        title:'名称',
        editable:{
            type:'text',
            title:'编辑名称',
            disabled:false,
            validate:function (value) {
                value = $.trim(value);
                if (!value) {
                    return '不能为空';
                }
            }
        }
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
        title:'fb状态',
        editable:{
            type:'text',
            title:'只能为0、101、110',
            disabled:false,
            validate:function (value) {
                value = $.trim(value);
                if (!value) {
                    return '不能为空';
                }
            }
        }
    },{
        field:'fc',
        title:'fc状态'
    },{
        field:'yz',
        title:'yz状态'
    },{
        field:'user_name',
        title:'用户名',
        editable:{
            type:'text',
            title:'编辑用户名',
            disabled:false,
            validate:function (value) {
                value = $.trim(value);
                if (!value) {
                    return '不能为空';
                }
            }
        }
    },{
        field:'mobile',
        title:'手机',
        editable:{
            type:'text',
            title:'编辑用户手机号',
            disabled:false,
            validate:function (value) {
                value = $.trim(value);
                if (!value) {
                    return '不能为空';
                }
            }
        }
    },{
        field:'avoid',
        title:'忌口'
    },{
        field:'message',
        title:'留言'
    },{
        field:'station',
        title:'站点',
        editable:{
            type:'text',
            title:'编辑站点名称',
            disabled:false,
            validate:function (value) {
                value = $.trim(value);
                if (!value) {
                    return '不能为空';
                }
            }
        }
    },{
        field:'stationD',
        title:'地区',
        editable:{
            type:'text',
            title:'编辑区域名称，格式C市D区',
            disabled:false,
            validate:function (value) {
                value = $.trim(value);
                if (!value) {
                    return '不能为空';
                }
            }
        }
    },{
        field:'stationA',
        title:'地址',
        editable:{
            type:'text',
            title:'编辑站点地址',
            disabled:false,
            validate:function (value) {
                value = $.trim(value);
                if (!value) {
                    return '不能为空';
                }
            }
        }
    },{
        field:'stationP',
        title:'联系电话',
        editable:{
            type:'text',
            title:'编辑站点联系电话',
            disabled:false,
            validate:function (value) {
                value = $.trim(value);
                if (!value) {
                    return '不能为空';
                }
            }
        }
    },{
        field:'orderID',
        title:'订单号'
    },{
        field:'ID',
        title:'ID'
    },{
        field:'QRString',
        title:'QRString'
    }]

})