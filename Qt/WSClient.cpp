#include "WSClient.h"

#include "cmath"
#include <QRegExp>
#include <QRegExpValidator>
#include <QMessageBox>
#include <QDebug>


#define SERVICE_BASE  "webservice.php"

//******************************************************************************************
//function: doReadData() const
//params: const QUrl &url
//return: QJsonObject
//Description:
//******************************************************************************************
WSClient::WSClient(QObject *parent, const QString &lpzHost) :
    QObject(parent)
{
    this->wsClient = new QNetworkAccessManager(this);
    QObject::connect(this->wsClient, SIGNAL(finished(QNetworkReply*)), this,
                     SLOT(parseNetworkResponse(QNetworkReply*)));

    this->lpzURL = this->getWebServiceURL(lpzHost);

    //Set default messages.
    jsLoginError["code"] = "General";
    jsLoginError["message"] = "Login error.";

    jsNoData["code"] = "General";
    jsNoData["message"] = "No data.";
}

//******************************************************************************************
//function: doReadData() const
//params: const QUrl &url
//return: QJsonObject
//Description:
//******************************************************************************************
void WSClient::parseNetworkResponse( QNetworkReply *reply )
{
    reply->deleteLater();
    this->pRespNetwork = reply;
}

//******************************************************************************************
//function: doReadData() const
//params: const QUrl &url
//return: QJsonObject
//Description:
//******************************************************************************************
void WSClient::onError(QNetworkReply::NetworkError code)
{
    qDebug() << QString("Connection error code : %1").arg(code);
}

//******************************************************************************************
//function: doReadData() const
//params: const QUrl &url
//return: QJsonObject
//Description:
//******************************************************************************************
QString WSClient::getVersion()
{
    if (!this->getCheckLogin())
        throw WSClientException( this->jsLoginError );
    return lpzVersion;
}

//******************************************************************************************
//function: doReadData() const
//params: const QUrl &url
//return: QJsonObject
//Description:
//******************************************************************************************
QJsonObject WSClient::doGet(const QUrl &url) const
{
    QJsonObject response;

    QNetworkRequest req ( url );
    QNetworkReply *reply = this->wsClient->get( req );
    QObject::connect(reply, SIGNAL(error(QNetworkReply::NetworkError)), this,
                           SLOT(onError(QNetworkReply::NetworkError)));

    QEventLoop loop;
    connect(this->wsClient, SIGNAL(finished(QNetworkReply *)), &loop, SLOT(quit()));
    loop.exec();

    if (this->pRespNetwork->error() == QNetworkReply::NoError){
        QString jsonData(this->pRespNetwork->readAll());
        QByteArray byteArray;
        byteArray.append(jsonData);

        QJsonParseError jsonParseErro;
        QJsonDocument root = QJsonDocument::fromJson(jsonData.toUtf8(), &jsonParseErro);

        if(jsonParseErro.error == 0){
            response = root.object();
        }
    }
    else{
        QJsonObject error;
        throw WSClientException(error);
    }

    this->pRespNetwork->deleteLater();
    return response;
}

//******************************************************************************************
//function: doReadData() const
//params: const QUrl &url
//return: QJsonObject
//Description:
//******************************************************************************************
QJsonObject WSClient::doPost(const QUrl &url, const QByteArray &params) const
{
    QJsonObject response;

    qDebug() << params;

    QNetworkRequest req ( url );
    req.setHeader(QNetworkRequest::ContentTypeHeader, "application/x-www-form-urlencoded");
    QNetworkReply *reply = this->wsClient->post(req, params);
    QObject::connect(reply, SIGNAL(error(QNetworkReply::NetworkError)), this,
                           SLOT(onError(QNetworkReply::NetworkError)));

    QEventLoop loop;
    connect(this->wsClient, SIGNAL(finished(QNetworkReply *)), &loop, SLOT(quit()));
    loop.exec();

    if (this->pRespNetwork->error() == QNetworkReply::NoError){
        QString jsonData(this->pRespNetwork->readAll());
        QByteArray byteArray;
        byteArray.append(jsonData);

        QJsonParseError jsonParseErro;
        QJsonDocument root = QJsonDocument::fromJson(jsonData.toUtf8(), &jsonParseErro);

        if(jsonParseErro.error == 0){
            response = root.object();
        }
    }
    else{
        QJsonObject error;
        throw WSClientException(error);
    }

    this->pRespNetwork->deleteLater();
    return response;
}

