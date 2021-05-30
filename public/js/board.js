$(function () {

    const URL = window.location.pathname;
    const Search = window.location.search;
    socket.emit('createRoom', { URL, Search })

    for (let div of $('.form-check-input')) {
        if (div.checked === true || div.checked === 'true') {
            $(div).parent().parent().parent().children('.textli').css({ 'text-decoration': 'line-through', 'color': '#a9a9a9' })
        } else if (div.checked === false || div.checked === 'false') {
            $(div).parent().parent().parent().children('.textli').css({ 'text-decoration': 'none' })
        }
    }

    $('#back').on('submit', function () {
        socket.emit('leaveRoom', { URL, Search })
    })

    $(".column").sortable({
        connectWith: ".column",
        handle: ".portlet-header",
        cancel: ".portlet-toggle",
        placeholder: "portlet-placeholder ui-corner-all",
        dropOnEmpty: true,
        update: function (e, ui) {
            let length = this.children.length;
            let type = this.id;
            if (type == 'columnTODO') {
                $('.to_do').html(length);
            } else if (type == 'columnDOING') {
                $('.doing').html(length);
            } else if (type == 'columnDONE') {
                $('.done').html(length);
            }
        },
        receive: function (event, ui) {
            socket.emit('updateMove', {
                url: URL,
                Move: {
                    to: this.id,
                    from: ui.sender[0].id,
                    item: ui.item[0].id,
                    position: ui.item.index()
                }
            })
            if (this.id == 'columnDOING') {
                let val = $('.maxinp').val();
                if ($(this).children().length > val) {
                    $(ui.sender).sortable('cancel');
                    let alert = `<div class="alert alert-warning alert-dismissible fade show col-6 offset-3 my-3" role="alert">
                        You are limit for ${val} tasks
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`
                    $('.alertBox').append(alert)
                }
            }
        }
    });

    $(".portlet")
        .addClass("ui-widget ui-widget-content ui-corner-all")
        .find(".portlet-header")
        .addClass("ui-widget-header ui-corner-all")

    $(".portlet-toggle").on("click", function () {
        var icon = $(this);
        icon.closest(".portlet").find(".portlet-content").toggle();
    });

    $('.taskArea').toggle();

    if ($('.shareInput').length > 0) {
        $('.shareInput').hide();
    }

    if ($('.containerBoard').length > 0) {
        if ($('.containerBoard')[0].id == 'true') {
            $('.links').removeClass('logout').addClass('login')
        }
    }

    if ($('.mainDiv')[0].id == 'true') {
        $('.links').removeClass('logout').addClass('login');
    }

    $(".addnew").click(function () {
        const link = window.location.pathname
        socket.emit('sendToRoom', link)
    });

    $("#deleteRow").click(function () {
        $(e.target).parent().remove()
    });

    $('.toggleTasks').on('click', e => {
        $(e.target).parent().parent().children('#taskArea').slideToggle(800)
        return false;
    });

    $('#save_Page').click(e => {
        e.preventDefault();
        let id = $('.text-primary')[0].id;
        let Max = $('.maxinp').val();
        let planbox = $('.PLAN').children().children('.portlet');
        let todoColumn = $('.TODO').children().children('.portlet');
        let doingColumn = $('.DOING').children().children('.portlet');
        let doneColumn = $('.DONE').children().children('.portlet');

        let Data = {
            max: Max,
            page_id: id,
            planObj: {
                tasks: {}
            },
            todoObj: {
                tasks: {}
            },
            doingObj: {
                tasks: {}
            },
            doneObj: {
                tasks: {}
            }
        }

        $(planbox).each((i, v) => {
            let idTask = v.id;
            let title = $(v).children('.container').children('.row').children('.title_task').html();
            let finalArr = {};

            $(v).children('#taskArea').children('.container').children().each((indexx, vallue) => {
                if ($(vallue)[0].localName === 'form' && $(vallue)[0].classList[0] !== 'contExit') {
                    let titleForm = $(vallue).children('h6').html();
                    let arr = {};
                    $(vallue).children('.containerListTask').children('.list').children('li').each((index, value) => {
                        let val = $(value).children('.textli').children('.text-wrap').html();
                        let checkBox = $(value).children('.checkBox').children('.form-check').children('#defaultCheck')[0].checked;
                        arr[`row_${index}`] = {
                            id: value.id,
                            pos_row: index,
                            value: val.trim(),
                            checked: checkBox
                        }
                    });
                    finalArr[`list_${indexx}`] = {
                        id: vallue.id,
                        type: "list",
                        pos_list: indexx,
                        title: titleForm.trim(),
                        array: arr
                    };

                } else if ($(vallue)[0].localName === 'div' && $(vallue)[0].classList[0] !== 'contExit') {
                    finalArr[`title_${indexx}`] = {
                        id: vallue.id,
                        type: "title",
                        pos_title: indexx,
                        value: $(vallue).context.innerText.trim()
                    }
                }
            });

            Data.planObj.tasks[`task_${i}`] = {
                'name': title.trim(),
                'id': idTask,
                'data': finalArr
            }
        });

        $(todoColumn).each((i, v) => {
            let idTask = v.id;
            let title = $(v).children('.container').children('.row').children('.title_task').html();
            let finalArr = {};
            $(v).children('#taskArea').children('.container').children().each((indexx, vallue) => {
                if ($(vallue)[0].localName === 'form' && $(vallue)[0].classList[0] !== 'contExit') {
                    let titleForm = $(vallue).children('h6').html();
                    let arr = {};
                    $(vallue).children('.containerListTask').children('.list').children('li').each((index, value) => {
                        let val = $(value).children('.textli').children('.text-wrap').html();
                        let checkBox = $(value).children('.checkBox').children('.form-check').children('#defaultCheck')[0].checked;
                        arr[`row_${index}`] = {
                            id: value.id,
                            pos_row: index,
                            value: val.trim(),
                            checked: checkBox
                        }
                    });
                    finalArr[`list_${indexx}`] = {
                        id: vallue.id,
                        type: "list",
                        pos_list: indexx,
                        title: titleForm.trim(),
                        array: arr
                    };

                } else if ($(vallue)[0].localName === 'div' && $(vallue)[0].classList[0] !== 'contExit') {
                    finalArr[`title_${indexx}`] = {
                        id: vallue.id,
                        type: "title",
                        pos_title: indexx,
                        value: $(vallue).context.innerText.trim()
                    }
                }
            });

            Data.todoObj.tasks[`task_${i}`] = {
                'name': title.trim(),
                'id': idTask,
                'data': finalArr
            }
        });

        $(doingColumn).each((i, v) => {
            let idTask = v.id;
            let title = $(v).children('.container').children('.row').children('.title_task').html();
            let finalArr = {};
            $(v).children('#taskArea').children('.container').children().each((indexx, vallue) => {
                if ($(vallue)[0].localName === 'form' && $(vallue)[0].classList[0] !== 'contExit') {
                    let titleForm = $(vallue).children('h6').html();
                    let arr = {};
                    $(vallue).children('.containerListTask').children('.list').children('li').each((index, value) => {
                        let val = $(value).children('.textli').children('.text-wrap').html();
                        let checkBox = $(value).children('.checkBox').children('.form-check').children('#defaultCheck')[0].checked;
                        arr[`row_${index}`] = {
                            id: value.id,
                            pos_row: index,
                            value: val.trim(),
                            checked: checkBox
                        }
                    });
                    finalArr[`list_${indexx}`] = {
                        id: vallue.id,
                        type: "list",
                        pos_list: indexx,
                        title: titleForm.trim(),
                        array: arr
                    };

                } else if ($(vallue)[0].localName === 'div' && $(vallue)[0].classList[0] !== 'contExit') {
                    finalArr[`title_${indexx}`] = {
                        id: vallue.id,
                        type: "title",
                        pos_title: indexx,
                        value: $(vallue).context.innerText.trim()
                    }
                }
            });

            Data.doingObj.tasks[`task_${i}`] = {
                'name': title.trim(),
                'id': idTask,
                'data': finalArr
            }
        });

        $(doneColumn).each((i, v) => {
            let idTask = v.id;
            let title = $(v).children('.container').children('.row').children('.title_task').html();
            let finalArr = {};
            $(v).children('#taskArea').children('.container').children().each((indexx, vallue) => {
                if ($(vallue)[0].localName === 'form' && $(vallue)[0].classList[0] !== 'contExit') {
                    let titleForm = $(vallue).children('h6').html();
                    let arr = {};
                    $(vallue).children('.containerListTask').children('.list').children('li').each((index, value) => {
                        let val = $(value).children('.textli').children('.text-wrap').html();
                        let checkBox = $(value).children('.checkBox').children('.form-check').children('#defaultCheck')[0].checked;
                        arr[`row_${index}`] = {
                            id: value.id,
                            pos_row: index,
                            value: val.trim(),
                            checked: checkBox
                        }
                    });
                    finalArr[`list_${indexx}`] = {
                        id: vallue.id,
                        type: "list",
                        pos_list: indexx,
                        title: titleForm.trim(),
                        array: arr
                    };

                } else if ($(vallue)[0].localName === 'div' && $(vallue)[0].classList[0] !== 'contExit') {
                    finalArr[`title_${indexx}`] = {
                        id: value.id,
                        type: "title",
                        pos_title: indexx,
                        value: $(vallue).context.innerText.trim()
                    }
                }
            });

            Data.doneObj.tasks[`task_${i}`] = {
                'name': title.trim(),
                'id': idTask,
                'data': finalArr
            }
        });

        const userId = window.location.pathname.split("/")[1];
        const boardId = window.location.pathname.split("/")[3];
        const q = window.location.search;
        let url = `/${userId}/saveBoard/${boardId}`;
        var posting = $.ajax({
            url: url,
            data: JSON.stringify({
                user_id: userId,
                boardId: boardId,
                data: Data
            }),
            type: "post",
            dataType: 'json',
            contentType: 'application/json',
        });
        posting.done(function (data) {
            socket.emit('updatePage', data)
        });
        return false;
    });

    $('.form').click(function (e) {
        for (let ex of $('.contExit')) {
            ex.remove();
        }
        $(e.currentTarget).before('<div class="contExit row m-0 p-0 d-flex align-items-center py-1"><span class="exitTitle col text-left m-0 p-0 ml-2">x</span><span class="toggleList col text-right m-0 p-0 mr-2">-</span></div>');
    });

    $('.textTitle').click(function (e) {
        for (let ex of $('.contExit')) {
            ex.remove();
        }
        $(e.currentTarget).before('<div class="contExit d-flex align-items-center py-1"><span class="exitTitle d-flex align-items-center m-0 p-0 ml-2">x</span></div>');
    });

    if ($('.maxinp').length > 0) {
        let maxInput = $('.maxinp').val();
        if (maxInput == 'undefined' || maxInput == undefined) {
            document.querySelector('.maxinp').setAttribute('value', '3');
        }
    }
});

