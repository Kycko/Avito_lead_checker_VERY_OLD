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
