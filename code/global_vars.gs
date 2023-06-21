// G  = global vars
function Gcolors() {
    var G = {};
    G.hl_green = '#93dfaf'; // hl = highlight
    G.hl_red   = '#ea9999'; // hl = highlight
    G.black    = '#000000'; // i.e. default font color
    G.brd_grey = '#cccccc'; // brd = cell borders
    return G;
}
function Greq_sheets() {
    var G = {};
    G.rows     = '[script] столбцы';
    G.autocorr = '[script] автоисправления';
    return G;
}
function Gtext() {
    var G = {};

    // MM = main menu
    G.MM_title      = 'Проверка лидов перед загрузкой';
    G.MM_launch_all = ['🚀 Запустить все проверки', 'launch_all'];
    G.MM_items      = [['▥ Проверить столбцы (наличие и названия)',         'check_column_names'],
                       ['▟ Удалить пустые строки и столбцы',                'rm_empty_rows_columns'],
                       ['▦ Исправить стиль ячеек и текста на всём листе',   'sheet_text_formatting']];

    return G;
}
