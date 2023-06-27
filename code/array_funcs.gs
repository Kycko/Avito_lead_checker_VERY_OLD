// if ignore_title, it'll remove the column even if it has some data in the first title cell
function ARR_rm_empty_RC(data, ignore_title=false) {
    var rm_lists = ARR_find_empty_RC(data, ignore_title);
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
    for (var i=0; i < data.cur[0].length; i+=1) {
        const index = ARR_search_in_list(data.autocorr[0], data.cur[0][i]);
        if (index >= 0) {data.cur[0][i] = data.autocorr[1][index]}
    }
    return data;
}

// type = 'rows' or 'columns'
function ARR_rm_RC_list(data, rm_list, type) {
    if (rm_list) {
        if (type == 'rows') {
            for (var i = rm_list.length-1; i >= 0; i-=1) {
                data.splice(rm_list[i], 1);
            }
        }
        else if (type == 'columns') {
            for (var row=0; row < data.length; row+=1) {
                for (var i = rm_list.length-1; i >= 0; i-=1) {
                    data[row].splice(rm_list[i], 1);
                }
            }
        }
    }
    return data;
}

// type = return 'index' or 'item'
function ARR_last_item(array, type) {
    if (array) {
        var index = array.length-1;

        if (type === 'index') {
            return index;
        }
        else {
            return array[index];
        }
    }
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
function ARR_search_in_list(list, txt, type='index') {
    for (var i=0; i < list.length; i+=1) {
        if (list[i].toLowerCase() === txt.toLowerCase()) {
            if (type === 'index') {return i}
            else                  {return true}
        }
    }
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
