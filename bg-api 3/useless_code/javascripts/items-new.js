/**
 * Created by Mbb on 2017/5/30.
 */
var bannerURL;
var resourceURL;

// 监控类型值的变化，如果是网页类型，对inputContent
$("#inputType").change(function(){
    if ($("#inputType").val() == 'page') {
        $('#inputSourseLabel').replaceWith('<label for="inputResource" id="inputSourseLabel" class="col-lg-2 control-label">*链接</label>')
        $('#inputResource').replaceWith('<input type="url" name="content" id="inputResource" required class="form-control"/>');
    }else {
        $('#inputSourseLabel').replaceWith('<label for="inputResource" id="inputSourseLabel" class="col-lg-2 control-label">*内容</label>')
        $('#inputResource').replaceWith('<input type="file" name="content" onchange="onselectresource()" style="display: inline-block" required id="inputResource" class="fileupload">')
    }
});

// 上传资源
function onselectresource() {
    $('#resourceloaded').remove();
    if ($('#inputResource').val().length) {
        $('#inputResource').after('<label id="resourceloading" style="display: inline-block">上传中</label>');
        var fileName = $('#inputResource').val();
        var extension = fileName.substring(fileName.lastIndexOf('.'), fileName.length).toLowerCase();
        //if (extension != ".exe" && extension == ".dll") {
            var data = new FormData();
            data.append('upload', $('#inputResource')[0].files[0]);
            $.ajax({
                // 上传图片的URL
                url: '/upload/toleancloud',
                type: 'POST',
                data: data,
                cache: false,
                contentType: false, //不可缺参数
                processData: false, //不可缺参数
                success: function(data) {
                    // 返回上传资源的临时路径
                    resourceURL = data.pic;
                    $('#resourceloading').remove();
                    $('#inputResource').after('<a href="'+resourceURL+'" target="_blank" id="resourceloaded" style="display: inline-block">上传完成</a>');
                },
                error: function() {
                    console.log('error');
                    $('#resourceloading').remove();
                    $('#inputResource').after('<label id="resourceloaded" style="display: inline-block">上传失败</label>');
                },
                complete:function () {
                }
            });
        //}
    }
}

// 上传banner
function onselectbanner() {
    $('#bannerloaded').remove();
    if ($('#inputBanner').val().length) {
        $('#inputBanner').after('<label id="bannerloading" style="display: inline-block">上传中</label>');
        var fileName = $('#inputBanner').val();
        var extension = fileName.substring(fileName.lastIndexOf('.'), fileName.length).toLowerCase();
        if (extension == ".jpg" || extension == ".png" || extension == ".gif") {
            var data = new FormData();
            data.append('upload', $('#inputBanner')[0].files[0]);
            $.ajax({
                // 上传图片的URL
                url: '/upload/toleancloud',
                type: 'POST',
                data: data,
                cache: false,
                contentType: false, //不可缺参数
                processData: false, //不可缺参数
                success: function(data) {
                    // 返回上传图片的临时路径
                    bannerURL = data.pic;
                    $('#bannerloading').remove();
                    $('#inputBanner').after('<a href="'+bannerURL+'" target="_blank" id="bannerloaded" style="display: inline-block">上传完成</a>');
                },
                error: function() {
                    console.log('error');
                    $('#bannerloading').remove();
                    $('#inputBanner').after('<label id="bannerloaded" style="display: inline-block">上传失败</label>');
                },
                complete:function () {
                }
            });
        }
    }
}

// 提交
function goSubmit() {
    $('#addUserSubmit').replaceWith('<button id="addUserSubmit" class="btn btn-primary">加载中</button>');
    var reqData = {
        type:$("#inputType").val(),
        focus:$("#inputFocus").val(),
        title:$("#inputTitle").val(),
        topic:$("#inputTopic").val(),
        author:$("#inputAuthor").val(),
        detail:$("#inputDetail").val(),
        resourceURL:resourceURL,
        bannerURL:bannerURL
    }
    var options = {
        url:'/items/add',
        type:'post',
        data:reqData,
        success:function (data) {
            if (data == 'ok'){
                //刷新表格
                alert("创建成功");
                $(window).attr('location','/items');
            }else if (data == 'illegal'){
                $(window).attr('location','/login');
            }else {
                alert(data);
                location.replace(document.referrer);
            }
        },
        error:function (xhr,status,msg) {
            alert('请求错误');
            location.replace(document.referrer);
        },
        complete:function (xhr) {
            $('#addUserSubmit').replaceWith('<button type="submit" id="addUserSubmit" class="btn btn-primary">确定</button>');
            $('#addUserModal').modal('hide');
        }
    };

    $.ajax(options);
}

// 表单提交，点击提交
$('#addUserSubmit').click(function () {
    // 需要加条件，如果所有必填项都有值，才能提交
    if ($("#inputType").val() == 'page'){
        // 网页
        resourceURL = $("#inputResource").val();
        if ($("#inputFocus").val()&&$("#inputTopic").val()&&$("#inputAuthor").val()&&$("#inputTitle").val()&&$("#inputDetail").val()&&resourceURL&&bannerURL){
            goSubmit();
        }else {
            alert('有必要参数没填写');
        }
    }else {
        if ($("#inputFocus").val()&&$("#inputTopic").val()&&$("#inputAuthor").val()&&$("#inputTitle").val()&&$("#inputDetail").val()&&resourceURL&&bannerURL){
            goSubmit();
        }else {
            alert('有必要参数没填写');
        }
    }
})

