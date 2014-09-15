#ifndef WSCLIENTEXCEPTION_H
#define WSCLIENTEXCEPTION_H

#include <QString>
#include <QJsonObject>

class WSClientException
{
public:
    explicit WSClientException(const QJsonObject &message);
    virtual ~WSClientException(void) throw();
    virtual QString what(void) const throw();

private:
    QString lpzError;
    QString lpzMessage;
    QJsonObject pError;
};

#endif // WSCLIENTEXCEPTION_H
