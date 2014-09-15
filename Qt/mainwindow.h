#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include "WSClient.h"
#include "WSClientException.h"

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();

private slots:    
    void on_btnLogin_clicked();

    void on_btnListTypes_clicked();

    void on_btnGetTicket_clicked();

    void on_btnUpdateTicket_clicked();

    void on_btnDeleteTicket_clicked();

    void on_btnQuery_clicked();

    void on_btnSetRelated_clicked();

private:
    WSClient* wsClient;
    Ui::MainWindow *ui;
};

#endif // MAINWINDOW_H
