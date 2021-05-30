$(function () {

    if ($("#countNot").length > 0) {
        let lis = $(".notificationBox").children(".card").children("li");
        let count = 0;
        for (let li of lis) {
            if (li.classList[li.classList.length - 1] == "false") {
                count++;
            }
        }
        if (count > 0) {
            $("#countNot").text(count).removeClass('hide');
        }
    }

    $(".notificationBox").hide()

    $(".notifctionBall").on('click', function (params) {
        $('.notificationBox').toggle();
        let lis = $(".notificationBox").children(".card").children("li");
        let count = 0;
        for (let i = 0; i < lis.length; i++) {
            if (lis[i].classList[lis[i].classList.length - 1] == "false") {
                $(lis[i]).removeClass('false').addClass("true");
                $("#countNot").addClass('hide');
                count++;
            }
        }

        if (count > 0) {
            const userId = window.location.pathname.split("/")[1];
            const boardId = window.location.pathname.split("/")[3];
            let url = `/${userId}/clearNotification/${boardId}`;
            $.ajax(url, {
                type: "post",
                dataType: 'json',
                contentType: 'application/json',
            });
        }
    })
    return false;
});

$(document).on('click', function (e) {
    if ($('.notificationBox').length > 0) {
        if ($(e.target)[0].classList[0] !== 'notifctionBall') {
            $('.notificationBox').hide()
        }
    }
    let TOOL = $(e.target.classList[0]).selector;
});

$(document).change(function () {
    if ($("#countNot").length > 0) {
        let lis = $(".notificationBox").children(".card").children("li");
        let count = 0;
        for (let li of lis) {
            if (li.classList[li.classList.length - 1] == "false") {
                count++;
            }
        }
        if (count > 0) {
            $("#countNot").text(count).removeClass('hide');
        }
    }
});