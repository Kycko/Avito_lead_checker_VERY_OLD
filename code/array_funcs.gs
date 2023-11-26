function ARR_rm_empty_RC(data, ignore_title=false, title_rows=1) {
    // if ignore_title, it'll remove the column even if it has some data in the first title cell
    var rm_lists = ARR_find_empty_RC(data.cur, ignore_title, title_rows);
    data = ARR_rm_RC_list(data, rm_lists.rows, 'rows');
    data = ARR_rm_RC_list(data, rm_lists.columns, 'columns');
    return data;
}
function ARR_find_empty_RC(table, ignore_title, title_rows=1) {
    // В НОВОЙ ВЕРСИИ ДОБАВИТЬ АРГУМЕНТ ДЛЯ ПРОВЕРКИ ТОЛЬКО СТРОКИ/СТОЛБЦА ИЛИ ОБОИХ ('r', 'c', 'rc')
    var rows    = [];   // будем добавлять, если найдём пустую строку
    var columns = [];   // сначала в списке все столбцы, потом будем убирать из списка, если найдём НЕ пустой
    for (var i=0; i < table[0].length; i++) {columns.push(i)}

    var temp = Number(ignore_title) * title_rows;
    if (table.length > temp) {
        for (var row=temp; row < table.length; row++) {
            var empty_row      = true;
            var non_empty_cols = [];
            for (var col=0; col < table[row].length; col++) {
                if (table[row][col] !== '') {
                    empty_row = false;
                    non_empty_cols.push(col);
                }
            }

            if (empty_row) {rows.push(row)}
            if (columns) {
                for (var i=0; i < non_empty_cols.length; i++) {
                    var index = columns.indexOf(non_empty_cols[i]);
                    if (index >= 0) {columns.splice(index, 1)}
                }
            }
        }
    }
    var final = {
        rows    : rows,
        columns : columns
    }
    return final;
}
function ARR_check_column_names(data, SD) {
    data = ARR_check_loaded_columns(data, SD);
    data = ARR_add_mandatory_columns(data);
    if (SD) {ARR_check_double_titles(data.cur[data.title])}
    return data;
}
function ARR_check_user_data(data, fix_man, SD, only_verify=false) {
    data.cur       = ARR_rotate(data.cur);
    data.bg_colors = ARR_rotate(data.bg_colors);
    data.notes     = ARR_rotate(data.notes);
    let  tit       = data.title;

    for (let i=0; i < data.cur.length; i++) {
        const just_check_blanks = ['Название лида', 'Наименование проекта', 'Название компании', 'Имя'];
        const autofill          = ['Статус',        'Ответственный',        'Доступен для всех'];
        const capitalize_each   = ['Фамилия',       'Имя',                  'Отчество'];
        const only_numbers      = ['Авито-аккаунт', 'Добавочный телефон',   'ИНН'];
        let range = {r:i, c:tit+1, h:1, w:data.cur[i].length-tit-1};

        if      (STR_find_sub(data.cur[i][tit], 'e-mail', 'bool')) {
            data = ARR_check_UD_range(data, range, 'e-mail', SD, only_verify);
        }
        else if (STR_find_sub(data.cur[i][tit], 'сайт', 'bool') || data.cur[i][tit].toString().toLowerCase() === 'страница вконтакте') {
            data = ARR_check_UD_range(data, range, 'сайт', SD, only_verify);
        }
        else if (data.cur[i][tit] == 'Регион и город' && CRS('check_cities', data, show_msg=false)) {
            data = ARR_check_UD_range(data, range, 'регион/город', SD, only_verify);
        }
        else if (data.cur[i][tit] == 'Категория' && CRS('check_categories', data, show_msg=false)) {
            data = ARR_check_UD_range(data, range, 'категория', SD, only_verify);
        }
        else if (data.cur[i][tit] == 'Вертикаль' && CRS('check_categories', data, show_msg=false)) {
            data = ARR_fix_vert_and_man(data, range, 'вертикаль', false, only_verify);
        }
        else if (fix_man && data.cur[i][tit] == 'Ответственный менеджер в сделке' && CRS('check_managers', data, show_msg=false)) {
            data = ARR_fix_vert_and_man(data, range, 'менеджер', false, only_verify);
        }
        else if (data.cur[i][tit] == 'Источник' && CRS('check_sources', data, show_msg=false)) {
            data = ARR_check_UD_range(data, range, 'источник', SD, only_verify);
        }
        else if (data.cur[i][tit].toString().toLowerCase() == 'должность') {
            data = ARR_check_UD_range(data, range, 'должность', false);
        }
        else if (data.cur[i][tit] == 'Дата проведения мероприятия') {
            data = ARR_check_UD_range(data, range, 'дата', SD, only_verify);
        }
        else if (data.cur[i][tit] == 'Статус посещения мероприятия клиентом') {
            data = ARR_check_UD_range(data, range, 'статус посещения мероприятия клиентом', SD, only_verify);
        }
        else if (ARR_search_in_list(only_numbers, data.cur[i][tit], 'bool')) {
            data = ARR_check_UD_range(data, range, 'только цифры', false, true);
        }
        else if (STR_find_sub(data.cur[i][tit], 'телефон', 'bool')) {
            data = ARR_check_UD_range(data, range, data.cur[i][tit].toString().toLowerCase(), false, only_verify);
        }
        else if (ARR_search_in_list(autofill, data.cur[i][tit], 'bool')) {
            data = ARR_check_UD_range(data, range, data.cur[i][tit].toString().toLowerCase(), SD, only_verify);
        }
        else if (ARR_search_in_list(['Фамилия', 'Отчество'], data.cur[i][tit], 'bool')) {
            data = ARR_check_UD_range(data, range, data.cur[i][tit].toString().toLowerCase(), false, only_verify);
        }
        else if (ARR_search_in_list(just_check_blanks, data.cur[i][tit], 'bool')) {
            data = ARR_check_blanks(data, range, data.cur[i][tit].toString().toLowerCase(), only_verify);
        }

        // без else: для имени сперва выполняем ARR_check_blanks(), затем ARR_change_fontcase()
        if (ARR_search_in_list(capitalize_each, data.cur[i][tit], 'bool')) {
            data = ARR_change_fontcase(data, range, 'default_each');
        }
    }

    if (data.col_reqs.length) {data = ARR_final_errors_list(data)}
    data.cur       = ARR_rotate(data.cur);
    data.bg_colors = ARR_rotate(data.bg_colors);
    data.notes     = ARR_rotate(data.notes);
    return data;
}
function ARR_final_errors_list(data) {
    var tit  = data.title;
    const GC = Gcolors();
    for (var r=0; r < data.cur.length; r+=1) {
        var unique = [];
        var errors = 0;
        for (var c=tit+1; c < data.cur[r].length; c+=1) {
            if (!ARR_search_in_list(unique, data.cur[r][c], 'bool')) {unique.push(data.cur[r][c])}
            if (data.bg_colors[r][c] == GC.hl_red)                   {errors += 1}
        }

        // UC = uniques color, EC = errors color
        const index = ARR_search_in_list(data.col_reqs[0], data.cur[r][tit]);
        if (index >= 0 && unique.length > Number(data.col_reqs[5][index])) {var UC = GC.hl_red}
        else                                                               {var UC = GC.hl_light_green}
        if (errors)                                                        {var EC = GC.hl_red}
        else                                                               {var EC = GC.hl_light_green}

        for (var c=0; c < tit; c+=1) {
            data.cur      [r].splice(0, 1);
            data.bg_colors[r].splice(0, 1);
            data.notes    [r].splice(0, 1);
        }
        data.cur      [r].unshift('Уникальных: ' + unique.length.toString(), 'Ошибок: ' + errors.toString());
        data.bg_colors[r].unshift(UC  , EC);
        data.notes    [r].unshift(null, null);
    }
    data.title = 2;
    return data;
}

