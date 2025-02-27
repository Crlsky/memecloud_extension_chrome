class Connection {
    
    constructor(domain = 'https://memecloud.co', name = 'extension_token') {
        this.domain = domain;
        this.name = name;
    }

    getToken(callback) {
        chrome.cookies.get({
                            "url": this.domain,
                            "name": this.name
                            }, function(cookie) {
            if(callback && cookie) 
                callback(cookie.value);
            else
                callback(response.tokenError);
        });
    }

    setToken(value, callback) {
        chrome.cookies.set({
                            "url": this.domain,
                            "name": this.name,
                            "value": value
                            }, function(cookie) {
            if(callback && cookie) 
                callback(response.tokenSet);
            else
                callback(response.tokenError);
        });
    }

    authorization(callback) {
        this.getToken(function(token){
            if(token != response.tokenError){
                fetch('https://memecloud.co/api/extension/header', { 
                    method: 'POST', 
                    headers: new Headers({
                        'Authorization':  'extension_token '+ token,
                    })
                })
                .then(resp => {
                    if(resp.status == 200)
                        callback(response.Auth);
                    else
                        callback(response.unAuth);
                })

            }else{
                callback(response.tokenError); 
            }
        })
    }

    signIn(user, passwd, callback){

        let data = '_username='+user+'&_password='+passwd;

        fetch('https://memecloud.co/api/login_check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Access-Control-Allow-Origin': '*', 
                'accept':'*/*'
            },
            mode: "cors",
            body: data
        })
        .then(resp => {
            callback(response.logged);
        })
    }

    logOut(option, callback){
        chrome.cookies.remove({
                                "url": this.domain,
                                "name": this.name
                                }, function(){
                                    callback(response.logout);
                                });
        
    }

    getContent(id_parent, callback){
        this.getToken(function(token){
            if(token != response.tokenError){
                fetch('https://memecloud.co/api/extension/get_dirs', { 
                    method: 'POST', 
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        'Authorization':  'Bearer '+ token,
                    }),
                    body: JSON.stringify({id_parent: id_parent})
                })
                .then(response => response.json())
                .then(data => {
                    callback(data);
                });

            }else{
                callback(response.tokenError); 
            }
        })
    }

    addMeme(url, name, callback){
        this.getToken(function(token){
            if(token != response.tokenError){
                fetch('https://memecloud.co/api/extension/addmeme', { 
                    method: 'POST', 
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        'Authorization':  'Bearer '+ token,
                    }),
                    body: JSON.stringify({url: url,
                                            name: name
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    callback(data);
                });

            }else{
                callback(response.tokenError); 
            }
        })
    }

    searchContent(searchQuerry, callback){
        console.log(searchQuerry);
        this.getToken(function(token){
            if(token != response.tokenError){
                fetch('https://memecloud.co/api/search/content', { 
                    method: 'POST', 
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        'Authorization':  'Bearer '+ token,
                    }),
                    body: JSON.stringify({search_querry: searchQuerry})
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    callback(data);
                });
            } else {
                callback(response.tokenError); 
            }
        })
    }
}
/* fetch do controllera 
fetch('https://memecloud.co/api/extension', { 
    method: 'POST', 
    headers: new Headers({
        'Authorization':  'Bearer '+ token,
    }), 
    body: url
})
.then(response => response.text())
.then(data => {
    console.log(data);
});*/