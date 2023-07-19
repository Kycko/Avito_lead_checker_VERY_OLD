function MM_launch_all_no_man() {MM_launch_all(false)}
function MM_launch_all(fix_man=true) {
    const SD = UI_MM_show_dialogues();  // SD = show dialogues

    // get all the data
    var data = SH_get_all_sheets_data();
    CRS('launch_all', data);

    // change the data (only in memory, not in the sheets)
    data = ARR_rm_empty_RC(data, true, data.title+1);   // RC = rows & columns; ARR = array
    if (CRS('check_column_names', data, show_msg=false)) {data = ARR_check_column_names(data, SD)}
    data = ARR_check_user_data(data, fix_man, SD);

    // write all the changed data in the sheets
    SH_set_values(data.cur, data.cur_sheet);

    // sheet formatting
    SH_pin_first_rows(data.title+1);
    SH_add_filter(data.cur_sheet.getRange(data.title+1, 1, data.cur.length-data.title, data.cur.length));
    if (CRS('sheet_text_formatting', data, show_msg=false)) {SH_text_formatting(data)}
    if (CRS('hl_bad_titles', data, show_msg=false)) {data = SH_hl_bad_titles(data)}
    SH_hl_cells(data);
}
function MM_check_column_names() {
    const SD = UI_MM_show_dialogues();
    var data = SH_get_all_sheets_data();
    if (CRS('check_column_names', data)) {
        data = ARR_check_column_names(data, SD);
        SH_set_values(data.cur, data.cur_sheet);
        data = SH_hl_bad_titles(data);
        SH_hl_cells(data);
    }
}
function MM_rm_empty_RC() {
    var data = SH_get_all_sheets_data();
    data = ARR_rm_empty_RC(data, true);     // RC = rows & columns; ARR = array
    SH_set_values(data.cur, data.cur_sheet);
    SH_hl_cells(data);
}
function MM_sheet_text_formatting() {
    var data = SH_get_all_sheets_data();
    if (CRS('sheet_text_formatting', data)) {SH_text_formatting(data)}
}
function MM_count_errors() {
    var data = SH_get_all_sheets_data();
    (CRS('launch_all', data));
    data = ARR_check_user_data(data, true, false, true);
    SH_set_values(data.cur, data.cur_sheet);
    SH_hl_cells(data);
}

function MM_check_cities()          {MM_check_UD('регион/город', 'check_cities')}
function MM_check_emails()          {MM_check_UD('e-mail', 'empty_req')}
function MM_check_categories()      {MM_check_UD('категория', 'check_categories')}
function MM_check_verticals()       {MM_check_UD('вертикаль', 'check_categories')}
function MM_check_verticals_blank() {MM_check_UD('вертикаль', 'check_categories', true)}
function MM_check_managers()        {MM_check_UD('менеджер', 'check_managers')}
function MM_check_managers_blank()  {MM_check_UD('менеджер', 'check_managers', true)}
function MM_check_sources()         {MM_check_UD('источник', 'check_sources')}
function MM_check_phones()          {MM_check_UD('телефон', 'empty_req')}
function MM_highlight_blanks()      {MM_check_UD('пустые', 'empty_req')}
function MM_add_Unknown()           {MM_check_UD('add_Unknown', 'empty_req')}

// secondary function just to keep the code simple
// UD = user data
function MM_check_UD(type, CRS_type, only_blank=false) {
    var data = SH_get_all_sheets_data();
    if (CRS(CRS_type, data)) {
        var SHrange = data.cur_sheet.getActiveRange();
        var ARrange = {r : SHrange.getRow()-1,
                       c : SHrange.getColumn()-1,
                       h : SHrange.getHeight(),
                       w : SHrange.getWidth()}

        if (ARR_search_in_list(['вертикаль', 'менеджер'], type, 'bool')) {
            data.cur       = ARR_rotate(data.cur);
            data.bg_colors = ARR_rotate(data.bg_colors);
            ARrange        = rotate_my_range(ARrange);
            data           = ARR_fix_vert_and_man(data, ARrange, type, only_blank);
            data.cur       = ARR_rotate(data.cur);
            data.bg_colors = ARR_rotate(data.bg_colors);
        }
        else if (type === 'пустые')      {data = ARR_check_blanks(data, ARrange, '', false, false)}
        else if (type === 'add_Unknown') {data = ARR_check_blanks(data, ARrange, 'имя', false, false)}
        else if (type === 'телефон')     {data = ARR_check_UD_range(data, ARrange, type, false)}
        else                             {data = ARR_check_UD_range(data, ARrange, type, UI_MM_show_dialogues())}
        SH_set_range_values(data.cur, SHrange);
        SH_hl_cells(data);
    }
}
