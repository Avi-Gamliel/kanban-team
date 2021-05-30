function Notifcation(notification) {
    let div = ``;
    notification.forEach((element, i) => {
        let date = new Date(element.time).toString().split(" ");
        div += `<li id=${i} class="row m-0 px-2 py-1 divide notifRow ${element.view}" >
                <div class="col-12 row m-0 p-0 container">
                    <div class="col-10">
                        <div class="col-12 m-0 p-0  text-left">
                            ${element.msg}
                        </div>
                        <div class="col-12 m-0 p-0 time  text-left">
                            ${date[0]} ,${date[2]} ${date[1]} - ${date[4]}
                        </div>
                    </div>
                    <div class=" col my-2 p-0 containerUsers text-center adminNote">
                        <div class="userNote my-1 p-0">
                            <span class="cr p-1 userNote">
                                ${element.short}
                            </span>
                        </div>
                    </div>
                    </li>
            `;
    });
    $('.notificationBox').children('.card').html(div)
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
}

socket.on('connect', () => {
    const path1 = window.location.pathname.split("/")[1];
    const path2 = window.location.pathname.split("/")[2];
    if (path2 == 'dashboard') {
        socket.emit('joinRoom', { room: path1 + '/' + path2 })
    }
});

socket.on('connectToRoom', data => {
    if (data.user) {
        $(`#${data.user}`).addClass('log')
        let name = $(`#${data.user}`).children('span').attr("title");
        const uesr = window.location.search.split("=")[1];
        if (data.user !== uesr) {
            $('#alertLog').text(`${name} sign in`).addClass('alertLog')
            setTimeout(() => {
                $('#alertLog').text('').removeClass('alertLog')
            }, 3500);
        }
    }
    if (data.userExist) {
        data.userExist.forEach(user => {
            $(`#${user}`).addClass('log')
        })
    }

})

socket.on('leaveRoom', data => {
    if (data.user) {
        $(`#${data.user}`).removeClass('log')
        let name = $(`#${data.user}`).children('span').attr("title");
        const uesr = window.location.search.split("=")[1];
        if (data.user !== uesr) {
            $('#alertLog').text(`${name} sign out`).addClass('alertLogout')
            setTimeout(() => {
                $('#alertLog').text('').removeClass('alertLogout')
            }, 3500);
        }
    }
})

socket.on('changes', data => {
});

socket.on('notification', data => {
    if (data) {
        const notification = data.note;
        const page = data.page
        Notifcation(notification);
        let divShare = $('.containerBoardSahre').children(".boxBoard");
        for (let div of divShare) {
            let shareBoardId = $(div)[0].id;
            let shareBoardAdmin = $(div).children().children('.saveboard').children('.containersAdminShare').children('.adminShare').children('span')[0].innerText;
            if (shareBoardId == page.id && shareBoardAdmin == page.adminShort) {
                $(div).children('.card').children('.card-header').text(page.pageName);
                $(div).children('.card').children('.card-body').children('.card-text').text(page.pageSec);
                return;
            } else {
            }
        }
    }
});

socket.on('getDataToRoom', data => {
    let PLAN = $("#columnPLAN").children().length;
    let TODO = $("#columnTODO").children().length;
    let DOING = $("#columnDOING").children().length
    let DONE = $("#columnDONE").children().length;
    let id = PLAN + TODO + DOING + DONE;
    $("#columnPLAN").append(` <div id=${id} class="portlet m-0 my-3 card ui-widget ui-widget-content ui-corner-all">
                                    <div class="portlet-header todo row m-0 p-0 bg-lighten ">
                                        <span id="exit" class="text-left col-2 ">x</span>
                                        <span id="toggleTasks" class="toggleTasks text-right col-2 offset-8">-</span>
                                    </div>
                                    <div class="container cont">
                                        <div class="row m-0 p-3 card-header">
                                            <h6 contenteditable="true" class="title_task col-12 text-center p-2">
                                            title sample
                                            </h6>
                                        </div>
                                    </div>
            <div id="taskArea" class="taskArea">
                <div class="container cont"></div>
                <div class="portlet-content bg-lighten">
                    <div class="menuBox row m-0 p-0 px-1">
                        <i class="addnewchecklsit col-2 fas fa-list p-2 m-0 mx-1"></i>
                        <i class="addText col-2 fas fa-heading p-2 m-0 mx-1"></i>
                    </div>
                </div>
            </div>
        </div>`)
});

