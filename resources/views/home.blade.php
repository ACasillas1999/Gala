@extends('layout')

@section('title', 'Inicio')

@section('styles')
<style>
    .qr-card {
        text-align: center;
        max-width: 500px;
        width: 100%;
    }
    .qr-code {
        background: #fff;
        padding: 20px;
        border-radius: 15px;
        display: inline-block;
        margin: 20px 0;
    }
    .host-info {
        color: var(--primary);
        font-size: 0.9rem;
        margin-top: 10px;
        opacity: 0.8;
    }
</style>
@endsection

@section('content')
<div class="glass-container qr-card fade-in">
    <h2>¡Comparte tus momentos!</h2>
    <p>Escanea el código QR para subir tus fotos a la galería del evento.</p>
    
    <div class="qr-code">
        {!! QrCode::size(250)->generate(route('upload.form')) !!}
    </div>

    <div class="host-info">
        Escanea para ir a: {{ route('upload.form') }}
    </div>

    <div style="margin-top: 30px;">
        <a href="{{ route('gallery') }}" class="btn-gold">Ver Galería</a>
    </div>
</div>
@endsection
