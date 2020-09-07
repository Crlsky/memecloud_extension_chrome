chrome.runtime.onMessage.addListener(function(msg, sender, Response) {
    let connection = new Connection('https://memecloud.co', 'extension_token');

    switch(msg.method){
        case actions.gettoken:
            connection.getToken(function(token){
                Response(token);
            });
            break;
        
        case actions.auth:
            connection.authorization(function(resp) {
                Response(resp);
            });
            break;

        case actions.signin:
            connection.signIn(msg.options.login, msg.options.passwd, function(logged){
                Response(logged);
            })
            break;

        case actions.getcontent:
            connection.getContent(msg.options, function(content){
                Response(content);
            })
            break;

        case actions.logout:
            connection.logOut(msg.options, function(call){
                Response(call);
            })
            break;
    }

    return true;
}); 

