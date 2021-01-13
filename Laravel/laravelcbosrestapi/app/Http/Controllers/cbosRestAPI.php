<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException as GuzzleRequestException;
use GuzzleHttp\Exception\ConnectException as GuzzleConnectException;
use Illuminate\Http\Request;

class cbosRestAPI extends Controller {
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function cbosRestAPIRetrieve($wsid) {
		$wsres = $this->cbosdoLogin();
		if ($wsres) {
			try {
				$client = new Client();
				$response = $client->request('GET', env('COREBOS_URL').'?operation=retrieve&sessionName='.$wsres['sessionName'].'&id='.$wsid);
				$responseData = $response->getBody()->getContents();
				return $responseData;
			} catch (GuzzleRequestException $e) {
				return false;
			} catch (GuzzleConnectException $e) {
				return false;
			}
		}
	}

	public function cbosRestAPIDelete($wsid) {
		$wsres = $this->cbosdoLogin();
		if ($wsres) {
			try {
				$client = new Client();
				//$response = $client->request('POST', env('COREBOS_URL').'?operation=delete&sessionName='.$wsres['sessionName'].'&id='.$wsid);
				$responseData = $response->getBody()->getContents();
				return $responseData;
			} catch (GuzzleRequestException $e) {
				return false;
			} catch (GuzzleConnectException $e) {
				return false;
			}
		}
	}
	public function cbosRestAPIdoCreate(Request $data, $module) {
		$datavals = json_encode($data->all());
		var_dump($datavals);
		die();
		/*$wsres = $this->cbosdoLogin();
		if($wsres) {
			try {
				$client = new Client();
				$response = $client->request('POST', env('COREBOS_URL').'?operation=create&sessionName='.$wsres['sessionName'].'&elementType='.$module.'element='.$datavals);
				$response = $client->request('POST', env('COREBOS_URL').'?operation=create&sessionName='.$wsres['sessionName'], [
						'operation' => 'create',
						'elementType' => $module,
						'element' => $datavals
				]);
				$responseData = $response->getBody()->getContents();
				var_dump($responseData); die();
				return $responseData;
			}
			catch(GuzzleRequestException $e) {
				return false;
			}
			catch(GuzzleConnectException $e) {
				return false;
			}
		}*/
	}

	public function cbosdoLogin($userName = '', $userpass = '') {
		$userName = !empty($username) ? $username : env('COREBOS_USERNAME');
		$userPassword = !empty($userpass) ? $userpass : env('COREBOS_PASSWORD');
		try {
			$client = new Client();
			$response = $client->request('GET', env('COREBOS_URL') . '?operation=getchallenge&username=' . $userName);
			if ($response->getStatusCode() == 200) {
				$responseData = $response->getBody()->getContents();
				$successStatus = json_decode($responseData, true);
				if (!$successStatus['success']) {
					return false;
				}
				$responseDataArray = json_decode($responseData, true);
				$response = $client->request('POST', env('COREBOS_URL'), [
					'form_params' => [
						'operation' => 'login',
						'accessKey' => $responseDataArray['result']['token'] . $userPassword,
						'username' => $userName,
					],
				]);
				if ($response->getStatusCode() == 200) {
					$responseData = $response->getBody()->getContents();
					$responseArr = json_decode($responseData, true);
					if ($responseArr['success']) {
						return $responseArr['result'];
					} else {
						return false;
					}
				}
			}
		} catch (GuzzleRequestException $e) {
			return false;
		} catch (GuzzleConnectException $e) {
			return false;
		}
	}
}
