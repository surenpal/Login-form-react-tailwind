param(
  [Parameter(Mandatory = $true)]
  [string]$InputDir,

  [string]$OutputFile = ""
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Runtime.WindowsRuntime

function Await-Generic {
  param(
    [Parameter(Mandatory = $true)]
    $Operation,

    [Parameter(Mandatory = $true)]
    [Type]$ResultType
  )

  $method = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq "AsTask" -and $_.IsGenericMethod -and $_.GetGenericArguments().Count -eq 1 -and $_.GetParameters().Count -eq 1
  } | Select-Object -First 1

  $generic = $method.MakeGenericMethod(@($ResultType))
  $task = $generic.Invoke($null, @($Operation))
  return $task.Result
}

$language = [Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime]::new("ja")
$engine = [Windows.Media.Ocr.OcrEngine,Windows.Media.Ocr,ContentType=WindowsRuntime]::TryCreateFromLanguage($language)

if ($null -eq $engine) {
  throw "Windows OCR for Japanese is not available on this system."
}

$results = @()
$files = Get-ChildItem -LiteralPath $InputDir -Filter *.png | Sort-Object Name

foreach ($fileInfo in $files) {
  $storageFile = Await-Generic ([Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]::GetFileFromPathAsync($fileInfo.FullName)) ([Windows.Storage.StorageFile])
  $stream = Await-Generic ($storageFile.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
  $decoder = Await-Generic ([Windows.Graphics.Imaging.BitmapDecoder,Windows.Graphics.Imaging,ContentType=WindowsRuntime]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $bitmap = Await-Generic ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  $ocrResult = Await-Generic ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])

  $results += [PSCustomObject]@{
    name = $fileInfo.BaseName
    text = $ocrResult.Text
  }
}

$json = $results | ConvertTo-Json -Depth 4

if ($OutputFile) {
  [System.IO.File]::WriteAllText($OutputFile, $json, [System.Text.UTF8Encoding]::new($false))
} else {
  $json
}
