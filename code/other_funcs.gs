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
    data.cur[r][c]      = data.cur[r][c].toString().trim(); // trim spaces for all the user data
    const autocorr_list = ['регион/город',
                           'категория',
                           'источник',
                           'название компании',
                           'имя',
                           'статус',
                           'ответственный',
                           'доступен для всех',
                           'должность'];
    if (type === 'e-mail') {
        data.cur[r][c] = data.cur[r][c].toLowerCase();
        // RPL = replace
        var RPL = {from : ['–', '—', '|', ';', '; ', ', '],
                   to   : ['-', '-', ',', ',', ',' , ',']}
        while (STR_find_sub_list(data.cur[r][c], RPL.from, 'bool')) {
            for (i=0; i < RPL.from.length; i+=1) {
                data.cur[r][c] = data.cur[r][c].replace(RPL.from[i], RPL.to[i]);
            }
        }
        data.cur[r][c] = ARR_rm_doubles_in_list(data.cur[r][c].split(',')).join(',');
    }
    else if (type === 'сайт')                       {data.cur[r][c] = STR_format_website(data.cur[r][c])}
    else if (STR_find_sub(type, 'телефон', 'bool')) {data.cur[r][c] = STR_format_phone  (data.cur[r][c], type === 'основной телефон')}
    else if (ARR_search_in_list(autocorr_list, type, 'bool')) {
        if (type === 'регион/город') {
            data.cur[r][c] = STR_trim_city(data.cur[r][c]);
            var       temp = data.cur[r][c].split(' ');
            if (ARR_search_in_list(['обл.', 'обл'], ARR_last_item(temp), 'bool')) {
                temp[ARR_last_index(temp)] = 'область';
            }
            data.cur[r][c] = temp.join(' ');
        }
        else if (type === 'должность') {data.cur[r][c] = data.cur[r][c].toLowerCase()}
        for (var i=0; i < data.autocorr[1].length; i+=1) {
            var check1 = data.autocorr[0][i].toString().toLowerCase() == type;
            var check2 = data.autocorr[1][i].toString().toLowerCase() == data.cur[r][c].toLowerCase();
            if (check1 && check2) {
                data.cur[r][c] = data.autocorr[2][i];
                return data;
            }
        }
    }
    return data;
}
function validate_UD(data, r, c, type) {
    if (STR_find_sub_list(type, ['телефон', 'e-mail'], 'bool')) {
        var valid = true;
        var list  = data.cur[r][c].toString().split(',');
        for (i=0; i < list.length; i+=1) {
            if (type === 'e-mail') {
                if (!STR_check_email(list[i])) {valid = false}
            }
            else if (type === 'основной телефон') {
                if (list[i].length !== 11 || list[i].toString().charAt(0) != '7') {valid = false}
            }
            else if (type === 'другой телефон') {
                if (list[i] === '79999999999') {valid = false}
                else if (list[i].length !== 0 && (list[i].length !== 11 || list[i].toString().charAt(0) != '7')) {
                    valid = false;
                }
            }
        }
    }
    else if (type === 'сайт') {
        if      (!data.cur[r][c].length)                                                   {valid = true}
        else if ( STR_find_sub(data.cur[r][c], '@', 'bool'))                               {valid = false}
        else if ( STR_find_sub(data.cur[r][c], ' ', 'bool'))                               {valid = false}
        else if (!STR_find_sub(data.cur[r][c], '.', 'bool'))                               {valid = false}
        else if (STR_find_sub_list(data.cur[r][c], ['http://', 'https://', 'www.']) === 0) {valid = false}
        else if (data.cur[r][c].toString().slice(-1) == '/')                               {valid = false}
        else                                                                               {valid = true}
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
    else if (type === 'должность')         {var valid = true}
    else if (type === 'дата')              {var valid = validate_date(data.cur[r][c].toString().split('.'))}
    else if (type === 'статус')            {var valid = data.cur[r][c].toString().toLowerCase() === 'новый'}
    else if (type === 'ответственный')     {var valid = data.cur[r][c].toString().toLowerCase() === 'квалификаторы'}
    else if (type === 'доступен для всех') {var valid = data.cur[r][c].toString().toLowerCase() === 'да'}
    else if (type === 'только цифры')     {var valid = data.cur[r][c].length === data.cur[r][c].toString().replace(/\D+/g, '').length}
    else if (type === 'статус посещения мероприятия клиентом') {
        var valid = ARR_search_in_list(['visited', 'not visited'], data.cur[r][c].toString().toLowerCase(), 'bool');
    }
    return valid;
}
function validate_date(list) {
    if (list.length === 3) {
        var valid_list = [false, false, false];
        if (Number(list[0]) > 0    && Number(list[0]) < 32)   {valid_list[0] = true}
        if (Number(list[1]) > 0    && Number(list[1]) < 13)   {valid_list[1] = true}
        if (Number(list[2]) > 2000 && Number(list[2]) < 2100) {valid_list[2] = true}

        var valid = true;
        for (var i=0; i < valid_list.length; i+=1) {
            if (!valid_list[i]) {valid = false}
        }
        return valid;
    }
    else {return false}
}

function rotate_my_range(old_range) {
    const new_range = {r : old_range.c,
                       c : old_range.r,
                       h : old_range.w,
                       w : old_range.h}
    return new_range;
}

// cat_row = category row
function verify_vertical(data, r, c, cat_row, only_verify) {
    const GC    = Gcolors();
    const index = ARR_search_in_list(data.cat[0], data.cur[cat_row][c]);

    if (only_verify) {
        if (index >= 0 && data.cur[r][c] == data.cat[2][index]) {data.bg_colors[r][c] = GC.hl_light_green}
        else                                                    {data.bg_colors[r][c] = GC.hl_red}
    }
    else {
        if (index >= 0) {data = change_and_notify_vert_or_man(data, r, c, data.cur[r][c], data.cat[2][index], GC.hl_light_green, 'вертикаль')}
        else {
            data.bg_colors[r][c] = GC.hl_red;
            data.cur      [r][c] = '';
        }
    }
    return data;
}
function verify_manager(data, r, c, cat_row, city_row, only_verify) {
    const init_str       = data.cur[r][c];
    data.bg_colors[r][c] = Gcolors().hl_red;
    if (!only_verify) {data.cur[r][c] = ''}

    var index = ARR_search_in_list(data.cat[0], data.cur[cat_row][c]);
    if (index >= 0) {
        const cat_group = data.cat[1][index];
        for (var i=1; i < data.man[0].length; i+=1) {
            if (data.man[0][i] === cat_group) {
                if (data.man[1][i] === 'все') {
                    if (only_verify) {
                        if (data.cur[r][c].length && data.cur[r][c] == data.man[2][i]) {data.bg_colors[r][c] = Gcolors().hl_light_green}
                    }
                    else {data = change_and_notify_vert_or_man(data, r, c, init_str, data.man[2][i], Gcolors().hl_light_green, 'менеджер')}
                    return data;
                }
                else {
                    var city_ind = ARR_search_in_list(data.cities[0], data.cur[city_row][c]);
                    if (city_ind >= 0) {
                        if (STR_find_sub(data.man[1][i], data.cities[1][city_ind], 'bool')) {
                            if (only_verify) {
                                if (data.cur[r][c].length && data.cur[r][c] == data.man[2][i]) {
                                    data.bg_colors[r][c] = Gcolors().hl_light_green;
                                }
                            }
                            else {data = change_and_notify_vert_or_man(data, r, c, init_str, data.man[2][i], Gcolors().hl_light_green, 'менеджер')}
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

// при автоматическом изменении вертикалей и менеджеров уведомляем пользователя
function change_and_notify_vert_or_man(data, r, c, init_str, new_str, new_color, type) {
    data.cur[r][c] = new_str;
    if (init_str.length && init_str.toString().toLowerCase() != new_str.toString().toLowerCase()) {
        if (new_str.length) {data.bg_colors[r][c] = Gcolors().hl_yellow}
        data.notes[r][c] = 'Предыдущее значение ячейки: ' + init_str;
        if     (type === 'вертикаль') {data.vert_changed    = true}
        else if (type === 'менеджер') {data.manager_changed = true}
    }
    else if (new_str.length) {data.bg_colors[r][c] = new_color}
    return data;
}
