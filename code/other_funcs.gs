// CRS = check required sheets
function CRS(type, data, show_msg=true) {
    const names   = Greq_sheets();
    const obj     = Gno_sheet_msgs()[type];
    var NA_sheets = [];
    for (var i=0; i < obj.sheets.length; i+=1) {
        const prop = obj.sheets[i];
        if (!data[prop]) {NA_sheets.push(names[prop])}
    }

    // if ([]) почему-то выдаёт true
    if (show_msg && NA_sheets.length) {
        if (NA_sheets.length === 1) {var text = 'Отсутствует лист:'}
        else                        {var text = 'Отсутствуют листы:'}
        for (i=0; i < NA_sheets.length; i+=1) {text += '\n• ' + NA_sheets[i]}
        UI_show_msg(obj.title, text);
    }
    return !NA_sheets.length;  // true if all is OK
}
function get_col_letter_from_num(column) {
    var temp, letter = '';
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}
function find_substring(string, sub, type='index') {
    const index = string.toLowerCase().indexOf(sub.toLowerCase());
    if (index >= 0) {
        if (type === 'index') {return index}
        else                  {return true}
    }
}

// r = row, c = column
function check_email_in_cell(data, r, c) {
    var list  = data.cur[r][c].split(',');
    var valid = true;
    for (i=0; i < list.length; i+=1) {
        if (!check_email(list[i])) {valid = false}
    }

    if (!valid) {
        const R    = r+1; // R = row in sheets notation
        const cell = get_col_letter_from_num(c+1) + R;
        const ui   = SpreadsheetApp.getUi();
        const resp = ui.prompt('Неправильный e-mail в ячейке ' + cell,
                               'Введите правильное значение, оставьте поле пустым для удаления или нажмите "Отмена", чтобы исправить его потом.\n\nТекущее значение:\n• ' + data.cur[r][c] +'\n\n',
                               ui.ButtonSet.OK_CANCEL);
        if (resp.getSelectedButton() == ui.Button.OK) {data.cur[r][c] = resp.getResponseText()}
        else                                          {data.mark_red.push([r, c])}
    }
    return data;
}
function check_email(string) {
    return false;
}
