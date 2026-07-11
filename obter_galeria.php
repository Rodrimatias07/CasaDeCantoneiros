<?php
declare(strict_types=1);

ob_start();

header('Content-Type: application/json');

chdir(__DIR__);

$categorias = ['envolvente', 'exterior', 'interior'];
$imagens_finais = [];

foreach ($categorias as $cat) {
    $ficheiros = glob('images/galeria/' . $cat . '/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', GLOB_BRACE);

    if (!is_array($ficheiros)) {
        $ficheiros = [];
    }

    natcasesort($ficheiros);

    foreach ($ficheiros as $ficheiro) {
        if (!is_file($ficheiro)) {
            continue;
        }

        $caminho_completo_da_imagem = str_replace('\\', '/', $ficheiro);
        $nome_da_pasta_da_categoria = $cat;

        array_push($imagens_finais, [
            "url" => $caminho_completo_da_imagem,
            "categoria" => $nome_da_pasta_da_categoria
        ]);
    }
}

$imagens_finais = array_values($imagens_finais);

ob_clean();

echo json_encode($imagens_finais, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
