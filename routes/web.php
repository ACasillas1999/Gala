<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\PhotoController;

Route::get('/', [PhotoController::class, 'index'])->name('home');
Route::get('/upload', [PhotoController::class, 'showUploadForm'])->name('upload.form');
Route::post('/upload', [PhotoController::class, 'store'])->name('upload.store');
Route::get('/gallery', [PhotoController::class, 'gallery'])->name('gallery');
