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
        if      (!STR_find_sub(domain, '.', 'bool')) {return false}
        else if ( STR_find_sub(string, '|', 'bool')) {return false}
        else if ( STR_find_sub(string, '’', 'bool')) {return false}
        else if ( STR_find_sub(string, ' ', 'bool')) {return false}
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
    return phones.join();
}
function STR_format_website(site) {
    const start = ['http://', 'https://', 'www.'];
    for (var i=0; i < start.length; i+=1) {
        if (STR_find_sub(site, start[i]) === 0) {site = site.toString().replace(start[i], '')}
    }
    while (site.toString().slice(-1) == '/') {site = site.toString().slice(0, -1)}
    return site;
}
function STR_trim_city(city) {
    const search = ['г. ', 'г ', 'г.'];
    for (i=0; i < search.length; i+=1) {
        if (STR_find_sub(city, search[i]) === 0) {return city.replace(search[i], '')}
    }
    return city;
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
