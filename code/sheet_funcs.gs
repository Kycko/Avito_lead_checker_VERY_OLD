function SH_get_values(sheet) {
    var range = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());
    range     = range.breakApart();
    return range.getValues();
}
function SH_set_values(data, sheet) {
    var size = {
        rows    : data.length,
        columns : data[0].length
    }
    SH_fit_size(sheet, size);
    sheet.getRange(1, 1, size.rows, size.columns)
        .setValues(data);
}

function SH_check_availability(name, err_title) {
    var sheet = SpreadsheetApp.getActive().getSheetByName(name);
    if (!sheet) {
        UI_show_msg(err_title, 'Отсутствует лист:\n' + name);
    }
    return sheet
}

function SH_fit_size(sheet, new_size) {
    var old_size = {
        rows    : sheet.getMaxRows(),
        columns : sheet.getMaxColumns()
    }

    // rows
    var num = new_size.rows - old_size.rows;
    if (num > 0) {
        sheet.insertRowsAfter(old_size.rows, num);
    }
    else if (num < 0) {
        sheet.deleteRows(new_size.rows+1, -num);
    }

    // columns
    num = new_size.columns - old_size.columns;
    if (num > 0) {
        sheet.insertColumnsAfter(old_size.columns, num);
    }
    else if (num < 0) {
        sheet.deleteColumns(new_size.columns+1, -num);
    }
}
function SH_text_formatting(sheet, col_reqs, data) {
    var cur_range = sheet.getRange(1, 1, data.length, data[0].length);
    SH_set_range_formatting(cur_range);
    SpreadsheetApp.flush();
    sheet.getRange(2, 1, data.length-1, data[0].length).setBackground(null);    // don't change the title backgrounds, they show errors
    sheet.autoResizeColumns(1, data[0].length);
    SH_set_req_wrapping(sheet, col_reqs, data);
    SH_set_req_column_width(sheet, col_reqs, data);
}
function SH_set_range_formatting(range, txt_color=Gcolors().black, txt_font='Calibri', txt_size=12, wrap=false, Valign='middle', Halign='left', borders='default') {
    range
        .setFontColor(txt_color)
        .setFontFamily(txt_font)
        .setFontSize(txt_size)
        .setWrap(wrap)
        .setVerticalAlignment(Valign)
        .setHorizontalAlignment(Halign);
    if (borders === 'default') {
        range.setBorder(true, true, true, true, true, true, Gcolors().brd_grey, null);
    }
}

// req – only change the columns listed in Greq_sheets().columns
function SH_set_req_wrapping(sheet, col_reqs, data, columns='all') {
    if (columns === 'all') {
        for (var i=0; i < col_reqs.length; i+=1) {
            if (col_reqs[i][4] == 'да') {
                var index = ARR_search_title(data, col_reqs[i][0]);
                if (index != null) {
                    sheet.getRange(2, index+1, data.length-1)
                        .setWrap(true);
                }
            }
        }
    }
}
function SH_set_req_column_width(sheet, col_reqs, data, columns='all') {
    if (columns === 'all') {
        for (var i=0; i < col_reqs.length; i+=1) {
            if (typeof Number(col_reqs[i][3]) == 'number') {
                var index = ARR_search_title(data, col_reqs[i][0]);
                if (index != null) {
                    const cur_width = sheet.getColumnWidth(index+1);
                    if (cur_width > col_reqs[i][3]) {
                        sheet.setColumnWidth(index+1, col_reqs[i][3]);
                    }
                }
            }
        }
    }
}
