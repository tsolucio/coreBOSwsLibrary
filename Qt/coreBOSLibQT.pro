#-------------------------------------------------
#
# Project created by QtCreator 2014-08-23T15:53:00
#
#-------------------------------------------------

QT += core gui network
QT += script
QT += xml

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TARGET = coreBOSLibQT
TEMPLATE = app


SOURCES += main.cpp\
        mainwindow.cpp \
    json.cpp \
    WSClient.cpp \
    WSClientException.cpp

HEADERS  += mainwindow.h \
    json.h \
    WSClient.h \
    WSClientException.h

FORMS    += mainwindow.ui
