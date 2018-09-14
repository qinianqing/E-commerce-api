/**
 * Created by Mbb on 2017/5/4.
 */
function deleteIns() {
    var reqData = $('#instructiontable').bootstrapTable('getData');
    var result = confirm('删除后不可恢复，确定删除吗？');
    if (result == true){
        $.ajax({
            type: "post",
            url: "/fc/instruction/delete",
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
                $('#instructiontable').bootstrapTable('refresh');
                $('#deletebtn').css("display","none");
            }

        });
    }
}
function showAddUserModal() {
    $('#addUserModal').modal('show');
}

// 判断select的值，更新输入框类型
// 监控变动
$("#inputType").change(function(){
    if ($("#inputType").val() == 'photo') {
        $('#inputContent').replaceWith('<input type="file" name="content" id="inputContent" onchange="onselectimage()"  required class="fileupload"/>');
    }else {
        $('#inputContent').replaceWith('<textarea type="text" placeholder="输入答案" name="content" required id="inputContent" class="form-control"></textarea>');
    }
});

// 处理图片上传
function onselectimage() {
    if ($('.fileupload').val().length) {
        var fileName = $('.fileupload').val();
        var extension = fileName.substring(fileName.lastIndexOf('.'), fileName.length).toLowerCase();
        if (extension == ".jpg" || extension == ".png") {
            var data = new FormData();
            data.append('upload', $('.fileupload')[0].files[0]);
            $.ajax({
                // 上传图片的URL
                url: '/upload',
                type: 'POST',
                data: data,
                cache: false,
                contentType: false, //不可缺参数
                processData: false, //不可缺参数
                success: function(data) {
                    // 返回上传图片的临时路径
                    console.log(data.msg);
                    picTempPath = data.msg;
                },
                error: function() {
                    console.log('error');
                }
            });
        }
    }
}

$('#addUserSubmit').click(function () {
    $('#addUserSubmit').replaceWith('<button id="addUserSubmit" class="btn btn-primary">加载中</button>');
    var reqData;
    if ($("#inputType").val() == 'photo') {
        reqData = {
            type:'photo',
            content:picTempPath
        }
    }else {
        reqData = {
            type:$("#inputType").val(),
            content:$("#inputContent").val()
        }
    }
    var options = {
        url:'/fc/instruction/add',
        type:'post',
        data:reqData,
        success:function (data) {

            if (data == 'ok'){
                //刷新表格
                $('#instructiontable').bootstrapTable('refresh');
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
            $('#addUserSubmit').replaceWith('<button type="submit" id="addUserSubmit" class="btn btn-primary">确定</button>');
            $('#addUserModal').modal('hide');
        }
    };

    $.ajax(options);
})


$('#instructiontable').bootstrapTable({
    url:'/fc/instruction/list',//取数据的api地址
    queryParams:function (params) {
        console.log(params)
        var temp = {
            //limit:params.limit,//单页数量
            //offset:params.offset,//页码
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
        var reqData = $('#instructiontable').bootstrapTable('getData');

        $.ajax({
            type: "post",
            url: "/fc/instruction/edit",
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
                $('#instructiontable').bootstrapTable('refresh');
            }

        });
    },
    onEditableSave: function (field, row, oldValue, $el) {

        $.ajax({
            type: "post",
            url: "/fc/instruction/edit",
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
                $('#instructiontable').bootstrapTable('refresh');
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
        var data = $('#instructiontable').bootstrapTable('getData');
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
        title:'顺序'
    },{
        field:'type',
        title:'类型',
        editable:{
            type:'select',
            title:'详情',
            disabled:false,
            source:[{value:'photo',text:'图片'},{value:'text',text:'段落'},{value:'title',text:'标题'}]
        }
    },{
        field:'content',
        title:'图片输入链接(点击编辑)',
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