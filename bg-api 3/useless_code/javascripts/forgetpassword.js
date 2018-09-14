$("#changepassword").submit(function () {
    var options = {
        url:'/login/changepassword',
        type:'get',
        success:function (data) {
            if (data == 'OK'){
                //刷新表格
                alert('请去公司邮箱修改密码')
                $(window).attr('location','/login');
            }else {
                alert(data);
            }
        },
        error:function (xhr,status,msg) {
            alert('请求错误');
        },
        complete:function (xhr) {

        }
    };
    $("#changepassword").ajaxSubmit(options);
})