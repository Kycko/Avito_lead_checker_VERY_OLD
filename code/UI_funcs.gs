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

function UI_show_msg(title, msg) {
    const ui = SpreadsheetApp.getUi();
    ui.alert(title, msg, ui.ButtonSet.OK);
}
function UI_show_UD_error(data, cur, type, ui) {
    if (type === 'e-mail') {
        var title = 'Неправильный e-mail';
        var msg   = 'Введите правильное значение, оставьте поле пустым для удаления или нажмите "Отмена", чтобы исправить его потом.\n\nТекущее значение:\n• ' + cur +'\n\n';
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
