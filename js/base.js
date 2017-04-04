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
        current_index,
        task_list = [];

    init();

    $form_add_task.on('submit',on_add_task_submit);
    $task_detail_mask.on('click',hide_task_detail);

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
        if(!new_task.content) return;

        if(add_task(new_task)) {
            $input.val(null);
        }
    }

    /**
     * 监听删除事件
     */
    function listen_delete_task() {
        $delete_task_trigger.on('click',function() {
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
        $task_item.on('dblclick',function () {
            index = $(this).data('index');
            show_task_detail(index);
        });
        $detail_task_trigger.on('click',function () {
            var $this = $(this);
            var $item = $this.parent();
            index = $item.data('index');

            show_task_detail(index);
        })
    }

    function update_task(index,data) {
        if(index === undefined || !task_list[index]) return;
        task_list[index] =data;
        refresh_task_list();
    }

    function render_task_detail(index) {
        if(index === undefined || !task_list[index]) return;
        var item = task_list[index];


        var tpl ='<form>' +
            '<div class="content input-item">'+ item.content +'</div>' +
            '<div class="input-item" style="display: none;"><input name="content" value="'+ item.content +'"></div>' +
            '<div class="desc input-item">' +
                '<textarea name="desc">'+ (item.desc || '') +'</textarea>' +
            '</div>' +
            '<div class="remind input-item">' +
                '<input type="date" name="remind_date" id="" value="'+ item.remind_date +'">' +
            '</div>' +
            '<div><button type="submit">更新</button></div>' +
        '</form>';

        $task_detail.html(tpl);

        $update_form = $task_detail.find('form');
        $task_detail_content = $update_form.find('.content');
        $task_detail_content_input = $update_form.find('[name=content]');

        $task_detail_content.on('dblclick',function (){
            $(this).hide();
            $task_detail_content_input.parent().show();
        })

        $update_form.on('submit',function (e) {
            e.preventDefault();
            var data = {};
            data.content = $(this).find('[name=content]').val();
            data.desc = $(this).find('[name=desc]').val();
            data.remind_date = $(this).find('[name=remind_date]').val();

            update_task(index,data);
            hide_task_detail();
        })
    }

    function show_task_detail (index) {
        render_task_detail(index);
        $task_detail_mask.fadeIn(function () {
            $task_detail.fadeIn('fast');
    });
    }

    function hide_task_detail () {
        $task_detail.fadeOut('fast',function () {
            $task_detail_mask.fadeOut();
        });
    }

    function refresh_task_list() {
        store.set('task_list',task_list);
        render_task_list();
        listen_delete_task();
        listen_detail_task();
    }

    function add_task (new_task) {
        task_list.push(new_task);
        refresh_task_list();
        return true;
    }

    function del_task(index) {
        if( index === undefined || !task_list[index]) return;
        delete task_list[index];
        refresh_task_list();
    }

    function render_task_list () {
        var $task_list = $('.task-list');

        $task_list.html('');

        for (var i = 0; i < task_list.length; i++) {
            var $task = render_task_item(task_list[i],i);
            $task_list.prepend($task);
        }

        $delete_task_trigger = $('.action.delete');
        $detail_task_trigger = $('.action.detail');
        $task_item = $('.task-item');
    }

    function render_task_item(data,index) {
        if (!data || index === undefined) return;
        var task_tpl =
            '<div class="task-item" data-index="' + index +'">' +
                '<span><input type="checkbox"></span>' +
                '<span class="task-content">' + data.content + '</span>' +
                '<span class="action detail fr">详情</span>'+
                '<span class="action delete fr">删除</span>' +
            '</div>';
        return $(task_tpl);
    }

    function init () {
        task_list = store.get('task_list') || [];
        if(task_list.length) {
           refresh_task_list();
        }
    }
})();
