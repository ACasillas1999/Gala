<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Photo;

class PhotoController extends Controller
{
    public function index()
    {
        return view('home');
    }

    public function showUploadForm()
    {
        return view('upload');
    }

    public function store(Request $request)
    {
        $request->validate([
            'photo' => 'required|file|mimes:jpg,jpeg,png,mp4,mov,avi|max:51200',
            'guest_name' => 'nullable|string|max:255',
        ]);

        $file = $request->file('photo');
        $mime = $file->getMimeType();
        $type = str_contains($mime, 'video') ? 'video' : 'image';

        $path = $file->store('photos', 'public');

        Photo::create([
            'path' => $path,
            'guest_name' => $request->guest_name,
            'type' => $type,
        ]);

        return back()->with('success', '¡Foto subida con éxito!');
    }

    public function gallery()
    {
        $photos = Photo::latest()->get();
        return view('gallery', compact('photos'));
    }
}
