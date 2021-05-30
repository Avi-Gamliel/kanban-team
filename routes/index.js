const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth')
const { ensureAdmin } = require('../config/admin')
// const mysql = require('mysql');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Page = require('.././modules/pages');
const User = require('.././modules/user');
const Tasks = require('.././modules/tasks');
const user = require('.././modules/user');

dotenv.config();

//----------- GET Welcome page PUBLIC -----------//
router.get('/', (req, res) => res.render('welcome'));

//----------- GET Dashboard page private -----------// 
router.get('/:id/dashboard', ensureAuthenticated, async (req, res) => {

    try {
        await Page.find({ custumer_id: [req.params.id] }).populate('custumers_share').populate('custumer_id').
            exec(async function (err, costumer) {
                if (err) return handleError(err);
                await Page.find({ custumers_share: { $in: [req.params.id.trim()] } }).populate('custumers_share').populate('custumer_id').
                    exec(async function (err, costumershare) {
                        if (err) return handleError(err);
                        await User.find({ _id: req.params.id }).exec().then(async (adminUser) => {
                            await res.render('dashboard', { msg: costumer, msgShare: costumershare, name: adminUser[0], login: true, user: req.params.id })
                        })
                    });
            });

    } catch {
    }
});

//----------- GET Dashboard page private -----------// 
router.post('/:id/dashboard/:board', ensureAuthenticated, async (req, res) => {
    try {
        let errors = [];
        let users = [];
        await Page.find({ page_id: req.params.board, custumer_id: [req.params.id] }).populate('custumers_share').populate('custumer_id').
            exec(async function (err, costumer) {
                if (err) return handleError(err);
                if (costumer[0].custumers_share.length > 0) {
                    await costumer[0].custumers_share.forEach(async userShare => {
                        if (costumer[0].custumers_share.length == 0) return;
                        await users.push([userShare.shortName, userShare.name, userShare._id])
                    });
                }
                await User.find({ _id: req.query.v }).exec().then(async (adminUser) => {
                    await res.render('project', { msg: costumer, login: true, name: adminUser[0], usersShare: users, id: req.user._id, errors: errors })
                });
            });
    } catch {
    }
});

router.get('/:id/dashboard/:board', ensureAuthenticated, async (req, res) => {
    try {
        let errors = [];
        let users = [];
        await Page.find({ page_id: req.params.board, custumer_id: [req.params.id] }).populate('custumers_share').populate('custumer_id').
            exec(async function (err, costumer) {
                if (err) return handleError(err);
                await costumer[0].custumers_share.forEach(async userShare => {
                    if (costumer[0].custumers_share.length == 0) return;
                    await users.push([userShare.shortName, userShare.name])
                });
                await User.find({ _id: req.query.v }).exec().then(async (adminUser) => {
                    await res.render('project', { msg: costumer, login: true, name: adminUser[0], usersShare: users, id: req.user._id, errors: errors })
                });
            });
    } catch {
    }
});