//******************************************************************************************
//function: doGet
//params: const QHash<QString, QString> &parameters
//return: QJsonObject
//Description:
//******************************************************************************************
QJsonObject WSClient::Get(const QString &operation, const QHash<QString, QString> &parameters)
{    
    QJsonObject response;

    QUrlQuery values;
    values.addQueryItem("operation", operation);

    if (!this->lpzSessionId.isEmpty())
        values.addQueryItem("sessionName", this->lpzSessionId);

    QHashIterator<QString, QString> params(parameters);
    while(params.hasNext()){
        params.next();
        values.addQueryItem(params.key(), params.value());
    }

    if(!values.isEmpty()){
        QUrl url ( this->lpzURL );
        url.setQuery(values.query());

        if(url.isValid()){
            QJsonObject result = this->doGet(url);

            #ifdef QT_DEBUG
                //qDebug() << result;
            #endif

            if ( !result.isEmpty() ){
               return result;
            }
            else {
                QJsonObject error;
                error["code"] = "General";
                error["message"] = "No data";
                throw WSClientException( response );
            }
        }
    }

    return response;
}

//******************************************************************************************
//function: doPost
//params: const QHash<QString, QString> &parameters
//return: QJsonObject
//Description:
//******************************************************************************************
QJsonObject WSClient::Post(const QString &operation, const QHash<QString, QString> &parameters)
{    
    QJsonObject response;

    QByteArray postData;
    QString lpzParam = QString("operation=%1&").arg(operation);
    postData.append(lpzParam);

    if (!this->lpzSessionId.isEmpty()){
        lpzParam = QString("sessionName=%1&").arg(this->lpzSessionId);
        postData.append(lpzParam);
    }

    QHashIterator<QString, QString> params(parameters);
    while(params.hasNext()){
        params.next();
        lpzParam = QString("%1=%2&").arg(params.key()).arg(params.value());
        postData.append(lpzParam);
    }

    if(!postData.isEmpty()){
        QUrl url ( this->lpzURL );

        if(url.isValid()){
            QJsonObject result = this->doPost(url, postData);

            #ifdef QT_DEBUG
                //qDebug() << result;
            #endif

            if ( !result.isEmpty() ){
               return result;
            }
            else {
                QJsonObject error;
                error["code"] = "General";
                error["message"] = "No data";
                throw WSClientException( response );
            }
        }
    }

    return response;
}

//******************************************************************************************
//function: doChallenge
//params: const QString &lpzUserName
//return: QJsonObject
//Description:
//******************************************************************************************
QJsonObject WSClient::doChallenge(const QString &lpzUserName)
{
    QHash<QString, QString> params;    
    params.insert("username", lpzUserName);

    QJsonObject response = Get("getchallenge", params);
    params.clear();

    if ( !response.isEmpty() ){
        QVariantMap map_json  = response.toVariantMap();
        QVariant success      = map_json.value("success");

        if ( success.toBool() ){
            response = response.value("result").toObject();
        }
        else {
            QJsonObject error = response.value("error").toObject();
            throw WSClientException( error );
        }
    }

    return response;
}

//******************************************************************************************
//function: doLogin
//params: const QString &lpzUserName, const QString &lpzKey
//return: Bool
//Description:
//******************************************************************************************
bool WSClient::doLogin(const QString &lpzUserName, const QString &lpzKey)
{
    QJsonObject res_challenge = doChallenge(lpzUserName);
    QVariantMap json_challenge = res_challenge.toVariantMap();

    QString lpzToken = json_challenge.value("token").toString();
    QString lpzAccessKey = QString("%1%2").arg(lpzToken).arg(lpzKey);
    QString lpzEncodedKey = QString(QCryptographicHash::hash((lpzAccessKey.toLatin1()),QCryptographicHash::Md5).toHex());

    QHash<QString, QString> params;    
    params.insert("username", lpzUserName);
    params.insert("accessKey", lpzEncodedKey);

    QJsonObject res_login = Post("login", params);

    if ( !res_login.isEmpty() ){
        QVariantMap map_login  = res_login.toVariantMap();
        QVariant success      = map_login.value("success");

        if ( success.toBool() ){
            QJsonObject info_user = res_login.value("result").toObject();
            QVariantMap map_user = info_user.toVariantMap();

            this->lpzSessionId = map_user.value("sessionName").toString();
            this->lpzUserId = map_user.value("userId").toString();
            this->lpzVersion = map_user.value("vtigerVersion").toString();
            this->lpzExpireTime = json_challenge.value("expireTime").toString();
            this->lpzServerTime = json_challenge.value("serverTime").toString();

            return true;
        }
        else {
            QJsonObject error = res_login.value("error").toObject();
            throw WSClientException( error );
        }
    }

    return false;
}

