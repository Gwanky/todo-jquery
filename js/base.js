;(function () {
    'use strict';

    var $form_add_task = $('.add-task'),
        $delete_task_trigger,
        $detail_task_trigger,
        $task_detail = $('.task-detail'),
        $task_detail_mask = $('.task-detail-mask'),
        $update_form,
        $task_detail_content,
        $task_detail_content_input,
        $task_item,
        $checkbox_complete,
        $datetime,
        current_index,
        $msg = $('.msg'),
        $msg_content = $msg.find('.msg-content'),
        $msg_confirm = $msg.find('.confirmed'),
        $alerter = $('.alerter'),
        task_list = [];

    init();

    $form_add_task.on('submit', on_add_task_submit);
    $task_detail_mask.on('click', hide_task_detail);

    function on_add_task_submit(e) {
        var new_task = {};
        /* 禁用默认事件 */
        e.preventDefault();
        /* 获取新task的值 */
        var $input = $(this).find('input[name=content]');

        new_task.content = $input.val();
        new_task.desc = '';
        new_task.remind_date = '';
        /* 如果新task的值为空，值返回，否则继续执行 */
        if (!new_task.content) return;

        if (add_task(new_task)) {
            $input.val(null);
        }
    }

    /**
     * 监听删除事件
     */
    function listen_delete_task() {
        $delete_task_trigger.on('click', function () {
            var $this = $(this);
            var $item = $this.parent();
            var index = $item.data('index');
            var tmp = confirm('删除该task?');
            tmp ? del_task(index) : null;
        });
    }

    /**
     * 监听详情事件
     */
    function listen_detail_task() {
        var index;
        $task_item.on('dblclick', function () {
            index = $(this).data('index');
            show_task_detail(index);
        });
        $detail_task_trigger.on('click', function () {
            var $this = $(this);
            var $item = $this.parent();
            index = $item.data('index');

            show_task_detail(index);
        })
    }

    /**
     * 监听task是否完成
     */
    function listen_checkbox_complete() {
        $checkbox_complete.on('click', function () {
            var $this = $(this);
            var index = $this.parent().parent().data('index');
            var item = get(index);

            if (item.complete) {
                update_task(index, {complete: false});
            } else {
                update_task(index, {complete: true});
            }
        });
    }

    function listen_msg_even() {
        $msg_confirm.on('click', function () {
            hide_msg();
        });
    }

    /**
     * 获取task
     * @param index
     */
    function get(index) {
        return store.get('task_list')[index];
    }

    /**
     * 更新task
     * @param index
     * @param data
     */
    function update_task(index, data) {
        if (index === undefined || !task_list[index]) return;

        task_list[index] = $.extend({}, task_list[index], data);

        refresh_task_list();
    }

    /**
     * 渲染task-detail
     * @param index
     */
    function render_task_detail(index) {
        //判断index是否合法，task是否存在
        if (index === undefined || !task_list[index]) return;
        //获取task
        var item = get(index);
        //task-detail 模板
        var tpl = '<form>' +
            '<div class="content input-item">' + item.content + '</div>' +
            '<div class="input-item" style="display: none;"><input name="content" value="' + item.content + '"></div>' +
            '<div class="desc input-item">' +
            '<textarea name="desc">' + (item.desc || '') + '</textarea>' +
            '</div>' +
            '<div class="remind input-item">' +
            '<input class="datetime" type="text" name="remind_date" id="" value="' + (item.remind_date || '') + '">' +
            '</div>' +
            '<div><button type="submit">更新</button></div>' +
            '</form>';

        $task_detail.html(tpl);

        $update_form = $task_detail.find('form');
        $task_detail_content = $update_form.find('.content');
        $task_detail_content_input = $update_form.find('[name=content]');
        $datetime = $update_form.find('.datetime');


        $datetime.datetimepicker();

        $task_detail_content.on('dblclick', function () {
            $(this).hide();
            $task_detail_content_input.parent().show();
        });

        $update_form.on('submit', function (e) {
            e.preventDefault();
            var data = {};
            data.content = $(this).find('[name=content]').val();
            data.desc = $(this).find('[name=desc]').val();
            data.remind_date = $(this).find('[name=remind_date]').val();

            update_task(index, data);
            hide_task_detail();
        })
    }

    /**
     * 显示task-detail
     * @param index
     */
    function show_task_detail(index) {
        render_task_detail(index);
        $task_detail_mask.fadeIn(function () {
            $task_detail.fadeIn('fast');
        });
    }

    /**
     * 隐藏 task-detail
     */
    function hide_task_detail() {
        $task_detail.fadeOut('fast', function () {
            $task_detail_mask.fadeOut();
        });
    }

    /**
     * 刷新task-list
     */
    function refresh_task_list() {
        store.set('task_list', task_list);
        render_task_list();
    }

    /**
     * 添加new task
     * @param new_task
     * @returns {boolean}
     */
    function add_task(new_task) {
        task_list.push(new_task);
        refresh_task_list();
        return true;
    }

    /**
     * 删除task
     * @param index
     */
    function del_task(index) {
        if (index === undefined || !task_list[index]) return;
        delete task_list[index];
        refresh_task_list();
    }

    /**
     * 渲染task-list
     */
    function render_task_list() {
        var $task_list = $('.task-list');
        var complete_task_list = [];

        $task_list.html('');

        for (var i = 0; i < task_list.length; i++) {
            var item = task_list[i];

            if (item && item.complete) {
                complete_task_list[i] = item;
            } else {
                var $task = render_task_item(item, i);
            }

            $task_list.prepend($task);
        }

        for (var j = 0; j < complete_task_list.length; j++) {
            $task = render_task_item(complete_task_list[j], j);
            if (!$task) continue;
            $task.addClass('completed');
            $task_list.append($task);
        }

        $delete_task_trigger = $('.action.delete');
        $detail_task_trigger = $('.action.detail');
        $checkbox_complete = $('.task-list .complete');
        $task_item = $('.task-item');

        listen_delete_task();
        listen_detail_task();
        listen_checkbox_complete();
        listen_msg_even();
    }

    /**
     * 渲染task
     * @param data
     * @param index
     * @returns {*|jQuery|HTMLElement}
     */
    function render_task_item(data, index) {
        if (!data || index === undefined) return;
        var task_tpl =
            '<div class="task-item" data-index="' + index + '">' +
            '<span><input class="complete" ' + (data.complete ? 'checked' : '') + ' type="checkbox"></span>' +
            '<span class="task-content">' + data.content + '</span>' +
            '<span class="action detail fr">详情</span>' +
            '<span class="action delete fr">删除</span>' +
            '</div>';
        return $(task_tpl);
    }

    function task_remind_check() {
        var current_timestamp;
        var itl = setInterval(function () {
            for (var i = 0; i < task_list.length; i++) {
                var item = get(i),
                    task_timestamp;
                if (!item || !item.remind_date || item.informed) continue;

                current_timestamp = (new Date()).getTime();
                task_timestamp = (new Date(item.remind_date)).getTime();

                if (current_timestamp - task_timestamp >= 1) {
                    update_task(i, {informed: true});
                    show_msg(item.content);
                }
            }
        }, 300);
    }

    function show_msg(msg) {
        if (!msg) return;
        $msg_content.html(msg);
        $alerter.get(0).play();
        $msg.show();
    }

    function hide_msg() {
        $msg.hide();
    }

    function init() {
        task_list = store.get('task_list') || [];

        if (task_list.length) {
            refresh_task_list();
        }

        task_remind_check();
    }
})();
