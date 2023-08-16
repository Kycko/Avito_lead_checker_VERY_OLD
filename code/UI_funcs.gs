/** @OnlyCurrentDoc */
function onOpen() {
    const GT = Gtext();
    var menu = SpreadsheetApp.getUi().createMenu(GT.MM_title);
    for (var i=0; i < GT.MM_items.length; i+=1) {
        if (GT.MM_items[i][0] === 'separator') {menu.addSeparator()}
        else                                   {menu.addItem(GT.MM_items[i][0], GT.MM_items[i][1])}
    }
    menu.addToUi();
}

function UI_show_msg(title, msg, question=false) {
    const ui = SpreadsheetApp.getUi();
    if (question) {var buttons = ui.ButtonSet.YES_NO}
    else          {var buttons = ui.ButtonSet.OK}
    const resp = ui.alert(title, msg, buttons);

    if     (resp == ui.Button.YES) {return true}
    else if (resp == ui.Button.NO) {return false}
}
function UI_show_UD_error(data, r, c, type, ui, range) {
    // title
    if (ARR_search_in_list(['дата', 'категория'], type, 'bool')) {var title = 'Неправильная ' + type}
    else                                                         {var title = 'Неправильный ' + type}

    // message
    if (ARR_search_in_list(['e-mail', 'сайт'], type, 'bool')) {
        var msg   = 'Введите правильное значение, оставьте поле пустым для удаления или нажмите "Отмена", чтобы исправить его потом.\n\nТекущее значение:\n• ' + data.cur[r][c] +'\n\n';
    }
    else {var msg = ARR_recommend_correction(data.sugg, data.cur[r][c], type)}

    // errors counter
    const total   = range.h * range.w;
    const current = (r-range.r)*range.w + (c-range.c+1);
    title        += ' (' + current.toString() + ' из ' + total.toString() + ')'

    return ui.prompt(title, msg, ui.ButtonSet.OK_CANCEL);
}
function UI_MM_show_dialogues() {
    const title = 'Предлагать сразу исправлять ошибки?';
    const msg   = 'Если нет, диалоговые окна не будут появляться, а все ошибки будут подсвечены красным.';
    return UI_show_msg(title, msg, true);
}
function UI_add_title_in_comments() {
    const title = 'Добавить названия столбцов?';
    const msg   = 'Если нет, в комментарий будет добавлено только значение из ячейки.';
    return UI_show_msg(title, msg, true);
}
function UI_ask_separator(ui) {
    const title = 'Введите разделитель';
    const msg   = 'Введите символы, которые будут разделять в комментарии данные из разных столбцов. Пробелы тоже учитываются, т. е. в большинстве случаев нужно ввести "пробел|пробел".\n\nЕсли оставить это поле пустым, данные из разных столбцов будут соединены без разделителей.\nЕсли нажать "Отмена" или закрыть это окно, скрипт завершит свою работу, не выполнив никаких действий.\n\n';
    return ui.prompt(title, msg, ui.ButtonSet.OK_CANCEL);
}
function UI_show_vert_man_toast(data) {
    if      (!data.vert_changed && !data.manager_changed) {return}
    else if ( data.vert_changed && !data.manager_changed) {var title = 'Вертикаль изменена!'}
    else if (!data.vert_changed &&  data.manager_changed) {var title = 'Менеджеры изменены!'}
    else if ( data.vert_changed &&  data.manager_changed) {var title = 'Вертикали и менеджеры изменены!'}
    const msg = 'Все автоматически изменённые ячейки будут подсвечены жёлтым цветом.';
    SpreadsheetApp.getActive().toast(msg, title, 10);
}
