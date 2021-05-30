$(function () {
    $("#formAddBoard").on('click', function (e) {
        e.preventDefault();
        let count = $('.containerBoard').children().length;
        const neData = window.location.pathname.split("/")[1];
        const userShort = $('.userShort').text()
        const fn = $('.fn').text();
        let boxes = $('.containerBoard').children('.boxBoard');
        let array = [];
        let max;
        if (boxes.length == 0) {
            max = 0
        } else {
            for (let box of boxes) {
                array.push($(box)[0].id)
            }
            max = Math.max(...array);
        }
        let ID = max + 1;
        if (count < 9) {
            $('.containerBoard')
                .append(`
                <div id=${ID} class="col-3 p-2 boxBoard">
                <div class="card text-center">
                    <div contenteditable="true" class="card-header">
                    Title
                    </div>
                    <div class="card-body">
                        <p contenteditable="true" class="card-text">
                        Description
                        </p>
                        <form action="/${neData}/dashboard/${ID}?v=${neData}" method="post">
                            <button class="btn btn-primary">Plan</button>
                        </form>
                    </div>
                    <div class="saveboard card-footer text-muted row m-0 p-0 ">               
                        <i id="saveboard" class="col py-2 saveboard fas fa-cloud-upload-alt align-middle text-left"></i>
                        <div class="col my-1 mx-1 p-0 containerUsers">
                            <div class="admin  my-1 p-0 text-center">
                                <span class="cr p-1" title="${fn}">
                                ${userShort}
                                </span>
                            </div>
                        </div>
                    </div>
            </div>
         `);

            let url = `/${neData}/saveBoard`;
            var posting = $.ajax(url, {
                data: JSON.stringify({
                    user_id: neData,
                    boardId: ID,
                    title: "Title",
                    desc: "Description"
                }),
                type: "post",
                dataType: 'json',
                contentType: 'application/json',
            });

            posting.done(function (data) {
                socket.emit('updateData', data);
            });
            $('.boxBoard').click(function (e) {
                let id = $(e.currentTarget)[0].id;
                for (let ex of $('.contBoardExit')) {
                    ex.remove();
                }
                $(e.currentTarget).prepend(`<div class="contBoardExit d-flex align-items-center"><span id=${id} class="exitBoard d-flex align-items-center m-0 p-0 ml-2">x</span></div>`).on('click', 'span', function (e) {
                    const neData = window.location.pathname.split("/")[1];
                    let url = `/${neData}/deleteBoard/${$(e.target)[0].id}?_method=DELETE`;
                    var posting = $.post(url);
                    posting.done(function (data) {
                    });
                    let id = e.target.id
                    $('.containerBoard').find(`#${id}`).remove();
                    return false;
                });
                ;
            });
        }
    });

    $('.boxBoard').click(function (e) {
        let id = $(e.currentTarget)[0].id;
        for (let ex of $('.contBoardExit')) {
            ex.remove();
        }
        $(e.currentTarget).prepend(`<div class="contBoardExit d-flex align-items-center"><span id=${id} class="exitBoard d-flex align-items-center m-0 p-0 ml-2">x</span></div>`).on('click', 'span', function () {
            const neData = window.location.pathname.split("/")[1];
            let url = `/${neData}/deleteBoard/${$(e.target)[0].id}?_method=DELETE`;
            var post = $.post(url);
            post.done(function (data) {
            });
            let id = e.target.id
            $('.containerBoard').find(`#${id}`).remove();
            return false;
        });
    });
});

$(document).on('click', function (e) {
    let TOOL = $(e.target.classList[0]).selector;
    if (e.target.id == "saveboard") {
        const title = $(e.target).parent().parent().children('.card-header').text().trim();
        const description = $(e.target).parent().parent().children('.card-body').children('.card-text').text().trim();
        const form = $(e.target).parent().parent().children('.card-body').children('form')[0];
        const id = $(e.target).parent().parent().parent()[0].id;
        const neData = window.location.pathname.split("/")[1];
        form.action = `/${neData}/dashboard/${id}?v=${neData}`;
        let url = `/${neData}/saveBoard`;
        var posting = $.ajax(url, {
            data: JSON.stringify({
                user_id: neData,
                boardId: id,
                title: title.trim(),
                desc: description.trim()
            }),
            type: "post",
            dataType: 'json',
            contentType: 'application/json',
        });
        posting.done(function (data) {
            socket.emit('updateData', data)
        });
        return false;
    } else if (TOOL === 'exitBoard') {
        const neData = window.location.pathname.split("/")[1];
        let url = `/${neData}/deleteBoard/${$(e.target)[0].id}?_method=DELETE`;
        let PAGE_ID = $(e.target).parent().parent().children('.card')[0].id
        var deleteBoard = $.ajax(url, {
            data: JSON.stringify({
                page_id: PAGE_ID,
            }),
            type: "post",
            dataType: 'json',
            contentType: 'application/json',
        });
        deleteBoard.done(function (data) {
            socket.emit('removeBoard', data)
        });
        let id = e.target.id;
        $('.containerBoard').find(`#${id}`).remove();
        return false;
    }
})