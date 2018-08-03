// coreBOS WS Library tests
package main

import (
	"fmt"
	"os"

	"github.com/tsolucio/corebosgowslib"
)

func main() {
	docoreBOSLogin()
	testGetInfo()
	// testCRUD()
	// testRelated()
	docoreBOSLogout()
}

func docoreBOSLogin() {
	corebosgowslib.SetURL("http://localhost/coreBOSwork")
	_, err := corebosgowslib.DoLogin("admin", "admin", true)
	if err != nil {
		fmt.Fprintf(os.Stdout, "%v\n", err)
	}
}

func docoreBOSLogout() {
	_, err := corebosgowslib.DoLogout()
	if err != nil {
		fmt.Fprintf(os.Stdout, "%v\n", err)
	}
}

func testGetInfo() {
	dq, err := corebosgowslib.DoQuery("select accountname from Accounts where accountname like '%chem%';")
	fmt.Fprintf(os.Stdout, "%v\n", dq)
	fmt.Fprintf(os.Stdout, "%v\n", err)
	columns := corebosgowslib.GetResultColumns()
	fmt.Fprintf(os.Stdout, "%v\n", columns)
	for _, record := range dq.([]interface{}) {
		for _, col := range columns {
			fmt.Fprintf(os.Stdout, "%v, ", record.(map[string]interface{})[col])
		}
		fmt.Println("\n")
	}
	var ltp []string
	lt, err := corebosgowslib.DoListTypes(ltp)
	fmt.Fprintf(os.Stdout, "%v\n", lt)
	fmt.Fprintf(os.Stdout, "%v\n", err)
	ltp = []string{"PHONE", "BOOLEAN"}
	lt, err = corebosgowslib.DoListTypes(ltp)
	fmt.Fprintf(os.Stdout, "%v\n", lt)
	fmt.Fprintf(os.Stdout, "%v\n", err)
	ds, err := corebosgowslib.DoDescribe("Assets")
	fmt.Fprintf(os.Stdout, "%v\n", ds)
	fmt.Fprintf(os.Stdout, "%v\n", err)
	acc, err := corebosgowslib.DoRetrieve("11x74")
	fmt.Fprintf(os.Stdout, "%v\n", acc)
	fmt.Fprintf(os.Stdout, "%v\n", err)
}

func testCRUD() {
	contactData := map[string]interface{}{
		"lastname":  "Valiant",
		"homephone": "123456789",
	}
	ctoinfo, err := corebosgowslib.DoCreate("Contacts", contactData)
	fmt.Fprintf(os.Stdout, "%v\n", ctoinfo)
	fmt.Fprintf(os.Stdout, "%v\n", err)
	contactData = map[string]interface{}{
		"lastname":  "Valiant2",
		"homephone": "987654321",
		"id":        ctoinfo["id"].(string),
	}
	ctoupd, err := corebosgowslib.DoUpdate("Contacts", contactData)
	fmt.Fprintf(os.Stdout, "%v\n", ctoupd)
	fmt.Fprintf(os.Stdout, "%v\n", err)
	contactData = map[string]interface{}{
		"lastname":  "ValiantR",
		"homephone": "741258963",
		"id":        ctoinfo["id"].(string),
	}
	ctorev, err := corebosgowslib.DoRevise("Contacts", contactData)
	fmt.Fprintf(os.Stdout, "%v\n", ctorev)
	fmt.Fprintf(os.Stdout, "%v\n", err)
	delrec, err := corebosgowslib.DoDelete("12x34113")
	fmt.Fprintf(os.Stdout, "%v\n", delrec)
	fmt.Fprintf(os.Stdout, "%v\n", err)
}

func testRelated() {
	invkData := map[string]interface{}{
		"module": "Assets",
	}
	invk, err := corebosgowslib.DoInvoke("getRelatedModulesInfomation", invkData, "POST")
	fmt.Fprintf(os.Stdout, "%v\n", invk)
	fmt.Fprintf(os.Stdout, "%v\n", err)
	var relData map[string]interface{}
	rel1, err := corebosgowslib.DoGetRelatedRecords("11x74", "Accounts", "Contacts", relData)
	fmt.Fprintf(os.Stdout, "%v\n", rel1)
	fmt.Fprintf(os.Stdout, "%v\n", err)
	relwith := []string{
		"26x9719", "26x9721",
	}
	setrel, err := corebosgowslib.DoSetRelated("11x74", relwith)
	fmt.Fprintf(os.Stdout, "%v\n", setrel)
	fmt.Fprintf(os.Stdout, "%v\n", err)
}
