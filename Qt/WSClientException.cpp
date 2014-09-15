#include "WSClientException.h"
#include <QDebug>

WSClientException::WSClientException(const QJsonObject &message)
{
    this->pError = message;
}

WSClientException::~WSClientException(void) throw()
{
}

QString WSClientException::what(void) const throw()
{
    QVariantMap map_error  = pError.toVariantMap();
    QVariant code = map_error.value("code");
    QVariant message = map_error.value("message");

    qDebug() << map_error;

    QString ws_message = QString("%1 - %2").arg(code.toString()).arg(message.toString());
    return ws_message;
}