$(document).on('click', function (e) {
    const URL = window.location.pathname;
    let TOOL = $(e.target.classList[0]).selector;
    if (TOOL == 'addnewchecklsit') {
        let id = $(e.target).parent().parent().parent().parent()[0].id
        let idParent = $(e.target).parent().parent().parent().parent().parent()[0].id
        socket.emit('changeNote', { url: URL, idBoard: id, parent: idParent, type: 'addNewCheckList', target: 'addnewchecklsit' })
    } else if (TOOL == 'addText') {
        let id = $(e.target).parent().parent().parent().parent()[0].id
        let idParent = $(e.target).parent().parent().parent().parent().parent()[0].id
        socket.emit('changeNote', { url: URL, idBoard: id, parent: idParent, type: 'addNewText', target: 'addText' })
        return false;
    } else if (TOOL == 'toggleTasks') {
        $(e.target).parent().parent().children('#taskArea').slideToggle("slow");
        return false;
    } else if (TOOL == 'title_task') {
        $(e.target).focusout(function () {
            let item = $(e.target).text().trim();
            let id = $(e.target).parent().parent().parent()[0].id
            let idParent = $(e.target).parent().parent().parent().parent()[0].id
            socket.emit('changeNote', { url: URL, idBoard: id, parent: idParent, type: 'changeNote', item: item, target: 'mainTitle' })
        })
        $('.textTitle').click(function (e) {
            for (let ex of $('.contExit')) {
                ex.remove();
            }
            $(e.currentTarget).before('<div class="contExit d-flex align-items-center py-1"><span class="exitTitle d-flex align-items-center m-0 p-0 ml-2">x</span></div>');
        });
    } else if (TOOL == 'textTitle') {
        $(e.target).focusout(function () {
            let item = $(e.target).text().trim();
            let taskId = $(e.target)[0].id
            let id = $(e.target).parent().parent().parent()[0].id
            let idParent = $(e.target).parent().parent().parent().parent()[0].id
            socket.emit('changeNote', { url: URL, idBoard: id, parent: idParent, type: 'changeTaskTitle', item: item, target: 'changeTaskTitle', taskId: taskId })
        })
        $('.textTitle').click(function (e) {
            for (let ex of $('.contExit')) {
                ex.remove();
            }
            $(e.currentTarget).before('<div class="contExit d-flex align-items-center py-1"><span class="exitTitle d-flex align-items-center m-0 p-0 ml-2">x</span></div>');
        });

    } else if (TOOL == 'Lt') {
        $(e.target).focusout(function () {
            let item = $(e.target).text().trim();
            let id = $(e.target).parent().parent().parent().parent()[0].id
            let idParent = $(e.target).parent().parent().parent().parent().parent()[0].id
            let taskId = $(e.target).parent()[0].id
            socket.emit('changeNote', { url: URL, idBoard: id, parent: idParent, type: 'changeListTitle', item: item, target: 'changeListTitle', taskId: taskId, item: item })
        })
        $('.form').click(function (e) {
            for (let ex of $('.contExit')) {
                ex.remove();
            }
            $(e.currentTarget).before('<div class="contExit row m-0 p-0 d-flex align-items-center py-1"><span class="exitTitle col text-left m-0 p-0 ml-2">x</span><span class="toggleList col text-right m-0 p-0 mr-2">-</span></div>');
        });
    } else if (TOOL == 'toggleList') {
        $($(e.target).parent()[0].nextElementSibling).children('.containerListTask').slideToggle("slow");
        return false
    }
    if (e.target.id == "exit") {
        let id = $(e.target).parent().parent()[0].id
        let idParent = $(e.target).parent().parent().parent()[0].id
        socket.emit('changeNote', { url: URL, idBoard: id, parent: idParent, type: 'removeNote' })
        $(e.target).parent().parent().remove();
        return false;
    }

    if (e.target.id == "searchUser") {
        $('.shareInput').toggle('slide', { direction: 'right' });
    }

    if (e.target.id == "deleteRow") {
        let id = $(e.target).parent().parent().parent().parent().parent().parent().parent()[0].id
        let idParent = $(e.target).parent().parent().parent().parent().parent().parent().parent().parent()[0].id
        let li = $(e.target).parent()[0].id
        let taskId = $(e.target).parent().parent().parent().parent()[0].id
        socket.emit('changeNote', { url: URL, idBoard: id, parent: idParent, type: 'delete', target: 'delete', li: li, taskId: taskId })
    }

    if (e.target.id == "defaultCheck") {
        let id = $(e.target).parent().parent().parent().parent().parent().parent().parent().parent().parent()[0].id
        let idParent = $(e.target).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent()[0].id
        let li = $(e.target).parent().parent().parent()[0].id
        let taskId = $(e.target).parent().parent().parent().parent().parent().parent()[0].id
        socket.emit('changeNote', { url: URL, idBoard: id, parent: idParent, type: 'checked', target: 'checked', check: e.target.checked, li: li, taskId: taskId })
    }

    if (TOOL === 'exitTitle') {
        let id = $(e.target).parent().parent().parent().parent()[0].id
        let idParent = $(e.target).parent().parent().parent().parent().parent()[0].id
        let taskId = $(e.target).parent()[0].nextElementSibling.id
        socket.emit('changeNote', { url: URL, idBoard: id, parent: idParent, type: 'deleteTitle', target: 'deleteTitle', taskId: taskId })
        return false;
    }
});

