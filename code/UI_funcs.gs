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
function UI_show_UD_error(data, cur, type, ui) {
    if (ARR_search_in_list(['e-mail', 'статус', 'ответственный', 'доступен для всех'], type, 'bool')) {
        var title = 'Неправильный ' + type.toString();
        var msg   = 'Введите правильное значение, оставьте поле пустым для удаления или нажмите "Отмена", чтобы исправить его потом.\n\nТекущее значение:\n• ' + cur +'\n\n';
    }
    else if (type === 'дата') {
        var title = 'Неправильная дата';
        var msg   = 'Введите правильное значение или нажмите "Отмена", чтобы исправить его потом.\n\nТекущее значение:\n• ' + cur +'\n\n';
    }
    else if (type === 'регион/город') {
        var title = 'Неправильный регион/город';
        var msg   = ARR_recommend_correction(data.sugg, cur, type);
    }
    else if (type === 'категория') {
        var title = 'Неправильная категория';
        var msg   = ARR_recommend_correction(data.sugg, cur, type);
    }
    else if (type === 'источник') {
        var title = 'Неправильный источник';
        var msg   = ARR_recommend_correction(data.sugg, cur, type);
    }
    return ui.prompt(title, msg, ui.ButtonSet.OK_CANCEL);
}
function UI_MM_show_dialogues() {
    const title = 'Предлагать сразу исправлять ошибки?';
    const msg   = 'Если нет, диалоговые окна не будут появляться, а все ошибки будут подсвечены красным.';
    return UI_show_msg(title, msg, true);
}
