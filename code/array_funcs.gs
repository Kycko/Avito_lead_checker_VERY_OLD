// if ignore_title, it'll remove the column even if it has some data in the first title cell
function ARR_rm_empty_RC(data, ignore_title=false) {
    var rm_lists = ARR_find_empty_RC(data.cur, ignore_title);
    data = ARR_rm_RC_list(data, rm_lists.rows, 'rows');
    data = ARR_rm_RC_list(data, rm_lists.columns, 'columns');
    return data;
}
function ARR_find_empty_RC(data, ignore_title) {
    var rows    = [];   // будем добавлять, если найдём пустую строку
    var columns = [];   // сначала в списке все столбцы, потом будем убирать из списка, если найдём НЕ пустой
    for (var i=0; i < data[0].length; i+=1) {
        columns.push(i);
    }

    var temp = Number(ignore_title);
    if (data.length > temp) {
        for (var row=temp; row < data.length; row+=1) {
            var empty_row      = true;
            var non_empty_cols = [];
            for (var col=0; col < data[row].length; col+=1) {
                if (data[row][col] !== '') {
                    empty_row = false;
                    non_empty_cols.push(col);
                }
            }
            if (empty_row) {
                rows.push(row);
            }
            if (columns) {
                for (var i=0; i < non_empty_cols.length; i+=1) {
                    var index = columns.indexOf(non_empty_cols[i]);
                    if (index >= 0) {
                        columns.splice(index, 1);
                    }
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
function ARR_check_column_names(data) {
    data = ARR_check_loaded_columns(data);
    data = ARR_add_mandatory_columns(data);
    ARR_check_double_titles(data.cur[0]);
    return data;
}
function ARR_check_user_data(data) {
    data.cur       = ARR_rotate(data.cur);
    data.bg_colors = ARR_rotate(data.bg_colors);

    for (var i=0; i < data.cur.length; i+=1) {
        if (ARR_search_in_list(['Рабочий e-mail', 'Частный e-mail'], data.cur[i][0], 'bool')) {
            data = ARR_check_emails(data, i, 1, 1, data.cur[i].length-1);
        }
        else if (data.cur[i][0] == 'Регион и город') {
            data = ARR_check_cities(data, i, 1, 1, data.cur[i].length-1);
        }
    }

    data.cur       = ARR_rotate(data.cur);
    data.bg_colors = ARR_rotate(data.bg_colors);
    return data;
}

// FC = first cell, must be array indexes (not sheet indexes)
function ARR_check_emails(data, FC_row, FC_col, rows_count, cols_count) {
    for (r=FC_row; r < FC_row+rows_count; r+=1) {
        for (c=FC_col; c < FC_col+cols_count; c+=1) {
            data = check_email_in_cell(data, r, c);
        }
    }
    return data;
}
function ARR_check_cities(data, FC_row, FC_col, rows_count, cols_count) {
    const ui   = SpreadsheetApp.getUi();
    const Gred = Gcolors().hl_red;
    for (r=FC_row; r < FC_row+rows_count; r+=1) {
        for (c=FC_col; c < FC_col+cols_count; c+=1) {
            const init_value = data.cur[r][c];
            data.bg_colors[r][c] = null;

            var index = ARR_search_in_list(data.autocorr[1], data.cur[r][c]);
            if (index >= 0 && data.autocorr[0][index] === 'регион/город') {
                data.cur[r][c] = data.autocorr[2][index];
            }

            var valid = false;
            while (!valid) {
                valid = ARR_search_in_list(data.cities[0], data.cur[r][c], 'bool');
                if (!valid) {
                    const resp = ui.prompt('Неправильный регион/город',
                    ARR_recommend_correction(data.sugg, data.cur[r][c], 'регион/город'),
                    ui.ButtonSet.OK_CANCEL);
                    if (resp.getSelectedButton() == ui.Button.OK) {data.cur[r][c] = resp.getResponseText()}
                    else {
                        data.cur[r][c] = init_value;
                        data.bg_colors[r][c] = Gred;
                        valid = true;
                    }
                }
            }
        }
    }
    return data;
}

function ARR_check_loaded_columns(data) {
    const ui = SpreadsheetApp.getUi();
    for (var i=0; i < data.cur[0].length; i+=1) {
        var index = ARR_search_in_list(data.autocorr[1], data.cur[0][i]);
        if (index >= 0 && data.autocorr[0][index] === 'название столбца') {
            data.cur[0][i] = data.autocorr[2][index];
        }

        index = ARR_search_in_list(data.col_reqs[0], data.cur[0][i]);
        if (data.cur[0][i] && index == null) {
            const resp = ui.prompt('Неправильное название столбца',
                                   ARR_recommend_correction(data.sugg, data.cur[0][i], 'название столбца'),
                                   ui.ButtonSet.OK_CANCEL);
            if (resp.getSelectedButton() == ui.Button.OK) {data.cur[0][i] = resp.getResponseText()}
        }
    }
    return data;
}
function ARR_add_mandatory_columns(data) {
    var old_data      = ARR_rotate(data.cur);
    var old_bg_colors = ARR_rotate(data.bg_colors);
    const old_len     = old_data[0].length;
    var new_data      = [];
    var new_bg_colors = [];

    for (var i=1; i < data.col_reqs[0].length; i+=1) {
        const index = ARR_search_first_column(old_data, data.col_reqs[0][i]);
        if (index >= 0) {
            new_data.push(old_data[index]);
            new_bg_colors.push(old_bg_colors[index]);
            old_data.splice(index, 1);
            old_bg_colors.splice(index, 1);
        }
        else if (data.col_reqs[1][i] === 'да') {
            new_data.push([data.col_reqs[0][i]]);
            new_bg_colors.push([null]);
            for (var count=1; count < old_len; count+=1) {
                new_data[ARR_last_index(new_data)].push('');
                new_bg_colors[ARR_last_index(new_bg_colors)].push(null);
            }
        }
    }
    if (old_data !== []) {
        for (var i=0; i < old_data.length; i+=1) {
            new_data.push(old_data[i]);
            new_bg_colors.push(old_bg_colors[i]);
        }
    }

    data.cur = ARR_rotate(new_data);
    data.bg_colors = ARR_rotate(new_bg_colors);
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
    var final_msg = 'Введите правильный вариант или нажмите "Отмена", чтобы исправить позже.\n\nТекущее значение в ячейке:\n• ' +
                    cur + '\n\n';

    var vars = '';
    for (var i=0; i < sugg[0].length; i+=1) {
        if (sugg[0][i] === type && STR_find_sub(cur, sugg[1][i], 'bool')) {
            vars += '• ' + sugg[2][i] + '\n';
        }
    }
    if (vars) {final_msg += 'Возможные варианты:\n' + vars + '\n'}
    return final_msg;
}

// type = 'rows' or 'columns'
function ARR_rm_RC_list(data, rm_list, type) {
    if (rm_list) {
        if (type == 'rows') {
            for (var i = rm_list.length-1; i >= 0; i-=1) {
                data.cur.splice(rm_list[i], 1);
                data.bg_colors.splice(rm_list[i], 1);
            }
        }
        else if (type == 'columns') {
            for (var row=0; row < data.cur.length; row+=1) {
                for (var i = rm_list.length-1; i >= 0; i-=1) {
                    data.cur[row].splice(rm_list[i], 1);
                    data.bg_colors[row].splice(rm_list[i], 1);
                }
            }
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

// type = return 'index' or 'bool' (just to know if the name is in the array)
function ARR_search_title(data, name, type='index') {
    for (var i=0; i < data[0].length; i+=1) {
        if (data[0][i].toLowerCase() === name.toLowerCase()) {
            if (type === 'index') {return i}
            else {return true}
        }
    }
}
function ARR_search_first_column(data, name, type='index') {
    for (var i=0; i < data.length; i+=1) {
        if (data[i][0].toLowerCase() === name.toLowerCase()) {
            if (type === 'index') {return i}
            else {return true}
        }
    }
}
function ARR_search_in_list(list, txt, type='index') {
    for (var i=0; i < list.length; i+=1) {
        if (list[i].toLowerCase() === txt.toString().toLowerCase()) {
            if (type === 'index') {return i}
            else                  {return true}
        }
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
function ARR_rotate(old) {
    var rotated = [];
    for (var i=0; i < old[0].length; i+=1) {rotated.push([])}

    for (var r=0; r < old.length; r+=1) {
        for (var c=0; c < old[r].length; c+=1) {
            rotated[c].push(old[r][c]);
        }
    }
    return rotated;
}

// FC = first cell, must be array indexes (not sheet indexes)
function ARR_crop(old_data, FC_row, FC_col, rows_count, cols_count) {
    var new_data = [];
    for (r=FC_row; r < FC_row+rows_count; r+=1) {
        new_data.push([]);
        for (c=FC_col; c < FC_col+cols_count; c+=1) {
            new_data[ARR_last_index(new_data)].push(old_data[r][c]);
        }
    }
    return new_data;
}
