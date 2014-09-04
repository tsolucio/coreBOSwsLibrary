/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package vtws;

import com.vtiger.vtwsclib.WSClient;
import org.json.simple.JSONArray;

import java.security.cert.Certificate;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;

public class Vtws {

	public static void main(String[] args) {

//		WSClient wsclient = new WSClient("https://vtiger.od1.vtiger.com/webservice.php");
//		boolean login = wsclient.doLogin("demo@vtiger.com", "Sgc32P6nqRi8x4l");
//
//		if(login) {
//			JSONArray result = wsclient.doQuery("Select * FROM Accounts;");
//			System.out.println(result.toString());
//		}

		int port = 443;
		String hostname = "tibco.od1.vtiger.com";
		SSLSocketFactory factory = HttpsURLConnection.getDefaultSSLSocketFactory();
		System.out.println("Creating a SSL Socket For "+hostname+" on port "+port);
		try
		{
			SSLSocket socket = (SSLSocket) factory.createSocket(hostname, port);
			socket.startHandshake();
			System.out.println("Handshaking Complete");

			Certificate[] serverCerts = socket.getSession().getPeerCertificates();
			System.out.println("Retreived Server's Certificate Chain");

			System.out.println(serverCerts.length + "Certifcates Found\n\n\n");
			for (int i = 0; i < serverCerts.length; i++) {
				Certificate myCert = serverCerts[i];
				System.out.println("====Certificate:" + (i+1) + "====");
				System.out.println("-Public Key-\n" + myCert.getPublicKey());
				System.out.println("-Certificate Type-\n " + myCert.getType());

				System.out.println();
			}
			socket.close();
		}catch(Exception e)
		{
			System.out.println(e.toString());
		}

	}
}
