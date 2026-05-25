$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host ""
Write-Host "  ===============================================" -ForegroundColor Cyan
Write-Host "    Prayer Times App Running!" -ForegroundColor Green
Write-Host "    Open: http://localhost:8080" -ForegroundColor Yellow
Write-Host "  ===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press Ctrl+C to stop the server." -ForegroundColor DarkGray
Write-Host ""

$root = $PSScriptRoot

$mimeTypes = @{
    ".html" = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }

        $filePath = Join-Path $root $path.TrimStart("/")

        if (Test-Path $filePath) {
            $ext = [System.IO.Path]::GetExtension($filePath)
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            
            $response.ContentType = $contentType
            $response.StatusCode = 200
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "  [200] $path" -ForegroundColor Green
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($msg, 0, $msg.Length)
            Write-Host "  [404] $path" -ForegroundColor Red
        }

        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    Write-Host "Server stopped." -ForegroundColor Yellow
}