router.post('/:id/shareUser/:board', ensureAuthenticated, ensureAdmin, async (req, res) => {
    const email = req.body.email
    const userid = req.params.id;
    const pageid = req.params.board;
    try {
        let errors = [];
        let users = [];
        await User.find({ email: email }).exec().then(async user => {
            await Page.find({ custumer_id: [userid], page_id: pageid }).exec().then(async PAGE => {
                await Page.find({ custumer_id: [userid], page_id: pageid }).populate('custumers_share').populate('custumer_id').exec(async function (err, page) {
                    if (user.length == 0) {
                        req.flash('success_msg', 'the user is not exist');
                        return res.redirect(`/${userid}/dashboard/${pageid}?v=${req.query.v}`)
                    } else if (!page) {
                        return;
                    } else if (email == page[0].custumer_id[0].email) {
                        req.flash('success_msg', 'You are the admin');
                        return res.redirect(`/${userid}/dashboard/${pageid}?v=${req.query.v}`)
                    }
                    if (PAGE[0].custumers_share.indexOf(user[0]._id) !== -1) {
                        req.flash('success_msg', "this user share in this board");
                        return res.redirect(`/${userid}/dashboard/${pageid}?v=${req.query.v}`)
                    }
                    await page[0].custumers_share.push(user[0]._id);
                    await page[0].save().then(async pageUpdate => {
                        await user[0].pages_share.push(page[0]._id);
                        let note = await {
                            msg: `${req.user.name} share with you board `,
                            short: req.user.shortName,
                            view: false,
                            time: new Date(),
                        }
                        let length = await user[0].notification.length;
                        if (length == 10) {
                            await user[0].notification.splice(-1, 1);
                            await user[0].notification.unshift(note);
                        } else if (length < 10) {
                            await user[0].notification.unshift(note);
                        }
                        await user[0].save().then(async e => {
                            await Page.find({ page_id: req.params.board, custumer_id: [req.params.id] }).populate('custumers_share').
                                exec(async function (err, costumer) {
                                    if (err) return handleError(err);
                                    costumer.forEach(async userShare => {
                                        if (userShare.custumers_share.length == 0) return;
                                        await users.push([userShare.custumers_share[0].shortName, userShare.custumers_share[0].name, userShare.custumers_share[0]._id])
                                    });
                                    await res.json({
                                        pageName: costumer[0].name_board,
                                        pageDesc: costumer[0].name_desc,
                                        pageId: costumer[0].page_id,
                                        AdminId: costumer[0].custumer_id[0],
                                        adminName: page[0].custumer_id[0].name,
                                        adminShort: page[0].custumer_id[0].shortName,
                                        usersShare: users,
                                    });
                                });
                        });
                    })
                })
            })
        })
    } catch {
    }
});

//----------- POST save data private -----------//
router.post('/:id/saveBoard', ensureAuthenticated, async (req, res) => {
    let id = req.body.boardId;
    let title = req.body.title;
    let desc = req.body.desc;
    try {
        await Page.find({ custumer_id: [req.params.id], page_id: id }).exec().then(async doc => {
            if (doc.length == 0) {
                const page = await new Page({
                    page_id: id,
                    custumer_id: req.params.id,
                    name_board: title,
                    name_desc: desc,
                    max_doing: 3
                });
                await page.save().then(async page => {
                    await User.find({ _id: req.params.id }).exec().then(async user => {
                        await user[0].pages.push(page);
                        await user[0].save().then(async result => {
                            await Page.find({ custumer_id: [req.params.id], page_id: id }).populate('custumers_share').populate('custumer_id').
                                exec(async function (err, costumer) {
                                    if (err) return handleError(err);
                                    res.json(costumer)
                                });
                        })
                    })
                }).catch(err => {
                    console.log(err);
                });
            } else {
                await User.find({ _id: req.params.id }).exec().then(async user => {
                    if (doc[0].name_board.trim() == title.trim() && doc[0].name_desc.trim() == desc.trim()) {
                        return res.json('no change')
                    } else {
                        await doc[0].update({ name_board: title, name_desc: desc })
                            .exec()
                            .then(async d => {
                                await Page.find({ custumer_id: [req.params.id], page_id: id }).populate('custumers_share').populate('custumer_id').
                                    exec(async function (err, costumer) {
                                        if (err) return handleError(err);
                                        let note = await {
                                            msg: `${user[0].name} change the name board `,
                                            short: user[0].shortName,
                                            view: false,
                                            time: new Date(),
                                        }
                                        await costumer[0].custumers_share.forEach(async guset => {
                                            await User.find({ _id: guset._id }).exec().then(async gusetDetail => {
                                                let length = await gusetDetail[0].notification.length;
                                                if (length == 10) {
                                                    await gusetDetail[0].notification.splice(-1, 1);
                                                    await gusetDetail[0].notification.unshift(note);
                                                } else if (length < 10) {
                                                    await gusetDetail[0].notification.unshift(note);
                                                }
                                                await gusetDetail[0].save().then(async () => {
                                                    await res.json(costumer[0]._id)
                                                });
                                            })
                                        })
                                    });
                            });
                    }
                }).catch(err => {
                    console.log(err);
                })
            }
        });
    } catch {
    }
});
//----------- POST save data private -----------//
router.post('/:id/clearNotification/:board', ensureAuthenticated, async (req, res) => {
    let newNote = []
    try {
        await User.find({ _id: [req.params.id] }).exec().then(async user => {
            user[0].notification.forEach(note => {
                note.view = true;
                newNote.push(note)
            })
            await user[0].update({ notification: newNote }).exec().then(d => {
            });
        })
    } catch {
    }
});

