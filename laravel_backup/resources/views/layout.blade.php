<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gala Event - @yield('title')</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #d4af37; /* Metallic Gold */
            --bg-dark: #0a0a0b;
            --glass: rgba(255, 255, 255, 0.05);
            --glass-border: rgba(255, 255, 255, 0.1);
        }

        body {
            background-color: var(--bg-dark);
            color: #ffffff;
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
        }

        .glass-container {
            background: var(--glass);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
        }

        .btn-gold {
            background: linear-gradient(135deg, #d4af37 0%, #f9e29c 50%, #d4af37 100%);
            color: #000;
            border: none;
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }

        .btn-gold:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3);
        }

        .header {
            padding: 1rem;
            text-align: center;
        }

        .header h1 {
            font-weight: 600;
            letter-spacing: 4px;
            margin: 0;
            background: linear-gradient(to right, #d4af37, #fde08d, #d4af37);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-transform: uppercase;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .fade-in {
            animation: fadeIn 0.8s ease forwards;
        }
    </style>
    @yield('styles')
</head>
<body>
    <div class="header">
        <h1>Gala Event</h1>
    </div>

    <main style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px;">
        @yield('content')
    </main>

    @yield('scripts')
</body>
</html>