socket.on('updateMove', async DATA => {

    let data = $(`.${DATA.from}`).children(`#${DATA.item}`);
    let lengthto = $(`.${DATA.to}`).children('.portlet').length;
    let lengthfrom = $(`.${DATA.from}`).children('.portlet').length;
    if (DATA.to == 'columnTODO') {
        if (DATA.position == 0) {
            await $(`.${DATA.to}`).prepend($(data)[0].outerHTML);
        } else {
            $($(data)[0].outerHTML).insertAfter($(`.${DATA.to}`)[0].children.item(DATA.position - 1))
        }
        await $(data).remove();
        $('.to_do').html(lengthto + 1);
    } else if (DATA.to == 'columnDOING') {
        let val = $('.maxinp').val();
        if ($(`.${DATA.to}`).children('.portlet').length + 1 > Number(val)) {
            let alert = `<div class="alert alert-warning alert-dismissible fade show col-6 offset-3 my-3" role="alert">
                    You are limit for ${val} tasks
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`
            $('.alertBox').append(alert)
        } else {
            if (DATA.position == 0) {
                await $(`.${DATA.to}`).prepend($(data)[0].outerHTML);
            } else {
                $($(data)[0].outerHTML).insertAfter($(`.${DATA.to}`)[0].children.item(DATA.position - 1))
            }
            await $(data).remove();
            $('.doing').html(lengthto + 1);
        }

    } else if (DATA.to == 'columnDONE') {
        if (DATA.position == 0) {
            await $(`.${DATA.to}`).prepend($(data)[0].outerHTML);
        } else {
            $($(data)[0].outerHTML).insertAfter($(`.${DATA.to}`)[0].children.item(DATA.position - 1))
        }
        await $(data).remove();
        $('.done').html(lengthto + 1);
    } else if (DATA.to == 'columnPLAN') {
        if (DATA.position == 0) {
            await $(`.${DATA.to}`).prepend($(data)[0].outerHTML);
        } else {
            $($(data)[0].outerHTML).insertAfter($(`.${DATA.to}`)[0].children.item(DATA.position - 1))
        }
        await $(data).remove();
        $('.done').html(lengthto + 1);
    }

    if (DATA.from == 'columnTODO') {
        $('.to_do').html(lengthfrom - 1);
    } else if (DATA.from == 'columnDOING') {
        $('.doing').html(lengthfrom - 1);
    } else if (DATA.from == 'columnDONE') {
        $('.done').html(lengthfrom - 1);
    }
})

socket.on('notifcation_deleteBoard', data => {
    let divShare = $('.containerBoardSahre').children(".boxBoard");
    for (let div of divShare) {
        let shareBoardId = $(div)[0].id;
        let shareBoardAdmin = $(div).children().children('.saveboard').children('.containersAdminShare').children('.adminShare').children('span')[0].innerText;
        if (shareBoardId == data.page[0].page_id && shareBoardAdmin == data.adminShort) {
            $(div).remove();
            Notifcation(data.notification);
            return;
        }
    }
})

socket.on('notifcation_deleteBoard', data => {
    let divShare = $('.containerBoardSahre').children(".boxBoard");
    for (let div of divShare) {
        let shareBoardId = $(div)[0].id;
        let shareBoardAdmin = $(div).children().children('.saveboard').children('.containersAdminShare').children('.adminShare').children('span')[0].innerText;
        if (shareBoardId == data.page[0].page_id && shareBoardAdmin == data.adminShort) {
            $(div).remove();
            Notifcation(data.notification);
            return;
        }
    }
})

socket.on('userShare', DATA => {
    Notifcation(DATA.note);
    let users = ``;
    const userId = window.location.pathname.split("/")[1]
    DATA.data.usersShare.forEach(user => {
        users += `<div class="users my-1 p-0 text-center">
                        <span class="cr p-1" title="${user[1]}">
                        ${user[0]}
                        </span>
                  </div>`;
    });
    $('.containerBoardSahre').append(`<div id='${DATA.data.pageId}' class="col-3 p-2 boxBoard">
                                            <div class="card text-center" id="<%= m._id %>">
                                                <div contenteditable="true" class="card-header">
                                                ${DATA.data.pageName}
                                                </div>
                                                <div class="card-body">
                                                    <p contenteditable="true" class="card-text">
                                                    ${DATA.data.pageDesc}
                                                    </p>
                                                    <form action="/${DATA.data.AdminId}/dashboard/${DATA.data.pageId}?v=${userId}"
                                                        method="post">
                                                        <button class="btn btn-warning">Plan</button>
                                                    </form>
                                                </div>
                                                <div class="saveboard card-footer text-muted row m-0 p-0 ">
                                                        <i id="saveboard"
                                                        class="col py-2 saveboard fas fa-cloud-upload-alt align-middle text-left"></i>
                                                        <div class="col my-1 mx-1 p-0 containerUsers">
                                                        ${users}
                                                        </div>
                                                            <div class="col my-1 mx-1 p-0 containersAdminShare text-center">
                                                                <div class="adminShare my-1 p-0">
                                                                    <span class="cr p-1" title="${DATA.data.adminName}">
                                                                    ${DATA.data.adminShort}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                </div>
                                            </div>
                                        </div>`)
})

socket.on('removeNote', data => {
    $(`.${data.parent}`).children(`#${data.child}`).remove();
})

