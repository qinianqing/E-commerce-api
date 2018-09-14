/**
 * Created by Mbb on 2017/5/2.
 */
$('#mottotable').bootstrapTable({
    url:'/fc/motto',//取数据的api地址
    queryParams:function (params) {
        console.log(params)
        var temp = {
            limit:params.limit,//单页数量
            offset:params.offset,//页码
            //order 升降顺序,不用
            //search 在需要搜索的地方使用
            //其他参数,可以自定义
        }
        return temp;
    },
    dataType:'json',
    //toolbar:'#toolbar',
    striped:true,
    cache:false,
    pagination:false,
    clickToSelect:true,
    //showColumns: true, //显示列控制按钮
    //showRefresh: true, //显示刷新按钮
    onEditableSave: function (field, row, oldValue, $el) {
        $.ajax({
            type: "post",
            url: "/fc/motto/edit",
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
                $('#mottotable').bootstrapTable('refresh');
            }

        });
    },
    columns:[{
        field:'name',
        title:'类型'
    },{
        field:'detail',
        title:'详细(点击编辑)',
        editable:{
            type:'text',
            title:'详情',
            disabled:false,
            validate:function (value) {
                value = $.trim(value);
                if (!value) {
                    return '不能为空';
                }
            }
        }
    }]

})