$(document).change(function (e) {

    const URL = window.location.pathname;
    if (e.target.checked == true) {
        $(e.target).parent().parent().parent().children('.textli').css({ 'text-decoration': 'line-through', 'color': '#a9a9a9' })
    } else if (e.target.checked == false) {
        $(e.target).parent().parent().parent().children('.textli').css({ 'text-decoration': 'none' })
    }
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
    $(".addUser").submit(function (data) {
        e.stopPropagation();
        e.preventDefault()
        const userId = window.location.pathname.split("/")[1];
        const boardId = window.location.pathname.split("/")[3];
        const search = window.location.search;
        const email = $(this).children('input').val()
        let url = `/${userId}/shareUser/${boardId}${search}`;
        var share = $.ajax({
            url: url,
            data: JSON.stringify({
                email: email,
            }),
            type: "post",
            dataType: 'json',
            contentType: 'application/json',

        });
        share.done(function (data) {
            let div = ``;
            socket.emit('userShare', data);
            data.usersShare.forEach(user => {
                div += `<div class="users my-1 p-0 text-center">
                    <span class="cr p-1" title="${user[1]}">
                        ${user[0]}
                    </span>
                </div>`
            })
            $('.containerUsers').html(div);
        });
        return false;
    })

    $('.form').submit(e => {
        e.stopPropagation();
        e.preventDefault();
        let id = $(e.target).parent().parent().parent()[0].id
        let idParent = $(e.target).parent().parent().parent().parent()[0].id
        let input = $(e.target).children('.containerListTask').children('.form-btns').children('.inputBox').children('.inp');
        let value = input.val();
        input.val('')
        socket.emit('changeNote', { url: URL, idBoard: id, parent: idParent, type: 'submitList', target: 'form', idTask: e.target.id, value: value })
        return false;
    });
});