//******************************************************************************************
//function: doListTypes
//params: None
//return: QList<listTypeInfo>
//Description:
//******************************************************************************************
QList<listTypeInfo> WSClient::doListTypes()
{
    if (!this->getCheckLogin()){
        throw WSClientException( this->jsLoginError );
    }

    QList<listTypeInfo> lp_info;
    QHash<QString, QString> params;

    QJsonObject response = Get("listtypes", params);
    params.clear();

    if ( !response.isEmpty() ){
        QVariantMap map_json  = response.toVariantMap();
        QVariant success      = map_json.value("success");

        if ( success.toBool() ){
            QJsonObject data = response.value("result").toObject();
            QJsonObject info = data.value("information").toObject();
            QVariantMap mp_info = info.toVariantMap();

            for(QVariantMap::const_iterator iter = mp_info.begin(); iter != mp_info.end(); ++iter) {                
                QString module = iter.key();
                QJsonObject options = info.value(module).toObject();

                listTypeInfo lp_item;
                lp_item.isEntity = options.value("isEntity").toBool();
                lp_item.label = options.value("label").toString();
                lp_item.singular = options.value("singular").toString();
                lp_item.information = options;

                lp_info.append(lp_item);
            }
        }
        else {
            QJsonObject error = response.value("error").toObject();
            throw WSClientException( error );
        }
    }

    return lp_info;
}

//******************************************************************************************
//function: doRetrieve
//params: const QString id
//return: QJsonObject
//Description:
//******************************************************************************************
QJsonObject WSClient::doRetrieve(const QString id)
{
    if (!this->getCheckLogin()){
        throw WSClientException( this->jsLoginError );
    }

    QHash<QString, QString> params;
    params.insert("id", id);

    QJsonObject response = Get("retrieve", params);
    params.clear();

    if ( !response.isEmpty() ){
        QVariantMap map_json  = response.toVariantMap();
        QVariant success      = map_json.value("success");

        if ( success.toBool() ){
            return response.value("result").toObject();
        }
        else {
            QJsonObject error = response.value("error").toObject();
            throw WSClientException( error );
        }
    }

    return response;
}

//******************************************************************************************
//function: doCreate
//params: const QString name, QHash<QString, QString> &params
//return: QJsonObject
//Description:
//******************************************************************************************
QJsonObject WSClient::doCreate(const QString name, QHash<QString, QString> &params)
{
    if (!this->getCheckLogin()){
        throw WSClientException( this->jsLoginError );
    }

    if (params.count() >= 1)
    {
        QJsonObject item;

        QHashIterator<QString, QString> prm(params);
        while(prm.hasNext()){
            prm.next();
            item[prm.key()] = prm.value();
        }

        QJsonDocument doc_item(item);

        QHash<QString, QString> parameters;
        parameters.insert("elementType", name);
        parameters.insert("element", QString( doc_item.toJson() ));

        QJsonObject response = Post("create", parameters);
        return response;
    }
    else
    {
        throw "Datos incorrectos";
    }
}

//******************************************************************************************
//function: doUpdate
//params: const QHash<QString, QString> &params
//return: QJsonObject
//Description:
//******************************************************************************************
QJsonObject WSClient::doUpdate(const QHash<QString, QString> &params)
{
    if (!this->getCheckLogin()){
        throw WSClientException( this->jsLoginError );
    }

    if (params.count() >= 1)
    {
        QJsonObject item;

        QHashIterator<QString, QString> prm(params);
        while(prm.hasNext()){
            prm.next();
            item[prm.key()] = prm.value();
        }

        QJsonDocument doc_item(item);

        QHash<QString, QString> parameters;
        parameters.insert("element", QString( doc_item.toJson() ));

        QJsonObject response = Post("update", parameters);
        return response;
    }
    else
    {
        throw "Datos incorrectos";
    }
}

