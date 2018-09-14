/**
 * Created by Ziv on 2017/6/21.
 */
/**
 * Created by Mbb on 2017/5/30.
 */
var bannerURL;
var content;

// 上传头图
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
                    console.error('error');
                    $('#bannerloading').remove();
                    $('#inputBanner').after('<label id="bannerloaded" style="display: inline-block">上传失败</label>');
                },
                complete:function () {
                }
            });
        }
    }
}

// 表单提交，点击提交
$('#addUserSubmit').click(function () {
    // 需要加条件，如果所有必填项都有值，才能更新为加载中
    if ($("#inputFocus").val()&&$("#inputTitle").val()&&$("#inputAuthor").val()&&$("#inputDetail").val()&&bannerURL){
        $('#addUserSubmit').replaceWith('<button id="addUserSubmit" class="btn btn-primary">加载中</button>');
        var reqData = {
            focus:$("#inputFocus").val(),
            title:$("#inputTitle").val(),
            author:$("#inputAuthor").val(),
            detail:$("#inputDetail").val(),
            bannerUrl:bannerURL
        }
        var options = {
            url:'/topics/add',
            type:'post',
            data:reqData,
            success:function (data) {
                if (data == 'ok'){
                    //刷新表格
                    alert("创建成功");
                    $(window).attr('location','/topics')
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
            }
        };

        $.ajax(options);
    }
})

