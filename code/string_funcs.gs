// ищет в строке каждый элемент списка
function STR_find_sub_list(string, list, type='index') {
    for (let item of list) {
        const result = STR_find_sub(string, item, type);
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
    if      (string == '')                                     {return true}
    else if ((string.match(/@/g)||[]).length != 1)             {return false}
    else if (STR_find_sub_list(string, Gru_symbols(), 'bool')) {return false}
    else {
        const splitted = string.split('@');
        const domain   = ARR_last_item(splitted);
        if      (!STR_find_sub(domain, '.',  'bool')) {return false}
        else if ( STR_find_sub(domain, '..', 'bool')) {return false}
        else if (splitted[0] === '-')                 {return false}
        else if (STR_find_sub_list(string, [':', '|', '’', ' ', '<', '>', '[', ']', '.@', '@.', '@-.'], 'bool')) {return false}
    }
    return true;
}
function STR_format_phone(phone, use_unknown) {
    while (STR_find_sub(phone, ';', 'bool')) {phone = phone.replace(';', ',')}
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

    var i = 0;
    while (i < phones.length) {
        if (use_unknown) {
            if (phones.length > 1 && phones[i] === '79999999999') {
                phones.splice(i,1);
                i -= 1;
            }
        }
        else {
            if (phones[i] === '79999999999') {
                phones.splice(i,1);
                i -= 1;
            }
        }
        i += 1;
    }

    phones = ARR_rm_doubles_in_list(phones);
    return phones.join(',');
}
function STR_format_website(site) {
    const    start = ['http://',   'https://',   'www.'];
    const rm_sites = ['facebook.', 'instagram.', 'twitter.'];
    site           = site.toString().toLowerCase();
    while (STR_find_sub(site, ' | ', 'bool')) {site = site.replace(' | ', ',')} // почему-то простое .replace() не работает
    let       list = site.split(',');

    for (let l = list.length-1; l >= 0; l--) {
        list[l] = list[l].toString().trim();
        for (let string of start) {
            if (STR_find_sub(list[l], string) === 0) {list[l] = list[l].replace(string, '')}
        }
        while (list[l].slice(-1) == '/') {list[l] = list[l].slice(0, -1)}

        if (STR_find_sub_list(list[l], rm_sites) === 0) {list.splice(l,1)}
    }

    list = ARR_rm_doubles_in_list(list);
    return list.join(',');
}
function STR_trim_city(city) {
    const search = ['г. ', 'г ', 'г.', 'д. ', 'д ', 'д.', 'с. ', 'с ', 'с.', 'х. ', 'х ', 'х.', 'рп. ', 'рп ', 'рп.', 'дп. ', 'дп ', 'дп.', 'посёлок ', 'посёлок', 'поселок ', 'поселок', 'пос. ', 'пос ', 'пос.', 'пгт ', 'пгт', 'городской пос. ', 'городской пос ', 'городской пос.', 'город ', 'город', 'ст-ца ', 'ст-ца'];
    for (i=0; i < search.length; i+=1) {
        if (STR_find_sub(city, search[i]) === 0) {
            // отрезаем по длине найденного
            return city.substring(search[i].length).trim(); // нужно сразу выйти из цикла
        }
    }

    var list = city.split(' ');
    if (ARR_search_in_list(search, ARR_last_item(list), 'bool')) {
        return list.splice(list.length-1, 1).join(' ');
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

// don't change symbols [1:] if lower_all = false
// capitalize_each means each word (separated by space)
function STR_capitalize(string, lower_all, capitalize_each=false) {
    string = string.toString();
    if (lower_all) {string = string.toLowerCase()}
    if (capitalize_each) {
        var list = string.split(' ');
        for (var i=0; i < list.length; i+=1) {list[i] = list[i].charAt(0).toUpperCase() + list[i].substring(1)}
        string = list.join(' ');
    }
    return string.charAt(0).toUpperCase() + string.substring(1);
}
