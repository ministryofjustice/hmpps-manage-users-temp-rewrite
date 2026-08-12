/* eslint-disable */

// ZAP Authentication script (type: authentication, engine: Graal.js)
// Requests the base URL and follows the full redirect chain. The (stubbed)
// auth service issues its token/cookie only once the chain completes.

var HttpRequestHeader = Java.type('org.parosproxy.paros.network.HttpRequestHeader');
var HttpHeader = Java.type('org.parosproxy.paros.network.HttpHeader');
var URI = Java.type('org.apache.commons.httpclient.URI');
var AuthenticationHelper = Java.type('org.zaproxy.zap.authentication.AuthenticationHelper');

function authenticate(helper, paramsValues, credentials) {
    var loginUrl = paramsValues.get('login_url');
    print('Stub auth: GET ' + loginUrl + ', following redirects');

    var msg = helper.prepareMessage();
    var requestUri = new URI(loginUrl, false);
    var requestHeader = new HttpRequestHeader(HttpRequestHeader.GET, requestUri, HttpHeader.HTTP11);
    msg.setRequestHeader(requestHeader);

    // Second arg = follow redirects. This walks the full stubbed chain
    // (e.g. base -> /sso -> /callback) in one call.
    helper.sendAndReceive(msg, true);

    AuthenticationHelper.addAuthMessageToHistory(msg);
    print('Stub auth: final status ' + msg.getResponseHeader().getStatusCode());

    return msg;
}

function getRequiredParamsNames() {
    return ['login_url'];
}

function getOptionalParamsNames() {
    return [];
}

function getCredentialsParamsNames() {
    // Nothing to enter — the "auth" is just completing the redirect chain
    return [];
}
