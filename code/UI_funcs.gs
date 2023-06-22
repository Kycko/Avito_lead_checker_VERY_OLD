/** @OnlyCurrentDoc */
function onOpen() {
    const GT = Gtext();
    var menu = SpreadsheetApp.getUi().createMenu(GT.MM_title);

    menu.addItem(GT.MM_launch_all[0], GT.MM_launch_all[1]);
    menu.addSeparator();
    for (var i=0; i < GT.MM_items.length; i+=1) {
        menu.addItem(GT.MM_items[i][0], GT.MM_items[i][1]);
    }
    menu.addToUi();
}

function UI_show_msg(title, msg) {
    const ui = SpreadsheetApp.getUi();
    ui.alert(title, msg, ui.ButtonSet.OK);
}
