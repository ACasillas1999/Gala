@extends('layout')

@section('title', 'Subir Contenido')

@section('styles')
<style>
    .upload-card {
        max-width: 500px;
        width: 100%;
        text-align: center;
        padding: 3rem 2rem;
        position: relative;
        overflow: hidden;
    }
    
    .upload-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, transparent, var(--primary), transparent);
    }

    h2 {
        font-weight: 600;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 2rem;
        color: #fff;
    }

    .form-group {
        margin-bottom: 2rem;
        text-align: left;
    }

    .label-premium {
        display: block;
        margin-bottom: 10px;
        color: var(--primary);
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1.5px;
    }

    .input-premium {
        width: 100%;
        padding: 15px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        color: white;
        font-family: inherit;
        font-size: 1rem;
        transition: all 0.3s ease;
        outline: none;
    }

    .input-premium:focus {
        border-color: var(--primary);
        background: rgba(255, 255, 255, 0.07);
        box-shadow: 0 0 15px rgba(212, 175, 55, 0.1);
    }

    /* Custom File Upload Area */
    .file-upload-area {
        position: relative;
        width: 100%;
        height: 180px;
        border: 2px dashed var(--glass-border);
        border-radius: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.01);
    }

    .file-upload-area:hover {
        border-color: var(--primary);
        background: rgba(212, 175, 55, 0.05);
    }

    .file-upload-area svg {
        width: 48px;
        height: 48px;
        color: var(--primary);
        margin-bottom: 15px;
        opacity: 0.7;
    }

    .file-upload-area p {
        margin: 0;
        font-size: 0.9rem;
        opacity: 0.8;
    }

    .file-upload-area input {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        opacity: 0;
        cursor: pointer;
    }

    .btn-submit {
        width: 100%;
        margin-top: 1rem;
        padding: 18px;
        font-size: 1rem;
    }

    .alert-premium {
        background: rgba(40, 167, 69, 0.1);
        border: 1px solid rgba(40, 167, 69, 0.3);
        color: #4cd137;
        padding: 15px;
        border-radius: 12px;
        margin-bottom: 2rem;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    .back-link {
        display: inline-block;
        margin-top: 2rem;
        color: #888;
        text-decoration: none;
        font-size: 0.8rem;
        transition: color 0.3s;
    }

    .back-link:hover {
        color: var(--primary);
    }

    #file-name {
        margin-top: 10px;
        color: var(--primary);
        font-weight: 600;
        font-size: 0.85rem;
    }
</style>
@endsection

@section('content')
<div class="glass-container upload-card fade-in">
    <h2>Subir Contenido</h2>
    
    @if(session('success'))
        <div class="alert-premium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            {{ session('success') }}
        </div>
    @endif

    <form action="{{ route('upload.store') }}" method="POST" enctype="multipart/form-data">
        @csrf
        
        <div class="form-group">
            <label class="label-premium" for="guest_name">¿Quién comparte este momento?</label>
            <input type="text" name="guest_name" id="guest_name" class="input-premium" placeholder="Tu nombre artístico o real..." autocomplete="off">
        </div>

        <div class="form-group">
            <label class="label-premium">Captura el Momento</label>
            <div class="file-upload-area" id="dropzone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <p id="upload-text">Toca para seleccionar fotos o videos</p>
                <span id="file-name"></span>
                <input type="file" name="photo" id="photo" accept="image/*,video/*" capture="environment" required onchange="updateFileName(this)">
            </div>
            <p style="text-align: center; margin-top: 15px; font-size: 0.75rem; opacity: 0.5; letter-spacing: 0.5px;">
                Formatos permitidos: JPG, PNG, MP4 (Máx. 50MB)
            </p>
        </div>

        <button type="submit" class="btn-gold btn-submit shadow-lg">Enviar a la Galería</button>
    </form>

    <a href="{{ route('gallery') }}" class="back-link">← Cancelar y volver a la galería</a>
</div>
@endsection

@section('scripts')
<script>
    function updateFileName(input) {
        const fileName = input.files[0] ? input.files[0].name : "";
        const textElement = document.getElementById('upload-text');
        const fileNameElement = document.getElementById('file-name');
        
        if (fileName) {
            textElement.style.display = 'none';
            fileNameElement.innerText = "Archivo seleccionado: " + fileName;
        } else {
            textElement.style.display = 'block';
            fileNameElement.innerText = "";
        }
    }
</script>
@endsection
