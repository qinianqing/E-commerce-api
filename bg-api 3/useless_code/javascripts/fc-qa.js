/**
 * Created by Mbb on 2017/5/4.
 */
function deleteIns() {
    var reqData = $('#qatable').bootstrapTable('getData');

    var result = confirm('删除后不可恢复，确定删除吗？');
    if (result == true){
        $.ajax({
            type: "post",
            url: "/fc/qa/delete",
            contentType:"application/json",
            data: JSON.stringify(reqData),
            success: function (data, status) {
                if (data == "ok") {
                    alert("删除成功");
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
                $('#qatable').bootstrapTable('refresh');
                $('#deletebtn').css("display","none");
            }

        });
    }
}

function showAddUserModal() {
    $('#addUserModal').modal('show');
}

$('#addUserForm').submit(function () {
    var options = {
        url:'/fc/qa/add',
        type:'post',
        success:function (data) {
            if (data == 'ok'){
                //刷新表格
                $('#qatable').bootstrapTable('refresh');
            }else if (data == 'illegal'){
                $(window).attr('location','/login');
            }else {
                alert(data);
            }
        },
        error:function (xhr,status,msg) {
            alert('请求错误');
        },
        complete:function (xhr) {
            $('#addUserModal').modal('hide');
        }
    };
    $("#addUserForm").ajaxSubmit(options);
})

$('#qatable').bootstrapTable({
    url:'/fc/qa/list',//取数据的api地址
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
    toolbar:'#toolbar',
    striped:true,
    cache:false,
    pagination:false,
    clickToSelect:true,
    //showColumns: true, //显示列控制按钮
    //showRefresh: true, //显示刷新按钮
    onReorderRowsDrop:function (table,row) {
      console.log($('#qatable').bootstrapTable('getData'));
      var reqData = $('#qatable').bootstrapTable('getData');

        $.ajax({
            type: "post",
            url: "/fc/qa/edit",
            contentType:"application/json",
            data: JSON.stringify(reqData),
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
                $('#qatable').bootstrapTable('refresh');
            }

        });
    },
    onEditableSave: function (field, row, oldValue, $el) {
        $.ajax({
            type: "post",
            url: "/fc/qa/edit",
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
                $('#qatable').bootstrapTable('refresh');
            }

        });
    },
    onCheck:function (row) {
        console.log('oncheck');
        console.log(row)
        $('#deletebtn').css("display","inline");
    },
    onUncheck:function (row) {
        console.log('onUncheck');
        console.log(row);
        // 获取表格数据，判断check是否有false
        var data = $('#qatable').bootstrapTable('getData');
        var show = 0;
        for (var i=0;i<data.length;i++){
            if (data[i].check){
                break
            }else {
                show = show+1;
                continue
            }
        }
        if (show == data.length){
            $('#deletebtn').css("display","none");
        }
    },
    columns:[{
        checkbox:true,
        field:'check',
        title:'选择'
    },{
        field:'index',
        title:'顺序(拖拽排序)'
    },{
        field:'question',
        title:'Q(点击编辑)',
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
    },{
        field:'answer',
        title:'A(点击编辑)',
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