#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QApplication>
#include <QDesktopWidget>
#include <QInputDialog>

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{        
    ui->setupUi(this);
    this->move(QApplication::desktop()->screen()->rect().center() - this->rect().center());
}

MainWindow::~MainWindow()
{
    delete wsClient;
    delete ui;
}

//****************************************************************************************
//Login.
//****************************************************************************************
void MainWindow::on_btnLogin_clicked()
{
    this->setCursor(Qt::WaitCursor);

    try
    {
        this->wsClient = new WSClient(this, "http://corebos.org/demos/corebos");

        if( wsClient->doLogin("admin", "4qBtQX8s8RMqBgJQ") ){
            ui->txtLog->appendPlainText(tr("Login OK"));
            QString lpzMessage = QString("Versión coreBOS : %1").arg(wsClient->getVersion());
            ui->txtLog->appendPlainText(lpzMessage);

            ui->btnLogin->setEnabled(false);
            ui->btnListTypes->setEnabled(true);
            ui->btnGetTicket->setEnabled(true);
            ui->btnUpdateTicket->setEnabled(true);
            ui->btnDeleteTicket->setEnabled(true);
            ui->btnQuery->setEnabled(true);
            ui->btnSetRelated->setEnabled(true);
        }
    }
    catch(WSClientException &e)
    {
        QString lpzMessageErr = QString("<pre style=\"color: red;\">%1</pre>").arg(e.what());
        ui->txtLog->appendHtml(lpzMessageErr);
    }

    this->setCursor(Qt::ArrowCursor);
}

//****************************************************************************************
//Get list types.
//****************************************************************************************
void MainWindow::on_btnListTypes_clicked()
{
    this->setCursor(Qt::WaitCursor);

    try
    {
        QList<listTypeInfo> types = this->wsClient->doListTypes();

        if (types.count() >= 1){
            for(int i = 0; i<types.count(); i++){
                listTypeInfo item = types[i];
                QString msg = QString("Label : %1, IsEntity: %2, Singular : %3").arg(item.label).arg(item.isEntity).arg(item.singular);
                ui->txtLog->appendPlainText(msg);
            }
        }
    }
    catch(WSClientException &e)
    {
        QString lpzMessageErr = QString("<pre style=\"color: red;\">%1</pre>").arg(e.what());
        ui->txtLog->appendHtml(lpzMessageErr);
    }

    this->setCursor(Qt::ArrowCursor);
}

//****************************************************************************************
//Get ticket information.
//****************************************************************************************
void MainWindow::on_btnGetTicket_clicked()
{
    this->setCursor(Qt::WaitCursor);

    try
    {
        bool ok;
        int id = QInputDialog::getInt(this,  tr("Data"), tr("Ticket Id:"), 0, 0, 10000000, 1, &ok);

        if (ok && id >0){
            QString ticket_id = QString::number(id);
            ui->txtLog->appendPlainText(QString("Retrieve ticket : %1").arg(ticket_id));

            //Call function.
            QJsonObject ticket = this->wsClient->doRetrieve(QString("17x%1").arg(ticket_id));
            QJsonDocument jDoc(ticket);

            //Print resposne.
            QString lpzMessage = QString("<pre style=\"color: blue;\">%1</pre>").arg(QString(jDoc.toJson()));
            ui->txtLog->appendHtml(lpzMessage);
        }
    }
    catch(WSClientException &e)
    {
        QString lpzMessageErr = QString("<pre style=\"color: red;\">%1</pre>").arg(e.what());
        ui->txtLog->appendHtml(lpzMessageErr);
    }

    this->setCursor(Qt::ArrowCursor);
}

