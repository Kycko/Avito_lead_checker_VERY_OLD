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

// UD = user data
function autocorr_UD(data, r, c, type) {
    const autocorr_list = ['регион/город', 'категория'];
    if      (type === 'e-mail')       {data.cur[r][c] = data.cur[r][c].toString().toLowerCase()}
    else if (ARR_search_in_list(autocorr_list, type, 'bool')) {
        var index = ARR_search_in_list(data.autocorr[1], data.cur[r][c]);
        if (index >= 0 && data.autocorr[0][index] === type) {
            data.cur[r][c] = data.autocorr[2][index];
        }
    }
    return data;
}
function validate_UD(data, r, c, type) {
    if (type === 'e-mail') {
        var valid = true;
        var list  = data.cur[r][c].toString().split(',');
        for (i=0; i < list.length; i+=1) {
            if (!STR_check_email(list[i])) {valid = false}
        }
    }
    else if (type === 'регион/город') {
        var valid = ARR_search_in_list(data.cities[0], data.cur[r][c], 'bool');
    }
    else if (type === 'категория') {
        var valid = ARR_search_in_list(data.cat[0], data.cur[r][c], 'bool');
    }
    return valid;
}
