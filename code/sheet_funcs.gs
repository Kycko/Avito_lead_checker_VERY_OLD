// get & set the sheets data
function SH_get_all_sheets_data() {
    var   data = {};
    const GRS  = Greq_sheets();
    all_sheets_list = SH_get_all_sheets_list()

    data.cur_sheet = SpreadsheetApp.getActiveSheet();
    const range    = data.cur_sheet.getRange(1, 1, data.cur_sheet.getMaxRows(), data.cur_sheet.getMaxColumns());

    range.setNumberFormat('@STRING@');
    data.cur       = SH_get_values(data.cur_sheet.getName(), all_sheets_list);
    data.bg_colors = range.getBackgrounds();

    for (var key in GRS) {
        // all the data from '[script]' sheets will be ROTATED!
        data[key] = SH_get_values(GRS[String(key)], all_sheets_list, true);
    }
    return data;
}

// rotate = the first column will be the first row and vice versa
function SH_get_values(name, all_sheets_list, rotate=false) {
    if (ARR_search_in_list(all_sheets_list, name, 'bool')) {
        const sheet = SpreadsheetApp.getActive().getSheetByName(name);
        const range = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());
        range.breakApart();
        var   data  = range.getValues();
        if (rotate) {data = ARR_rotate(data)}
        return data;
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
    SH_set_range_values(data, sheet.getRange(1, 1, size.rows, size.columns));
}
function SH_set_range_values(data, range) {
    const row = range.getRow()-1;
    const col = range.getColumn()-1;
    const height = range.getHeight();
    const width = range.getWidth();

    if (data.length != height || data[0].length != width) {
        data = ARR_crop(data, row, col, height, width);
    }
    range.setValues(data);
}

function SH_get_all_sheets_list() {
    var   list   = [];
    const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
    for (var i=0; i < sheets.length; i+=1) {
        list.push(sheets[i].getName());
    }
    return list;
}

// sheets formatting
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
    if (clear_notes) {range.clearNote()}
    if (borders === 'default') {
        range.setBorder(true, true, true, true, true, true, Gcolors().brd_grey, null);
    }
}
function SH_hl_bad_titles(data) {
    const GC = Gcolors();
    var unused_titles = data.col_reqs[0];   // this is to highlight repeating titles

    for (var i=0; i < data.cur[0].length; i+=1) {
        const index = ARR_search_in_list(unused_titles, data.cur[0][i]);
        if (index >= 0) {
            data.bg_colors[0][i] = GC.hl_green;
            unused_titles.splice(index, 1);
        }
        else {data.bg_colors[0][i] = GC.hl_red}
    }
    return data;
}
function SH_hl_cells(data) {
    data.cur_sheet.getRange(1, 1, data.cur.length, data.cur[0].length)
        .setBackgrounds(data.bg_colors);
}
function SH_pin_first_row() {
    SpreadsheetApp.getActiveSheet().setFrozenRows(1);
}
function SH_add_main_filter(sheet) {
    var cur_filter = sheet.getFilter();
    if (cur_filter) {cur_filter.remove()}
    sheet.getDataRange().createFilter();
}

// req – only change the columns listed in Greq_sheets().columns
function SH_set_req_wrapping(data, columns='all') {
    if (columns === 'all') {
        for (var i=0; i < data.col_reqs[4].length; i+=1) {
            if (data.col_reqs[4][i] == 'да') {
                var index = ARR_search_title(data.cur, data.col_reqs[0][i]);
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
        for (var i=0; i < data.cur[0].length; i+=1) {
            const cur_width = data.cur_sheet.getColumnWidth(i+1);
            var index = ARR_search_title(data.col_reqs, data.cur[0][i]);
            var num   = Number(data.col_reqs[3][index]);
            if (index != null && num) {
                if (cur_width > data.col_reqs[3][index]) {
                    data.cur_sheet.setColumnWidth(i+1, data.col_reqs[3][index]);
                }
            }
            else if (cur_width > 200) {data.cur_sheet.setColumnWidth(i+1, 200)}
        }
    }
}
