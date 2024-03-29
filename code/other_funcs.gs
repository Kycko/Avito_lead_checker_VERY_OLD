// CRS = check required sheets
function CRS(type, data, show_msg=true) {
    const names   = Greq_sheets();
    const obj     = Gno_sheet_msgs()[type];
    var NA_sheets = [];
    obj.sheets.forEach(item => {
        if (!data[item]) {NA_sheets.push(names[item])}
    });

    // if ([]) почему-то выдаёт true
    if (show_msg && NA_sheets.length) {
        if (NA_sheets.length === 1) {var text = 'Отсутствует лист:'}
        else                        {var text = 'Отсутствуют листы:'}
        NA_sheets.forEach(item => text += '\n• '+item);
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
                           'вертикаль',
                           'источник',
                           'название компании',
                           'фамилия',
                           'имя',
                           'отчество',
                           'статус',
                           'ответственный',
                           'доступен для всех',
                           'должность',
                           'e-mail'];
    if (type === 'e-mail') {
        data.cur[r][c] = data.cur[r][c].toLowerCase();
        // RPL = replace
        var RPL = {from : ['​', '–', '—', '|', ';', '; ', ', ', ',,'],   // первое – это мягкий пробел (u200b)
                   to   : ['', '-', '-', ',', ',', ',' , ',',  ',']}
        while (STR_find_sub_list(data.cur[r][c], RPL.from, 'bool')) {
            for (i=0; i < RPL.from.length; i++) {
                data.cur[r][c] = data.cur[r][c].replace(RPL.from[i], RPL.to[i]);
            }
        }

        var list = data.cur[r][c].split(',');
        if (list.length) {
            for (i=0; i < list.length; i++) {
                let dog_counter = (list[i].match(/@/g)||[]).length;
                list[i]         =  list[i].split('@');
                let         num = ARR_last_index(list[i]);
                let       gmail = STR_find_sub(list[i][num], 'gmail', 'bool');
                if (dog_counter === 1 && gmail) {list[i][num] = 'gmail.com'}
                list[i] = list[i].join('@');
            }
        }

        data.cur[r][c] = ARR_rm_doubles_in_list(list).join(',');
    }
    else if (type === 'сайт')                       {data.cur[r][c] = STR_format_website(data.cur[r][c])}
    else if (STR_find_sub(type, 'телефон', 'bool')) {data.cur[r][c] = STR_format_phone  (data.cur[r][c], type === 'основной телефон')}
    if (ARR_search_in_list(autocorr_list, type, 'bool')) {
        if (type === 'регион/город') {
            // обрезаем всякие г. и т. п.
            data.cur[r][c] = STR_trim_city(data.cur[r][c]);
 
            // до парсинга autocorr'а переводим в кириллицу только если это даст нужное значение(!), а иначе даём в autocorr латиницу
            let temp_city = STR_latin_to_cyrillic(data.cur[r][c]);
            let city_ind  = ARR_search_in_list   (data.autocorr[1], temp_city); // потому что autocorr перевёрнут
            // Logger.log(temp_city + ': ' + city_ind); // для проверки (номер строки, если найдено в autocorr'е)
            if (city_ind >= 0 && data.autocorr[0][city_ind].toString().toLowerCase() == type) {
                data.cur[r][c] = temp_city;
            }

            // исправляем обл.
            let temp = data.cur[r][c].split(' ');
            if (ARR_search_in_list(['обл.', 'обл'], ARR_last_item(temp), 'bool')) {
                temp[ARR_last_index(temp)] = 'область';
            }
            data.cur[r][c] = temp.join(' ');

            // capitalization
            let indx = ARR_search_in_list(data.cities[0], data.cur[r][c]);
            if (indx !== null && indx >= 0) {data.cur[r][c] = data.cities[0][indx]}
        }
        else if (type === 'должность') {
            data.cur[r][c] = data.cur[r][c].toLowerCase();
            // RPL = replace
            var RPL = {from : ['директор ', 'руководитель ', 'специалист '],
                       to   : ['дир. ',     'рук. ',         'спец. ']}
            for (i=0; i < RPL.from.length; i+=1) {
                if (data.cur[r][c].length > 17 && STR_find_sub(data.cur[r][c], RPL.from[i]) === 0) {
                    data.cur[r][c] = data.cur[r][c].replace(RPL.from[i], RPL.to[i]);
                }
            }
        }
        for (let i=0; i < data.autocorr[1].length; i++) {
            let check1 = data.autocorr[0][i].toString().toLowerCase() == type;
            let check2 = data.autocorr[1][i].toString().toLowerCase() == data.cur[r][c].toLowerCase();
            if (check1 && check2) {
                data.cur[r][c] = data.autocorr[2][i];
                return data;
            }
        }

        // после проерки autocorr'а латиницей пробуем перевести в кириллицу
        if (type === 'регион/город') {data.cur[r][c] = STR_latin_to_cyrillic(data.cur[r][c])}
    }
    return data;
}
function validate_UD(data, r, c, type) {
    if (STR_find_sub_list(type, ['телефон', 'e-mail'], 'bool')) {
        var valid = true;
        let  list = data.cur[r][c].toString().split(',');
        for (let i=0; i < list.length; i++) {
            if (type === 'e-mail') {valid = STR_check_email(list[i])}
            else {
                let kazakh = STR_find_sub('67', list[i].charAt(1), 'bool');
                if (type === 'основной телефон') {
                    if (list[i].length !== 11 || list[i].charAt(0) != '7' || kazakh) {valid = false}
                }
                else if (type === 'другой телефон') {
                    if (list[i] === '79999999999') {valid = false}
                    else if (list[i].length !== 0 && (list[i].length !== 11 || list[i].charAt(0) != '7' || kazakh)) {
                        valid = false;
                    }
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
        let  indx = ARR_search_in_list(data.sources[0], data.cur[r][c]);
        var valid = indx !== null && indx >= 0;
        if (valid) {data.cur[r][c] = data.sources[0][indx]}
    }
    else if (ARR_search_in_list(['фамилия', 'отчество', 'должность'], type, 'bool')) {var valid = true}
    else if (type === 'дата')              {var valid = validate_date(data.cur[r][c].toString().split('.'))}
    else if (type === 'статус')            {var valid = data.cur[r][c].toString().toLowerCase() === 'новый'}
    else if (type === 'ответственный')     {var valid = data.cur[r][c].toString().toLowerCase() === 'квалификаторы'}
    else if (type === 'доступен для всех') {var valid = data.cur[r][c].toString().toLowerCase() === 'да'}
    else if (type === 'только цифры')      {var valid = data.cur[r][c].length === data.cur[r][c].toString().replace(/\D+/g, '').length}
    else if (type === 'статус посещения мероприятия клиентом') {
        var valid = ARR_search_in_list(['','visited', 'not visited'], data.cur[r][c].toString().toLowerCase(), 'bool');
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
        if (index >= 0) {
            data = autocorr_UD(data, r, c, 'вертикаль');
            data = change_and_notify_vert_or_man(data, r, c, data.cur[r][c], data.cat[2][index], GC.hl_light_green, 'вертикаль');
        }
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

function get_today   () {return new Date().toLocaleDateString('ru-RU')}
function get_curYear () {return new Date().getFullYear()}
function get_curMonth() {return new Date().getMonth()}  // возвращает 0-11
