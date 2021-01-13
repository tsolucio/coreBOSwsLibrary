<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PostController;
use App\Http\Controllers\cbosRestAPI;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------*/

Route::get('/cbosapi/session/{userName}/{userpass}', [cbosRestAPI::class, 'cbosdoLogin']);
//sample http://127.0.0.1:8000/api/cbosapi/session/admin/admin1234
Route::get('/cbosapi/retrieve/{wsid}', [cbosRestAPI::class, 'cbosRestAPIRetrieve']);
//sample http://127.0.0.1:8000/api/cbosapi/retrieve/11x74
Route::get('/cbosapi/delete/{wsid}', [cbosRestAPI::class, 'cbosRestAPIDelete']);
//sample http://127.0.0.1:8000/api/cbosapi/delete/11x74
Route::post('/cbosapi/create/{module}', [cbosRestAPI::class, 'cbosRestAPIdoCreate']);
//sample http://127.0.0.1:8000/api/cbosapi/create/Account