//****************************************************************************************
//TEST ACTUALIZAR REGISTRO.
//****************************************************************************************
void MainWindow::on_btnUpdateTicket_clicked()
{
    this->setCursor(Qt::WaitCursor);

    try
    {
        bool ok;
        int id = QInputDialog::getInt(this,  tr("Data"), tr("Ticket Id:"), 0, 0, 10000000, 1, &ok);

        if (ok && id >0){
            QString ticket_id = QString::number(id);
            ui->txtLog->appendPlainText(QString("Update ticket : %1").arg(ticket_id));

            QJsonObject ticket = this->wsClient->doRetrieve(QString("17x%1").arg(ticket_id));

            QHash<QString, QString> up_item;
            QVariantMap up_map = ticket.toVariantMap();

            for(QVariantMap::const_iterator iter = up_map.begin(); iter != up_map.end(); ++iter) {
                up_item.insert(iter.key(), iter.value().toString());
            }

            up_item["description"] = QString("new problem.");

            QJsonObject response = this->wsClient->doUpdate(up_item);
            QJsonDocument jDoc(response);

            QString lpzMessage = QString("<pre style=\"color: blue;\">%1</pre>").arg(QString(jDoc.toJson()));
            ui->txtLog->appendHtml(lpzMessage);

            up_item.clear();
        }
    }
    catch(WSClientException &e)
    {
        QString lpzMessageErr = QString("<pre style=\"color: red;\">%1</pre>").arg(e.what());
        ui->txtLog->appendHtml(lpzMessageErr);
    }

    this->setCursor(Qt::ArrowCursor);
}

//****************************************************************************************
//TEST BORRAR REGISTRO.
//****************************************************************************************
void MainWindow::on_btnDeleteTicket_clicked()
{
    this->setCursor(Qt::WaitCursor);

    try
    {
        bool ok;
        int id = QInputDialog::getInt(this,  tr("Data"), tr("Ticket Id:"), 0, 0, 10000000, 1, &ok);

        if (ok && id >0){
            QString ticket_id = QString::number(id);
            ui->txtLog->appendPlainText(QString("Delete ticket : %1").arg(ticket_id));

            QJsonObject response = wsClient->doDelete(QString("17x%1").arg(ticket_id));
            QJsonDocument jDoc(response);

            QString lpzMessage = QString("<pre style=\"color: blue;\">%1</pre>").arg(QString(jDoc.toJson()));
            ui->txtLog->appendHtml(lpzMessage);
        }
    }
    catch(WSClientException &e)
    {
        QString lpzMessageErr = QString("<pre style=\"color: red;\">%1</pre>").arg(e.what());
        ui->txtLog->appendHtml(lpzMessageErr);
    }

    this->setCursor(Qt::ArrowCursor);
}

//****************************************************************************************
//Get query.
//****************************************************************************************
void MainWindow::on_btnQuery_clicked()
{
    this->setCursor(Qt::WaitCursor);

    try
    {
        bool ok;
        QString lpz_query = QInputDialog::getText(this,  tr("Data"), tr("Defined Query :"), QLineEdit::Normal, "", &ok);

        if (ok && !lpz_query.isEmpty()){
            ui->txtLog->appendPlainText(QString("Execute query : %1").arg(lpz_query));
            QJsonArray res_query = wsClient->doQuery(lpz_query);

            if ( res_query.count() >= 1 ){
                for(int i=0; i<res_query.count(); i++){
                    QJsonObject response = res_query.at(i).toObject();
                    QJsonDocument jDoc(response);

                    QString lpzMessage = QString("<pre style=\"color: blue;\">%1</pre>").arg(QString(jDoc.toJson()));
                    ui->txtLog->appendHtml(lpzMessage);
                }
            }
        }
    }
    catch(WSClientException &e)
    {
        QString lpzMessageErr = QString("<pre style=\"color: red;\">%1</pre>").arg(e.what());
        ui->txtLog->appendHtml(lpzMessageErr);
    }

    this->setCursor(Qt::ArrowCursor);
}

//****************************************************************************************
//Set related.
//****************************************************************************************
void MainWindow::on_btnSetRelated_clicked()
{
    this->setCursor(Qt::WaitCursor);

    try
    {
        ui->txtLog->appendPlainText(tr("Related records."));

        qDebug() << QJsonDocument::fromJson("{17x136}").toJson();


        /*
        //Call function.
        QJsonObject related = this->wsClient->doSetRelated(tr("25x12368"), tr("17x136"));
        QJsonDocument jDoc(related);

        //Print resposne.
        QString lpzMessage = QString("<pre style=\"color: blue;\">%1</pre>").arg(QString(jDoc.toJson()));
        ui->txtLog->appendHtml(lpzMessage);
        */
    }
    catch(WSClientException &e)
    {
        QString lpzMessageErr = QString("<pre style=\"color: red;\">%1</pre>").arg(e.what());
        ui->txtLog->appendHtml(lpzMessageErr);
    }

    this->setCursor(Qt::ArrowCursor);
}
