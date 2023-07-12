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
    data.cur[r][c] = data.cur[r][c].toString().trim();  // trim spaces for all the user data
    const autocorr_list = ['регион/город', 'категория', 'источник', 'название компании', 'имя'];
    if      (type === 'e-mail')  {data.cur[r][c] = data.cur[r][c].toString().toLowerCase()}
    else if (type === 'телефон') {data.cur[r][c] = STR_format_phone(data.cur[r][c])}
    else if (ARR_search_in_list(autocorr_list, type, 'bool')) {
        if (type === 'регион/город') {data.cur[r][c] = STR_trim_city(data.cur[r][c])}
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
    else if (type === 'телефон') {
        var valid = data.cur[r][c].length === 11;
    }
    else if (type === 'регион/город') {
        var valid = ARR_search_in_list(data.cities[0], data.cur[r][c], 'bool');
    }
    else if (type === 'категория') {
        var valid = ARR_search_in_list(data.cat[0], data.cur[r][c], 'bool');
    }
    else if (type === 'источник') {
        var valid = ARR_search_in_list(data.sources[0], data.cur[r][c], 'bool');
    }
    return valid;
}

function rotate_my_range(old_range) {
    const new_range = {r : old_range.c,
                       c : old_range.r,
                       h : old_range.w,
                       w : old_range.h}
    return new_range;
}

// cat_row = category row
function verify_vertical(data, r, c, cat_row) {
    const index = ARR_search_in_list(data.cat[0], data.cur[cat_row][c]);
    if (index >= 0) {
        data.cur[r][c] = data.cat[2][index];
        data.bg_colors[r][c] = Gcolors().hl_light_green;
    }
    else {
        data.cur[r][c] = '';
        data.bg_colors[r][c] = Gcolors().hl_red;
    }
    return data;
}
function verify_manager(data, r, c, cat_row, city_row) {
    data.cur[r][c]       = '';
    data.bg_colors[r][c] = Gcolors().hl_red;

    var index = ARR_search_in_list(data.cat[0], data.cur[cat_row][c]);
    if (index >= 0) {
        const cat_group = data.cat[1][index];
        for (var i=1; i < data.man[0].length; i+=1) {
            if (data.man[0][i] === cat_group) {
                if (data.man[1][i] === 'все') {
                    data.cur[r][c] = data.man[2][i];
                    data.bg_colors[r][c] = Gcolors().hl_light_green;
                    return data;
                }
                else {
                    var city_ind = ARR_search_in_list(data.cities[0], data.cur[city_row][c]);
                    if (city_ind >= 0) {
                        if (STR_find_sub(data.man[1][i], data.cities[1][city_ind], 'bool')) {
                            data.cur[r][c] = data.man[2][i];
                            data.bg_colors[r][c] = Gcolors().hl_light_green;
                            return data;
                        }
                    }
                    else {return data}
                }
            }
        }
    }
    return data;
}
