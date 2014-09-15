#ifndef WSCLIENTLIB_H
#define WSCLIENTLIB_H

#include <QObject>

#include <QUrl>
#include <QUrlQuery>

#include <QHash>
#include <QCryptographicHash>
#include <QScriptEngine>
#include <QScriptValueIterator>

#include <QJsonObject>
#include <QJsonDocument>
#include <QJsonArray>
#include <QVariantMap>
#include <QDomDocument>
#include <QDomElement>
#include <QDomNode>

#include <QtNetwork/QNetworkAccessManager>
#include <QtNetwork/QNetworkRequest>
#include <QtNetwork/QNetworkReply>
#include <QEventLoop>

#include <WSClientException.h>

struct listTypeInfo{
    bool isEntity;
    QString singular;
    QString label;
    QJsonObject information;
};

class WSClient : public QObject
{
    Q_OBJECT
public:
    explicit WSClient(QObject *parent = 0, const QString &lpzHost = "");

private slots:
    void onError(QNetworkReply::NetworkError code);
    void parseNetworkResponse( QNetworkReply *finished );

private:
    QString lpzURL;
    QString lpzExpireTime;
    QString lpzServerTime;
    QString lpzUserId;
    QString lpzUserName;
    QString lpzVersion;
    QString lpzSessionId;    
    QNetworkReply* pRespNetwork;
    QNetworkAccessManager *wsClient;

    QJsonObject jsLoginError;
    QJsonObject jsNoData;

private:
    void Get();
    void Post();
    QJsonObject doGet(const QUrl &url) const;
    QJsonObject doPost(const QUrl &url, const QByteArray &params) const;
    QJsonObject Get(const QString &operation, const QHash<QString, QString> &parameters);
    QJsonObject Post(const QString &operation, const QHash<QString, QString> &parameters);
    QJsonObject doChallenge(const QString &lpzUserName);

    QString getWebServiceURL(const QString &lpzURL);

    inline bool getCheckLogin(void){
        if (!this->lpzSessionId.isEmpty())
            return true;
        return false;
    }

public:
    QString getVersion(void);
    bool doLogin(const QString &lpzUserName, const QString &lpzKey);
    QList<listTypeInfo> doListTypes();
    QJsonObject doRetrieve(const QString id);
    QJsonObject doCreate(const QString name, QHash<QString, QString> &params);
    QJsonObject doUpdate(const QHash<QString, QString> &params);
    QJsonObject doDelete(const QString &id);
    QJsonArray doQuery(const QString &lpzQuery);
    QJsonObject doInvoke();
    QJsonObject doGetRelatedRecords(const QString &record, const QString &module, const QString &relatedmodule, const QString &queryparameters);
    QJsonObject doSetRelated(const QString &relate_this_id, const QString &with_this_ids);
};

#endif // WSClIENT_H