socket.on('changeNote', data => {

    if (data.target == 'mainTitle') {
        $(`.${data.parent}`).children(`#${data.child}`).children('.container').children('.card-header').children('h6').text(data.item);
    }

    if (data.target == 'addText') {
        let length = $(`.${data.parent}`).children(`#${data.child}`).children('.taskArea').children('.container').children('.textTitle').length;
        $(`.${data.parent}`).children(`#${data.child}`).children('.taskArea').children('.container').append(`<div id="${length}_T" contenteditable="true" class="textTitle p-2 m-0 gr">Text</div>`)
        $('.textTitle').click(function (e) {
            for (let ex of $('.contExit')) {
                ex.remove();
            }
            $(e.currentTarget).before('<div class="contExit d-flex align-items-center py-1"><span class="exitTitle d-flex align-items-center m-0 p-0 ml-2">x</span></div>');
        });
    }

    if (data.target == 'addnewchecklsit') {
        let length = $(`.${data.parent}`).children(`#${data.child}`).children('.taskArea').children('.container').children('.form').length;
        $(`.${data.parent}`).children(`#${data.child}`).children('.taskArea').children('.container')
            .append(`<form id="${length}_L" class="form px-2 pb-2 m-0 gr">
            <h6 contenteditable=true
                class="Lt text-center p-3">
               text here
            </h6>
            <div class="containerListTask">
            <div class="form-btns row m-0 p-0">
            <div class="inputBox col-10 px-1">
                <input class="inp col-12 p-0 m-0" />
            </div>
            <div class="buttonBox col-2 px-1">
                <button
                    class="addSubmit p-0 m-0 col-12 btn btn-danger">+</button>
            </div>
            </div>
            <ul class="list  m-0 p-0">
            </ul>
            </div>
        </form> `);
        $('.form').submit(function (e) {
            e.preventDefault();
            for (let ex of $('.contExit')) {
                ex.remove();
            }
            $(e.currentTarget).before('<div class="contExit  d-flex align-items-center py-1"><span class="exitTitle d-flex align-items-center m-0 p-0 ml-2">x</span><span class="toggleList col text-right m-0 p-0 mr-2">-</span></div>');
        });
        $('.form').click(function (e) {
            for (let ex of $('.contExit')) {
                ex.remove();
            }
            $(e.currentTarget).before('<div class="contExit row m-0 p-0 d-flex align-items-center py-1"><span class="exitTitle col text-left m-0 p-0 ml-2">x</span><span class="toggleList col text-right m-0 p-0 mr-2">-</span></div>');
        });
    }

    if (data.target == 'form') {
        if (data.value !== '') {
            let length = $(`.${data.parent}`).children(`#${data.child}`).children('.taskArea').children('.container').children(`#${data.idTask}`).children(".containerListTask").children('.list').children('li').length;
            $(`.${data.parent}`).children(`#${data.child}`).children('.taskArea').children('.container').children(`#${data.idTask}`).children(".containerListTask").children('.list').prepend(`
         <li id=${length} class="row d-flex pr-2 align-items-center gr m-0 p-0 my-2">
            <div class="col-10 text-left p-0 m-0 px-1 textli text-break">
                <div contentEditable="true" class="col-12 m-0 p-0 pl-1 text-wrap">${data.value}</div>
            </div>
            <div class="col-1 d-flex align-items-center justify-content-end text-right checkBox p-0 m-0">
            <div class="form-check checkbox-warning-filled">
            <input type="checkbox" class="form-check-input filled-in" id="defaultCheck">
            <label class="form-check-label" for="defaultCheck"></label>
          </div>
                 </div>
                 <i class="col-1 m-0 p-0 far fa-trash-alt" id="deleteRow"></i>
        </li>`)
        }
    }

    if (data.target == 'changeListTitle') {
        $(`.${data.parent} `).children(`#${data.child}`).children('.taskArea').children('.container').children(`#${data.taskId} `).children("h6").text(data.item);
    }

    if (data.target == 'changeTaskTitle') {
        $(`.${data.parent}`).children(`#${data.child}`).children('.taskArea').children('.container').children(`#${data.taskId}`).text(data.item);
    }

    if (data.target == 'checked') {
        if (data.check == true) {
            $(`.${data.parent}`).children(`#${data.child}`).children('.taskArea').children('.container').children(`#${data.taskId}`).children(".containerListTask").children('ul').children(`#${data.li}`).children('.textli').css({ 'text-decoration': 'line-through', 'color': '#a9a9a9' })
        } else if (data.check == false) {
            $(`.${data.parent}`).children(`#${data.child}`).children('.taskArea').children('.container').children(`#${data.taskId}`).children(".containerListTask").children('ul').children(`#${data.li}`).children('.textli').css({ 'text-decoration': 'none' })
        }
    }

    if (data.target == 'delete') {
        $(`.${data.parent}`).children(`#${data.child}`).children('.taskArea').children('.container').children(`#${data.taskId}`).children(".containerListTask").children('ul').children(`#${data.li}`).remove()
    }

    if (data.target == 'deleteTitle') {
        $(`.${data.parent}`).children(`#${data.child}`).children('.taskArea').children('.container').children(`#${data.taskId}`).remove();
        if ($(`.${data.parent}`).children(`#${data.child}`).children('.taskArea').children('.container').children('.contExit').length > 0) {
            $(`.${data.parent}`).children(`#${data.child}`).children('.taskArea').children('.container').children('.contExit').remove();
        }
    }

})