//----------- POST save data private -----------//
router.post('/:id/saveBoard/:board', ensureAuthenticated, async (req, res) => {
    let max = req.body.data.max;
    let planObjectTasks = req.body.data.planObj.tasks;
    let todoObjectTasks = req.body.data.todoObj.tasks;
    let doingObjectTasks = req.body.data.doingObj.tasks;
    let doneObjectTasks = req.body.data.doneObj.tasks;
    let keysPlan = Object.keys(planObjectTasks);
    try {
        await Page.find({ custumer_id: [req.params.id], _id: req.body.data.page_id }).exec().then(async doc => {
            if (!doc[0].plan) {
                doc[0].max_doing = await max;
                doc[0].plan = await planObjectTasks;
                doc[0].todo = await todoObjectTasks;
                doc[0].doing = await doingObjectTasks;
                doc[0].done = await doneObjectTasks;
                await doc[0].save();
                res.json(doc[0])
            } else {
                doc[0].max_doing = await max;
                doc[0].plan = await planObjectTasks;
                doc[0].todo = await todoObjectTasks;
                doc[0].doing = await doingObjectTasks;
                doc[0].done = await doneObjectTasks;
                await doc[0].save();
                res.json(doc[0])
            }
        });
    } catch {
    }
});

//----------- POST delete data private -----------//
router.delete('/:id/deleteBoard/:board', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        await Page.find({ custumer_id: [req.params.id], page_id: req.params.board }).exec().then(async doc => {
            if (!doc[0]) return; // if not exit
            const pageId = doc[0]._id;
            const userShares = doc[0].custumers_share;
            await doc[0].remove().then(async result => {
                await User.find({ _id: req.params.id, pages: { $in: [pageId.toString().trim()] } }).exec().then(async adminuser => {
                    await adminuser[0].pages.forEach(async (page, i) => {
                        if (page.toString().trim() == pageId.toString().trim()) {
                            await adminuser[0].pages.splice(i, 1)
                            await adminuser[0].save().then(async Res => {
                                await userShares.forEach(async (share, i) => {
                                    User.find({ _id: [share] }).exec().then(async UserShare => {
                                        await UserShare[0].pages_share.forEach(async (pageShare, j) => {
                                            if (pageShare.toString().trim() == pageId.toString().trim()) {
                                                await UserShare[0].pages_share.splice(j, 1);
                                                let note = await {
                                                    msg: `${adminuser[0].name} delete the board `,
                                                    short: adminuser[0].shortName,
                                                    view: false,
                                                    time: new Date(),
                                                }
                                                let length = await UserShare[0].notification.length;
                                                if (length == 10) {
                                                    await UserShare[0].notification.splice(-1, 1);
                                                    await UserShare[0].notification.unshift(note);
                                                } else if (length < 10) {
                                                    await UserShare[0].notification.unshift(note);
                                                }
                                                await UserShare[0].save().then(async () => {
                                                    res.json({
                                                        notification: UserShare[0].notification,
                                                        page: doc,
                                                        adminName: adminuser[0].name,
                                                        adminShort: adminuser[0].shortName
                                                    })
                                                });
                                            }
                                        })
                                    });
                                })
                            }).catch(err => console.log(err))
                        }
                    });
                }).catch(err => console.log(err))
            });
        }).catch(err => console.log(err));
    } catch {
    }
});

module.exports = router;