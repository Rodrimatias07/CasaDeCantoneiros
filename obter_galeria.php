<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

$baseDir = __DIR__ . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . 'galeria';
$baseUrl = 'images/galeria';
$extensions = '*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}';
$imagens = [];

if (is_dir($baseDir)) {
    $patterns = [
        $baseDir . DIRECTORY_SEPARATOR . $extensions,
        $baseDir . DIRECTORY_SEPARATOR . '*' . DIRECTORY_SEPARATOR . $extensions,
    ];

    foreach ($patterns as $pattern) {
        $files = glob($pattern, GLOB_BRACE);

        if (!is_array($files)) {
            continue;
        }

        foreach ($files as $file) {
            if (!is_file($file)) {
                continue;
            }

            $relative = str_replace($baseDir, $baseUrl, $file);
            $relative = str_replace(DIRECTORY_SEPARATOR, '/', $relative);
            $imagens[] = $relative;
        }
    }
}

$imagens = array_values(array_unique($imagens));
natcasesort($imagens);
$imagens = array_values($imagens);

echo json_encode($imagens, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
