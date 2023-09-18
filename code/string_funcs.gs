// ищет в строке каждый элемент списка
function STR_find_sub_list(string, list, type='index') {
    for (var i=0; i < list.length; i+=1) {
        const result = STR_find_sub(string, list[i], type);
        if (result === true || result >= 0) {return result}
    }
}
function STR_find_sub(string, sub, type='index') {
    const index = string.toString().toLowerCase().indexOf(sub.toString().toLowerCase());
    if (index >= 0) {
        if (type === 'index') {return index}
        else                  {return true}
    }
}
function STR_check_email(string) {
    if      (string == '')                         {return true}
    else if ((string.match(/@/g)||[]).length != 1) {return false}
    else {
        const domain = ARR_last_item(string.split('@'));
        if      (!STR_find_sub    (domain, '.',                                  'bool')) {return false}
        else if ( STR_find_sub    (domain, '..',                                 'bool')) {return false}
        else if (STR_find_sub_list(string, [':', '|', '’', ' ', '<', '>', '.@'], 'bool')) {return false}
    }
    return true;
}
function STR_format_phone(phone, use_unknown) {
    var phones = phone.split(',');
    for (var i=0; i < phones.length; i+=1) {
        phones[i] = phones[i].toString().replace(/\D+/g, '');
        if      (phones[i].toString().length === 10) {phones[i] = '7' + phones[i].toString()}
        else if (phones[i].toString().length === 11) {
            if (phones[i].toString().charAt(0) == '8') {phones[i] = '7' + phones[i].toString().slice(1)}
        }
        else if (phones[i].toString().length < 10) {
            if (use_unknown) {phones[i] = '79999999999'}
            else             {phones[i] = ''}
        }
    }

    for (var i=0; i < phones.length; i+=1) {
        if (use_unknown) {
            if (phones.length > 1 && phones[i] === '79999999999') {phones.splice(i,1)}
        }
        else {
            if (phones[i] === '79999999999')                      {phones.splice(i,1)}
        }
    }
    return phones.join(',');
}
function STR_format_website(site) {
    const start = ['http://', 'https://', 'www.'];
    site        = site.toString().toLowerCase();
    while (STR_find_sub(site, ' | ', 'bool')) {site = site.replace(' | ', ',')} // почему-то простое .replace() не работает
    var    list = site.split(',');

    for (var l=0; l < list.length; l+=1) {
        list[l] = list[l].toString().trim();
        for (var i=0; i < start.length; i+=1) {
            if (STR_find_sub(list[l], start[i]) === 0) {list[l] = list[l].toString().replace(start[i], '')}
        }
        while (list[l].toString().slice(-1) == '/') {list[l] = list[l].toString().slice(0, -1)}
    }
    return list.join(',');
}
function STR_trim_city(city) {
    const search = ['г. ', 'г ', 'г.', 'д. ', 'д ', 'д.', 'с. ', 'с ', 'с.', 'х. ', 'х ', 'х.', 'рп. ', 'рп ', 'рп.', 'дп. ', 'дп ', 'дп.', 'пос. ', 'пос ', 'пос.', 'пгт ', 'пгт', 'город ', 'ст-ца '];
    for (i=0; i < search.length; i+=1) {
        if (STR_find_sub(city, search[i]) === 0) {
            city = city.replace(search[i], '');
            return city.toString().trim();          // нужно сразу выйти из цикла
        }
    }
    return city.toString().trim();
}

// parts = parts of date (list with 3 numbers)
function STR_recommend_dates(parts) {
    var vars = [];
    if (parts.length === 3) {
        for (var i=0; i<3; i+=1) {
            for (var j=0; j<3; j+=1) {
                if (i !== j && validate_date([parts[i], parts[j], parts[3-i-j]])) {
                    var day   = parts[i]    .toString();
                    var month = parts[j]    .toString();
                    var year  = parts[3-i-j].toString();
                    if (day.length   === 1) {day   = '0'+day}
                    if (month.length === 1) {month = '0'+month}
                    vars.push(day + '.' + month + '.' + year);
                }
            }
        }
    }
    return vars;
}

function STR_join_comments(cur_comment, add_txt, separator, start) {
    if (add_txt.toString().length && cur_comment.toString().length) {
        if (separator === null) {
            const ui   = SpreadsheetApp.getUi();
            const resp = UI_ask_separator(ui);
            if (resp.getSelectedButton() == ui.Button.OK) {separator = resp.getResponseText()}
            else                                          {return null}
        }
        if (start) {var final_txt = add_txt + separator + cur_comment}
        else       {var final_txt = cur_comment + separator + add_txt}
    }
    else {var final_txt = cur_comment + add_txt}

    return {txt : final_txt, separator : separator}
}