function ARR_check_UD_range(data, range, type, SD, only_verify=false) {
    // range = {r, c, h, w} (first row, first col, height, width)
    let  USI = {from: [], to: []};  // USI = user input, just to autocorrect doubled strings
    const GC = Gcolors();

    for (let r=range.r; r < range.r+range.h; r++) {
        for (let c=range.c; c < range.c+range.w; c++) {
            if (only_verify) {
                if (validate_UD(data, r, c, type)) {data.bg_colors[r][c] = GC.hl_light_green}
                else                               {data.bg_colors[r][c] = GC.hl_red}
            }
            else {
                const init_value = data.cur[r][c];
                data = autocorr_UD(data, r, c, type);

                let valid = false;
                while (!valid) {
                    valid = validate_UD(data, r, c, type);
                    if (valid) {data.bg_colors[r][c] = GC.hl_light_green}
                    else {
                        if (SD === 'ask') {
                            if (range.h === 1 && range.w === 1) {SD = true}
                            else                                {SD = UI_MM_show_dialogues()}
                        }
                        if (!SD) {
                            data.cur      [r][c] = init_value;
                            data.bg_colors[r][c] = GC.hl_red;
                            valid                = true;
                        }
                        else {
                            const index = ARR_search_in_list(USI.from, data.cur[r][c]);
                            if (index >= 0) {
                                if (USI.to[index] === null) {
                                    data.cur[r][c] = init_value;
                                    data.bg_colors[r][c] = GC.hl_red;
                                    valid = true;
                                }
                                else {data.cur[r][c] = USI.to[index]}
                            }
                            else {
                                const   ui = SpreadsheetApp.getUi();
                                const resp = UI_show_UD_error(init_value, data, r, c, type, ui, range);
                                if (resp.getSelectedButton() == ui.Button.OK) {
                                    data.cur[r][c] = resp.getResponseText();
                                    if (validate_UD(data, r, c, type)) {
                                        USI.from.push(init_value);
                                        USI.to  .push(data.cur[r][c]);
                                    }
                                }
                                else {
                                    data.cur      [r][c] = init_value;
                                    data.bg_colors[r][c] = GC.hl_red;
                                    valid = true;

                                    USI.from.push(init_value);
                                    USI.to  .push(null);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if (SD === 'ask') {UI_show_toast('Ошибок не найдено')}
    return data;
}
function ARR_join_comments(data, range, start) {
    const ui = SpreadsheetApp.getUi();
    var  tit = data.title;
    if (range.r > tit) {
        var   separator = null;
        var   add_empty = false;
        const add_title = UI_add_title_in_comments();
        if (add_title && ARR_check_for_empty_cells(data.cur, range)) {
            add_empty = UI_add_empty_in_comments();
            if (add_empty) {empty_replacement = UI_replace_empty_in_comments(ui)}
        }

        var   comm_column = ARR_search_in_list(data.cur[tit], 'комментарий');
        if (comm_column  == null) {
            for (var i=0; i < data.cur.length; i+=1) {
                if (i == tit) {data.cur[i].push('Комментарий')}
                else          {data.cur[i].push('')}
            }
            comm_column = data.cur[0].length-1;
        }

        for (var r=range.r; r < range.r+range.h; r+=1) {
            const cur_comment = data.cur[r][comm_column].toString().trim();
            var   add_txt     = '';
            for (var c=range.c; c < range.c+range.w; c+=1) {
                data.cur[r][c] = data.cur[r][c].toString().trim();
                var add_or_not = data.cur[r][c].length || (add_title && add_empty);
                if (add_or_not) {
                    // separator
                    if (add_txt.length && add_or_not) {
                        if (separator === null) {
                            const resp = UI_ask_separator(ui);
                            if (resp.getSelectedButton() == ui.Button.OK) {separator = resp.getResponseText()}
                            else                                          {return 'break'}
                        }
                        add_txt += separator;
                    }

                    // title
                    if (add_title) {
                        add_txt += data.cur[tit][c].toString().trim();
                        if (add_txt.at(-1) == '?') {add_txt += ' '}
                        else                       {add_txt += ': '}
                    }

                    // user data
                    if (!data.cur[r][c].length && empty_replacement.getSelectedButton() == ui.Button.OK) {
                        add_txt   += empty_replacement.getResponseText();
                    }
                    else {add_txt += data.cur[r][c]}
                }
            }
            const obj = STR_join_comments(cur_comment, add_txt, separator, start);
            if (obj === null) {return 'break'}
            else {
                data.cur[r][comm_column] = obj.txt;
                separator                = obj.separator;
            }
        }
        return {data  : data,
                range : {r:0, c:comm_column, h:data.cur.length, w:1}}
    }
    else {
        UI_show_msg('Невозможно добавить комментарии', 'Выделите ячейки без строк заголовков.');
        return 'break';
    }
}
function ARR_check_req_cols(data, req_cols, type) {
    var txt     = '';
    var indexes = [];
    req_cols.forEach(item => {
        const ind = ARR_search_in_column(data.cur, item, data.title);
        if (ind >= 0) {indexes.push(ind)}
        else          {txt += '• ' + item + '\n'}
    });

    if (txt) {
        if                   (type === 'вертикаль') {var title = 'Невозможно проверить вертикали'}
        else if               (type === 'менеджер') {var title = 'Невозможно проверить менеджеров'}
        if (req_cols.length - indexes.length === 1) {var msg   = 'В таблице отсутствует нужный столбец:\n' + txt}
        else                                        {var msg   = 'В таблице отсутствуют нужные столбцы:\n' + txt}
        UI_show_msg(title, msg);
    }
    return indexes;
}
function ARR_check_blanks(data, range, type='', only_verify=false, highlight=true) {
    const GC = Gcolors();
    for (var r=range.r; r < range.r+range.h; r+=1) {
        for (var c=range.c; c < range.c+range.w; c+=1) {
            if (!only_verify && ARR_search_in_list(['Название компании', 'Имя'], type, 'bool')) {data = autocorr_UD(data, r, c, type)}
            if (data.cur[r][c]) {
                if (highlight) {data.bg_colors[r][c] = GC.hl_light_green}
            }
            else                {data.bg_colors[r][c] = GC.hl_red}
        }
    }
    return data;
}
function ARR_change_fontcase(data, range, type) {
    for (var r=range.r; r < range.r+range.h; r+=1) {
        for (var c=range.c; c < range.c+range.w; c+=1) {
            data.cur[r][c] = data.cur[r][c].toString();
            if      (type === 'lower')        {data.cur[r][c] = data.cur[r][c].toLowerCase()}
            else if (type === 'upper')        {data.cur[r][c] = data.cur[r][c].toUpperCase()}
            else if (type === 'up_first')     {data.cur[r][c] = STR_capitalize(data.cur[r][c], false)}
            else if (type === 'default')      {data.cur[r][c] = STR_capitalize(data.cur[r][c], true)}
            else if (type === 'default_each') {data.cur[r][c] = STR_capitalize(data.cur[r][c], true, true)}
        }
    }
    return data;
}

// vert and man = verticals and managers
function ARR_fix_vert_and_man(data, range, type, only_blank=false, only_verify=false) {
    if (range.h === 1 && range.c > data.title) {
        if     (type === 'вертикаль') {var req_cols = ['Категория']}
        else if (type === 'менеджер') {var req_cols = ['Категория', 'Регион и город']}
        const col_indexes = ARR_check_req_cols(data, req_cols, type);

        if (col_indexes.length === req_cols.length) {
            for (var c=range.c; c < range.c+range.w; c+=1) {
                if (!only_blank || (only_blank && !data.cur[range.r][c].length)) {
                    if     (type === 'вертикаль') {data = verify_vertical(data, range.r, c, col_indexes[0], only_verify)}
                    else if (type === 'менеджер') {data = verify_manager (data, range.r, c, col_indexes[0], col_indexes[1], only_verify)}
                }
            }
        }
    }
    else {UI_show_msg('Невозможно проверить', 'Выделите ячейки только в одном столбце, без строк заголовков.')}
    return data;
}

function ARR_check_loaded_columns(data, SD) {
    const tit = data.title;
    const  ui = SpreadsheetApp.getUi();
    for (let i=0; i < data.cur[tit].length; i++) {
        data.cur[tit][i] = data.cur[tit][i].toString().trim();
        var        index = ARR_search_in_list(data.autocorr[1], data.cur[tit][i]);
        if (index >= 0 && data.autocorr[0][index] === 'название столбца') {
            data.cur[tit][i] = data.autocorr[2][index];
        }

        index = ARR_search_in_list(data.col_reqs[0], data.cur[tit][i], 'bool');
        if (SD && data.cur[tit][i] && !index) {
            const resp = ui.prompt('Неправильное название столбца',
                                   ARR_recommend_correction(data.sugg, data.cur[tit][i], 'название столбца'),
                                   ui.ButtonSet.OK_CANCEL);
            if (resp.getSelectedButton() == ui.Button.OK) {data.cur[tit][i] = resp.getResponseText()}
        }
    }
    return data;
}
function ARR_add_mandatory_columns(data) {
    let      old_data = ARR_rotate(data.cur);
    let old_bg_colors = ARR_rotate(data.bg_colors);
    let     old_notes = ARR_rotate(data.notes);
    const     old_len = old_data[0].length;
    let      new_data = [];
    let new_bg_colors = [];
    let     new_notes = [];

    for (let i=1; i < data.col_reqs[0].length; i++) {
        const index = ARR_search_in_column(old_data, data.col_reqs[0][i], data.title);
        if (index >= 0) {
            new_data     .push  (old_data     [index]);
            new_bg_colors.push  (old_bg_colors[index]);
            new_notes    .push  (old_notes    [index]);
            old_data     .splice(index,       1);
            old_bg_colors.splice(index,       1);
            old_notes    .splice(index,       1);
        }
        else if (data.col_reqs[1][i] === 'да') {
            let   temp_data = [];
            let temp_colors = [];
            let  temp_notes = [];
            for (let count=0; count < old_len; count++) {
                temp_data  .push('');
                temp_colors.push(null);
                temp_notes .push(null);
            }
            temp_data[data.title] = data.col_reqs[0][i];
            new_data     .push(temp_data);
            new_bg_colors.push(temp_colors);
            new_notes    .push(temp_notes);
        }
    }
    for (let i=0; i < old_data.length; i++) {
        new_data     .push(old_data     [i]);
        new_bg_colors.push(old_bg_colors[i]);
        new_notes    .push(old_notes    [i]);
    }

   data.cur       = ARR_rotate(new_data);
    data.bg_colors = ARR_rotate(new_bg_colors);
    data.notes     = ARR_rotate(new_notes);
    return data;
}
function ARR_check_double_titles(titles) {
    const doubles = ARR_check_doubles_in_list(titles);
    if (doubles.length) {
        var txt = '';
        for (var i=0; i < doubles.length; i+=1) {txt += '\n• '+doubles[i]}
        UI_show_msg('В таблице есть столбцы с одинаковыми названиями', txt);
    }
}
function ARR_recommend_correction(sugg, cur, type) {
    let final_msg = 'Введите правильный вариант$$$ или нажмите "Отмена", чтобы исправить его потом.\n\nТекущее значение:\n• ' + cur +'\n\n';

    const temp = ['e-mail', 'дата', 'статус посещения мероприятия клиентом'];
    if (ARR_search_in_list(temp, type, 'bool')) {var string = ', оставьте поле пустым для удаления'}
    else                                        {var string = ''}
    final_msg  = final_msg.replace('$$$', string);

    if      (type === 'дата')   {var vars = STR_recommend_dates(cur.toString().split('/'))}
    else if (type === 'e-mail') {
        var vars = [cur.toString().toLowerCase().replace(' ', '')];
        while (STR_find_sub(vars[0], ' ', 'bool')) {vars[0] = vars[0].replace(' ', '')}
        if (vars[0] === cur || !STR_check_email(vars[0])) {vars = []}
    }
    else {
        var vars = [];
        for (let i=0; i < sugg[0].length; i++) {
            if (sugg[0][i] === type && STR_find_sub(cur, sugg[1][i], 'bool')) {vars.push(sugg[2][i])}
        }
    }

    if (vars.length) {
        final_msg += 'Возможные варианты:\n';
        vars       = ARR_rm_doubles_in_list(vars);
        for (let i=0; i < vars.length; i++) {final_msg += '• ' + vars[i] + '\n'}
        final_msg += '\n';
    }
    return final_msg;
}

function ARR_rm_RC_list(data, rm_list, type) {
    // type = 'rows' or 'columns'
    if (rm_list) {
        for (var i = rm_list.length-1; i >= 0; i-=1) {
            data.cur       = ARR_rm_RC(data.cur,       type, rm_list[i]);
            data.bg_colors = ARR_rm_RC(data.bg_colors, type, rm_list[i]);
            data.notes     = ARR_rm_RC(data.notes,     type, rm_list[i]);
        }
    }
    return data;
}

function ARR_last_item(array) {
    if (array) {return array[array.length-1]}
}
function ARR_last_index(array) {
    if (array) {return array.length-1}
}

function ARR_search_in_column(table, name, column, type='index', full_text=true) {
    // name can be just a string or a list of strings
    // type = return 'index' or 'bool' (just to know if the name is in the array)
    let check = false;
    for (let r=0; r < table.length; r++) {
        let string = table[r][column].toString().toLowerCase().trim();
        if (typeof name === 'string') {
            name = name.toString().toLowerCase().trim();
            if (full_text) {check = string === name}
            else           {check = STR_find_sub(string, name, 'bool')}
        }
        else {
            for (let item of name) {
                if (!check) {
                    let      temp = item.toString().toLowerCase().trim();
                    let subcheck1 =  full_text && string === temp;
                    let subcheck2 = !full_text && STR_find_sub(string, temp, 'bool');
                    if (subcheck1 || subcheck2) {check = true}
                }
            }
        }
        if (check) {
            if (type === 'index') {return r}
            else                  {return true}
        }
    }
}
function ARR_search_title_row(table) {
    for (let i=0; i < table.length; i++) {
        if (STR_find_sub_list(table[i][0], ['Уникальных: ', 'Ошибок: ']) !== 0) {return i}
    }
    return 0;
}

function ARR_search_in_list(list, txt, type='index', full_text=true) {
    // если full_text=false, возвращает первую ячейку, в которой только часть текста = txt
    txt = txt.toString().toLowerCase().trim();
    for (let i=0; i < list.length; i++) {
        let temp = list[i].toString().toLowerCase().trim();
        if (full_text) {var check = temp === txt}
        else           {var check = STR_find_sub(temp, txt, 'bool')}

        if (check) {
            if (type === 'index') {return i}
            else                  {return true}
        }
    }
}
// ищет во всех элементах списка и возвращает список индексов всех найденных
function ARR_list_all_found_indexes(list, txt, full_text=true) {
    // если full_text=false, добавит индекс при совпадении только части строки
    txt            = txt.toString().toLowerCase().trim();
    let final_list = [];
    for (let i=0; i < list.length; i++) {
        let temp = list[i].toString().toLowerCase().trim();

        if (full_text) {
            if (temp === txt) {final_list.push(i)}
        }
        else {
            if (STR_find_sub(temp, txt, 'bool')) {final_list.push(i)}
        }
    }
    return final_list;
}
// ищет в списке любой элемент второго списка
function ARR_search_any_in_list(list_to_search_in, list_of_search_variants, type='index', full_text=true) {
    for (let i=0; i < list_of_search_variants.length; i++) {
        let result = ARR_search_in_list(list_to_search_in, list_of_search_variants[i], type, full_text);
        if (Number(result) >= 0) {return result}
    }
}

function ARR_check_doubles_in_list(list) {
    var doubles = [];
    for (var i=0; i < list.length; i+=1) {
        if (i != ARR_search_in_list(list, list[i])) {
            if (!ARR_search_in_list(doubles, list[i], 'bool')) {doubles.push(list[i])}
        }
    }
    return doubles;
}

function ARR_sort_numeric_list(list, ascending=true) {
    // ascending – это 'по возрастанию'; если оно = false, будет сортировка по убыванию
    if (ascending) {return list.toSorted((a, b) => a - b)}
    else           {return list.toSorted((a, b) => b - a)}
}
function ARR_rotate(old) {
    let rotated = [];
    for (let cell of old[0]) {rotated.push([])}
    for (let r=0; r < old.length; r++) {
        for (let c=0; c < old[r].length; c++) {
            rotated[c].push(old[r][c]);
        }
    }
    return rotated;
}

function ARR_check_for_empty_cells(table, range, max_allowed=0) {
    // функция возвращает false, если количество пустых ячеек > max_allowed
    // т. е. при max_allowed=0 возвращается false как только будет найдена хоть одна пустая ячейка
    // range = {r, c, h, w} (first row, first col, height, width)
    var empty_counter = 0;
    for (var r=range.r; r < range.r+range.h; r++) {
        for (var c=range.c; c < range.c+range.w; c++) {
            if (!table[r][c].length) {
                empty_counter++;
                if (empty_counter > max_allowed) {return true}
            }
        }
    }
    return false;
}

function ARR_crop(old_data, FC_row, FC_col, rows_count, cols_count) {
    // FC = first cell, must be array indexes (not sheet indexes)
    var new_data = [];
    for (r=FC_row; r < FC_row+rows_count; r+=1) {
        new_data.push([]);
        for (c=FC_col; c < FC_col+cols_count; c+=1) {
            new_data[ARR_last_index(new_data)].push(old_data[r][c]);
        }
    }
    return new_data;
}
function ARR_rm_doubles_in_list(old_list) {
    var new_list = [];
    for (let item of old_list) {
        if (!ARR_search_in_list(new_list, item, 'bool')) {new_list.push(item)}
    }
    return new_list;
}
function ARR_create_empty_table(rows, columns, data=null) {
    var final = [];
    for (var r=0; r<rows; r+=1) {
        final.push([]);
        for (var c=0; c<columns; c+=1) {
            final[r].push(data);
        }
    }
    return final;
}

function ARR_rm_RC(table, type, num, count=1) {
    // type = 'rows' or 'columns'
    if (type === 'rows') {table.splice(num, count)}
    else {
        for (var row=0; row < table.length; row++) {
            table[row].splice(num, count);
        }
    }
    return table;
}
function ARR_add_RC(table, type, num, count=1, value='') {
    if (type === 'rows') {
        for (let i=0; i < count; i++) {
            table.splice(num, 0, table[0]);
            for (let c=0; c < table[num].length; c++) {table[num][c] = value}
        }
    }
    else {
        for (let r=0; r < table.length; r++) {
            for (let i=0; i < count; i++) {table[r].splice(num, 0, value)}
        }
    }
    return table;
}
function ARR_add_columns_with_titles(table, title_list, num) {
    for (let title of title_list) {
        table         = ARR_add_RC(table, 'columns', num);
        table[0][num] = title;
    }
    return table;
}
function ARR_rm_table_columns_by_titles(table, title_list) {
    for (var i=0; i < title_list.length; i+=1) {
        index = ARR_search_in_list(table[0], title_list[i]);
        if (index >= 0) {table = ARR_rm_RC(table, 'columns', index)}
    }
    return table;
}

// меняет текст всех ячеек диапазона на value
function ARR_fill_cells(table, range, value) {
    // range = {r, c, h, w} (first row, first col, height, width)
    for (var r=range.r; r < range.r+range.h; r++) {
        for (var c=range.c; c < range.c+range.w; c++) {
            table[r][c] = value;
        }
    }
    return table;
}

function ARR_move_RC(table, type, from, to, count=1) {
    // from & to are array indexes, e. g. type 'column' from 0 to 1 = from A to B
    if (type === 'rows') {
        const removed = table.splice(from, count);
        table.splice(to, 0, removed);
    }
    else {
        for (var row=0; row < table.length; row+=1) {
            const removed = table[row].splice(from, count);
            table[row].splice(to, 0, removed);
        }
    }
    return table;
}

// проходит по всем строкам таблицы и добавляет текст из одного столбца в другой, добавляя separator
function ARR_join_two_columns(table, c_from, c_to, r_first=0, r_last=null, separator='') {
    // c_from и c_to – это номера столбцов 'из' и 'в'
    // r_first=1 означает, что в первой строке ничего не объединяем
    // r_last=null означает, что объединяем во всех строках, начиная с r_first и до самого конца
    // r_first=0 + r_last=3 означает, что объединяем в строках 0, 1, 2 и 3 ВКЛЮЧИТЕЛЬНО
    if  (r_last === null || r_last >= table.length) {r_last = table.length-1}
    for (var r=r_first; r < r_last+1; r+=1) {
        table[r][c_from] = table[r][c_from].toString();
        table[r][c_to]   = table[r][c_to]  .toString();
        if (table[r][c_from].length) {
            if (table[r][c_to].length) {table[r][c_to] += separator}
            table[r][c_to] += table[r][c_from];
        }
    }
    return table;
}

// this filters remove all the other rows from table
function ARR_filter_rows_by_cell(table, column, filter_txt, save_title=true) {
    var new_table = [];
    if (save_title) {new_table.push(table[0])}
    for (var r=1; r < table.length; r+=1) {
        if (table[r][column] === filter_txt) {new_table.push(table[r])}
    }
    return new_table;
}
function ARR_rm_cells_by_full_text(table, txt) {
    for (let r=0; r < table.length; r++) {
        for (let c=0; c < table[r].length; c++) {
            if (table[r][c] == txt) {table[r][c] = ''}
        }
    }
    return table;
}
function ARR_rm_list_items_by_text(list, txt, full_text=true) {
    let indexes = ARR_list_all_found_indexes(list, txt, full_text);
    indexes     = ARR_sort_numeric_list     (indexes, false);
    for (let num of indexes) {list.splice(num, 1)}
    return list;
}