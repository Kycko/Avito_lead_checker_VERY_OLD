function get_sheet_values(sheet) {
    return sheet.getDataRange().getValues();
}
function set_sheet_values(data, sheet) {
    var size = {
        rows    : data.length,
        columns : data[0].length
    }
    fit_sheet_size(sheet, size);
    sheet.getRange(1, 1, size.rows, size.columns)
        .setValues(data);
}
function fit_sheet_size(sheet, new_size) {
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
