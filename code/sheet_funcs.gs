function SH_get_all_sheets_data() {
    var   data = {};
    const GRS  = Greq_sheets();
    all_sheets_list = SH_get_all_sheets_list()

    data.cur_sheet = SpreadsheetApp.getActiveSheet();
    data.cur       = SH_get_values(data.cur_sheet.getName(), all_sheets_list);

    for (var key in GRS) {
        data[key] = SH_get_values(GRS[String(key)], all_sheets_list);
    }
    return data;
}
function SH_get_values(name, all_sheets_list) {
    if (ARR_search_in_list(all_sheets_list, name, 'bool')) {
        const sheet = SpreadsheetApp.getActive().getSheetByName(name);
        const range = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns())
        range.breakApart();
        return range.getValues();
    }
    else {
        return null;
    }
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

function SH_get_all_sheets_list() {
    var   list   = [];
    const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
    for (var i=0; i < sheets.length; i+=1) {
        list.push(sheets[i].getName());
    }
    return list;
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
function SH_text_formatting(data) {
    var cur_range = data.cur_sheet.getRange(1, 1, data.cur.length, data.cur[0].length);
    SH_set_range_formatting(cur_range);
    SpreadsheetApp.flush();
    data.cur_sheet.getRange(2, 1, data.cur.length-1, data.cur[0].length)
        .setBackground(null);   // don't change the title backgrounds, they show errors
    data.cur_sheet.autoResizeColumns(1, data.cur[0].length);
    SH_set_req_wrapping(data);
    SH_set_req_column_width(data);
}
function SH_set_range_formatting(range, txt_color=Gcolors().black, txt_font='Calibri', txt_size=11, wrap=SpreadsheetApp.WrapStrategy.CLIP, Valign='middle', Halign='left', clear_notes=true, borders='default') {
    range
        .setFontColor(txt_color)
        .setFontFamily(txt_font)
        .setFontSize(txt_size)
        .setWrapStrategy(wrap)
        .setVerticalAlignment(Valign)
        .setHorizontalAlignment(Halign);
    if (clear_notes) {range.clearNote();}
    if (borders === 'default') {
        range.setBorder(true, true, true, true, true, true, Gcolors().brd_grey, null);
    }
}

// req – only change the columns listed in Greq_sheets().columns
function SH_set_req_wrapping(data, columns='all') {
    if (columns === 'all') {
        for (var i=0; i < data.col_reqs.length; i+=1) {
            if (data.col_reqs[i][4] == 'да') {
                var index = ARR_search_title(data.cur, data.col_reqs[i][0]);
                if (index != null) {
                    data.cur_sheet.getRange(2, index+1, data.cur.length-1)
                        .setWrap(true);
                }
            }
        }
    }
}
function SH_set_req_column_width(data, columns='all') {
    if (columns === 'all') {
        for (var i=0; i < data.col_reqs.length; i+=1) {
            if (typeof Number(data.col_reqs[i][3]) == 'number') {
                var index = ARR_search_title(data.cur, data.col_reqs[i][0]);
                if (index != null) {
                    const cur_width = data.cur_sheet.getColumnWidth(index+1);
                    if (cur_width > data.col_reqs[i][3]) {
                        data.cur_sheet.setColumnWidth(index+1, data.col_reqs[i][3]);
                    }
                }
            }
        }
    }
}
