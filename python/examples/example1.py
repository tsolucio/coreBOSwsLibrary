import simplejson as json
import WSClient

ws = None

#**********************************************************************
#Update item
#**********************************************************************
def update():
    item = ws.do_retrieve('9x000001')
    item['ticketstatus'] = 'Closed'
    print ws.do_update(item)

#**********************************************************************
#Main
#**********************************************************************
if __name__ == "__main__":
    ws = WSClient('url')

    if ws.do_login('user', 'key'):
        print "Loggin OK"
        update()
        ws.logout()
