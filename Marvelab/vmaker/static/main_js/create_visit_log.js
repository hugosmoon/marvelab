function create_visit_log(page){
    $.ajax({
        type: 'POST',
        url: "/vmaker/create_visit_log/" ,
        data: {
        'user_id':$.cookie('user_id'),
        'page':page,
        'ip':returnCitySN["cip"],
        'city':returnCitySN["cname"]
        } ,   
    });
}