//******************************************************************************************
//function: doDelete
//params: const QString &id
//return: QJsonObject
//Description:
//******************************************************************************************
QJsonObject WSClient::doDelete(const QString &id)
{
    if (!this->getCheckLogin()){
        throw WSClientException( this->jsLoginError );
    }

    QHash<QString, QString> params;
    params.insert("id", id);

    QJsonObject response = Post("delete", params);
    params.clear();

    if ( !response.isEmpty() ){
        QVariantMap map_json  = response.toVariantMap();
        QVariant success      = map_json.value("success");

        if ( success.toBool() ){
            return response.value("result").toObject();
        }
        else {
            QJsonObject error = response.value("error").toObject();
            throw WSClientException( error );
        }
    }
    throw WSClientException( jsNoData );
}

//******************************************************************************************
//function: doQuery
//params: const QString &lpzQuery
//return: QJsonArray
//Description:
//******************************************************************************************
QJsonArray WSClient::doQuery( const QString &lpzQuery )
{
    if (!this->getCheckLogin()){
        throw WSClientException( this->jsLoginError );
    }

    QHash<QString, QString> params;
    params.insert("query", lpzQuery);

    QJsonObject response = Get("query", params);
    params.clear();

    if ( !response.isEmpty() ){
        QVariantMap map_json  = response.toVariantMap();
        QVariant success      = map_json.value("success");

        if ( success.toBool() ){
            return response.value("result").toArray();
        }
        else {
            QJsonObject error = response.value("error").toObject();
            throw WSClientException( error );
        }
    }
    throw WSClientException( jsNoData );
}

//******************************************************************************************
//function: doSetRelated
//params: const QString &relate_this_id, const QString &with_this_ids
//return: QJsonObject
//Description:
//Set relation between records.
//param relate_this_id string ID of record we want to related other records with
//param with_this_ids string/array either a string with one unique ID or an array of IDs to relate to the first parameter
//******************************************************************************************
QJsonObject WSClient::doSetRelated(const QString &relate_this_id, const QString &with_these_ids)
{
    if (!this->getCheckLogin()){
        throw WSClientException( this->jsLoginError );
    }

    QHash<QString, QString> params;
    params.insert("relate_this_id", relate_this_id);
    params.insert("with_these_ids", with_these_ids);

    qDebug() << params;

    QJsonObject response = Post("SetRelation", params);
    params.clear();

    if ( !response.isEmpty() ){
        QVariantMap map_json  = response.toVariantMap();
        QVariant success      = map_json.value("success");

        if ( success.toBool() ){
            return response.value("result").toObject();
        }
        else {
            QJsonObject error = response.value("error").toObject();
            throw WSClientException( error );
        }
    }
    throw WSClientException( jsNoData );
}

/*
QJsonObject WSClient::doGetRelatedRecords(const QString &record, const QString &module, const QString &relatedmodule, const QString &queryparameters)
{

}
*/

//******************************************************************************************
//function: getWebServiceURL
//params: const QString &lpzURL
//return: QString
//Description: Get correct webservice URL.
//******************************************************************************************
QString WSClient::getWebServiceURL(const QString &lpzURL)
{
    int index = 0;
    QString lpzValidateURL = lpzURL;

    QRegExp urlRegex("^(http|https)://[a-z0-9]+([-.]{1}[a-z0-9]+)*.[a-z]{2,5}(([0-9]{1,5})?/?.*)$");
    QValidator* urlValidate = new QRegExpValidator(urlRegex);

    if (urlValidate->validate(lpzValidateURL, index) == QValidator::Acceptable){
        if(lpzValidateURL.indexOf(QString(SERVICE_BASE)) >= 1){
            return lpzValidateURL;
        }
        else{
            if(lpzValidateURL.at(lpzValidateURL.length() -1) == '/'){
                lpzValidateURL += QString(SERVICE_BASE);
            }
            else{ lpzValidateURL += "/" + QString(SERVICE_BASE); }
        }
    }
    else { throw "Invalid URL"; }

    return lpzValidateURL;
}
